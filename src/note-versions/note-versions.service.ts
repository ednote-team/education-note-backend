import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NoteVersion } from './entities/note-version.entity';

export interface VersionMeta {
  id: string;
  userName: string;
  createdAt: string;
}

export interface VersionFull extends VersionMeta {
  blocks: object[];
}

@Injectable()
export class NoteVersionsService {
  constructor(
    @InjectRepository(NoteVersion)
    private readonly repo: Repository<NoteVersion>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private async hasAccess(noteId: string, userId: string): Promise<boolean> {
    const rows: unknown[] = await this.dataSource.query(
      `SELECT 1 FROM notes
        WHERE id = $1::uuid AND user_id = $2::uuid AND is_deleted = false
       UNION
       SELECT 1 FROM note_permissions
        WHERE note_id = $1::uuid AND user_id = $2::uuid
       LIMIT 1`,
      [noteId, userId],
    );
    return rows.length > 0;
  }

  async saveVersion(
    noteId: string,
    userId: string,
    userName: string,
    blocks: object[],
  ): Promise<void> {
    // Skip if saved within the last 10 seconds (spam guard), or if content
    // is identical to the previous version (dedup on content change only).
    const last: { blocks: object; diff_ms: number }[] = await this.dataSource.query(
      `SELECT blocks,
              EXTRACT(EPOCH FROM (NOW() - created_at)) * 1000 AS diff_ms
       FROM note_versions
       WHERE note_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT 1`,
      [noteId],
    );

    if (last.length > 0) {
      if (last[0].diff_ms < 10_000) return;
      if (JSON.stringify(last[0].blocks) === JSON.stringify(blocks)) return;
    }

    await this.dataSource.query(
      `INSERT INTO note_versions (id, note_id, user_id, user_name, blocks, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4::jsonb, NOW())`,
      [noteId, userId, userName, JSON.stringify(blocks)],
    );
  }

  async findByNote(noteId: string, requestingUserId: string): Promise<VersionMeta[]> {
    if (!(await this.hasAccess(noteId, requestingUserId))) {
      throw new ForbiddenException();
    }

    const rows = await this.repo.find({
      where: { noteId },
      order: { createdAt: 'DESC' },
      select: ['id', 'userName', 'createdAt'],
    });

    return rows.map((r) => ({
      id: r.id,
      userName: r.userName,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async findOne(versionId: string, requestingUserId: string): Promise<VersionFull> {
    const version = await this.repo.findOne({ where: { id: versionId } });
    if (!version) throw new NotFoundException();

    if (!(await this.hasAccess(version.noteId, requestingUserId))) {
      throw new ForbiddenException();
    }

    return {
      id: version.id,
      userName: version.userName,
      createdAt: version.createdAt.toISOString(),
      blocks: version.blocks,
    };
  }
}

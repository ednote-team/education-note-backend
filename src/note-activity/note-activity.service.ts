import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface ActivityEntry {
  userId: string;
  userName: string;
  editedAt: string;
}

@Injectable()
export class NoteActivityService {
  // Throttle per (noteId, userId) — only write to DB once every 5 minutes
  private readonly throttle = new Map<string, number>();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async logActivity(
    noteId: string,
    userId: string,
    userName: string,
  ): Promise<void> {
    const key = `${noteId}:${userId}`;
    const now = Date.now();
    if ((this.throttle.get(key) ?? 0) + 5 * 60_000 > now) return;
    this.throttle.set(key, now);

    await this.dataSource.query(
      `INSERT INTO note_activity (id, note_id, user_id, user_name, edited_at)
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, NOW())
       ON CONFLICT (note_id, user_id)
       DO UPDATE SET user_name = EXCLUDED.user_name, edited_at = NOW()`,
      [noteId, userId, userName],
    );
  }

  async findByNote(
    noteId: string,
    requestingUserId: string,
  ): Promise<ActivityEntry[]> {
    // Must be owner or collaborator to read activity
    const access: unknown[] = await this.dataSource.query(
      `SELECT 1 FROM notes
        WHERE id = $1::uuid AND user_id = $2::uuid AND is_deleted = false
       UNION
       SELECT 1 FROM note_permissions
        WHERE note_id = $1::uuid AND user_id = $2::uuid
       LIMIT 1`,
      [noteId, requestingUserId],
    );

    if (access.length === 0) {
      throw new ForbiddenException();
    }

    const rows: { user_id: string; user_name: string; edited_at: Date }[] =
      await this.dataSource.query(
        `SELECT user_id, user_name, edited_at
           FROM note_activity
          WHERE note_id = $1::uuid
          ORDER BY edited_at DESC`,
        [noteId],
      );

    return rows.map((r) => ({
      userId: r.user_id,
      userName: r.user_name,
      editedAt: r.edited_at.toISOString(),
    }));
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotePermission } from './entities/note-permission.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';
import { CreateNotePermissionDto, UpdateNotePermissionDto } from './dto/note-permission.dto';

@Injectable()
export class NotePermissionsService {
  constructor(
    @InjectRepository(NotePermission)
    private readonly permRepo: Repository<NotePermission>,
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
    @InjectRepository(NoteBlock)
    private readonly blockRepo: Repository<NoteBlock>,
    private readonly dataSource: DataSource,
  ) {}


  private async assertNoteOwner(noteId: string, ownerId: string): Promise<Note> {
    const note = await this.noteRepo.findOne({
      where: { id: noteId, userId: ownerId, isDeleted: false },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  private async findUserByEmail(
    email: string,
  ): Promise<{ id: string; email: string } | null> {
    const rows: { id: string; email: string }[] = await this.dataSource.query(
      `SELECT id::text, email FROM auth.users WHERE email = $1 LIMIT 1`,
      [email],
    );
    return rows[0] ?? null;
  }

  /** Bulk-fetch emails for a list of user UUIDs */
  private async getEmailMap(user_ids: string[]): Promise<Map<string, string>> {
    if (user_ids.length === 0) return new Map();
    const rows: { id: string; email: string }[] = await this.dataSource.query(
      `SELECT id::text, email FROM auth.users WHERE id = ANY($1::uuid[])`,
      [user_ids],
    );
    return new Map(rows.map((r) => [r.id, r.email]));
  }


  async findAll(
    note_id: string,
    owner_id: string,
  ): Promise<(NotePermission & { email: string })[]> {
    await this.assertNoteOwner(note_id, owner_id);

    const perms = await this.permRepo.find({
      where: { note_id },
      order: { shared_at: 'ASC' },
    });

    const emailMap = await this.getEmailMap(perms.map((p) => p.user_id));

    return perms.map((p) => ({
      ...p,
      email: emailMap.get(p.user_id) ?? p.user_id,
    }));
  }

  async create(
    note_id: string,
    owner_id: string,
    dto: CreateNotePermissionDto,
  ): Promise<NotePermission & { email: string }> {
    await this.assertNoteOwner(note_id, owner_id);

    const supabaseUser = await this.findUserByEmail(dto.email);
    if (!supabaseUser) {
      throw new NotFoundException('No user found with this email');
    }

    const existing = await this.permRepo.findOne({
      where: { note_id, user_id: supabaseUser.id },
    });
    if (existing) {
      throw new ConflictException('User already has access to this note');
    }

    const perm = this.permRepo.create({
      note_id,
      user_id: supabaseUser.id,
      role: dto.role,
    });
    const saved = await this.permRepo.save(perm);
    return { ...saved, email: supabaseUser.email };
  }

  async updateRole(
    note_id: string,
    perm_id: string,
    owner_id: string,
    dto: UpdateNotePermissionDto,
  ): Promise<NotePermission> {
    await this.assertNoteOwner(note_id, owner_id);

    const perm = await this.permRepo.findOne({ where: { id: perm_id, note_id } });
    if (!perm) throw new NotFoundException('Permission not found');

    perm.role = dto.role;
    return this.permRepo.save(perm);
  }

  async revoke(note_id: string, perm_id: string, owner_id: string): Promise<void> {
    await this.assertNoteOwner(note_id, owner_id);

    const perm = await this.permRepo.findOne({ where: { id: perm_id, note_id } });
    if (!perm) throw new NotFoundException('Permission not found');

    await this.permRepo.remove(perm);
  }

  /* ---- Public (no auth) ---- */

  async getPublicNote(
    noteId: string,
  ): Promise<{ note: Pick<Note, 'id' | 'title' | 'updatedAt'>; blocks: NoteBlock[] }> {
    const note = await this.noteRepo.findOne({
      where: { id: noteId, isDeleted: false },
    });
    if (!note) throw new NotFoundException('Note not found');

    const blocks = await this.blockRepo.find({
      where: { noteId },
      order: { position: 'ASC' },
    });

    return { note: { id: note.id, title: note.title, updatedAt: note.updatedAt }, blocks };
  }
}

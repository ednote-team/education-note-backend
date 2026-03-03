import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { NoteYjsState } from './entities/note-yjs-state.entity';
import { CreateNoteDto, UpdateNoteDto } from './dto/notes.dto';
import { GeminiService } from '../common/llm/gemini.service';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';
import { AiUsageService } from '../ai-usage/ai-usage.service';

export type AccessRole = 'owner' | 'edit' | 'view' | null;

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(NoteBlock)
    private readonly blockRepository: Repository<NoteBlock>,
    @InjectRepository(NoteYjsState)
    private readonly yjsStateRepo: Repository<NoteYjsState>,
    private readonly geminiService: GeminiService,
    private readonly dataSource: DataSource,
    private readonly aiUsageService: AiUsageService,
  ) {}

  create(userId: string, dto: CreateNoteDto): Promise<Note> {
    const note = this.notesRepository.create({
      ...dto,
      userId,
    });
    return this.notesRepository.save(note);
  }

  findAll(userId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { userId, isDeleted: false },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, userId, isDeleted: false },
      relations: ['blocks'],
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.blocks) {
      note.blocks.sort((a, b) => a.position - b.position);
    }

    return note;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    const note = await this.findOne(id, userId);
    Object.assign(note, dto);
    note.updatedAt = new Date();
    return this.notesRepository.save(note);
  }

  async toggleFavorite(id: string, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    note.isFavorite = !note.isFavorite;
    return this.notesRepository.save(note);
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    note.isDeleted = true;
    note.deletedAt = new Date();
    await this.notesRepository.save(note);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const note = await this.notesRepository.findOne({
      where: { id, userId, isDeleted: true },
    });

    if (!note) {
      throw new NotFoundException('Deleted note not found');
    }

    await this.notesRepository.remove(note);
  }

  async restore(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, userId, isDeleted: true },
    });

    if (!note) {
      throw new NotFoundException('Deleted note not found');
    }

    note.isDeleted = false;
    note.deletedAt = null;
    return this.notesRepository.save(note);
  }

  async findDeleted(userId: string): Promise<Note[]> {
    // Auto-cleanup notes deleted more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.notesRepository
      .createQueryBuilder()
      .delete()
      .from(Note)
      .where('user_id = :userId AND is_deleted = true AND deleted_at IS NOT NULL AND deleted_at < :cutoff', {
        userId,
        cutoff: thirtyDaysAgo,
      })
      .execute();

    return this.notesRepository.find({
      where: { userId, isDeleted: true },
      order: { deletedAt: 'DESC' },
    });
  }

  async aiAssist(
    noteId: string,
    userId: string,
    message: string,
    context?: string,
  ): Promise<{ response: string }> {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    const blocks = await this.blockRepository.find({
      where: { noteId },
      order: { position: 'ASC' },
    });

    const noteContent = blocks
      .map(b => b.content?.text ?? '')
      .join('\n');

    const markdownInstructions = `
คำแนะนำสำคัญในการจัดรูปแบบ Markdown:
- ใช้ "# " (มีช่องว่างหลัง #) สำหรับหัวข้อระดับ 1, "## " สำหรับระดับ 2, "### " สำหรับระดับ 3
- **ห้าม** ใช้ "**ชื่อหัวข้อ**" แทนหัวข้อ ต้องใช้ # เท่านั้น
- ใช้ "* text" (มีช่องว่างหลัง *) สำหรับรายการแบบ bullet points
- **ห้าม** ใช้ "*text" (ไม่มีช่องว่างหลัง *) เพราะจะไม่แสดงผลเป็น bullet point
- ใช้ "1. text" (มีช่องว่างหลังตัวเลขและจุด) สำหรับรายการแบบตัวเลข
- ใช้ "**text**" สำหรับตัวหนา และ "*text*" สำหรับตัวเอียง (ไม่ใช่สำหรับหัวข้อหรือ bullet)

ตัวอย่างที่ถูกต้อง:
# หัวข้อหลัก
## หัวข้อย่อย
* รายการที่ 1
* รายการที่ 2

ตัวอย่างที่ผิด (ห้ามใช้):
**หัวข้อหลัก** ← ผิด
*รายการที่ 1 ← ผิด (ไม่มีช่องว่างหลัง *)
#หัวข้อหลัก ← ผิด (ไม่มีช่องว่างหลัง #)
`;

    let prompt = '';

    if (context) {
      prompt = `${markdownInstructions}

คำถาม: ${message}

ข้อความที่เลือก:
${context}

เนื้อหาทั้งหมดของ Note (สำหรับอ้างอิง):
${noteContent}

กรุณาตอบคำถามโดยอ้างอิงจากข้อความที่เลือกและเนื้อหาของ Note โดยใช้รูปแบบ Markdown ที่ถูกต้องตามคำแนะนำข้างต้น`;
    } else if (noteContent.trim()) {
      prompt = `${markdownInstructions}

คำถาม: ${message}

เนื้อหาของ Note:
${noteContent}

กรุณาตอบคำถามโดยอ้างอิงจากเนื้อหาของ Note โดยใช้รูปแบบ Markdown ที่ถูกต้องตามคำแนะนำข้างต้น`;
    } else {
      prompt = `${markdownInstructions}

คำถาม: ${message}

กรุณาตอบคำถามอย่างชัดเจนและเป็นประโยชน์ โดยใช้รูปแบบ Markdown ที่ถูกต้องตามคำแนะนำข้างต้น`;
    }
    await this.aiUsageService.increment(userId);
    const aiResponse = await this.geminiService.generate(prompt);

    return {
      response: aiResponse,
    };
  }

  async getSharedWithMe(userId: string): Promise<any[]> {
    return this.dataSource.query(
      `SELECT
         np.id,
         np.role,
         np.shared_at   AS "sharedAt",
         n.id           AS "noteId",
         n.title        AS "noteTitle",
         n.updated_at   AS "noteUpdatedAt",
         au.email       AS "ownerEmail"
       FROM note_permissions np
       JOIN notes n  ON n.id = np.note_id AND n.is_deleted = false
       LEFT JOIN auth.users au ON au.id::text = n.user_id::text
       WHERE np.user_id = $1
       ORDER BY np.shared_at DESC`,
      [userId],
    );
  }

  async getMyAccess(
    noteId: string,
    userId: string,
  ): Promise<{ role: AccessRole; canEdit: boolean }> {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, isDeleted: false },
    });
    if (!note) throw new NotFoundException('Note not found');

    if (note.userId === userId) return { role: 'owner', canEdit: true };

    const rows: { role: string }[] = await this.dataSource.query(
      `SELECT role FROM note_permissions WHERE note_id = $1 AND user_id = $2 LIMIT 1`,
      [noteId, userId],
    );

    if (!rows[0]) return { role: null, canEdit: false };
    const role = rows[0].role as 'edit' | 'view';
    return { role, canEdit: role === 'edit' };
  }

  async getYjsState(
    noteId: string,
    userId: string,
  ): Promise<{ state: string | null }> {
    const { role } = await this.getMyAccess(noteId, userId);
    if (role === null) throw new ForbiddenException('No access to this note');

    const record = await this.yjsStateRepo.findOne({ where: { noteId } });
    return {
      state: record?.state ? record.state.toString('base64') : null,
    };
  }

  async saveYjsState(
    noteId: string,
    userId: string,
    stateBase64: string,
  ): Promise<{ ok: boolean }> {
    const { canEdit } = await this.getMyAccess(noteId, userId);
    if (!canEdit) throw new ForbiddenException('Edit access required');

    const buf = Buffer.from(stateBase64, 'base64');
    await this.dataSource.query(
      `INSERT INTO note_yjs_states (note_id, state, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (note_id)
       DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`,
      [noteId, buf],
    );
    return { ok: true };
  }
}

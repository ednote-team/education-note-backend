import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto, UpdateNoteDto } from './dto/notes.dto';
import { GeminiService } from '../common/llm/gemini.service';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(NoteBlock)
    private readonly blockRepository: Repository<NoteBlock>,
    private readonly geminiService: GeminiService,
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

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    note.isDeleted = true;
    await this.notesRepository.save(note);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
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
    return this.notesRepository.save(note);
  }

  findDeleted(userId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { userId, isDeleted: true },
      order: { updatedAt: 'DESC' },
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
    const aiResponse = await this.geminiService.generate(prompt);

    return {
      response: aiResponse,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto, UpdateNoteDto } from './dto/notes.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
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
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteBlock } from './entities/note-block.entity';
import { Note } from '../notes/entities/note.entity';
import { NotePermission } from '../note-permissions/entities/note-permission.entity';
import {
  CreateBlockDto,
  UpdateBlockDto,
  ReorderBlocksDto,
} from './dto/note-blocks.dto';

@Injectable()
export class NoteBlocksService {
  constructor(
    @InjectRepository(NoteBlock)
    private readonly noteBlocksRepository: Repository<NoteBlock>,

    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,

    @InjectRepository(NotePermission)
    private readonly notePermissionsRepository: Repository<NotePermission>,
  ) { }

  /** 🔐 verify note ownership */
  private async assertNoteOwner(userId: string, noteId: string) {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new ForbiddenException('You do not have access to this note');
    }
  }

  /** verify note ownership OR edit permission */
  private async assertNoteAccess(userId: string, noteId: string) {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, userId, isDeleted: false },
    });
    if (note) return;

    const perm = await this.notePermissionsRepository.findOne({
      where: { note_id: noteId, user_id: userId, role: 'edit' },
    });
    if (!perm) {
      throw new ForbiddenException('You do not have access to this note');
    }
  }

  async create(
    userId: string,
    noteId: string,
    dto: CreateBlockDto,
  ): Promise<NoteBlock> {
    await this.assertNoteOwner(userId, noteId);

    const max = await this.noteBlocksRepository
      .createQueryBuilder('block')
      .select('MAX(block.position)', 'max')
      .where('block.noteId = :noteId', { noteId })
      .getRawOne();

    const position = dto.position ?? (max?.max ?? -1) + 1;

    if (dto.position !== undefined) {
      await this.noteBlocksRepository
        .createQueryBuilder()
        .update(NoteBlock)
        .set({ position: () => 'position + 1' })
        .where('noteId = :noteId AND position >= :position', {
          noteId,
          position,
        })
        .execute();
    }

    const block = this.noteBlocksRepository.create({
      ...dto,
      noteId,
      position,
    });

    return this.noteBlocksRepository.save(block);
  }

  async findAllByNote(userId: string, noteId: string): Promise<NoteBlock[]> {
    await this.assertNoteOwner(userId, noteId);

    return this.noteBlocksRepository.find({
      where: { noteId },
      order: { position: 'ASC' },
    });
  }

  async findOne(
    userId: string,
    id: string,
    noteId: string,
  ): Promise<NoteBlock> {
    await this.assertNoteOwner(userId, noteId);

    const block = await this.noteBlocksRepository.findOne({
      where: { id, noteId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  async update(
    userId: string,
    id: string,
    noteId: string,
    dto: UpdateBlockDto,
  ): Promise<NoteBlock> {
    const block = await this.findOne(userId, id, noteId);
    Object.assign(block, dto);
    block.updatedAt = new Date();
    return this.noteBlocksRepository.save(block);
  }

  async remove(
    userId: string,
    id: string,
    noteId: string,
  ): Promise<void> {
    await this.assertNoteOwner(userId, noteId);

    const block = await this.noteBlocksRepository.findOne({
      where: { id, noteId },
    });

    if (!block) return;

    await this.noteBlocksRepository.remove(block);

    await this.noteBlocksRepository
      .createQueryBuilder()
      .update(NoteBlock)
      .set({ position: () => 'position - 1' })
      .where('noteId = :noteId AND position > :position', {
        noteId,
        position: block.position,
      })
      .execute();
  }

  async reorder(
    userId: string,
    noteId: string,
    dto: ReorderBlocksDto,
  ): Promise<void> {
    await this.assertNoteOwner(userId, noteId);

    await this.noteBlocksRepository.manager.transaction(async (manager) => {
      for (const { blockId, position } of dto.blocks) {
        await manager.update(
          NoteBlock,
          { id: blockId, noteId },
          { position, updatedAt: new Date() },
        );
      }
    });
  }

  async convertType(
    userId: string,
    id: string,
    noteId: string,
    newType: string,
  ): Promise<NoteBlock> {
    const block = await this.findOne(userId, id, noteId);

    block.blockType = newType;

    if (['heading1', 'heading2', 'heading3'].includes(newType)) {
      block.content = { text: block.content?.text ?? String(block.content) };
    } else if (newType === 'checklist') {
      block.content = {
        text: block.content?.text ?? String(block.content),
        checked: false,
      };
    } else if (['bulletList', 'numberedList'].includes(newType)) {
      block.content = {
        text: block.content?.text ?? String(block.content),
        level: 0,
      };
    }

    block.updatedAt = new Date();
    return this.noteBlocksRepository.save(block);
  }

  async replaceAll(
    userId: string,
    noteId: string,
    blocks: CreateBlockDto[],
  ): Promise<void> {
    await this.assertNoteAccess(userId, noteId);

    await this.noteBlocksRepository.manager.transaction(async (manager) => {
      await manager.delete(NoteBlock, { noteId });

      const entities = blocks.map((block, index) =>
        manager.create(NoteBlock, {
          ...block,
          noteId,
          position: index,
        }),
      );

      await manager.save(entities);

      await manager.update(Note, noteId, { updatedAt: new Date() });
    });
  }
}

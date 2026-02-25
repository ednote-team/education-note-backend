import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from './entities/flashcards.entity';
import { FlashcardSet } from '../flashcard-sets/entities/flashcard-set.entity';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,

    @InjectRepository(FlashcardSet)
    private readonly flashcardSetRepo: Repository<FlashcardSet>,
  ) {}

  findSetsByNote(noteId: string) {
    return this.flashcardSetRepo.find({
      where: { note: { id: noteId } },
      order: { created_at: 'DESC' },
    });
  }

  findFlashcardsBySet(setId: string) {
    return this.flashcardRepo.find({
      where: { set_id: setId },
      order: { created_at: 'ASC' },
    });
  }

  async createFlashcard(setId: string, frontText: string, backText: string) {
    const card = this.flashcardRepo.create({
      set_id: setId,
      front_text: frontText,
      back_text: backText,
    });
    return this.flashcardRepo.save(card);
  }

  async deleteFlashcard(cardId: string) {
    const card = await this.flashcardRepo.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Flashcard not found');
    }
    await this.flashcardRepo.remove(card);
    return { success: true };
  }
}

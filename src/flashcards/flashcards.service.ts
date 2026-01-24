import { Injectable } from '@nestjs/common';
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

  findFlashcardsBySet(setId: string, limit = 10, offset = 0) {
    return this.flashcardRepo.find({
      where: { set_id: setId },
      order: { created_at: 'ASC' },
      take: limit,
      skip: offset,
    });
  }
}
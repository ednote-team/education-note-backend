import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardSetsController } from './flashcard-sets.controller';
import { FlashcardSetsService } from './flashcard-sets.service';
import { FlashcardSet } from './entities/flashcard-set.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';
import { Flashcard } from '../flashcards/entities/flashcards.entity';
import { FlashcardReview } from '../flashcard-reviews/entities/flashcard-review.entity';
import { GeminiService } from '../common/llm/gemini.service';
import { AiUsageModule } from '../ai-usage/ai-usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlashcardSet, Flashcard, FlashcardReview, Note, NoteBlock]),
    AiUsageModule,
  ],
  controllers: [FlashcardSetsController],
  providers: [FlashcardSetsService, GeminiService],
  exports: [FlashcardSetsService],
})
export class FlashcardSetsModule {}
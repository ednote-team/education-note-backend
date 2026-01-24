import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardReviewSession } from './entities/flashcard-review-session.entity';
import { FlashcardReviewSessionsService } from './flashcard-review-sessions.service';
import { FlashcardReviewSessionsController } from './flashcard-review-sessions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlashcardReviewSession]),
  ],
  providers: [FlashcardReviewSessionsService],
  controllers: [FlashcardReviewSessionsController],
  exports: [FlashcardReviewSessionsService],
})
export class FlashcardReviewSessionsModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardReviewsController } from './flashcard-reviews.controller';
import { FlashcardReviewsService } from './flashcard-reviews.service';
import { FlashcardReview } from './entities/flashcard-review.entity';
import { FlashcardReviewSessionsModule } from '../flashcard-review-sessions/flashcard-review-sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlashcardReview]),
    FlashcardReviewSessionsModule,
  ],
  controllers: [FlashcardReviewsController],
  providers: [FlashcardReviewsService],
  exports: [FlashcardReviewsService],
})
export class FlashcardReviewsModule {}
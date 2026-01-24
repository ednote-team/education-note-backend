import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashcardReview } from './entities/flashcard-review.entity';

@Injectable()
export class FlashcardReviewsService {
  constructor(
    @InjectRepository(FlashcardReview)
    private readonly reviewRepo: Repository<FlashcardReview>,
  ) {}

  async submitReview({
    flashcardId,
    sessionId,
    isCorrect,
  }: {
    flashcardId: string;
    userId: string;
    sessionId: string;
    isCorrect: boolean;
  }) {
    const review = this.reviewRepo.create({
      flashcard: { id: flashcardId },
      session: { id: sessionId },
      isCorrect,
    });

    await this.reviewRepo.save(review);

    return { success: true };
  }

  async findWrongFlashcards(setId: string, userId: string) {
    return this.reviewRepo
      .createQueryBuilder('r')
      .innerJoin('flashcards', 'f', 'f.id = r.flashcard_id')
      .innerJoin(
        qb =>
          qb
            .subQuery()
            .select('flashcard_id')
            .addSelect('MAX(reviewed_at)', 'latest')
            .from('flashcard_reviews', 'r2')
            .where('r2.user_id = :userId', { userId })
            .groupBy('flashcard_id'),
        'latest',
        'latest.flashcard_id = r.flashcard_id AND latest.latest = r.reviewed_at',
      )
      .where('f.set_id = :setId', { setId })
      .andWhere('r.user_id = :userId', { userId })
      .andWhere('r.is_correct = false')
      .getMany();
  }

  async getReviewHistory(
    flashcardId: string,
  ) {
    return this.reviewRepo.find({
      where: { session: { id: flashcardId } },
      order: {
        reviewedAt: 'ASC',
      },
    });
  }
}
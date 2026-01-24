import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FlashcardReview } from '../../flashcard-reviews/entities/flashcard-review.entity';
import { FlashcardSet } from '../../flashcard-sets/entities/flashcard-set.entity';

@Entity('flashcard_review_sessions')
export class FlashcardReviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FlashcardSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'set_id' })
  set: FlashcardSet;


  @Column({ type: 'int', name: 'review_round' })
  reviewRound: number;

  @OneToMany(
    () => FlashcardReview,
    (review) => review.session,
  )
  reviews: FlashcardReview[];
}
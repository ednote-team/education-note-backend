import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
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

  @Column({ type: 'int', name: 'correct_count', default: 0 })
  correctCount: number;

  @Column({ type: 'int', name: 'total_reviewed', default: 0 })
  totalReviewed: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @OneToMany(
    () => FlashcardReview,
    (review) => review.session,
  )
  reviews: FlashcardReview[];
}
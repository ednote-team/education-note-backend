import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FlashcardReviewSession } from '../../flashcard-review-sessions/entities/flashcard-review-session.entity';
import { Flashcard } from '../../flashcards/entities/flashcards.entity';

@Entity('flashcard_reviews')
export class FlashcardReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Flashcard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flashcard_id' })
  flashcard: Flashcard;

  @Column({ type: 'boolean', name: 'is_correct' })
  isCorrect: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'reviewed_at' })
  reviewedAt: Date;

  @ManyToOne(
    () => FlashcardReviewSession,
    (session) => session.reviews,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'session_id' })
  session: FlashcardReviewSession;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId: string;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuizAttempt } from '../../quiz-attempts/entities/quiz-attempt.entity';
import { QuizQuestion } from '../../quiz-questions/entities/quiz-question.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuizAttempt, (attempt) => attempt.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttempt;

  @Column({ type: 'uuid' })
  attempt_id: string;

  @ManyToOne(() => QuizQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @Column({ type: 'uuid' })
  question_id: string;

  @Column({ type: 'text' })
  user_answer: string;

  @Column({ type: 'boolean', name: 'is_correct' })
  isCorrect: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'answered_at' })
  answeredAt: Date;
}

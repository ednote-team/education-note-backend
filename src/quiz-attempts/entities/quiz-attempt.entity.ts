import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuizAnswer } from '../../quiz-answers/entities/quiz-answer.entity';
import { QuizSet } from '../../quiz-sets/entities/quiz-set.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuizSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_set_id' })
  quizSet: QuizSet;

  @Column({ type: 'uuid' })
  quiz_set_id: string;

  @Column({ type: 'int', name: 'correct_count', default: 0 })
  correctCount: number;

  @Column({ type: 'int', name: 'total_questions', default: 0 })
  totalQuestions: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'attempted_at' })
  attemptedAt: Date;

  @OneToMany(() => QuizAnswer, (answer) => answer.attempt)
  answers: QuizAnswer[];
}

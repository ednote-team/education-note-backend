import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuizSet } from '../../quiz-sets/entities/quiz-set.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  quiz_set_id: string;

  @ManyToOne(() => QuizSet, (set) => set.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_set_id' })
  quizSet: QuizSet;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'text' })
  question_type: string; // 'multiple_choice', 'true_false', 'short_answer'

  @Column({ type: 'jsonb', nullable: true })
  options: string[]; // สำหรับ multiple choice

  @Column({ type: 'text' })
  correct_answer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}

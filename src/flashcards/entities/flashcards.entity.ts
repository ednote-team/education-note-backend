import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FlashcardSet } from '../../flashcard-sets/entities/flashcard-set.entity';


@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  set_id: string;

  @ManyToOne(
    () => FlashcardSet,
    (set) => set.flashcards,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'set_id' })
  set: FlashcardSet;

  @Column({ type: 'text' })
  front_text: string;

  @Column({ type: 'text' })
  back_text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
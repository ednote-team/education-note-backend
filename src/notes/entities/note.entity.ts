import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { NoteBlock } from '../../note-blocks/entities/note-block.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column()
  title: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
  
  @Column({ name: 'has_flashcard', default: false })
  hasFlashcard: boolean;

  @Column({ name: 'has_quiz', default: false })
  hasQuiz: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NoteBlock, block => block.note, { cascade: true })
  blocks: NoteBlock[];
}

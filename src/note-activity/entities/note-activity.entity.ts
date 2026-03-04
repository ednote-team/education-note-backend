import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('note_activity')
@Unique(['noteId', 'userId'])
export class NoteActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'note_id', type: 'uuid' })
  noteId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'user_name', type: 'text' })
  userName: string;

  @Column({ name: 'edited_at', type: 'timestamptz' })
  editedAt: Date;
}

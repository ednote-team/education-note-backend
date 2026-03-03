import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('note_permissions')
export class NotePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  note_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text' })
  role: string;

  @Column({ name: 'resource_type', type: 'text', default: 'note' })
  resource_type: string;

  @CreateDateColumn({ type: 'timestamptz' })
  shared_at: Date;
}

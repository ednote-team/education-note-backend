import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Stores the binary Yjs document state for each note.
 * Used by the future Yjs WebSocket server to:
 *   - Load the latest state when a collaboration room is opened
 *   - Persist updates so the document survives server restarts
 */
@Entity('note_yjs_states')
export class NoteYjsState {
  @PrimaryColumn({ name: 'note_id', type: 'uuid' })
  noteId: string;

  @Column({ type: 'bytea', nullable: true })
  state: Buffer | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

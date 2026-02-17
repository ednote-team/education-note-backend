import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyPlan } from '../../study-plans/entities/study-plan.entity';

@Entity('study_plan_items')
export class StudyPlanItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ name: 'ref_type', type: 'text' })
  refType: string;

  @Column({ name: 'ref_id', type: 'uuid' })
  refId: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'text' })
  status: string;

  @Column()
  position: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => StudyPlan, plan => plan.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: StudyPlan;
}
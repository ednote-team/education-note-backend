import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlansController, StudyPlanPublicController, StudyPlanSharesController } from './study-plans.controller';
import { StudyPlansService } from './study-plans.service';
import { StudyPlan } from './entities/study-plan.entity';
import { StudyPlanItem } from '../study-plan-items/entities/study-plan-item.entity';
import { NotePermission } from '../note-permissions/entities/note-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPlan, StudyPlanItem, NotePermission]),
  ],
  controllers: [StudyPlansController, StudyPlanPublicController, StudyPlanSharesController],
  providers: [StudyPlansService],
  exports: [StudyPlansService],
})
export class StudyPlansModule {}

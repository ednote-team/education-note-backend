import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanItemsController } from './study-plan-items.controller';
import { StudyPlanItemsService } from './study-plan-items.service';
import { StudyPlanItem } from './entities/study-plan-item.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPlanItem, StudyPlan]),
  ],
  controllers: [StudyPlanItemsController],
  providers: [StudyPlanItemsService],
  exports: [StudyPlanItemsService],
})
export class StudyPlanItemsModule {}

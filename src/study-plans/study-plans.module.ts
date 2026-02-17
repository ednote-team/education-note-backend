import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlansController } from './study-plans.controller';
import { StudyPlansService } from './study-plans.service';
import { StudyPlan } from './entities/study-plan.entity';
import { StudyPlanItem } from '../study-plan-items/entities/study-plan-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPlan, StudyPlanItem]),
  ],
  controllers: [StudyPlansController],
  providers: [StudyPlansService],
  exports: [StudyPlansService],
})
export class StudyPlansModule {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyPlan } from './entities/study-plan.entity';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plans.dto';
import { StudyPlanItem } from '../study-plan-items/entities/study-plan-item.entity';

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(StudyPlan)
    private readonly studyPlansRepository: Repository<StudyPlan>,
    @InjectRepository(StudyPlanItem)
    private readonly itemRepository: Repository<StudyPlanItem>,
  ) {}

  create(userId: string, dto: CreateStudyPlanDto): Promise<StudyPlan> {
    const studyPlan = this.studyPlansRepository.create({
      ...dto,
      userId,
    });
    return this.studyPlansRepository.save(studyPlan);
  }

  findAll(userId: string): Promise<StudyPlan[]> {
    return this.studyPlansRepository.find({
      where: { userId, isDeleted: false },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<StudyPlan> {
    const studyPlan = await this.studyPlansRepository.findOne({
      where: { id, userId, isDeleted: false },
      relations: ['items'],
    });

    if (!studyPlan) {
      throw new NotFoundException('Study plan not found');
    }

    if (studyPlan.items) {
      studyPlan.items.sort((a, b) => a.position - b.position);
    }

    return studyPlan;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateStudyPlanDto,
  ): Promise<StudyPlan> {
    const studyPlan = await this.findOne(id, userId);
    Object.assign(studyPlan, dto);
    studyPlan.updatedAt = new Date();
    return this.studyPlansRepository.save(studyPlan);
  }

  async toggleFavorite(id: string, userId: string): Promise<StudyPlan> {
    const studyPlan = await this.findOne(id, userId);
    studyPlan.isFavorite = !studyPlan.isFavorite;
    return this.studyPlansRepository.save(studyPlan);
  }

  async remove(id: string, userId: string): Promise<void> {
    const studyPlan = await this.findOne(id, userId);
    studyPlan.isDeleted = true;
    studyPlan.deletedAt = new Date();
    await this.studyPlansRepository.save(studyPlan);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const studyPlan = await this.studyPlansRepository.findOne({
      where: { id, userId, isDeleted: true },
    });

    if (!studyPlan) {
      throw new NotFoundException('Deleted study plan not found');
    }

    await this.studyPlansRepository.remove(studyPlan);
  }

  async restore(id: string, userId: string): Promise<StudyPlan> {
    const studyPlan = await this.studyPlansRepository.findOne({
      where: { id, userId, isDeleted: true },
    });

    if (!studyPlan) {
      throw new NotFoundException('Deleted study plan not found');
    }

    studyPlan.isDeleted = false;
    studyPlan.deletedAt = null;
    return this.studyPlansRepository.save(studyPlan);
  }

  async findDeleted(userId: string): Promise<StudyPlan[]> {
    // Auto-cleanup study plans deleted more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.studyPlansRepository
      .createQueryBuilder()
      .delete()
      .from(StudyPlan)
      .where('user_id = :userId AND is_deleted = true AND deleted_at IS NOT NULL AND deleted_at < :cutoff', {
        userId,
        cutoff: thirtyDaysAgo,
      })
      .execute();

    return this.studyPlansRepository.find({
      where: { userId, isDeleted: true },
      order: { deletedAt: 'DESC' },
    });
  }
}

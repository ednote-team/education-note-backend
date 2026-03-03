import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StudyPlanItem } from './entities/study-plan-item.entity';
import { StudyPlan } from '../study-plans/entities/study-plan.entity';
import {
  CreateStudyPlanItemDto,
  UpdateStudyPlanItemDto,
  ReorderItemsDto,
} from './dto/study-plan-items.dto';

@Injectable()
export class StudyPlanItemsService {
  constructor(
    @InjectRepository(StudyPlanItem)
    private readonly studyPlanItemsRepository: Repository<StudyPlanItem>,

    @InjectRepository(StudyPlan)
    private readonly studyPlansRepository: Repository<StudyPlan>,

    private readonly dataSource: DataSource,
  ) { }

  /** verify plan ownership OR edit permission */
  private async assertPlanAccess(userId: string, planId: string) {
    const plan = await this.studyPlansRepository.findOne({
      where: { id: planId, userId, isDeleted: false },
    });

    if (plan) return;

    const rows = await this.dataSource.query(
      `SELECT 1 FROM note_permissions WHERE note_id = $1 AND user_id = $2 AND resource_type = 'plan' AND role = 'edit' LIMIT 1`,
      [planId, userId],
    );

    if (!rows[0]) {
      throw new ForbiddenException('You do not have access to this study plan');
    }
  }

  async create(
    userId: string,
    planId: string,
    dto: CreateStudyPlanItemDto,
  ): Promise<StudyPlanItem> {
    await this.assertPlanAccess(userId, planId);

    const max = await this.studyPlanItemsRepository
      .createQueryBuilder('item')
      .select('MAX(item.position)', 'max')
      .where('item.planId = :planId', { planId })
      .getRawOne();

    const position = dto.position ?? (max?.max ?? -1) + 1;

    if (dto.position !== undefined) {
      await this.studyPlanItemsRepository
        .createQueryBuilder()
        .update(StudyPlanItem)
        .set({ position: () => 'position + 1' })
        .where('planId = :planId AND position >= :position', {
          planId,
          position,
        })
        .execute();
    }

    const item = this.studyPlanItemsRepository.create({
      ...dto,
      planId,
      position,
    });

    return this.studyPlanItemsRepository.save(item);
  }

  async findAllByPlan(userId: string, planId: string): Promise<StudyPlanItem[]> {
    await this.assertPlanAccess(userId, planId);

    return this.studyPlanItemsRepository.find({
      where: { planId },
      order: { position: 'ASC' },
    });
  }

  async findOne(
    userId: string,
    id: string,
    planId: string,
  ): Promise<StudyPlanItem> {
    await this.assertPlanAccess(userId, planId);

    const item = await this.studyPlanItemsRepository.findOne({
      where: { id, planId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(
    userId: string,
    id: string,
    planId: string,
    dto: UpdateStudyPlanItemDto,
  ): Promise<StudyPlanItem> {
    const item = await this.findOne(userId, id, planId);
    Object.assign(item, dto);
    item.updatedAt = new Date();
    return this.studyPlanItemsRepository.save(item);
  }

  async remove(
    userId: string,
    id: string,
    planId: string,
  ): Promise<void> {
    await this.assertPlanAccess(userId, planId);

    const item = await this.studyPlanItemsRepository.findOne({
      where: { id, planId },
    });

    if (!item) return;

    await this.studyPlanItemsRepository.remove(item);

    await this.studyPlanItemsRepository
      .createQueryBuilder()
      .update(StudyPlanItem)
      .set({ position: () => 'position - 1' })
      .where('planId = :planId AND position > :position', {
        planId,
        position: item.position,
      })
      .execute();
  }

  async reorder(
    userId: string,
    planId: string,
    dto: ReorderItemsDto,
  ): Promise<void> {
    await this.assertPlanAccess(userId, planId);

    await this.studyPlanItemsRepository.manager.transaction(async (manager) => {
      for (const { itemId, position } of dto.items) {
        await manager.update(
          StudyPlanItem,
          { id: itemId, planId },
          { position, updatedAt: new Date() },
        );
      }
    });
  }

  async replaceAll(
    userId: string,
    planId: string,
    items: CreateStudyPlanItemDto[],
  ): Promise<void> {
    await this.assertPlanAccess(userId, planId);

    await this.studyPlanItemsRepository.manager.transaction(async (manager) => {
      await manager.delete(StudyPlanItem, { planId });

      const entities = items.map((item, index) =>
        manager.create(StudyPlanItem, {
          ...item,
          planId,
          position: index,
        }),
      );

      await manager.save(entities);

      await manager.update(StudyPlan, planId, { updatedAt: new Date() });
    });
  }
}

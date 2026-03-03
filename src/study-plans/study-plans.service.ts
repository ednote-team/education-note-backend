import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StudyPlan } from './entities/study-plan.entity';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plans.dto';
import { StudyPlanItem } from '../study-plan-items/entities/study-plan-item.entity';

export type PlanAccessRole = 'owner' | 'edit' | 'view' | null;

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(StudyPlan)
    private readonly studyPlansRepository: Repository<StudyPlan>,
    @InjectRepository(StudyPlanItem)
    private readonly itemRepository: Repository<StudyPlanItem>,
    private readonly dataSource: DataSource,
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

  /** Find plan if user is owner OR has edit permission */
  private async findOneWithAccess(id: string, userId: string): Promise<StudyPlan> {
    const plan = await this.studyPlansRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['items'],
    });
    if (!plan) throw new NotFoundException('Study plan not found');

    if (plan.userId === userId) {
      if (plan.items) plan.items.sort((a, b) => a.position - b.position);
      return plan;
    }

    const rows = await this.dataSource.query(
      `SELECT 1 FROM note_permissions WHERE note_id = $1 AND user_id = $2 AND resource_type = 'plan' AND role = 'edit' LIMIT 1`,
      [id, userId],
    );
    if (!rows[0]) throw new NotFoundException('Study plan not found');

    if (plan.items) plan.items.sort((a, b) => a.position - b.position);
    return plan;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateStudyPlanDto,
  ): Promise<StudyPlan> {
    const studyPlan = await this.findOneWithAccess(id, userId);
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

  /* ── Shared / access ── */

  async getSharedWithMe(userId: string): Promise<any[]> {
    return this.dataSource.query(
      `SELECT
         np.id,
         np.role,
         np.shared_at     AS "sharedAt",
         s.id             AS "planId",
         s.title          AS "planTitle",
         s.updated_at     AS "planUpdatedAt",
         au.email         AS "ownerEmail"
       FROM note_permissions np
       JOIN study_plans s ON s.id = np.note_id AND s.is_deleted = false
       LEFT JOIN auth.users au ON au.id::text = s.user_id::text
       WHERE np.user_id = $1 AND np.resource_type = 'plan'
       ORDER BY np.shared_at DESC`,
      [userId],
    );
  }

  async getMyAccess(
    planId: string,
    userId: string,
  ): Promise<{ role: PlanAccessRole; canEdit: boolean }> {
    const plan = await this.studyPlansRepository.findOne({
      where: { id: planId, isDeleted: false },
    });
    if (!plan) throw new NotFoundException('Study plan not found');

    if (plan.userId === userId) return { role: 'owner', canEdit: true };

    const rows: { role: string }[] = await this.dataSource.query(
      `SELECT role FROM note_permissions WHERE note_id = $1 AND user_id = $2 AND resource_type = 'plan' LIMIT 1`,
      [planId, userId],
    );

    if (!rows[0]) return { role: null, canEdit: false };
    const role = rows[0].role as 'edit' | 'view';
    return { role, canEdit: role === 'edit' };
  }

  async getPublicStudyPlan(planId: string): Promise<{
    plan: Pick<StudyPlan, 'id' | 'title' | 'weekStartDate' | 'updatedAt' | 'sectionLayout'>;
    items: StudyPlanItem[];
  }> {
    const plan = await this.studyPlansRepository.findOne({
      where: { id: planId, isDeleted: false },
    });
    if (!plan) throw new NotFoundException('Study plan not found');

    const items = await this.itemRepository.find({
      where: { planId },
      order: { position: 'ASC' },
    });

    return {
      plan: {
        id: plan.id,
        title: plan.title,
        weekStartDate: plan.weekStartDate,
        updatedAt: plan.updatedAt,
        sectionLayout: plan.sectionLayout,
      },
      items,
    };
  }
}

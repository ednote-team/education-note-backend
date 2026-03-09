import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudyPlanItemsService } from './study-plan-items.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  CreateStudyPlanItemDto,
  UpdateStudyPlanItemDto,
  ReorderItemsDto,
  ReplaceStudyPlanItemsDto,
} from './dto/study-plan-items.dto';

@Controller('study-plan-items')
@UseGuards(SupabaseAuthGuard)
export class StudyPlanItemsController {
  constructor(private readonly studyPlanItemsService: StudyPlanItemsService) { }

  @Post(':planId')
  create(
    @Request() req,
    @Param('planId') planId: string,
    @Body() dto: CreateStudyPlanItemDto,
  ) {
    return this.studyPlanItemsService.create(req.user.id, planId, dto);
  }

  @Get('deadlines')
  findDeadlines(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.studyPlanItemsService.findDeadlines(req.user.id, startDate, endDate);
  }

  @Get('plan/:planId')
  findAllByPlan(@Request() req, @Param('planId') planId: string) {
    return this.studyPlanItemsService.findAllByPlan(req.user.id, planId);
  }

  @Get(':planId/:itemId')
  findOne(
    @Request() req,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.studyPlanItemsService.findOne(req.user.id, itemId, planId);
  }

  @Put(':planId/:itemId')
  update(
    @Request() req,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateStudyPlanItemDto,
  ) {
    return this.studyPlanItemsService.update(req.user.id, itemId, planId, dto);
  }

  @Delete(':planId/:itemId')
  async remove(
    @Request() req,
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.studyPlanItemsService.remove(req.user.id, itemId, planId);
    return { message: 'Item deleted successfully' };
  }

  @Post(':planId/reorder')
  async reorder(
    @Request() req,
    @Param('planId') planId: string,
    @Body() dto: ReorderItemsDto,
  ) {
    await this.studyPlanItemsService.reorder(req.user.id, planId, dto);
    return { message: 'Items reordered successfully' };
  }

  @Put('plan/:planId/replace')
  replaceAll(
    @Request() req,
    @Param('planId') planId: string,
    @Body() dto: ReplaceStudyPlanItemsDto,
  ) {
    return this.studyPlanItemsService.replaceAll(
      req.user.id,
      planId,
      dto.items,
    );
  }
}

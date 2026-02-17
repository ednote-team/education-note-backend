import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudyPlansService } from './study-plans.service';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plans.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('study-plans')
@UseGuards(SupabaseAuthGuard)
export class StudyPlansController {
  constructor(private readonly studyPlansService: StudyPlansService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateStudyPlanDto) {
    return this.studyPlansService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.studyPlansService.findAll(req.user.id);
  }

  @Get('deleted')
  findDeleted(@Request() req) {
    return this.studyPlansService.findDeleted(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.studyPlansService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateStudyPlanDto,
  ) {
    return this.studyPlansService.update(id, req.user.id, dto);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.studyPlansService.toggleFavorite(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.studyPlansService.remove(id, req.user.id);
    return { message: 'Study plan moved to trash' };
  }

  @Delete(':id/hard')
  async hardDelete(@Request() req, @Param('id') id: string) {
    await this.studyPlansService.hardDelete(id, req.user.id);
    return { message: 'Study plan permanently deleted' };
  }

  @Post(':id/restore')
  restore(@Request() req, @Param('id') id: string) {
    return this.studyPlansService.restore(id, req.user.id);
  }
}

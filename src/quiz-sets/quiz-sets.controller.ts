import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { QuizSetsService } from './quiz-sets.service';
import { CreateQuizSetDto, UpdateQuizSetDto, GenerateQuizDto, ManualQuizSetDto, MergeQuizSetsDto } from './dto/quiz-set.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('quiz-sets')
export class QuizSetsController {
  constructor(private readonly quizSetsService: QuizSetsService) {}

  @Post('generate')
  async generate(
    @Body() dto: GenerateQuizDto,
    @Req() req: any,
  ) {
    try {
      if (!dto.noteId) {
        throw new BadRequestException('noteId is required');
      }

      return await this.quizSetsService.generateFromNote(
        dto.noteId,
        req.user.id,
        dto.options || {},
      );
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  @Post('manual')
  createManual(@Body() dto: ManualQuizSetDto, @Req() req: any) {
    return this.quizSetsService.createManual(dto, req.user.id);
  }

  @Post('merge')
  merge(@Body() dto: MergeQuizSetsDto, @Req() req: any) {
    return this.quizSetsService.mergeFromSets(dto, req.user.id);
  }

  @Post('merge-wrong')
  mergeWrong(@Body() dto: MergeQuizSetsDto, @Req() req: any) {
    return this.quizSetsService.mergeWrongAnswers(dto, req.user.id);
  }

  @Post()
  create(@Body() createQuizSetDto: CreateQuizSetDto) {
    return this.quizSetsService.create(createQuizSetDto);
  }

  @Get('deleted')
  findDeleted(@Req() req: any) {
    return this.quizSetsService.findDeleted(req.user.id);
  }

  @Get()
  findAll() {
    return this.quizSetsService.findAll();
  }

  @Get('note/:noteId')
  findByNoteId(@Param('noteId') noteId: string) {
    return this.quizSetsService.findByNoteId(noteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizSetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizSetDto: UpdateQuizSetDto) {
    return this.quizSetsService.update(id, updateQuizSetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizSetsService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Req() req: any) {
    return this.quizSetsService.restore(id, req.user.id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id') id: string, @Req() req: any) {
    return this.quizSetsService.hardDelete(id, req.user.id);
  }
}

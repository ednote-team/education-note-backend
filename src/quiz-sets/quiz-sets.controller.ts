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
import { CreateQuizSetDto, UpdateQuizSetDto, GenerateQuizDto } from './dto/quiz-set.dto';
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

  @Post()
  create(@Body() createQuizSetDto: CreateQuizSetDto) {
    return this.quizSetsService.create(createQuizSetDto);
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
}

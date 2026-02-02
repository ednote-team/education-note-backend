import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuizQuestionsService } from './quiz-questions.service';
import { CreateQuizQuestionDto, UpdateQuizQuestionDto } from './dto/quiz-question.dto';

@Controller('quiz-questions')
export class QuizQuestionsController {
  constructor(private readonly quizQuestionsService: QuizQuestionsService) {}

  @Post()
  create(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
    return this.quizQuestionsService.create(createQuizQuestionDto);
  }

  @Get()
  findAll() {
    return this.quizQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizQuestionsService.findOne(id);
  }

  @Get('quiz-set/:quizSetId')
  findByQuizSetId(@Param('quizSetId') quizSetId: string) {
    return this.quizQuestionsService.findByQuizSetId(quizSetId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.update(id, updateQuizQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizQuestionsService.remove(id);
  }
}

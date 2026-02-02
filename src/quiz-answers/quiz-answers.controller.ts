import { Controller, Get, Param } from '@nestjs/common';
import { QuizAnswersService } from './quiz-answers.service';

@Controller('quiz-answers')
export class QuizAnswersController {
  constructor(private readonly quizAnswersService: QuizAnswersService) {}

  @Get('attempt/:attemptId')
  findByAttemptId(@Param('attemptId') attemptId: string) {
    return this.quizAnswersService.findByAttemptId(attemptId);
  }
}

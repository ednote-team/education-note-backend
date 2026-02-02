import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAnswersModule } from '../quiz-answers/quiz-answers.module';
import { QuizQuestionsModule } from '../quiz-questions/quiz-questions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizAttempt]),
    QuizAnswersModule,
    QuizQuestionsModule,
  ],
  controllers: [QuizAttemptsController],
  providers: [QuizAttemptsService],
  exports: [QuizAttemptsService],
})
export class QuizAttemptsModule {}

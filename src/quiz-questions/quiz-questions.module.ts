import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestionsService } from './quiz-questions.service';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestion } from './entities/quiz-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion])],
  controllers: [QuizQuestionsController],
  providers: [QuizQuestionsService],
  exports: [QuizQuestionsService],
})
export class QuizQuestionsModule {}

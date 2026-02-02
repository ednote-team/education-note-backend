import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAnswersService } from './quiz-answers.service';
import { QuizAnswersController } from './quiz-answers.controller';
import { QuizAnswer } from './entities/quiz-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAnswer])],
  controllers: [QuizAnswersController],
  providers: [QuizAnswersService],
  exports: [QuizAnswersService],
})
export class QuizAnswersModule {}

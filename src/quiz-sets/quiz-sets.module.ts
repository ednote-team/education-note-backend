import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSetsService } from './quiz-sets.service';
import { QuizSetsController } from './quiz-sets.controller';
import { QuizSet } from './entities/quiz-set.entity';
import { QuizQuestion } from '../quiz-questions/entities/quiz-question.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';
import { GeminiService } from '../common/llm/gemini.service';
import { AiUsageModule } from '../ai-usage/ai-usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizSet, QuizQuestion, Note, NoteBlock]),
    AiUsageModule,
  ],
  controllers: [QuizSetsController],
  providers: [QuizSetsService, GeminiService],
  exports: [QuizSetsService],
})
export class QuizSetsModule {}

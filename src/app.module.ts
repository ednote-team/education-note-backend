import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { NoteBlocksModule } from './note-blocks/note-blocks.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { FlashcardSetsModule } from './flashcard-sets/flashcard-sets.module';
import { FlashcardReviewsModule } from './flashcard-reviews/flashcard-reviews.module';
import { QuizSetsModule } from './quiz-sets/quiz-sets.module';
import { QuizQuestionsModule } from './quiz-questions/quiz-questions.module';
import { QuizAttemptsModule } from './quiz-attempts/quiz-attempts.module';
import { QuizAnswersModule } from './quiz-answers/quiz-answers.module';
import { ChatModule } from './chat/chat.module';
import { StudyPlansModule } from './study-plans/study-plans.module';
import { StudyPlanItemsModule } from './study-plan-items/study-plan-items.module';
import { AiUsageModule } from './ai-usage/ai-usage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    NotesModule,
    NoteBlocksModule,
    FlashcardsModule,
    FlashcardSetsModule,
    FlashcardReviewsModule,
    QuizSetsModule,
    QuizQuestionsModule,
    QuizAttemptsModule,
    QuizAnswersModule,
    ChatModule,
    StudyPlansModule,
    StudyPlanItemsModule,
    AiUsageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
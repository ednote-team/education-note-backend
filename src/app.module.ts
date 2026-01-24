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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
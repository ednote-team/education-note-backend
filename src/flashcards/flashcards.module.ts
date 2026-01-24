import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { Flashcard } from './entities/flashcards.entity';
import { FlashcardSet } from '../flashcard-sets/entities/flashcard-set.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Flashcard,
    FlashcardSet,
    Note,
    NoteBlock,])],
  controllers: [FlashcardsController],
  providers: [FlashcardsService,],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
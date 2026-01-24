import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';

@Controller('flashcard-sets/:setId/flashcards')
export class FlashcardsController {
  constructor(
    private readonly flashcardsService: FlashcardsService,
  ) {}

  @Get('note/:noteId/sets')
  getSetsByNote(@Param('noteId') noteId: string) {
    return this.flashcardsService.findSetsByNote(noteId);
  }

  @Get('set/:setId')
  getFlashcardsBySet(@Param('setId') setId: string) {
    return this.flashcardsService.findFlashcardsBySet(setId);
  }

  @Get()
  find(@Param('setId') setId: string) {
    return this.flashcardsService.findFlashcardsBySet(setId);
  }
}

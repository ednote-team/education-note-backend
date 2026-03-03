import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { AddFlashcardToSetDto } from './dto/flashcard.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('flashcard-sets/:setId/flashcards')
export class FlashcardsController {
  constructor(
    private readonly flashcardsService: FlashcardsService,
  ) {}

  @Get()
  find(@Param('setId') setId: string) {
    return this.flashcardsService.findFlashcardsBySet(setId);
  }

  @Post()
  create(
    @Param('setId') setId: string,
    @Body() dto: AddFlashcardToSetDto,
  ) {
    return this.flashcardsService.createFlashcard(setId, dto.front_text, dto.back_text);
  }

  @Delete(':cardId')
  delete(@Param('cardId') cardId: string) {
    return this.flashcardsService.deleteFlashcard(cardId);
  }
}
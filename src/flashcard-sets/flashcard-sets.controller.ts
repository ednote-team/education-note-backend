import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { FlashcardSetsService } from './flashcard-sets.service';
import { GenerateFlashcardDto } from './dto/flashcard-set.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('flashcard-sets')
export class FlashcardSetsController {
  constructor(
    private readonly flashcardSetsService: FlashcardSetsService,
  ) {}

  @Post('generate')
  async generate(
    @Body() dto: GenerateFlashcardDto,
    @Req() req: any,
  ) {
    try {
      if (!dto.noteId) {
        throw new BadRequestException('noteId is required');
      }

      return await this.flashcardSetsService.generateFromNote(
        dto.noteId,
        req.user.id,
        dto.options || {},
      );
    } catch (error) {
      console.error('Error generating flashcard:', error);
      throw error;
    }
  }

  @Get()
  findByNote(
    @Query('noteId') noteId: string,
  ) {
    return this.flashcardSetsService.findByNote(
      noteId,
    );
  }

  @Get(':setId')
  findOne(
    @Param('setId') setId: string,
  ) {
    return this.flashcardSetsService.findOne(
      setId,
    );
  }

  @Delete(':setId')
  remove(
    @Param('setId') setId: string,
    @Req() req: any,
  ) {
    return this.flashcardSetsService.remove(
      setId,
      req.user.id,
    );
  }

  @Patch(':setId/restore')
  restore(
    @Param('setId') setId: string,
    @Req() req: any,
  ) {
    return this.flashcardSetsService.restore(
      setId,
      req.user.id,
    );
  }

  @Delete(':setId/hard')
  hardDelete(
    @Param('setId') setId: string,
  ) {
    return this.flashcardSetsService.hardDelete(setId);
  }
}
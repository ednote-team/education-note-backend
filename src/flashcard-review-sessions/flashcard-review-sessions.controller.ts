import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FlashcardReviewSessionsService } from './flashcard-review-sessions.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('flashcard-review-sessions')
export class FlashcardReviewSessionsController {
  constructor(
    private readonly sessionService: FlashcardReviewSessionsService,
  ) {}

  @Post('start')
  start(
    @Body('setId') setId: string,
  ) {
    return this.sessionService.startSession(
      setId,
    );
  }

  @Get('latest')
  getLatest(
    @Query('setId') setId: string,
  ) {
    return this.sessionService.getLatestSession(
      setId,
    );
  }
}
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

  @Post(':setId/start')
  start(
    @Param('setId') setId: string,
  ) {
    return this.sessionService.startSession(
      setId,
    );
  }

  @Get(':setId/latest')
  getLatest(
    @Query('setId') setId: string,
  ) {
    return this.sessionService.getLatestSession(
      setId,
    );
  }

  @Get(':setId/count')
  async countBySet(
    @Param('setId') setId: string,
  ) {
    const count = await this.sessionService.countBySet(setId);
    return { timesReviewed: count };
  }
}
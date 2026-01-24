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
import { FlashcardReviewsService } from './flashcard-reviews.service';
import { CreateFlashcardReviewDto } from './dto/flashcard-review.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('flashcard-reviews')
export class FlashcardReviewsController {
  constructor(
    private readonly reviewService: FlashcardReviewsService,
  ) {}

  @Post()
  submit(
    @Body() dto: CreateFlashcardReviewDto,
    @Req() req: any,
  ) {
    return this.reviewService.submitReview({
      flashcardId: dto.flashcardId,
      userId: req.user.id,
      sessionId: dto.sessionId,
      isCorrect: dto.isCorrect,
    });
  }

  @Get('wrong')
  getWrongOnly(
    @Query('setId') setId: string,
    @Req() req: any,
  ) {
    return this.reviewService.findWrongFlashcards(
      setId,
      req.user.id,
    );
  }

  @Get('history/:flashcardId')
  getHistory(
    @Param('flashcardId') flashcardId: string,
  ) {
    return this.reviewService.getReviewHistory(
      flashcardId,
    );
  }
}
import { IsBoolean, IsUUID } from 'class-validator';

export class CreateFlashcardReviewDto {
  @IsUUID()
  flashcardId: string;

  @IsUUID()
  sessionId: string;

  @IsBoolean()
  isCorrect: boolean;
}
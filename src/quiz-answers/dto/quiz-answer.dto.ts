import { IsUUID, IsString, IsBoolean } from 'class-validator';

export class CreateQuizAnswerDto {
  @IsUUID()
  attempt_id: string;

  @IsUUID()
  question_id: string;

  @IsString()
  user_answer: string;

  @IsBoolean()
  isCorrect: boolean;
}

import { IsUUID, IsArray, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @IsUUID()
  question_id: string;

  @IsOptional()
  @IsString()
  user_answer: string;
}

export class CreateQuizAttemptDto {
  @IsUUID()
  quiz_set_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}

import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateQuizQuestionDto {
  @IsUUID()
  quiz_set_id: string;

  @IsString()
  question_text: string;

  @IsString()
  question_type: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsString()
  correct_answer: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class UpdateQuizQuestionDto {
  @IsString()
  @IsOptional()
  question_text?: string;

  @IsString()
  @IsOptional()
  question_type?: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsString()
  @IsOptional()
  correct_answer?: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

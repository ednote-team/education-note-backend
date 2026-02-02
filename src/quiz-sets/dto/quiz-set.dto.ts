import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateQuizSetDto {
  @IsUUID()
  note_id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateQuizSetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class GenerateQuizDto {
  @IsUUID()
  noteId: string;

  @IsOptional()
  options?: {
    count?: number;
    minCount?: number;
    language?: 'th' | 'en';
    questionTypes?: ('multiple_choice' | 'true_false' | 'short_answer')[];
  };
}

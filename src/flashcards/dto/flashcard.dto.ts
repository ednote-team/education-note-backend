import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFlashcardDto {
  @IsUUID()
  set_id: string;

  @IsString()
  front_text: string;

  @IsString()
  back_text: string;

  @IsOptional()
  @IsString()
  correct_answer?: string;
}

export class UpdateFlashcardDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class GenerateFlashcardDto {
  noteId: string;
  options?: {
    count?: number;
    minCount?: number;
    language?: 'th' | 'en';
  };
}
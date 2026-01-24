import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFlashcardSetDto {
  @IsUUID()
  note_id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class GenerateFlashcardDto {
  @IsUUID()
  noteId: string;

  @IsOptional()
  options?: {
    count?: number;
    minCount?: number;
    language?: 'th' | 'en';
  };
}
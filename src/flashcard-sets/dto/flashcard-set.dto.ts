import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

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

export class CreateManualFlashcardSetDto {
  @IsUUID()
  noteId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  cards: { front_text: string; back_text: string }[];
}

export class MergeFlashcardSetsDto {
  @IsUUID()
  noteId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  sourceSetIds: string[];
}
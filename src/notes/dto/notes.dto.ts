import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class AiAssistDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  context?: string;
}

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

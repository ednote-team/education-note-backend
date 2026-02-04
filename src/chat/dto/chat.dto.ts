import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatHistoryItemDto {
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  context?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  @IsOptional()
  history?: ChatHistoryItemDto[];
}

import { IsString, IsOptional, IsNotEmpty, IsObject, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  blockType: string;

  @IsObject()
  @IsNotEmpty()
  content: any;

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  blockType?: string;

  @IsObject()
  @IsOptional()
  content?: any;
}

class BlockPositionDto {
  @IsString()
  @IsNotEmpty()
  blockId: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;
}

export class ReorderBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockPositionDto)
  blocks: BlockPositionDto[];
}

export class ReplaceNoteBlocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockDto)
  blocks: CreateBlockDto[];
}

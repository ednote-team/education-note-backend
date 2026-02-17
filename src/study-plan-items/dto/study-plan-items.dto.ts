import { IsString, IsOptional, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudyPlanItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  refType: string;

  @IsString()
  @IsNotEmpty()
  refId: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateStudyPlanItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  refType?: string;

  @IsString()
  @IsOptional()
  refId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

class ItemPositionDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;
}

export class ReorderItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPositionDto)
  items: ItemPositionDto[];
}

export class ReplaceStudyPlanItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudyPlanItemDto)
  items: CreateStudyPlanItemDto[];
}

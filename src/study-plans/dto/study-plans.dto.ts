import { IsString, IsOptional, IsNotEmpty, IsDateString, IsArray } from 'class-validator';

export class CreateStudyPlanDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  weekStartDate: string;
}

export class UpdateStudyPlanDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  weekStartDate?: string;

  @IsArray()
  @IsOptional()
  sectionLayout?: any[];
}

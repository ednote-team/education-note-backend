import { IsEmail, IsIn } from 'class-validator';

export class CreateNotePermissionDto {
  @IsEmail()
  email: string;

  @IsIn(['view', 'edit'])
  role: string;
}

export class UpdateNotePermissionDto {
  @IsIn(['view', 'edit'])
  role: string;
}

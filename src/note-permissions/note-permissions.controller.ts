import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotePermissionsService } from './note-permissions.service';
import { CreateNotePermissionDto, UpdateNotePermissionDto } from './dto/note-permission.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/** Public — no auth needed, anyone with the link can read */
@Controller('notes')
export class NotePublicController {
  constructor(private readonly service: NotePermissionsService) {}

  @Get(':noteId/public')
  getPublicNote(@Param('noteId') noteId: string) {
    return this.service.getPublicNote(noteId);
  }
}

/** Protected — note owner only */
@Controller('notes/:noteId/shares')
@UseGuards(SupabaseAuthGuard)
export class NotePermissionsController {
  constructor(private readonly service: NotePermissionsService) {}

  @Get()
  findAll(@Request() req, @Param('noteId') noteId: string) {
    return this.service.findAll(noteId, req.user.id);
  }

  @Post()
  create(
    @Request() req,
    @Param('noteId') noteId: string,
    @Body() dto: CreateNotePermissionDto,
  ) {
    return this.service.create(noteId, req.user.id, dto);
  }

  @Patch(':permId')
  updateRole(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('permId') permId: string,
    @Body() dto: UpdateNotePermissionDto,
  ) {
    return this.service.updateRole(noteId, permId, req.user.id, dto);
  }

  @Delete(':permId')
  async revoke(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('permId') permId: string,
  ) {
    await this.service.revoke(noteId, permId, req.user.id);
    return { message: 'Access revoked' };
  }
}

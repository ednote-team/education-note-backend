import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { NoteActivityService } from './note-activity.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('note-activity')
@UseGuards(SupabaseAuthGuard)
export class NoteActivityController {
  constructor(private readonly service: NoteActivityService) {}

  @Get('note/:noteId')
  findByNote(@Request() req, @Param('noteId') noteId: string) {
    return this.service.findByNote(noteId, req.user.id);
  }
}

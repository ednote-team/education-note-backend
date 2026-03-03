import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto, AiAssistDto } from './dto/notes.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('notes')
@UseGuards(SupabaseAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateNoteDto) {
    return this.notesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.id);
  }

  @Get('deleted')
  findDeleted(@Request() req) {
    return this.notesService.findDeleted(req.user.id);
  }

  @Get('shared-with-me')
  getSharedWithMe(@Request() req) {
    return this.notesService.getSharedWithMe(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, req.user.id, dto);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.notesService.toggleFavorite(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.notesService.remove(id, req.user.id);
    return { message: 'Note moved to trash' };
  }

  @Delete(':id/hard')
  async hardDelete(@Request() req, @Param('id') id: string) {
    await this.notesService.hardDelete(id, req.user.id);
    return { message: 'Note permanently deleted' };
  }

  @Post(':id/restore')
  restore(@Request() req, @Param('id') id: string) {
    return this.notesService.restore(id, req.user.id);
  }

  @Post(':id/ai-assist')
  aiAssist(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AiAssistDto,
  ) {
    return this.notesService.aiAssist(
      id,
      req.user.id,
      dto.message,
      dto.context,
    );
  }

  /* ── Collab / Yjs infrastructure ── */

  /**
   * Returns the current user's access level for a note.
   * Future Yjs WebSocket gateway will call this to verify
   * permissions before allowing a client to join a room.
   */
  @Get(':id/my-access')
  getMyAccess(@Request() req, @Param('id') id: string) {
    return this.notesService.getMyAccess(id, req.user.id);
  }

  /**
   * Returns base64-encoded Yjs document state.
   * Future Yjs WS server calls this when bootstrapping a new room.
   */
  @Get(':id/yjs-state')
  getYjsState(@Request() req, @Param('id') id: string) {
    return this.notesService.getYjsState(id, req.user.id);
  }

  /**
   * Persists base64-encoded Yjs document state.
   * Future Yjs WS server calls this periodically or on room close.
   * Body: { state: string }
   */
  @Put(':id/yjs-state')
  saveYjsState(
    @Request() req,
    @Param('id') id: string,
    @Body('state') state: string,
  ) {
    return this.notesService.saveYjsState(id, req.user.id, state);
  }
}

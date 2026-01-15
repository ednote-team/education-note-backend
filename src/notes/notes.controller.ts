import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/notes.dto';
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
}

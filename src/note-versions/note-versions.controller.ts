import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { NoteVersionsService } from './note-versions.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

class SaveVersionDto {
  @IsString()
  noteId: string;

  @IsString()
  userName: string;

  @IsArray()
  blocks: object[];
}

@Controller('note-versions')
@UseGuards(SupabaseAuthGuard)
export class NoteVersionsController {
  constructor(private readonly service: NoteVersionsService) {}

  @Post()
  save(@Request() req, @Body() dto: SaveVersionDto) {
    return this.service.saveVersion(
      dto.noteId,
      req.user.id,
      dto.userName,
      dto.blocks,
    );
  }

  @Get('note/:noteId')
  findByNote(@Request() req, @Param('noteId') noteId: string) {
    return this.service.findByNote(noteId, req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.service.findOne(id, req.user.id);
  }
}

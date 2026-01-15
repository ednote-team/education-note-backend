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
import { NoteBlocksService } from './note-blocks.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  CreateBlockDto,
  UpdateBlockDto,
  ReorderBlocksDto,
  ReplaceNoteBlocksDto,
} from './dto/note-blocks.dto';

@Controller('note-blocks')
@UseGuards(SupabaseAuthGuard)
export class NoteBlocksController {
  constructor(private readonly noteBlocksService: NoteBlocksService) { }

  @Post(':noteId')
  create(
    @Request() req,
    @Param('noteId') noteId: string,
    @Body() dto: CreateBlockDto,
  ) {
    return this.noteBlocksService.create(req.user.id, noteId, dto);
  }

  @Get('note/:noteId')
  findAllByNote(@Request() req, @Param('noteId') noteId: string) {
    return this.noteBlocksService.findAllByNote(req.user.id, noteId);
  }

  @Get(':noteId/:blockId')
  findOne(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('blockId') blockId: string,
  ) {
    return this.noteBlocksService.findOne(req.user.id, blockId, noteId);
  }

  @Put(':noteId/:blockId')
  update(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('blockId') blockId: string,
    @Body() dto: UpdateBlockDto,
  ) {
    return this.noteBlocksService.update(req.user.id, blockId, noteId, dto);
  }

  @Delete(':noteId/:blockId')
  async remove(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('blockId') blockId: string,
  ) {
    await this.noteBlocksService.remove(req.user.id, blockId, noteId);
    return { message: 'Block deleted successfully' };
  }

  @Post(':noteId/reorder')
  async reorder(
    @Request() req,
    @Param('noteId') noteId: string,
    @Body() dto: ReorderBlocksDto,
  ) {
    await this.noteBlocksService.reorder(req.user.id, noteId, dto);
    return { message: 'Blocks reordered successfully' };
  }

  @Post(':noteId/:blockId/convert')
  convertType(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('blockId') blockId: string,
    @Body() body: { blockType: string },
  ) {
    return this.noteBlocksService.convertType(
      req.user.id,
      blockId,
      noteId,
      body.blockType,
    );
  }

  @Put('note/:noteId/replace')
  replaceAll(
    @Request() req,
    @Param('noteId') noteId: string,
    @Body() dto: ReplaceNoteBlocksDto,
  ) {
    return this.noteBlocksService.replaceAll(
      req.user.id,
      noteId,
      dto.blocks,
    );
  }
}

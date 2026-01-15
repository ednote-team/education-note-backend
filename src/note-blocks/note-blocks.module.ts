import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteBlocksController } from './note-blocks.controller';
import { NoteBlocksService } from './note-blocks.service';
import { NoteBlock } from './entities/note-block.entity';
import { Note } from '../notes/entities/note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoteBlock,
      Note,
    ]),
  ],
  controllers: [NoteBlocksController],
  providers: [NoteBlocksService],
})
export class NoteBlocksModule {}

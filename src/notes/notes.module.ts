import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';
import { NoteYjsState } from './entities/note-yjs-state.entity';
import { LlmModule } from '../common/llm/llm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, NoteBlock, NoteYjsState]),
    LlmModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}

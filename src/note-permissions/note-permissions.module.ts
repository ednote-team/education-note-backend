import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotePermission } from './entities/note-permission.entity';
import { Note } from '../notes/entities/note.entity';
import { NoteBlock } from '../note-blocks/entities/note-block.entity';
import { NotePermissionsService } from './note-permissions.service';
import { NotePermissionsController, NotePublicController } from './note-permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotePermission, Note, NoteBlock])],
  controllers: [NotePermissionsController, NotePublicController],
  providers: [NotePermissionsService],
})
export class NotePermissionsModule {}

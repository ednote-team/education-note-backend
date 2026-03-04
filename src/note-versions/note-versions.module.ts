import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteVersion } from './entities/note-version.entity';
import { NoteVersionsService } from './note-versions.service';
import { NoteVersionsController } from './note-versions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoteVersion])],
  controllers: [NoteVersionsController],
  providers: [NoteVersionsService],
  exports: [NoteVersionsService],
})
export class NoteVersionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteActivity } from './entities/note-activity.entity';
import { NoteActivityService } from './note-activity.service';
import { NoteActivityController } from './note-activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NoteActivity])],
  controllers: [NoteActivityController],
  providers: [NoteActivityService],
  exports: [NoteActivityService],
})
export class NoteActivityModule {}

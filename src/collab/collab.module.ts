import { Module } from '@nestjs/common';
import { CollabService } from './collab.service';
import { NoteActivityModule } from '../note-activity/note-activity.module';

@Module({
  imports: [NoteActivityModule],
  providers: [CollabService],
})
export class CollabModule {}

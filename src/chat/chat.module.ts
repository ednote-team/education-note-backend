import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LlmModule } from '../common/llm/llm.module';
import { AiUsageModule } from '../ai-usage/ai-usage.module';

@Module({
  imports: [LlmModule, AiUsageModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

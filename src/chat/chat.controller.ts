import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('chat')
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  chat(@Request() req, @Body() dto: ChatDto) {
    return this.chatService.chat(req.user.id, dto.message, dto.context, dto.history);
  }
}

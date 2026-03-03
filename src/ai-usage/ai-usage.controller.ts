import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AiUsageService } from './ai-usage.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class AiUsageController {
  constructor(private readonly aiUsageService: AiUsageService) {}

  @Get('ai-usage')
  getUsage(@Request() req) {
    return this.aiUsageService.getUsage(req.user.id);
  }
}

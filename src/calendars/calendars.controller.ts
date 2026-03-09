import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendars.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('calendars')
@UseGuards(SupabaseAuthGuard)
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateCalendarDto) {
    return this.calendarsService.create(req.user.id, dto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.calendarsService.findByRange(req.user.id, startDate, endDate);
    }
    return this.calendarsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.calendarsService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarDto,
  ) {
    return this.calendarsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Request() req, @Param('id') id: string) {
    await this.calendarsService.remove(id, req.user.id);
    return { message: 'Calendar moved to trash' };
  }

  @Delete(':id/hard')
  @HttpCode(200)
  async hardDelete(@Request() req, @Param('id') id: string) {
    await this.calendarsService.hardDelete(id, req.user.id);
    return { message: 'Calendar permanently deleted' };
  }
}

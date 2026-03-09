import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar } from './entities/calendar.entity';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendars.dto';

@Injectable()
export class CalendarsService {
  constructor(
    @InjectRepository(Calendar)
    private readonly calendarsRepository: Repository<Calendar>,
  ) {}

  create(userId: string, dto: CreateCalendarDto): Promise<Calendar> {
    const calendar = this.calendarsRepository.create({
      ...dto,
      userId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
    return this.calendarsRepository.save(calendar);
  }

  findAll(userId: string): Promise<Calendar[]> {
    return this.calendarsRepository.find({
      where: { userId, isDeleted: false },
      order: { startDate: 'ASC' },
    });
  }

  findByRange(userId: string, startDate: string, endDate: string): Promise<Calendar[]> {
    return this.calendarsRepository
      .createQueryBuilder('calendar')
      .where('calendar.user_id = :userId', { userId })
      .andWhere('calendar.is_deleted = false')
      .andWhere('calendar.start_date <= :endDate', { endDate: new Date(endDate) })
      .andWhere('calendar.end_date >= :startDate', { startDate: new Date(startDate) })
      .orderBy('calendar.start_date', 'ASC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Calendar> {
    const calendar = await this.calendarsRepository.findOne({
      where: { id, userId, isDeleted: false },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');
    return calendar;
  }

  async update(id: string, userId: string, dto: UpdateCalendarDto): Promise<Calendar> {
    const calendar = await this.findOne(id, userId);
    Object.assign(calendar, {
      ...dto,
      ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
    });
    return this.calendarsRepository.save(calendar);
  }

  async remove(id: string, userId: string): Promise<void> {
    const calendar = await this.findOne(id, userId);
    calendar.isDeleted = true;
    calendar.deletedAt = new Date();
    await this.calendarsRepository.save(calendar);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const calendar = await this.calendarsRepository.findOne({
      where: { id, userId, isDeleted: true },
    });
    if (!calendar) throw new NotFoundException('Deleted calendar not found');
    await this.calendarsRepository.remove(calendar);
  }
}

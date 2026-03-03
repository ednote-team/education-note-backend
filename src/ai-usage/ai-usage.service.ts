import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsage } from './entities/ai-usage.entity';

@Injectable()
export class AiUsageService {
  constructor(
    @InjectRepository(AiUsage)
    private readonly repo: Repository<AiUsage>,
  ) {}

  private nextResetDate(): Date {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow;
  }

  async getOrCreate(userId: string): Promise<AiUsage> {
    let record = await this.repo.findOne({ where: { userId } });

    if (!record) {
      record = this.repo.create({
        userId,
        used: 0,
        limit: 2,
        plan: 'Free',
        resetAt: this.nextResetDate(),
      });
      return this.repo.save(record);
    }

    // ถ้าถึงวันรีเซ็ตแล้ว → reset counter
    if (new Date() >= record.resetAt) {
      record.used = 0;
      record.resetAt = this.nextResetDate();
      record.limit = 2;
      return this.repo.save(record);
    }

    // sync limit ถ้า record เก่ายังมี limit ผิด
    if (record.limit !== 2) {
      record.limit = 2;
      return this.repo.save(record);
    }

    return record;
  }

  async getUsage(userId: string) {
    const record = await this.getOrCreate(userId);
    return {
      used: record.used,
      limit: record.limit,
      plan: record.plan,
      resetAt: record.resetAt,
    };
  }

  async increment(userId: string): Promise<void> {
    const record = await this.getOrCreate(userId);

    if (record.used >= record.limit) {
      throw new HttpException(
        { message: 'AI generation limit reached. Resets tomorrow.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.repo.update({ userId }, { used: record.used + 1 });
  }
}

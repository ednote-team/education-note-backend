import { InjectRepository } from "@nestjs/typeorm";
import { FlashcardReviewSession } from "./entities/flashcard-review-session.entity";
import { Injectable } from '@nestjs/common';
import { Repository } from "typeorm";

@Injectable()
export class FlashcardReviewSessionsService {
  constructor(
    @InjectRepository(FlashcardReviewSession)
    private readonly sessionRepo: Repository<FlashcardReviewSession>,
  ) {}

  async startSession(setId: string) {
    const session = this.sessionRepo.create({
      set: { id: setId },
    });
    return this.sessionRepo.save(session);
  }

  async getLatestSession(setId: string) {
    return this.sessionRepo.findOne({
      where: { set: { id: setId } },
      order: { createdAt: 'DESC' },
    });
  }

  async countBySet(setId: string): Promise<number> {
    return this.sessionRepo.count({
      where: { set: { id: setId } },
    });
  }

  /** review_round คำนวณจากจำนวน session ที่มี set_id เดียวกัน */
  async getReviewRound(setId: string): Promise<number> {
    return this.sessionRepo.count({
      where: { set: { id: setId } },
    });
  }
}

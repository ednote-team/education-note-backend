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
    return this.sessionRepo.manager.transaction(async (manager) => {
      const lastSession = await manager.findOne(FlashcardReviewSession, {
        where: { set: { id: setId } },
        order: { reviewRound: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });

      const nextRound = lastSession ? lastSession.reviewRound + 1 : 1;

      const session = manager.create(FlashcardReviewSession, {
        set: { id: setId },
        reviewRound: nextRound,
      });

      return manager.save(session);
    });
  }

  async getLatestSession(setId: string) {
    return this.sessionRepo.findOne({
      where: { set: { id: setId } },
      order: { reviewRound: 'DESC' },
    });
  }

  async countBySet(setId: string): Promise<number> {
    return this.sessionRepo.count({
      where: { set: { id: setId } },
    });
  }
}
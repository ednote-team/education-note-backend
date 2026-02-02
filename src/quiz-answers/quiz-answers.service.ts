import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { CreateQuizAnswerDto } from './dto/quiz-answer.dto';

@Injectable()
export class QuizAnswersService {
  constructor(
    @InjectRepository(QuizAnswer)
    private quizAnswerRepository: Repository<QuizAnswer>,
  ) {}

  async create(createQuizAnswerDto: CreateQuizAnswerDto): Promise<QuizAnswer> {
    const answer = this.quizAnswerRepository.create(createQuizAnswerDto);
    return await this.quizAnswerRepository.save(answer);
  }

  async findByAttemptId(attemptId: string): Promise<QuizAnswer[]> {
    return await this.quizAnswerRepository.find({
      where: { attempt_id: attemptId },
      relations: ['question'],
    });
  }
}

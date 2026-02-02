import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';
import { QuizAnswersService } from '../quiz-answers/quiz-answers.service';
import { QuizQuestionsService } from '../quiz-questions/quiz-questions.service';

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    private quizAnswersService: QuizAnswersService,
    private quizQuestionsService: QuizQuestionsService,
  ) {}

  async create(createQuizAttemptDto: CreateQuizAttemptDto): Promise<QuizAttempt> {
    // สร้าง attempt
    const attempt = this.quizAttemptRepository.create({
      quiz_set_id: createQuizAttemptDto.quiz_set_id,
      totalQuestions: createQuizAttemptDto.answers.length,
    });
    const savedAttempt = await this.quizAttemptRepository.save(attempt);

    // ตรวจสอบคำตอบ
    let correctCount = 0;
    for (const answerDto of createQuizAttemptDto.answers) {
      const question = await this.quizQuestionsService.findOne(
        answerDto.question_id,
      );

      if (!question) {
        throw new Error(`Question with id ${answerDto.question_id} not found`);
      }

      const userAnswer = answerDto.user_answer ?? '';
      const isCorrect =
        question.correct_answer.toLowerCase().trim() ===
        userAnswer.toLowerCase().trim();

      if (isCorrect) correctCount++;

      await this.quizAnswersService.create({
        attempt_id: savedAttempt.id,
        question_id: answerDto.question_id,
        user_answer: userAnswer,
        isCorrect,
      });
    }

    // อัพเดท score
    savedAttempt.correctCount = correctCount;
    savedAttempt.score = Math.round(
      (correctCount / savedAttempt.totalQuestions) * 100,
    );
    return await this.quizAttemptRepository.save(savedAttempt);
  }

  async findAll(): Promise<QuizAttempt[]> {
    return await this.quizAttemptRepository.find({
      relations: ['answers', 'answers.question'],
    });
  }

  async findOne(id: string): Promise<QuizAttempt | null> {
    return await this.quizAttemptRepository.findOne({
      where: { id },
      relations: ['answers', 'answers.question'],
    });
  }

  async findByQuizSetId(quizSetId: string): Promise<QuizAttempt[]> {
    return await this.quizAttemptRepository.find({
      where: { quiz_set_id: quizSetId },
      relations: ['answers', 'answers.question'],
    });
  }
}

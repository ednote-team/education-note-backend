import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './entities/quiz-question.entity';
import { CreateQuizQuestionDto, UpdateQuizQuestionDto } from './dto/quiz-question.dto';

@Injectable()
export class QuizQuestionsService {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async create(createQuizQuestionDto: CreateQuizQuestionDto): Promise<QuizQuestion> {
    const question = this.quizQuestionRepository.create(createQuizQuestionDto);
    return await this.quizQuestionRepository.save(question);
  }

  async findAll(): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find();
  }

  async findOne(id: string): Promise<QuizQuestion | null> {
    return await this.quizQuestionRepository.findOne({ where: { id } });
  }

  async findByQuizSetId(quizSetId: string): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      where: { quiz_set_id: quizSetId },
    });
  }

  async update(id: string, updateQuizQuestionDto: UpdateQuizQuestionDto): Promise<QuizQuestion | null> {
    await this.quizQuestionRepository.update(id, updateQuizQuestionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.quizQuestionRepository.delete(id);
  }
}

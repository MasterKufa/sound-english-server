import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Word as WordModel } from './wordsToLearn.model';
import { Sequelize } from 'sequelize-typescript';
import { WordPayload, WordToLearn } from './types';
import { WithUser } from 'src/auth/types';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(WordModel)
    private wordModel: typeof WordModel,
    private sequelize: Sequelize,
  ) {}

  async findByFilters(): Promise<WordToLearn[] | null> {
    return this.wordModel.findAll();
  }

  async addOne(payload: WithUser<WordPayload>): Promise<void> {
    this.wordModel.create(payload);
  }
}

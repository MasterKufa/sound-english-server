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

  async findByFilters(
    payload: WithUser<object>,
  ): Promise<WordToLearn[] | null> {
    return await this.wordModel.findAll({ where: { userId: payload.user.id } });
  }

  async addOne(payload: WithUser<WordPayload>): Promise<void> {
    await this.wordModel.create({ ...payload, userId: payload.user.id });
  }

  async deleteOne(payload: WithUser<{ id: number }>): Promise<void> {
    await this.wordModel.destroy({
      where: { userId: payload.user.id, id: payload.id },
    });
  }
}

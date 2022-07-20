import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WordsService } from './wordsToLearn.service';
import { Word as WordModel } from './wordsToLearn.model';
import { WordsController } from './wordsToLearn.controller';

@Module({
  imports: [SequelizeModule.forFeature([WordModel])],
  providers: [WordsService],
  exports: [WordsService],
  controllers: [WordsController],
})
export class WordsModule {}

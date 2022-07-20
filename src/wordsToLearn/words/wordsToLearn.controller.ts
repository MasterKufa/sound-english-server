import { Controller, Get, Post, Req } from '@nestjs/common';
import { ReqWithUser } from 'src/auth/types';
import { ROUTES } from 'src/routes.constants';
import { TranslatePayload, WordPayload, WordToLearn } from './types';
import { WordsService } from './wordsToLearn.service';

@Controller(ROUTES.API.WORDS.BASE)
export class WordsController {
  constructor(private wordsService: WordsService) {}

  @Post(ROUTES.API.WORDS.ADD_ONE)
  addWord(@Req() request: ReqWithUser<WordPayload>): Promise<void> {
    return this.wordsService.addOne({
      ...request.body,
      user: request.user,
    });
  }

  @Post(ROUTES.API.WORDS.ADD_MANY)
  addWords(@Req() request: ReqWithUser<WordPayload[]>): Promise<void> {
    return this.wordsService.addMany({
      words: request.body,
      user: request.user,
    });
  }

  @Get(ROUTES.API.WORDS.ALL)
  findByFilters(@Req() request: ReqWithUser<object>): Promise<WordToLearn[]> {
    return this.wordsService.findByFilters({ user: request.user });
  }

  @Post(ROUTES.API.WORDS.DELETE_ONE)
  deleteWord(@Req() request: ReqWithUser<{ id: number }>): Promise<void> {
    return this.wordsService.deleteOne({
      ...request.body,
      user: request.user,
    });
  }

  @Post(ROUTES.API.WORDS.DELETE_ALL)
  deleteAllWords(@Req() request: ReqWithUser<object>): Promise<void> {
    return this.wordsService.deleteAll({
      user: request.user,
    });
  }

  @Post(ROUTES.API.WORDS.DELETE_BY_IDS)
  deleteWordsById(
    @Req() request: ReqWithUser<{ ids: number[] }>,
  ): Promise<void> {
    return this.wordsService.deleteByIds({
      ...request.body,
      user: request.user,
    });
  }

  @Post(ROUTES.API.WORDS.WORD_SPOKEN)
  changeWordSpoken(@Req() request: ReqWithUser<{ id: number }>): Promise<void> {
    return this.wordsService.changeWordSpoken({
      ...request.body,
      user: request.user,
    });
  }
  @Post(ROUTES.API.WORDS.TRANSLATE)
  translateWord(
    @Req() request: ReqWithUser<TranslatePayload>,
  ): Promise<TranslatePayload> {
    return this.wordsService.translateWord({
      ...request.body,
      user: request.user,
    });
  }
}

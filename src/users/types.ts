import { WordToLearn } from 'src/wordsToLearn/words/types';

export const enum Roles {
  admin = 'admin',
  user = 'user',
  supervisor = 'supervisor',
}

export class User {
  id: number;
  username: string;
  passwordHash: string;
  role: Roles;
  email: string;
  words: WordToLearn[];
}

export type FindUsersPayload = {
  username: string;
  limit?: string;
};

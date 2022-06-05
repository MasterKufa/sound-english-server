import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  IsEmail,
  Model,
  Table,
} from 'sequelize-typescript';
import { Roles } from './types';
import { WordToLearn } from 'src/wordsToLearn/types';
import { Word } from 'src/wordsToLearn/wordsToLearn.model';

@Table
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  username: string;

  @Column
  passwordHash: string;

  @Column({ defaultValue: Roles.user })
  role: Roles;

  @Column
  secretAnswer: string;

  @IsEmail
  @Column
  email: string;

  @HasMany(() => Word, 'userId')
  words: WordToLearn[];
}

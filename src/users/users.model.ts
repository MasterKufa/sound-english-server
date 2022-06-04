import {
  BelongsTo,
  Column,
  ForeignKey,
  IsEmail,
  Model,
  Table,
} from 'sequelize-typescript';
import { Roles } from './types';
import { Secret } from './secrets.model';

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

  @ForeignKey(() => Secret)
  @Column
  secretId: number;

  @BelongsTo(() => Secret)
  secret: Secret;
}

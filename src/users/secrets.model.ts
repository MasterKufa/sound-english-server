import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { User } from './users.model';

@Table
export class Secret extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ primaryKey: true })
  name: string;

  @HasMany(() => User)
  users: User[];
}

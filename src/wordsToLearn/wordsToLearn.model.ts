import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users.model';

@Table
export class Word extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  english: string;

  @Column
  russian: string;

  @Column({ defaultValue: 0 })
  lastSpeechTimestamp: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}

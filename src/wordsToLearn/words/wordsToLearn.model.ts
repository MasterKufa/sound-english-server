import {
  Column,
  ForeignKey,
  Model,
  Table,
  DataType,
} from 'sequelize-typescript';
import { User } from 'src/users/users.model';

@Table
export class Word extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  english: string;

  @Column
  russian: string;

  @Column({ type: DataType.TEXT })
  base64EnAudio: string;

  @Column({ type: DataType.TEXT })
  base64RuAudio: string;

  @Column({ defaultValue: 0, type: DataType.BIGINT })
  lastSpeechTimestamp: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}

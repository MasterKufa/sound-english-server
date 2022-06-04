import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './types';
import { User as UserModel } from './users.model';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { BCRYPT_SAULT } from './constants';
import { AuthPayload } from 'src/auth/types';
import { Op } from 'sequelize';
import { Secret as SecretModel } from './secrets.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(SecretModel)
    private secretModel: typeof SecretModel,
    private sequelize: Sequelize,
    private config: ConfigService,
  ) {}

  async findOne(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async findByNameAndEmail(
    username: string,
    email?: string,
  ): Promise<User | null> {
    const filterhObj = email
      ? { [Op.or]: [{ username }, { email }] }
      : { username };

    return this.userModel.findOne({ where: filterhObj });
  }

  async createOne(authPayload: AuthPayload): Promise<User | null> {
    const isExist = await this.findByNameAndEmail(
      authPayload.username,
      authPayload.email,
    );

    if (isExist) {
      throw new HttpException(
        {
          all: 'Такой пользователь уже существует',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    let user = null;
    const password = authPayload.password;

    delete authPayload.password;
    await this.sequelize.transaction(async (t) => {
      user = await this.userModel.create(
        {
          ...authPayload,
          passwordHash: bcrypt.hashSync(
            password,
            this.config.get<string>(BCRYPT_SAULT),
          ),
        },
        { transaction: t },
      );

      const secret = await this.secretModel.findOne({
        where: { name: authPayload.secret },
      });

      user.setSecret(secret);
    });

    return user;
  }
}

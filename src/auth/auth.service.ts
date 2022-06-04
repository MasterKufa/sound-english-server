import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/types';
import { AuthPayload, AuthResponsePayload, EmittedToken } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  deletePassword(user: User): Omit<User, 'passwordHash'> {
    if (user) {
      delete user.passwordHash;

      return user;
    }

    return null;
  }

  emitToken(user: User): EmittedToken {
    const payload: AuthResponsePayload = {
      userName: user.username,
      userId: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(authPayload: AuthPayload): Promise<EmittedToken> {
    const user = await this.usersService.createOne(authPayload);

    return this.emitToken(user);
  }

  async validateUser(id: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersService.findOne(id);
    return this.deletePassword(user);
  }

  async auth(username: string, password: string): Promise<EmittedToken> {
    const user = await this.usersService.findByNameAndEmail(username);
    const isValidPassword =
      user && bcrypt.compareSync(password, user.passwordHash);

    if (!user || !isValidPassword) {
      throw new HttpException(
        {
          all: 'Неверное имя пользователя или пароль',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.emitToken(user);
  }
}

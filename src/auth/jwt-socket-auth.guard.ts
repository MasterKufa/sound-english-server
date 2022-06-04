import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

import { AuthResponsePayload } from './types';
import { User } from 'src/users/types';
import { roomPrefix } from './helpers';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken: string = client.handshake?.query?.token as string;

      const decoded = this.jwtService.decode(authToken) as AuthResponsePayload;

      const user: Omit<User, 'passwordHash'> =
        await this.authService.validateUser(decoded.userId);

      if (!client.rooms.has(roomPrefix(user.id)))
        await client.join(roomPrefix(user.id));

      context.switchToWs().getData().user = user;

      return Boolean(user);
    } catch (err) {
      throw new WsException({
        status: HttpStatus.UNAUTHORIZED,
        message: err.message,
      });
    }
  }
}

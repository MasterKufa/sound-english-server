import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { JWT_EXPIRES, JWT_SECRET_NAME } from './constants';
import { AuthController } from './auth.controller';
import { WsJwtGuard } from './jwt-socket-auth.guard';

const JwtModuleRegistered = JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>(JWT_SECRET_NAME),
    signOptions: { expiresIn: JWT_EXPIRES },
  }),
});

@Module({
  imports: [UsersModule, PassportModule, JwtModuleRegistered],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WsJwtGuard],
  exports: [AuthService, JwtModuleRegistered],
})
export class AuthModule {}

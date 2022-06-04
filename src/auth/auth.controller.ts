import { Controller, Post, Body, Get } from '@nestjs/common';
import { ROUTES } from 'src/routes.constants';
import { AuthService } from './auth.service';
import { Public } from './jwt-auth.guard';
import { EmittedToken, AuthPayload } from './types';

@Controller(ROUTES.API.AUTH.BASE)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post(ROUTES.API.AUTH.LOGIN)
  async login(@Body() body: AuthPayload): Promise<EmittedToken> {
    const { username, password } = body;

    return this.authService.auth(username, password);
  }

  @Public()
  @Post(ROUTES.API.AUTH.REGISTER)
  register(@Body() body: AuthPayload): Promise<EmittedToken> {
    return this.authService.register(body);
  }

  @Get(ROUTES.API.AUTH.VERIFY)
  verifyToken(): void {
    return;
  }
}

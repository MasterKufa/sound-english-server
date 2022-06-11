import { Controller, Get, Render } from '@nestjs/common';
import { Public } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  @Public()
  @Get('/workplace/**')
  @Render('index.hbs')
  getHello() {
    return;
  }
}

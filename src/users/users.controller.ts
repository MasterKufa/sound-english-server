import { Controller } from '@nestjs/common';
import { ROUTES } from 'src/routes.constants';
import { UsersService } from './users.service';

@Controller(ROUTES.API.USERS.BASE)
export class UsersController {
  constructor(private usersService: UsersService) {}
}

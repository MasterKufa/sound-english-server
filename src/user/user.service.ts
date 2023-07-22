import { prisma } from "../../prisma";

class UserService {
  async recordUser(id?: number) {
    if (!(await prisma.user.findUnique({ where: { id } }))) {
      await prisma.user.create({ data: { id, settings: { create: {} } } });
    }
  }
}

export const userService = new UserService();

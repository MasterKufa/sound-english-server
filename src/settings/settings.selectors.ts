import { prisma } from "prisma";

export const userSettings = async (id: number) =>
  (
    await prisma.user.findUnique({
      where: { id },
      include: { settings: true },
    })
  )?.settings;

import { existsSync, mkdirSync } from "fs";

export const createNotExistedPath = (targetPath: string) => {
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }
  return targetPath;
};

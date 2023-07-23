import { resolve } from "path";
import { mkdirSync, existsSync } from "fs";

const createNotExistedPath = (targetPath: string) => {
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath);
  }

  return targetPath;
};

export const buildAudioUnitPath = (id: number) =>
  resolve(createNotExistedPath("audios/units"), `${id}.wav`);

export const buildAudioWordPath = (id: number) =>
  resolve(createNotExistedPath("audios/words"), `${id}.wav`);

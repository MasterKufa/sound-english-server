import { extension } from "mime-types";
import { createNotExistedPath } from "../helpers";
import { resolve } from "path";

export const buildCustomAudioTempPath = (id: number, type: string) =>
  resolve(
    createNotExistedPath("audios/temp/units"),
    `${id}.${extension(type)}`,
  );

export const buildCustomAudioPath = (id: number) =>
  resolve(createNotExistedPath("audios/units"), `${id}.custom.wav`);

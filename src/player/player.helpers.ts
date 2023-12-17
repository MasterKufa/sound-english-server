import { resolve } from "path";
import { createNotExistedPath } from "../helpers";
import { extension } from "mime-types";

export const buildAudioUnitPath = (id: number) =>
  resolve(createNotExistedPath("audios/units"), `${id}.mp3`);

export const buildAudioWordPath = (id: number) =>
  resolve(createNotExistedPath("audios/words"), `${id}.mp3`);

export const buildCustomAudioTempPath = (id: number, type: string) =>
  resolve(
    createNotExistedPath("audios/temp/units"),
    `${id}.${extension(type)}`,
  );

export const buildCustomAudioUnitPath = (id: number) =>
  resolve(createNotExistedPath("audios/units"), `${id}.custom.mp3`);

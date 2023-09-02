import { resolve } from "path";
import { createNotExistedPath } from "../helpers";

export const buildAudioUnitPath = (id: number) =>
  resolve(createNotExistedPath("audios/units"), `${id}.wav`);

export const buildAudioWordPath = (id: number) =>
  resolve(createNotExistedPath("audios/words"), `${id}.wav`);

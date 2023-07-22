import { resolve } from "path";

export const buildAudioUnitPath = (id: number) =>
  resolve("audios/units", `${id}.wav`);

export const buildAudioWordPath = (id: number) =>
  resolve("audios/units", `${id}.wav`);

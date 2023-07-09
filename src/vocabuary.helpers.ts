import { resolve } from "path";

export const buildAudioPath = (id: number) => resolve("audios", `${id}.wav`);

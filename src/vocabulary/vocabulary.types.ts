import { Word } from "@prisma/client";
import { Lang } from "../types";

export type WordReqBody = {
  sourceWord: WordUnitReqBody;
  targetWord: WordUnitReqBody;
  customAudios: CustomAudios;
  id?: number;
};

export type IdPayload = {
  id: number;
};

export type WordUnitReqBody = {
  lang: Lang;
  text: string;
};

export type WordTranslateResponse = {
  text: string;
};

export type ConcatAudiosPayload = {
  inputSource1: string;
  inputSource2: string;
  pauseMs: number;
  outputPath: string;
};

export type CustomAudioPayload = {
  buffer: Buffer;
  mimeType: string;
  isModified?: boolean;
};

export type CustomAudios = Partial<Record<Lang, CustomAudioPayload>>;

export type WordComplex = Word & { customAudios: CustomAudios };

import { CustomAudios, Lang } from "../types";

export type WordReqBody = {
  sourceWord: WordUnitReqBody;
  targetWord: WordUnitReqBody;
  customAudios: CustomAudios;
  generatedSoundHash: string;
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

import { CustomAudios, Lang } from "../types";

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

export type WordDefinition = {
  [Lang.en]: string;
  [Lang.ru]: string;
};

export type FileUploadPayload = {
  file: Buffer;
  name: string;
};

export type BulkWordUploadPayload = {
  words: Array<WordDefinition>;
};

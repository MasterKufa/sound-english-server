import { CustomAudios, Lang } from "../types";

export type WordReqBody = {
  units: Array<WordUnitReqBody>;
  customAudios: CustomAudios;
  id?: number;
};

export type WordUnitReqBody = {
  lang: Lang;
  text: string;
  id?: number;
};

export type WordTranslateRequest = {
  text: string;
  sourceLang: Lang;
  targetLang: Lang;
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

export type WordDefinition = Partial<Record<Lang, string>>;

export type FileUploadPayload = {
  file: Buffer;
  name: string;
};

export type BulkWordUploadPayload = {
  words: Array<WordDefinition>;
};

export enum BulkUploadError {
  langCheck = "langCheck",
  duplicate = "duplicate",
}

export type BulkUploadFailedRecord = {
  word: WordDefinition;
  error: BulkUploadError;
};

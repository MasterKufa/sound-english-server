import { Lang } from "../types";

export type WordReqBody = {
  sourceWord: WordUnitReqBody;
  targetWord: WordUnitReqBody;
  id?: number;
};

export type DeleteWordPayload = {
  id: number;
};

export type WordUnitReqBody = {
  lang: Lang;
  text: string;
};

export type ConcatAudiosPayload = {
  inputSource1: string;
  inputSource2: string;
  pauseMs: number;
  outputPath: string;
};

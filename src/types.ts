export type WordReqBody = {
  sourceWord: WordUnitReqBody;
  targetWord: WordUnitReqBody;
  id?: number;
};

export type WordUnitAudioBody = {
  id: number;
};

export type DeleteWordPayload = {
  id: number;
};

export type WordUnitReqBody = {
  lang: Lang;
  text: string;
};

export enum Lang {
  en = "en",
  ru = "ru",
}

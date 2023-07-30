import { Lang } from "../types";

export type LoadVoicesBody = {
  lang: Lang;
};

export type Voice = {
  id: string;
  name: string;
  gender: "M" | "F";
  language: Lang;
  locale: string;
  tts_name: string;
};

export type VoiceShort = Pick<Voice, "gender" | "name">;

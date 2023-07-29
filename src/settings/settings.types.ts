import { Lang } from "../types";

export enum SettingField {
  playerQueueSize = "playerQueueSize",
  lastPlayedRemindersSize = "lastPlayedRemindersSize",
  delayPlayerSourceToTarget = "delayPlayerSourceToTarget",
  delayPlayerWordToWord = "delayPlayerWordToWord",
  sourceVoice = "sourceVoice",
  targetVoice = "targetVoice",
  repeatSourceCount = "repeatSourceCount",
  repeatTargetCount = "repeatTargetCount",
  repeatWordCount = "repeatWordCount",
  repeatSourceDelay = "repeatSourceDelay",
  repeatTargetDelay = "repeatTargetDelay",
}

export type ChangeSettingsBody = {
  field: SettingField;
  value: unknown;
};

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

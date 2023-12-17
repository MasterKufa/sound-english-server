import { LoadVoicesBody, Voice } from "./settings.types";
import { prisma } from "../../prisma";
import { Lang } from "../types";
import { Settings } from "@prisma/client";
import { pick } from "lodash";
import { userSettings } from "./settings.selectors";

class SettingsService {
  async loadSettings(userId: number) {
    return userSettings(userId);
  }
  async changeSettings(payload: Settings, userId: number) {
    const user = await prisma.user.findFirst({ where: { id: userId } });

    const settings = await prisma.settings.update({
      where: { id: user.settingsId },
      data: pick(payload, [
        "playerQueueSize",
        "lastPlayedRemindersSize",
        "delayPlayerSourceToTarget",
        "delayPlayerWordToWord",
        "sourceVoice",
        "targetVoice",
        "repeatSourceCount",
        "repeatTargetCount",
        "repeatWordCount",
        "repeatSourceDelay",
        "repeatTargetDelay",
        "queueStrategy",
        "isCustomAudioPreferable",
      ]),
    });

    return settings;
  }
  async loadVoices(payload: LoadVoicesBody) {
    const res = await fetch(
      {
        [Lang.ru]: `${process.env.TTS_RU_HOST}/api/voices`,
        [Lang.en]: `${process.env.TTS_EN_HOST}/api/voices`,
      }[payload.lang],
    );

    const voices: Array<Voice> = await res.json();

    return Object.entries(voices)
      .filter(([_, voice]) => voice.language === payload.lang)
      .map(([name, { gender }]) => ({ name, gender }));
  }
}

export const settingsService = new SettingsService();

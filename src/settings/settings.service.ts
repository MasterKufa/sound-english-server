import { LoadVoicesBody } from "./settings.types";
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

  loadVoices(payload: LoadVoicesBody) {
    return {
      [Lang.ru]: [
        "aleksandr",
        "anna",
        "arina",
        "artemiy",
        "elena",
        "irina",
        "pavel",
      ],
      [Lang.en]: ["alan", "bdl", "clb", "slt"],
    }[payload.lang];
  }
}

export const settingsService = new SettingsService();

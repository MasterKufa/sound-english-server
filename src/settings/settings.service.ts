import { ChangeSettingsBody, LoadVoicesBody, Voice } from "./settings.types";
import { prisma } from "../../prisma";
import { Lang } from "../types";

class SettingsService {
  async changeSettings(payload: ChangeSettingsBody, userId: number) {
    const user = await prisma.user.findFirst({ where: { id: userId } });

    const settings = await prisma.settings.update({
      where: { id: user.settingsId },
      data: { [payload.field]: payload.value },
    });

    return settings;
  }
  async loadVoices(payload: LoadVoicesBody) {
    const res = await fetch(
      `${
        payload.lang === Lang.ru
          ? process.env.TTS_RU_HOST
          : process.env.TTS_EN_HOST
      }/api/voices`,
    );

    const voices: Array<Voice> = await res.json();

    return voices
      .filter((voice) => voice.language === payload.lang)
      .map(({ name, gender }) => ({ name, gender }));
  }
}

export const settingsService = new SettingsService();

import { existsSync } from "fs";
import {
  buildAudioUnitPath,
  buildAudioWordPath,
  buildCustomAudioUnitPath,
  buildCustomAudioTempPath,
} from "./player.helpers";
import { Settings, WordUnit } from "@prisma/client";
import {
  CustomAudioPayload,
  CustomAudios,
  Lang,
  WordComplexSanitized,
} from "../types";
import {
  ConcatConfig,
  CovertConfig,
  FFMPEG_ACTIONS,
  NormalizeVolumeConfig,
} from "./player.types";
import { prisma } from "../../prisma";
import { emitWithAnswer } from "@master_kufa/server-tools";
import { ffmpegSocket } from "../client-sockets";
import { settingsSelectors } from "../settings";
import { nanoid } from "nanoid";
import { readFile, rm, writeFile } from "fs/promises";
import { createHash } from "crypto";
import { fromPairs, pick } from "lodash";
import { wordComplexSelector } from "../selectors";

class PlayerService {
  async invalidateAudio(word: WordComplexSanitized, userId: number) {
    const settings = await settingsSelectors.userSettings(userId);

    const generatedSoundHash = createHash("sha256")
      .update(
        JSON.stringify({
          ...pick<Settings, keyof Settings>(
            settings,
            "isCustomAudioPreferable",
            "delayPlayerSourceToTarget",
            "delayPlayerWordToWord",
            "sourceVoice",
            "targetVoice",
            "sourceLang",
            "targetLang",
            "repeatSourceCount",
            "repeatTargetCount",
            "repeatSourceDelay",
            "repeatTargetDelay",
          ),
          values: word.units.flatMap((unit) => [unit.lang, unit.text]),
        }),
      )
      .digest("hex");

    if (generatedSoundHash !== word.generatedSoundHash) {
      await playerService.generateAudio(word, userId);
      await prisma.word.update({
        where: { id: word.id },
        data: { generatedSoundHash },
      });
    }
  }
  async generateAudio(word: WordComplexSanitized, userId: number) {
    const settings = await settingsSelectors.userSettings(userId);

    const [inputSource1, inputSource2] =
      await this.buildAudioPathsForWordGeneration(userId, word, settings);

    if (!inputSource1 || !inputSource2) return;

    await emitWithAnswer<ConcatConfig, unknown>(
      ffmpegSocket,
      FFMPEG_ACTIONS.CONCAT_WITH_PAUSE,
      {
        inputSource1,
        inputSource1Times: settings.repeatSourceCount,
        inputSource2,
        inputSource2Times: settings.repeatTargetCount,
        pauseMs: settings.delayPlayerSourceToTarget,
        outputPath: buildAudioWordPath(word.id),
        repeatSourceDelay: settings.repeatSourceDelay,
        repeatTargetDelay: settings.repeatTargetDelay,
      },
    );
  }
  async buildAudioPathsForWordGeneration(
    userId: number,
    word: WordComplexSanitized,
    settings: Settings,
  ) {
    const currentLanguagePairUnits = word.units.filter(
      (unit) =>
        unit.lang === settings.sourceLang || unit.lang === settings.targetLang,
    );

    const paths = currentLanguagePairUnits.map(({ id }) =>
      buildAudioUnitPath(id),
    );
    const customPaths = currentLanguagePairUnits.map(({ id }) =>
      buildCustomAudioUnitPath(id),
    );

    for (let i = 0; i < customPaths.length; i++) {
      if (settings.isCustomAudioPreferable && existsSync(customPaths[i])) {
        paths[i] = customPaths[i];
      } else {
        await this.generateUnitsAudio(currentLanguagePairUnits[i], userId);
      }
    }

    return paths;
  }
  async loadAudio(id: number, userId: number) {
    const word = await prisma.word.findUnique({
      where: { id },
      select: wordComplexSelector,
    });
    // to check whether settings or something changed without word saving
    await this.invalidateAudio(word, userId);

    const path = buildAudioWordPath(id);

    if (!existsSync(path)) return Buffer.from("", "binary");

    return readFile(path);
  }
  async deleteAudioUnit(id: number) {
    const filePath = buildAudioUnitPath(id);
    const fileCustomPath = buildCustomAudioUnitPath(id);

    if (existsSync(filePath)) await rm(filePath);
    if (existsSync(fileCustomPath)) await rm(fileCustomPath);
  }
  async generateUnitsAudio(payload: WordUnit, userId: number) {
    if (!payload.text) return;

    await this.deleteAudioUnit(payload.id);

    const settings = await settingsSelectors.userSettings(userId);

    const response = await fetch(
      {
        [Lang.en]: `${process.env.TTS_EN_HOST}/api/tts?voice=${settings.sourceVoice}&text=${payload.text}`,
        [Lang.ru]: `${process.env.TTS_RU_HOST}/api/tts?voice=${settings.targetVoice}&text=${payload.text}`,
      }[payload.lang],
    );

    const mp3Buffer = await response.arrayBuffer();

    await writeFile(buildAudioUnitPath(payload.id), Buffer.from(mp3Buffer));
  }
  async buildCustomAudios(id: number): Promise<CustomAudios> {
    const word = await prisma.word.findUnique({
      where: { id },
      include: { units: true },
    });

    const customAudios: CustomAudios = {};

    const paths = word.units.map((unit) => buildCustomAudioUnitPath(unit.id));

    await Promise.all(
      paths.map(async (path, inx) => {
        if (existsSync(path)) {
          customAudios[word.units[inx].lang] = {
            buffer: await readFile(path),
            mimeType: "audio/mp3",
          };
        }
      }),
    );

    return customAudios;
  }
  async createCustomAudio(unitId: number, customAudio: CustomAudioPayload) {
    const tempFilePath = buildCustomAudioTempPath(unitId, customAudio.mimeType);
    const filePath = buildCustomAudioUnitPath(unitId);

    if (existsSync(filePath)) await rm(filePath);

    await writeFile(tempFilePath, customAudio.buffer);

    await emitWithAnswer<CovertConfig, unknown>(
      ffmpegSocket,
      FFMPEG_ACTIONS.CONVERT_MP3,
      {
        input: tempFilePath,
        output: filePath,
        id: nanoid(),
      },
    );

    await emitWithAnswer<NormalizeVolumeConfig, unknown>(
      ffmpegSocket,
      FFMPEG_ACTIONS.NORMALIZE_VOLUME,
      {
        input: filePath,
        id: nanoid(),
      },
    );

    await rm(tempFilePath);
  }
  async saveCustomAudios(customAudios: CustomAudios, wordId: number) {
    const word = await prisma.word.findUnique({
      where: { id: wordId },
      include: { units: true },
    });

    await Promise.all(
      word.units.map(async (unit) => {
        const path = buildCustomAudioUnitPath(unit.id);

        if (
          customAudios[unit.lang] &&
          customAudios[unit.lang].isDeleted &&
          existsSync(path)
        )
          await rm(path);

        if (customAudios[unit.lang] && customAudios[unit.lang].isModified)
          await this.createCustomAudio(unit.id, customAudios[unit.lang]);
      }),
    );
  }
}

export const playerService = new PlayerService();

import { existsSync } from "fs";
import {
  buildAudioUnitPath,
  buildAudioWordPath,
  buildCustomAudioPath,
  buildCustomAudioTempPath,
} from "./player.helpers";
import { Settings, WordUnit } from "@prisma/client";
import { CustomAudioPayload, CustomAudios, Lang, WordComplex } from "../types";
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

class PlayerService {
  async generateAudio(word: WordComplex, userId: number) {
    const settings = await settingsSelectors.userSettings(userId);

    const [inputSource1, inputSource2] = await this.buildAudioPaths(
      userId,
      word,
      settings,
    );

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
  async buildAudioPaths(userId: number, word: WordComplex, settings: Settings) {
    let sourcePath = buildAudioUnitPath(word.sourceWord.id);
    let targetPath = buildAudioUnitPath(word.targetWord.id);

    const sourceCustomPath = buildCustomAudioPath(word.sourceWord.id);
    const targetCustomPath = buildCustomAudioPath(word.targetWord.id);

    if (settings.isCustomAudioPreferable && existsSync(sourceCustomPath)) {
      sourcePath = sourceCustomPath;
    } else {
      await this.generateUnitsAudio(word.sourceWord, userId);
    }

    if (settings.isCustomAudioPreferable && existsSync(targetCustomPath)) {
      targetPath = targetCustomPath;
    } else {
      await this.generateUnitsAudio(word.targetWord, userId);
    }

    return [sourcePath, targetPath];
  }
  async loadAudio(id: number) {
    return readFile(buildAudioWordPath(id));
  }
  async deleteAudioUnit(id: number) {
    const filePath = buildAudioUnitPath(id);
    const fileCustomPath = buildCustomAudioPath(id);

    if (existsSync(filePath)) await rm(filePath);
    if (existsSync(fileCustomPath)) await rm(fileCustomPath);
  }
  async generateUnitsAudio(payload: WordUnit, userId: number) {
    if (!payload.text) return;

    await this.deleteAudioUnit(payload.id);

    const settings = await settingsSelectors.userSettings(userId);

    const response = await fetch(
      payload.lang === Lang.ru
        ? `${process.env.TTS_RU_HOST}/api/tts?voice=${settings.targetVoice}&text=${payload.text}`
        : `${process.env.TTS_EN_HOST}/api/tts?voice=${settings.sourceVoice}&text=${payload.text}`,
    );

    const mp3Buffer = await response.arrayBuffer();

    await writeFile(buildAudioUnitPath(payload.id), Buffer.from(mp3Buffer));
  }
  async buildCustomAudios(id: number): Promise<CustomAudios> {
    const word = await prisma.word.findUnique({
      where: { id },
      include: { sourceWord: true, targetWord: true },
    });

    const customAudios: CustomAudios = {};
    const targetPath = buildCustomAudioPath(word.targetWord.id);
    const sourcePath = buildCustomAudioPath(word.sourceWord.id);

    if (existsSync(targetPath)) {
      customAudios.ru = {
        buffer: await readFile(targetPath),
        mimeType: "audio/mp3",
      };
    }

    if (existsSync(sourcePath)) {
      customAudios.en = {
        buffer: await readFile(sourcePath),
        mimeType: "audio/mp3",
      };
    }

    return customAudios;
  }
  async createCustomAudio(unitId: number, customAudio: CustomAudioPayload) {
    const tempFilePath = buildCustomAudioTempPath(unitId, customAudio.mimeType);
    const filePath = buildCustomAudioPath(unitId);

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
      include: { sourceWord: true, targetWord: true },
    });

    if (customAudios.en && customAudios.en.isModified)
      this.createCustomAudio(word.sourceWord.id, customAudios.en);

    if (customAudios.ru && customAudios.ru.isModified)
      this.createCustomAudio(word.targetWord.id, customAudios.ru);

    const sourceAudioPath = buildCustomAudioPath(word.sourceWord.id);
    const targetAudioPath = buildCustomAudioPath(word.targetWord.id);

    if (!customAudios.en && existsSync(sourceAudioPath))
      await rm(sourceAudioPath);

    if (!customAudios.ru && existsSync(targetAudioPath))
      await rm(targetAudioPath);
  }
}

export const playerService = new PlayerService();

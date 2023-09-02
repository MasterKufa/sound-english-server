import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { buildAudioUnitPath, buildAudioWordPath } from "./player.helpers";
import { Settings, Word, WordUnit } from "@prisma/client";
import { createHash } from "crypto";
import { Lang } from "../types";
import { ConcatConfig, FFMPEG_ACTIONS } from "./player.types";
import { prisma } from "../../prisma";
import { emitWithAnswer } from "@master_kufa/server-tools";
import { ffmpegSocket } from "../client-sockets";
import { buildCustomAudioPath } from "../vocabulary/vocabulary.helpers";

class PlayerService {
  async buildAudioPaths(
    userId: number,
    word: Word & {
      sourceWord: WordUnit;
      targetWord: WordUnit;
    },
    settings: Settings,
  ) {
    let sourcePath = buildAudioUnitPath(word.sourceWordUnitId);
    let targetPath = buildAudioUnitPath(word.targetWordUnitId);

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
  async loadAudio(id: number, userId: number) {
    const word = await prisma.word.findUnique({
      where: { id },
      include: { sourceWord: true, targetWord: true },
    });

    const { settings } = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    const wordAudioPath = buildAudioWordPath(id);

    const generatedSoundHash = createHash("sha256")
      .update(JSON.stringify(settings))
      .digest("hex");

    if (
      generatedSoundHash === word.generatedSoundHash &&
      existsSync(wordAudioPath)
    ) {
      return await readFileSync(wordAudioPath);
    }
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
        outputPath: wordAudioPath,
        repeatSourceDelay: settings.repeatSourceDelay,
        repeatTargetDelay: settings.repeatTargetDelay,
      },
    );

    await prisma.word.update({
      where: { id },
      data: { generatedSoundHash },
    });

    return readFileSync(wordAudioPath);
  }
  deleteAudio(id: number) {
    const filePath = buildAudioUnitPath(id);

    if (existsSync(filePath)) rmSync(filePath);
  }
  async generateUnitsAudio(payload: WordUnit, userId: number) {
    if (!payload.text) return;

    this.deleteAudio(payload.id);

    const { settings } = await prisma.user.findFirst({
      where: { id: userId },
      include: { settings: true },
    });

    const response = await fetch(
      payload.lang === Lang.ru
        ? `${process.env.TTS_RU_HOST}/api/tts?voice=${settings.targetVoice}&text=${payload.text}`
        : `${process.env.TTS_EN_HOST}/api/tts?voice=${settings.sourceVoice}&text=${payload.text}`,
    );

    const wavBuffer = await response.arrayBuffer();

    writeFileSync(buildAudioUnitPath(payload.id), Buffer.from(wavBuffer));
  }
}

export const playerService = new PlayerService();

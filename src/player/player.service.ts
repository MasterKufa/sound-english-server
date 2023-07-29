import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { buildAudioUnitPath, buildAudioWordPath } from "./player.helpers";
import { WordUnit } from "@prisma/client";
import { createHash } from "crypto";
import { Lang } from "../types";
import { Socket, io } from "socket.io-client";
import { ConcatConfig, FFMPEG_ACTIONS } from "./player.types";
import { prisma } from "../../prisma";
import { emitWithAnswer } from "@master_kufa/server-tools";

class PlayerService {
  ffmpegSocket: Socket;
  constructor() {
    this.ffmpegSocket = io(process.env.FFMPEG_HOST, {
      transports: ["websocket"],
    });
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

    if (generatedSoundHash === word.generatedSoundHash) {
      return readFileSync(wordAudioPath);
    }

    await this.generateUnitsAudio(word.sourceWord, userId);
    await this.generateUnitsAudio(word.targetWord, userId);

    await emitWithAnswer<ConcatConfig, unknown>(
      this.ffmpegSocket,
      FFMPEG_ACTIONS.CONCAT_WITH_PAUSE,
      {
        inputSource1: buildAudioUnitPath(word.sourceWordUnitId),
        inputSource1Times: settings.repeatSourceCount,
        inputSource2: buildAudioUnitPath(word.targetWordUnitId),
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

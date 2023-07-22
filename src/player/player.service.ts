import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { buildAudioUnitPath, buildAudioWordPath } from "./player.helpers";
import { WordUnit } from "@prisma/client";
import { Lang } from "../types";
import { Socket, io } from "socket.io-client";
import { FFMPEG_ACTIONS } from "./player.types";
import { prisma } from "../../prisma";

class PlayerService {
  ffmpegSocket: Socket;
  constructor() {
    this.ffmpegSocket = io(process.env.FFMPEG_HOST, {
      transports: ["websocket"],
    });
  }
  async loadAudio(id: number) {
    const word = await prisma.word.findUnique({ where: { id } });
    const { settings } = await prisma.user.findUnique({
      where: { id },
      include: { settings: true },
    });
    const wordAudioPath = buildAudioWordPath(id);

    await this.ffmpegSocket.emitWithAck(FFMPEG_ACTIONS.CONCAT_WITH_PAUSE, {
      inputSource1: buildAudioUnitPath(word.sourceWordUnitId),
      inputSource2: buildAudioUnitPath(word.targetWordUnitId),
      pauseMs: settings.delayPlayerSourceToTarget,
      outputPath: wordAudioPath,
    });

    return readFileSync(wordAudioPath);
  }
  deleteAudio(id: number) {
    const filePath = buildAudioUnitPath(id);

    if (existsSync(filePath)) rmSync(filePath);
  }
  async generateUnitsAudio(payload: WordUnit) {
    this.deleteAudio(payload.id);

    if (!payload.text) return;

    const response = await fetch(
      payload.lang === Lang.ru
        ? `${process.env.TTS_RU_HOST}/api/tts?voice=glow-speak:ru_nikolaev&text=${payload.text}`
        : `${process.env.TTS_EN_HOST}/api/tts?voice=larynx:northern_english_male-glow_tts&text=${payload.text}`,
    );

    const wavBuffer = await response.arrayBuffer();

    writeFileSync(buildAudioUnitPath(payload.id), Buffer.from(wavBuffer));
  }
}

export const playerService = new PlayerService();

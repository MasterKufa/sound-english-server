import {
  CustomAudioPayload,
  CustomAudios,
  IdPayload,
  WordComplex,
  WordReqBody,
  WordUnitReqBody,
} from "./vocabulary.types";
import { prisma } from "../../prisma";
import { Word, WordUnit } from "@prisma/client";
import { playerService } from "../player";
import { translate } from "@vitalets/google-translate-api";
import { pick } from "lodash";
import { emitWithAnswer } from "@master_kufa/server-tools";
import { writeFile, rm, existsSync, readFileSync } from "fs";
import { nanoid } from "nanoid";
import { CovertConfig, FFMPEG_ACTIONS } from "../player/player.types";
import { promisify } from "util";
import { ffmpegSocket } from "../client-sockets";
import {
  buildCustomAudioPath,
  buildCustomAudioTempPath,
} from "./vocabulary.helpers";

class VocabularyService {
  async translateWord(payload: WordUnitReqBody) {
    const translation = await translate(payload.text, {
      to: "ru",
    });

    return pick(translation, "text");
  }
  async saveWord(payload: WordReqBody, userId: number) {
    let word: Word & {
      sourceWord: WordUnit;
      targetWord: WordUnit;
    };

    if (payload.id) {
      word = await prisma.word.update({
        where: { id: payload.id },
        data: {
          sourceWord: {
            update: pick(payload.sourceWord, ["text", "lang"]),
          },
          targetWord: {
            update: pick(payload.targetWord, ["text", "lang"]),
          },
        },
        include: { sourceWord: true, targetWord: true },
      });
    } else {
      word = await prisma.word.create({
        data: {
          User: {
            connect: {
              id: userId,
            },
          },
          sourceWord: { create: pick(payload.sourceWord, ["text", "lang"]) },
          targetWord: { create: pick(payload.targetWord, ["text", "lang"]) },
        },
        include: { sourceWord: true, targetWord: true },
      });
    }

    this.saveCustomAudios(payload.customAudios, word.id);

    return word;
  }

  async deleteWord({ id }: IdPayload) {
    const word = await prisma.word.delete({
      where: { id },
      include: { sourceWord: true, targetWord: true },
    });

    await prisma.wordUnit.deleteMany({
      where: { id: { in: [word.sourceWord.id, word.targetWord.id] } },
    });

    playerService.deleteAudioUnit(id);

    return word.id;
  }

  async loadWords(userId: number) {
    return await prisma.word.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, sourceWord: true, targetWord: true, id: true },
    });
  }
  async loadWord({ id }: IdPayload): Promise<Partial<WordComplex>> {
    const word = await prisma.word.findFirst({
      where: { id },
      select: { createdAt: true, sourceWord: true, targetWord: true, id: true },
    });

    const customAudios = await this.buildCustomAudios(id);

    return { ...word, customAudios };
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
        buffer: readFileSync(targetPath),
        mimeType: "audio/wav",
      };
    }

    if (existsSync(sourcePath)) {
      customAudios.en = {
        buffer: readFileSync(sourcePath),
        mimeType: "audio/wav",
      };
    }

    return customAudios;
  }
  async createCustomAudio(unitId: number, customAudio: CustomAudioPayload) {
    const tempFilePath = buildCustomAudioTempPath(unitId, customAudio.mimeType);

    await promisify(writeFile)(tempFilePath, customAudio.buffer);

    await emitWithAnswer<CovertConfig, unknown>(
      ffmpegSocket,
      FFMPEG_ACTIONS.CONVERT_MONO_16,
      {
        input: tempFilePath,
        output: buildCustomAudioPath(unitId),
        id: nanoid(),
      },
    );

    await promisify(rm)(tempFilePath);
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
      await promisify(rm)(sourceAudioPath);

    if (!customAudios.ru && existsSync(targetAudioPath))
      await promisify(rm)(targetAudioPath);
  }
}

export const vocabularyService = new VocabularyService();

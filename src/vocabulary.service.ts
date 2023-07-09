import { DeleteWordPayload, Lang, WordReqBody, WordUnitReqBody } from "./types";
import { prisma } from "../prisma";
import { Word, WordUnit } from "@prisma/client";
import { existsSync, readFileSync, rm, rmSync, writeFileSync } from "fs";
import { buildAudioPath } from "./vocabuary.helpers";

class VocabularyService {
  async loadAudio(payload: number) {
    return readFileSync(buildAudioPath(payload));
  }
  deleteAudio(id) {
    const filePath = buildAudioPath(id);

    if (existsSync(filePath)) rmSync(filePath);
  }
  async generateAudio(payload: WordUnit) {
    const response = await fetch(
      `${
        payload.lang === Lang.ru
          ? process.env.TTS_RU_HOST
          : process.env.TTS_EN_HOST
      }/api/tts?${payload.text}`,
    );

    this.deleteAudio(payload.id);

    const wavBuffer = await response.arrayBuffer();

    writeFileSync(buildAudioPath(payload.id), Buffer.from(wavBuffer));
  }
  async saveWord(payload: WordReqBody) {
    let word: Word;
    if (payload.id) {
      word = await prisma.word.update({
        where: { id: payload.id },
        data: {
          sourceWord: {
            update: payload.sourceWord,
          },
          targetWord: {
            update: payload.targetWord,
          },
        },
        include: { sourceWord: true, targetWord: true },
      });
    } else {
      word = await prisma.word.create({
        data: {
          sourceWord: { create: payload.sourceWord },
          targetWord: { create: payload.targetWord },
        },
        include: { sourceWord: true, targetWord: true },
      });
    }

    // await this.generateAudio(word.sourceWord);
    // await this.generateAudio(word.targetWord);

    return word;
  }

  async deleteWord({ id }: DeleteWordPayload) {
    const word = await prisma.word.delete({
      where: { id },
      include: { sourceWord: true, targetWord: true },
    });

    await prisma.wordUnit.deleteMany({
      where: { id: { in: [word.sourceWord.id, word.targetWord.id] } },
    });

    // this.deleteAudio(id);

    return word.id;
  }

  // toDO user auth words
  async loadWords() {
    return await prisma.word.findMany({
      orderBy: { createdAt: "desc" },
      include: { sourceWord: true, targetWord: true },
    });
  }
}

export const vocabularyService = new VocabularyService();

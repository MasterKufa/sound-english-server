import { DeleteWordPayload, WordReqBody } from "./vocabulary.types";
import { prisma } from "../../prisma";
import { Word, WordUnit } from "@prisma/client";
import { playerService } from "../player";

class VocabularyService {
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
          User: {
            connect: {
              id: userId,
            },
          },
          sourceWord: { create: payload.sourceWord },
          targetWord: { create: payload.targetWord },
        },
        include: { sourceWord: true, targetWord: true },
      });
    }

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

    playerService.deleteAudio(id);

    return word.id;
  }

  async loadWords(userId: number) {
    return await prisma.word.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: "desc" },
      include: { sourceWord: true, targetWord: true },
    });
  }
}

export const vocabularyService = new VocabularyService();

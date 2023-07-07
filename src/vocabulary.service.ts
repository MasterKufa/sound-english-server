import { WordReqBody } from "./types";
import { prisma } from "../prisma";

class VocabularyService {
  async saveWord(payload: WordReqBody) {
    return await prisma.word.upsert({
      where: { id: payload.id },
      update: {
        sourceWord: { update: payload.sourceWord },
        targetWord: { update: payload.targetWord },
      },
      create: {
        sourceWord: { create: payload.sourceWord },
        targetWord: { create: payload.targetWord },
      },
      include: { sourceWord: true, targetWord: true },
    });
  }

  // toDO pagination
  async loadWords() {
    return await prisma.word.findMany({
      include: { sourceWord: true, targetWord: true },
    });
  }
}

export const vocabularyService = new VocabularyService();

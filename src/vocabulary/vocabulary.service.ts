import { IdPayload, WordReqBody, WordUnitReqBody } from "./vocabulary.types";
import { prisma } from "../../prisma";
import { playerService } from "../player";
import { translate } from "@vitalets/google-translate-api";
import { pick } from "lodash";
import { CustomAudios, WordComplex } from "../types";
import { wordComplexSelector } from "../selectors";

class VocabularyService {
  async translateWord(payload: WordUnitReqBody) {
    const translation = await translate(payload.text, {
      to: "ru",
    });

    return pick(translation, "text");
  }

  async saveWord(payload: WordReqBody, userId: number) {
    let word: WordComplex;

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
        select: wordComplexSelector,
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
        select: wordComplexSelector,
      });
    }

    // to check whether letters or smth changed
    await playerService.invalidateAudio(word, userId);
    await playerService.saveCustomAudios(payload.customAudios, word.id);

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

    await playerService.deleteAudioUnit(id);

    return word.id;
  }

  async loadWords(userId: number) {
    return await prisma.word.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: "desc" },
      select: wordComplexSelector,
    });
  }
  async loadWord({
    id,
  }: IdPayload): Promise<WordComplex & { customAudios: CustomAudios }> {
    const word = await prisma.word.findFirst({
      where: { id },
      select: wordComplexSelector,
    });

    const customAudios = await playerService.buildCustomAudios(id);

    return { ...word, customAudios };
  }
}

export const vocabularyService = new VocabularyService();

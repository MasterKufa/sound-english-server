import { IdPayload, WordReqBody, WordUnitReqBody } from "./vocabulary.types";
import { prisma } from "../../prisma";
import { playerService } from "../player";
import { translate } from "@vitalets/google-translate-api";
import { pick } from "lodash";
import { generateSoundHash } from "./vocabulary.helpers";
import { settingsSelectors } from "../settings";
import { WordComplex } from "../types";

class VocabularyService {
  private wordSelector = {
    createdAt: true,
    sourceWord: { select: { id: true, lang: true, text: true } },
    targetWord: { select: { id: true, lang: true, text: true } },
    id: true,
    generatedSoundHash: true,
  };
  async translateWord(payload: WordUnitReqBody) {
    const translation = await translate(payload.text, {
      to: "ru",
    });

    return pick(translation, "text");
  }

  async saveWord(payload: WordReqBody, userId: number) {
    let word: Partial<WordComplex>;

    const settings = await settingsSelectors.userSettings(userId);

    const generatedSoundHash = generateSoundHash(settings, payload);

    if (payload.id) {
      word = await prisma.word.update({
        where: { id: payload.id },
        data: {
          generatedSoundHash,
          sourceWord: {
            update: pick(payload.sourceWord, ["text", "lang"]),
          },
          targetWord: {
            update: pick(payload.targetWord, ["text", "lang"]),
          },
        },
        select: this.wordSelector,
      });
    } else {
      word = await prisma.word.create({
        data: {
          generatedSoundHash,
          User: {
            connect: {
              id: userId,
            },
          },
          sourceWord: { create: pick(payload.sourceWord, ["text", "lang"]) },
          targetWord: { create: pick(payload.targetWord, ["text", "lang"]) },
        },
        select: this.wordSelector,
      });
    }

    if (generatedSoundHash !== payload.generatedSoundHash) {
      await playerService.generateAudio(word as WordComplex, userId);
    }

    playerService.saveCustomAudios(payload.customAudios, word.id);

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
      select: this.wordSelector,
    });
  }
  async loadWord({ id }: IdPayload): Promise<Partial<WordComplex>> {
    const word = await prisma.word.findFirst({
      where: { id },
      select: this.wordSelector,
    });

    const customAudios = await playerService.buildCustomAudios(id);

    return { ...word, customAudios };
  }
}

export const vocabularyService = new VocabularyService();

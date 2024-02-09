import { WordReqBody, WordTranslateRequest } from "./vocabulary.types";
import { prisma } from "../../prisma";
import { playerService } from "../player";
import {
  CustomAudios,
  IdPayload,
  IdsPayload,
  WordComplexSanitized,
} from "../types";
import { wordComplexSelector } from "../selectors";
import { languageValidator } from "./language-validator";

class VocabularyService {
  async translateWord(payload: WordTranslateRequest) {
    const res = await fetch(`${process.env.TRANSLATE_HOST}/translate`, {
      method: "POST",
      body: JSON.stringify({
        q: payload.text,
        source: payload.sourceLang,
        target: payload.targetLang,
      }),
      headers: { "Content-Type": "application/json" },
    });

    return { text: (await res.json()).translatedText };
  }

  async saveWord(payload: WordReqBody, userId: number) {
    if (
      payload.units.some(
        (unit) => !languageValidator.validate(unit.text, unit.lang),
      )
    ) {
      throw new Error("Word spelling does not match language");
    }

    const duplicate = await prisma.word.findFirst({
      where: {
        units: {
          every: {
            AND: {
              lang: { in: payload.units.map(({ lang }) => lang) },
              text: { in: payload.units.map(({ text }) => text) },
            },
          },
        },
      },
    });

    if (duplicate) throw new Error("Word with such spelling already exists");

    let word: WordComplexSanitized;
    if (payload.id) {
      await Promise.all(
        payload.units.map((unit) =>
          prisma.wordUnit.upsert({
            create: { lang: unit.lang, text: unit.text, wordId: payload.id },
            update: unit,
            where: { id: unit.id || -1 },
          }),
        ),
      );

      word = await prisma.word.findFirst({
        where: { id: payload.id },
        select: wordComplexSelector,
      });
    } else {
      word = await prisma.word.create({
        data: {
          userId,
          units: {
            createMany: { data: payload.units },
          },
        },
        select: wordComplexSelector,
      });
    }
    // to check whether letters or something changed
    await playerService.invalidateAudio(word, userId);
    await playerService.saveCustomAudios(payload.customAudios, word.id);

    word = await prisma.word.update({
      where: { id: word.id },
      data: { updatedAt: new Date() },
      select: wordComplexSelector,
    });

    return word;
  }

  async deleteWord({ id }: IdPayload) {
    const word = await prisma.word.delete({
      where: { id },
      include: { units: true },
    });

    await prisma.wordUnit.deleteMany({
      where: { id: { in: word.units.map(({ id }) => id) } },
    });

    await Promise.all(
      word.units.map((unit) => playerService.deleteAudioUnit(unit.id)),
    );

    return word.id;
  }

  async deleteWordsBulk({ ids }: IdsPayload) {
    for await (const id of ids) {
      await this.deleteWord({ id });
    }

    return ids;
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
  }: IdPayload): Promise<
    WordComplexSanitized & { customAudios: CustomAudios }
  > {
    const word = await prisma.word.findFirst({
      where: { id },
      select: wordComplexSelector,
    });

    const customAudios = await playerService.buildCustomAudios(id);

    return { ...word, customAudios };
  }
}

export const vocabularyService = new VocabularyService();

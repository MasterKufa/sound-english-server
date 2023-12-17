import {
  IdPayload,
  IdsPayload,
  WordReqBody,
  WordUnitReqBody,
} from "./vocabulary.types";
import { prisma } from "../../prisma";
import { playerService } from "../player";
import { translate } from "@vitalets/google-translate-api";
import { omit, pick } from "lodash";
import { CustomAudios, WordComplexSanitized } from "../types";
import { wordComplexSelector } from "../selectors";
import { languageValidator } from "./language-validator";

class VocabularyService {
  async translateWord(payload: WordUnitReqBody) {
    const translation = await translate(payload.text, {
      to: "ru",
    });

    return pick(translation, "text");
  }

  async saveWord(payload: WordReqBody, userId: number) {
    if (
      payload.units.some(
        (unit) => !languageValidator.validate(unit.text, unit.lang),
      )
    ) {
      throw new Error("Word spelling does not match language");
    }

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

import { parse } from "csv-parse";
import {
  BulkWordUploadPayload,
  FileUploadPayload,
  WordDefinition,
} from "./vocabulary.types";
import { Readable } from "stream";
import { prisma } from "../../prisma";
import { Lang, WordComplex } from "../types";
import { vocabularyService } from "./vocabulary.service";

class FileUploadService {
  async processFile({ name, file }: FileUploadPayload) {
    const records: Array<WordDefinition> = [];
    const parser = Readable.from(file).pipe(parse({ columns: true }));

    for await (const record of parser) {
      const word = await prisma.word.findFirst({
        where: {
          sourceWord: { text: record[Lang.en] },
          targetWord: { text: record[Lang.ru] },
        },
      });

      if (!word) records.push(record);
    }

    return records;
  }
  async bulkUploadWords({ words }: BulkWordUploadPayload, userId: number) {
    return Promise.all<WordComplex>(
      words.map(
        (word) =>
          new Promise(async (resolve) => {
            const created = await vocabularyService.saveWord(
              {
                sourceWord: { lang: Lang.en, text: word[Lang.en] },
                targetWord: { lang: Lang.ru, text: word[Lang.ru] },
                customAudios: {},
              },
              userId,
            );

            resolve(created);
          }),
      ),
    );
  }
}

export const fileUploadService = new FileUploadService();

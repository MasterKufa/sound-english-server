import { parse } from "csv-parse";
import {
  BulkUploadError,
  BulkUploadFailedRecord,
  BulkWordUploadPayload,
  FileUploadPayload,
  WordDefinition,
} from "./vocabulary.types";
import { Readable } from "stream";
import { prisma } from "../../prisma";
import { Lang, WordComplexSanitized } from "../types";
import { vocabularyService } from "./vocabulary.service";
import { languageValidator } from "./language-validator";
import { Socket } from "socket.io";
import * as xlsx from "xlsx";
import { ACTIONS } from "../actions";
import { entries, values } from "lodash";

class FileUploadService {
  private convertToCSV(name: string, file: Buffer): Buffer {
    if (name.endsWith("csv")) return file;
    if (name.endsWith("xlsx") || name.endsWith("xls")) {
      const workBook = xlsx.read(file, { type: "buffer" });

      return xlsx.write(workBook, { type: "buffer", bookType: "csv" });
    }

    throw new Error("Wrong file extension");
  }
  async processFile({ name, file }: FileUploadPayload) {
    const records: Array<WordDefinition> = [];
    const failedRecords: Array<BulkUploadFailedRecord> = [];
    const buffer = this.convertToCSV(name, file);
    const parser = Readable.from(buffer).pipe(
      parse({ columns: true, bom: true }),
    );

    for await (const record of parser) {
      if (
        values(Lang).some(
          (lang) =>
            record[lang] && !languageValidator.validate(record[lang], lang),
        )
      ) {
        failedRecords.push({
          word: record,
          error: BulkUploadError.langCheck,
        });

        continue;
      }

      const recordUnits = entries(record).map(([lang, text]) => ({
        lang,
        text: text as string,
      }));

      const word = await prisma.word.findFirst({
        where: {
          units: {
            every: {
              AND: {
                lang: { in: recordUnits.map(({ lang }) => lang) },
                text: { in: recordUnits.map(({ text }) => text) },
              },
            },
          },
        },
      });

      if (word) {
        failedRecords.push({
          word: record,
          error: BulkUploadError.duplicate,
        });
      } else {
        records.push(record);
      }
    }

    return { records, failedRecords };
  }
  async bulkUploadWords(
    { words }: BulkWordUploadPayload,
    userId: number,
    socket: Socket,
  ) {
    const result: Array<WordComplexSanitized> = [];

    for await (const word of words) {
      const newWord = await vocabularyService.saveWord(
        {
          units: entries(word).map(([lang, text]) => ({
            lang: lang as Lang,
            text,
          })),
          customAudios: {},
        },
        userId,
      );

      result.push(newWord);
      socket.emit(ACTIONS.BULK_UPLOAD_PROGRESS, {
        total: words.length,
        handled: result.length,
      });
    }

    return result;
  }
}

export const fileUploadService = new FileUploadService();

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
import { Lang, WordComplex } from "../types";
import { vocabularyService } from "./vocabulary.service";
import { languageValidator } from "./language-validator";
import { Socket } from "socket.io";
import * as xlsx from "xlsx";
import { ACTIONS } from "../actions";

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
      const word = await prisma.word.findFirst({
        where: {
          sourceWord: { text: record[Lang.en] },
          targetWord: { text: record[Lang.ru] },
        },
      });

      if (word) {
        failedRecords.push({ word: record, error: BulkUploadError.duplicate });
      } else if (
        !languageValidator.validate(record[Lang.en], Lang.en) ||
        !languageValidator.validate(record[Lang.ru], Lang.ru)
      ) {
        failedRecords.push({ word: record, error: BulkUploadError.langCheck });
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
    const result: Array<WordComplex> = [];

    for await (const word of words) {
      const newWord = await vocabularyService.saveWord(
        {
          sourceWord: { lang: Lang.en, text: word[Lang.en] },
          targetWord: { lang: Lang.ru, text: word[Lang.ru] },
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

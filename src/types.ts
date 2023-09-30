import { Word, WordUnit } from "@prisma/client";
import { Socket } from "socket.io";

export type SocketAuth = Socket & {
  handshake: { auth: { decoded: { id: number } } };
};

export enum Lang {
  en = "en",
  ru = "ru",
}

export type BufferedAudio = { buffer: Buffer; type: string };

export type CustomAudioPayload = {
  buffer: Buffer;
  mimeType: string;
  isModified?: boolean;
};

export type CustomAudios = Partial<Record<Lang, CustomAudioPayload>>;

export type WordComplex = Omit<
  Word & {
    sourceWord: WordUnit;
    targetWord: WordUnit;
  },
  "userId" | "sourceWordUnitId" | "targetWordUnitId"
>;

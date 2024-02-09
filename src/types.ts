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
  isDeleted?: boolean;
};

export type CustomAudios = Partial<Record<Lang, CustomAudioPayload>>;

export type WordComplex = Word & {
  units: Array<WordUnit>;
};

export type WordComplexSanitized = Omit<WordComplex, "userId">;

export type IdPayload = {
  id: number;
};

export type IdsPayload = {
  ids: Array<number>;
};

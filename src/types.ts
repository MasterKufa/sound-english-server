import { Socket } from "socket.io";

export type SocketAuth = Socket & {
  handshake: { auth: { decoded: { id: number } } };
};

export enum Lang {
  en = "en",
  ru = "ru",
}

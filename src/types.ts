import { Socket } from "socket.io";
import { ACTIONS } from "./actions";

// toDO extract
export type Request<T> = T & { requestId?: string };
export type SocketResponse<T = "success" | "error"> = {
  requestId?: string;
  error?: string;
  payload: T;
};

export type ApiHandlers = Record<ACTIONS, ApiHandler>;

export type ApiHandler = (
  socket: Socket,
  payload: unknown,
) => void | Promise<void>;

export type WordReqBody = {
  sourceWord: WordUnitReqBody;
  targetWord: WordUnitReqBody;
  id?: number;
};

export type WordUnitAudioBody = {
  id: number;
};

export type DeleteWordPayload = {
  id: number;
};

export type WordUnitReqBody = {
  lang: Lang;
  text: string;
};

export enum Lang {
  en = "en",
  ru = "ru",
}

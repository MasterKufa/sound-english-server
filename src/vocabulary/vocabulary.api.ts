import { vocabularyService } from "./vocabulary.service";
import { ACTIONS } from "../actions";
import { Socket } from "socket.io";
import { WordReqBody, DeleteWordPayload } from "./vocabulary.types";
import { Word } from "@prisma/client";
import { SocketResponse, Api, Request } from "@master_kufa/server-tools";
import { SocketAuth } from "../types";

export const vocabularyApi = new Api({
  [ACTIONS.SAVE_WORD]: async (
    socket: SocketAuth,
    payload: Request<WordReqBody>,
  ) => {
    const word = await vocabularyService.saveWord(
      payload,
      socket.handshake.auth.decoded.id,
    );
    const successResponse: SocketResponse<Word> = {
      requestId: payload.requestId,
      payload: word,
    };

    socket.emit(ACTIONS.SAVE_WORD, successResponse);
  },
  [ACTIONS.DELETE_WORD]: async (
    socket: Socket,
    payload: Request<DeleteWordPayload>,
  ) => {
    const deletedId = await vocabularyService.deleteWord(payload);
    const successResponse: SocketResponse<number> = {
      requestId: payload.requestId,
      payload: deletedId,
    };

    socket.emit(ACTIONS.DELETE_WORD, successResponse);
  },
  [ACTIONS.LOAD_WORDS]: async (socket: SocketAuth, payload: Request<void>) => {
    const words = await vocabularyService.loadWords(
      socket.handshake.auth.decoded.id,
    );
    const successResponse: SocketResponse<Array<Word>> = {
      requestId: payload.requestId,
      payload: words,
    };

    socket.emit(ACTIONS.LOAD_WORDS, successResponse);
  },
});

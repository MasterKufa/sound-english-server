import { vocabularyService } from "./vocabulary.service";
import { ACTIONS } from "./actions";
import { Socket } from "socket.io";
import { ApiHandlers, SocketResponse, WordReqBody, Request } from "./types";

// toDO extract to lib and in auth too
class Api {
  constructor(private handlers: ApiHandlers) {}

  async handle(action: ACTIONS, socket: Socket, payload: { id?: string }) {
    try {
      await this.handlers[action](socket, payload);
    } catch ({ message }) {
      payload.id && socket.emit(action, { id: payload.id, error: message });
    }
  }
}

export const vocabularyApi = new Api({
  [ACTIONS.SAVE_WORD]: async (
    socket: Socket,
    payload: Request<WordReqBody>,
  ) => {
    const word = await vocabularyService.saveWord(payload);
    const successResponse: SocketResponse<WordReqBody> = {
      requestId: payload.requestId,
      payload: word as WordReqBody,
    };

    socket.emit(ACTIONS.SAVE_WORD, successResponse);
  },
  [ACTIONS.LOAD_WORDS]: async (socket: Socket, payload: Request<void>) => {
    const words = await vocabularyService.loadWords();
    const successResponse: SocketResponse<Array<WordReqBody>> = {
      requestId: payload.requestId,
      payload: words as Array<WordReqBody>,
    };

    socket.emit(ACTIONS.LOAD_WORDS, successResponse);
  },
});

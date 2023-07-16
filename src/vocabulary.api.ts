import { vocabularyService } from "./vocabulary.service";
import { ACTIONS } from "./actions";
import { Socket } from "socket.io";
import { WordReqBody, WordUnitAudioBody, DeleteWordPayload } from "./types";
import { Word } from "@prisma/client";
import { SocketResponse, Api, Request } from "@master_kufa/server-tools";

export const vocabularyApi = new Api({
  [ACTIONS.SAVE_WORD]: async (
    socket: Socket,
    payload: Request<WordReqBody>,
  ) => {
    const word = await vocabularyService.saveWord(payload);
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
  [ACTIONS.LOAD_WORDS]: async (socket: Socket, payload: Request<void>) => {
    const words = await vocabularyService.loadWords();
    const successResponse: SocketResponse<Array<Word>> = {
      requestId: payload.requestId,
      payload: words,
    };

    socket.emit(ACTIONS.LOAD_WORDS, successResponse);
  },
  [ACTIONS.LOAD_AUDIO]: async (
    socket: Socket,
    payload: Request<WordUnitAudioBody>,
  ) => {
    const audioBuffer = await vocabularyService.loadAudio(payload.id);
    const successResponse: SocketResponse<Buffer> = {
      requestId: payload.requestId,
      payload: audioBuffer,
    };

    socket.emit(ACTIONS.LOAD_AUDIO, successResponse);
  },
});

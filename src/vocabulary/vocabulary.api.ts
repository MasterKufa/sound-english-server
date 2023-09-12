import { vocabularyService } from "./vocabulary.service";
import { ACTIONS } from "../actions";
import { WordReqBody, WordUnitReqBody, IdPayload } from "./vocabulary.types";
import { Api, Request } from "@master_kufa/server-tools";
import { SocketAuth } from "../types";

export const vocabularyApiHandlers = {
  [ACTIONS.SAVE_WORD]: (payload: Request<WordReqBody>, socket) =>
    vocabularyService.saveWord(payload, socket.handshake.auth.decoded.id),
  [ACTIONS.TRANSLATE_WORD]: (payload: Request<WordUnitReqBody>) =>
    vocabularyService.translateWord(payload),
  [ACTIONS.DELETE_WORD]: (payload: Request<IdPayload>) =>
    vocabularyService.deleteWord(payload),
  [ACTIONS.LOAD_WORDS]: (_, socket: SocketAuth) =>
    vocabularyService.loadWords(socket.handshake.auth.decoded.id),
  [ACTIONS.LOAD_WORD]: (payload: Request<IdPayload>) =>
    vocabularyService.loadWord(payload),
};

export const vocabularyApi = new Api(vocabularyApiHandlers);

import { playerService } from "./player.service";
import { ACTIONS } from "../actions";

import { Api, Request } from "@master_kufa/server-tools";
import { WordUnitAudioBody } from "./player.types";
import { SocketAuth } from "../types";

export const playerApiHandlers = {
  [ACTIONS.LOAD_AUDIO]: (
    payload: Request<WordUnitAudioBody>,
    socket: SocketAuth,
  ) => playerService.loadAudio(payload.id, socket.handshake.auth.decoded.id),
};

export const playerApi = new Api(playerApiHandlers);

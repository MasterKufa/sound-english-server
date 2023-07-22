import { playerService } from "./player.service";
import { ACTIONS } from "../actions";
import { Socket } from "socket.io";

import { SocketResponse, Api, Request } from "@master_kufa/server-tools";
import { WordUnitAudioBody } from "./player.types";

export const playerApi = new Api({
  [ACTIONS.LOAD_AUDIO]: async (
    socket: Socket,
    payload: Request<WordUnitAudioBody>,
  ) => {
    const audioBuffer = await playerService.loadAudio(payload.id);
    const successResponse: SocketResponse<Buffer> = {
      requestId: payload.requestId,
      payload: audioBuffer,
    };

    socket.emit(ACTIONS.LOAD_AUDIO, successResponse);
  },
});

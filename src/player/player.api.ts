import { playerService } from "./player.service";
import { ACTIONS } from "../actions";

import { Api, Request } from "@master_kufa/server-tools";
import { WordUnitAudioBody } from "./player.types";

export const playerApiHandlers = {
  [ACTIONS.LOAD_AUDIO]: (payload: Request<WordUnitAudioBody>) =>
    playerService.loadAudio(payload.id),
};

export const playerApi = new Api(playerApiHandlers);

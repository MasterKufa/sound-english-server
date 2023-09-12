import { settingsService } from "./settings.service";
import { ACTIONS } from "../actions";
import { LoadVoicesBody } from "./settings.types";
import { Settings } from "@prisma/client";
import { Api, Request } from "@master_kufa/server-tools";
import { SocketAuth } from "../types";

export const settingsApiHandlers = {
  [ACTIONS.LOAD_SETTINGS]: (_, socket: SocketAuth) =>
    settingsService.loadSettings(socket.handshake.auth.decoded.id),
  [ACTIONS.CHANGE_SETTINGS]: (payload: Request<Settings>, socket: SocketAuth) =>
    settingsService.changeSettings(payload, socket.handshake.auth.decoded.id),
  [ACTIONS.LOAD_VOICES]: (payload: Request<LoadVoicesBody>) =>
    settingsService.loadVoices(payload),
};

export const settingsApi = new Api(settingsApiHandlers);

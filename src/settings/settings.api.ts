import { settingsService } from "./settings.service";
import { ACTIONS } from "../actions";
import { LoadVoicesBody, VoiceShort } from "./settings.types";
import { Settings } from "@prisma/client";
import { SocketResponse, Api, Request } from "@master_kufa/server-tools";
import { SocketAuth } from "../types";

export const settingsApi = new Api({
  [ACTIONS.LOAD_SETTINGS]: async (
    socket: SocketAuth,
    payload: Request<void>,
  ) => {
    const settings = await settingsService.loadSettings(
      socket.handshake.auth.decoded.id,
    );

    const successResponse: SocketResponse<Settings> = {
      requestId: payload.requestId,
      payload: settings,
    };

    socket.emit(ACTIONS.LOAD_SETTINGS, successResponse);
  },
  [ACTIONS.CHANGE_SETTINGS]: async (
    socket: SocketAuth,
    payload: Request<Settings>,
  ) => {
    const settings = await settingsService.changeSettings(
      payload,
      socket.handshake.auth.decoded.id,
    );
    const successResponse: SocketResponse<Settings> = {
      requestId: payload.requestId,
      payload: settings,
    };

    socket.emit(ACTIONS.CHANGE_SETTINGS, successResponse);
  },
  [ACTIONS.LOAD_VOICES]: async (
    socket: SocketAuth,
    payload: Request<LoadVoicesBody>,
  ) => {
    const voices = await settingsService.loadVoices(payload);
    const successResponse: SocketResponse<Array<VoiceShort>> = {
      requestId: payload.requestId,
      payload: voices,
    };

    socket.emit(ACTIONS.LOAD_VOICES, successResponse);
  },
});

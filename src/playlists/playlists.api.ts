import { ACTIONS } from "../actions";

import { Api, Request } from "@master_kufa/server-tools";
import { IdPayload, SocketAuth } from "../types";
import { PlaylistReqBody } from "./playlists.types";
import { playlistService } from "./playlists.service";

export const playlistsApiHandlers = {
  [ACTIONS.SAVE_PLAYLISTS]: (
    payload: Request<{ data: Array<PlaylistReqBody> }>,
    socket: SocketAuth,
  ) =>
    playlistService.savePlaylists(
      payload.data,
      socket.handshake.auth.decoded.id,
    ),
  [ACTIONS.DELETE_PLAYLIST]: (payload: Request<IdPayload>) =>
    playlistService.deletePlaylist(payload),
  [ACTIONS.LOAD_PLAYLISTS]: (_, socket: SocketAuth) =>
    playlistService.loadPlaylists(socket.handshake.auth.decoded.id),
};

export const playlistsApi = new Api(playlistsApiHandlers);

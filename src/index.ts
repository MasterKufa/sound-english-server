import { Socket } from "socket.io";
import { vocabularyApi, vocabularyApiHandlers } from "./vocabulary";
import { createServer } from "@master_kufa/server-tools";
import { userService } from "./user";
import { playerApi, playerApiHandlers } from "./player";
import { settingsApi, settingsApiHandlers } from "./settings";
import { registerApi } from "./helpers";
import { playlistsApi, playlistsApiHandlers } from "./playlists";

const server = createServer({ withAuthorization: true });

server.use(async (socket, next) => {
  await userService.recordUser(socket.handshake.auth.decoded.id);

  next();
});

server.on("connection", async (socket: Socket) => {
  registerApi(vocabularyApiHandlers, vocabularyApi, socket);
  registerApi(playerApiHandlers, playerApi, socket);
  registerApi(settingsApiHandlers, settingsApi, socket);
  registerApi(playlistsApiHandlers, playlistsApi, socket);
});

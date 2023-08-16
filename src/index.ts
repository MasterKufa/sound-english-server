import { Socket } from "socket.io";
import { ACTIONS } from "./actions";
import { vocabularyApi } from "./vocabulary";
import { createServer } from "@master_kufa/server-tools";
import { userService } from "./user";
import { playerApi } from "./player";
import { settingsApi } from "./settings";

const server = createServer({ withAuthorization: true });

server.use(async (socket, next) => {
  await userService.recordUser(socket.handshake.auth.decoded.id);

  next();
});

server.on("connection", async (socket: Socket) => {
  socket.on(
    ACTIONS.SAVE_WORD,
    vocabularyApi.handle.bind(vocabularyApi, ACTIONS.SAVE_WORD, socket),
  );
  socket.on(
    ACTIONS.TRANSLATE_WORD,
    vocabularyApi.handle.bind(vocabularyApi, ACTIONS.TRANSLATE_WORD, socket),
  );
  socket.on(
    ACTIONS.DELETE_WORD,
    vocabularyApi.handle.bind(vocabularyApi, ACTIONS.DELETE_WORD, socket),
  );
  socket.on(
    ACTIONS.LOAD_WORDS,
    vocabularyApi.handle.bind(vocabularyApi, ACTIONS.LOAD_WORDS, socket),
  );
  socket.on(
    ACTIONS.LOAD_AUDIO,
    playerApi.handle.bind(playerApi, ACTIONS.LOAD_AUDIO, socket),
  );
  socket.on(
    ACTIONS.LOAD_SETTINGS,
    settingsApi.handle.bind(settingsApi, ACTIONS.LOAD_SETTINGS, socket),
  );
  socket.on(
    ACTIONS.CHANGE_SETTINGS,
    settingsApi.handle.bind(settingsApi, ACTIONS.CHANGE_SETTINGS, socket),
  );
  socket.on(
    ACTIONS.LOAD_VOICES,
    settingsApi.handle.bind(settingsApi, ACTIONS.LOAD_VOICES, socket),
  );
});

import { Socket } from "socket.io";
import { ACTIONS } from "./actions";
import { vocabularyApi } from "./vocabulary";
import { createServer } from "@master_kufa/server-tools";
import { userService } from "./user";
import { playerApi } from "./player";

const server = createServer({ withAuthorization: true });

server.on("connection", async (socket: Socket) => {
  console.log(socket.handshake.auth, socket.handshake.auth.decoded.id);
  await userService.recordUser(socket.handshake.auth.decoded.id);

  socket.on(
    ACTIONS.SAVE_WORD,
    vocabularyApi.handle.bind(vocabularyApi, ACTIONS.SAVE_WORD, socket),
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
});

import { Server, Socket } from "socket.io";
import { ACTIONS } from "./actions";
import { vocabularyApi } from "./vocabulary.api";

const io = new Server(3000);

io.on("connection", (socket: Socket) => {
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
    vocabularyApi.handle.bind(vocabularyApi, ACTIONS.LOAD_AUDIO, socket),
  );
});

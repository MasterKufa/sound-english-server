import { Socket, io } from "socket.io-client";

export const ffmpegSocket: Socket = io(process.env.FFMPEG_HOST, {
  transports: ["websocket"],
});

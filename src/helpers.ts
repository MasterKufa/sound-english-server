import { Api, ApiHandlers } from "@master_kufa/server-tools";
import { existsSync, mkdirSync } from "fs";
import { Socket } from "socket.io";

export const createNotExistedPath = (targetPath: string) => {
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }
  return targetPath;
};

export const registerApi = <T extends string>(
  actions: ApiHandlers<string>,
  api: Api<T>,
  socket: Socket,
) =>
  Object.keys(actions).forEach((action) =>
    socket.on(action, api.handle.bind(api, action, socket)),
  );

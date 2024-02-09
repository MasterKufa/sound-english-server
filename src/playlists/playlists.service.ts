import { IdPayload } from "src/types";
import { prisma } from "../../prisma";
import { PlaylistItemAnswer, PlaylistReqBody } from "./playlists.types";
import { isEqual } from "lodash";

class PlaylistsService {
  async savePlaylists(payload: Array<PlaylistReqBody>, userId: number) {
    const newPlaylists = payload.filter((playlist) => !isFinite(playlist.id));

    const oldPlaylists = await prisma.playlist.findMany({
      include: { words: true },
    });

    const changedPlaylists = payload.filter((newList) => {
      const old = oldPlaylists.find(({ id }) => newList.id === id);

      return (
        old &&
        (newList.name !== old.name ||
          !isEqual(
            new Set(newList.wordIds),
            new Set(old.words.map(({ id }) => id)),
          ))
      );
    });

    for await (let playlist of newPlaylists) {
      await prisma.playlist.create({
        data: {
          name: playlist.name,
          userId,
          words: {
            connect: playlist.wordIds.map((id) => ({ id })),
          },
        },
      });
    }

    for await (let playlist of changedPlaylists) {
      await prisma.playlist.update({
        data: {
          name: playlist.name,
          words: {
            connect: playlist.wordIds.map((id) => ({ id })),
          },
        },
        where: { id: playlist.id },
      });
    }

    return this.loadPlaylists(userId);
  }

  async deletePlaylist({ id }: IdPayload) {
    return await prisma.playlist.delete({
      where: { id },
    });
  }

  async loadPlaylists(userId: number): Promise<Array<PlaylistItemAnswer>> {
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: { words: true },
      orderBy: { updatedAt: "desc" },
    });

    return playlists.map(({ name, id, createdAt, updatedAt, words }) => ({
      name,
      id,
      createdAt,
      updatedAt,
      wordIds: words.map(({ id }) => id),
    }));
  }
}

export const playlistService = new PlaylistsService();

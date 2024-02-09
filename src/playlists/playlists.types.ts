export type PlaylistReqBody = {
  id: number;
  name: string;
  wordIds: Array<number>;
};

export type PlaylistItemAnswer = {
  id: number;
  name: string;
  wordIds: Array<number>;
  createdAt: Date;
  updatedAt: Date;
};

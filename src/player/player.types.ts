export type WordUnitAudioBody = {
  id: number;
};

export enum FFMPEG_ACTIONS {
  CONCAT_WITH_PAUSE = "CONCAT_WITH_PAUSE",
}

export type ConcatConfig = {
  inputSource1: string;
  inputSource2: string;
  pauseMs: number;
  outputPath: string;
};

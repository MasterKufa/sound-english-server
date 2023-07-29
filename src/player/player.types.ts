export type WordUnitAudioBody = {
  id: number;
};

export enum FFMPEG_ACTIONS {
  CONCAT_WITH_PAUSE = "CONCAT_WITH_PAUSE",
}

export type ConcatConfig = {
  inputSource1: string;
  inputSource1Times: number;
  inputSource2: string;
  inputSource2Times: number;
  repeatSourceDelay: number;
  repeatTargetDelay: number;
  pauseMs: number;
  outputPath: string;
};

export type WordUnitAudioBody = {
  id: number;
};

export enum FFMPEG_ACTIONS {
  CONCAT_WITH_PAUSE = "CONCAT_WITH_PAUSE",
  CONVERT_MONO_16 = "CONVERT_MONO_16",
}

export type CovertConfig = {
  input: string;
  output: string;
  id: string;
};

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

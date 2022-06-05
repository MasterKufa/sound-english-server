export enum Columns {
  english = 'english',
  russian = 'russian',
  id = 'id',
}

export enum Lang {
  english = 'en-US',
  russian = 'ru-RU',
}

export type BuildUtercOpt = {
  ruVoice: SpeechSynthesisVoice | null;
  enVoice: SpeechSynthesisVoice | null;
};

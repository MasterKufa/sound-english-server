export enum Columns {
  english = 'english',
  russian = 'russian',
  id = 'id',
  delete = 'delete',
  select = 'select',
}

export enum Lang {
  english = 'en-US',
  russian = 'ru-RU',
}

export type BuildUtercOpt = {
  ruVoice: SpeechSynthesisVoice | null;
  enVoice: SpeechSynthesisVoice | null;
};

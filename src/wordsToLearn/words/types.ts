export class WordToLearn {
  id: number;
  english: string;
  russian: string;
}

export type WordPayload = {
  english: string;
  russian: string;
  base64RuAudio?: string;
  base64EnAudio?: string;
};

export type TranslatePayload = {
  russian?: string;
  english?: string;
};

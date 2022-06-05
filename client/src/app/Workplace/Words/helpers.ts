import { Word } from 'ducks/reducers/types';
import { last } from 'lodash';
import { BuildUtercOpt, Lang } from './types';

const buildUtterence = (
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = voice;
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;

  return utterance;
};

export const buildUterc = (data: Word[], opts: BuildUtercOpt) =>
  data
    ?.map((x) => {
      const en = buildUtterence(x.english, Lang.english, opts.enVoice);
      const ru = buildUtterence(x.russian, Lang.russian, opts.ruVoice);

      ru.onend = () => {
        speechSynthesis.pause();

        setTimeout(() => speechSynthesis.resume(), 1000);
      };

      return [en, ru];
    })
    .flat();

export const speakUterc = (utterances: SpeechSynthesisUtterance[]) => {
  speechSynthesis.cancel();
  utterances?.forEach((x) => speechSynthesis.speak(x));

  const lastUt = last(utterances);

  if (lastUt) lastUt.onend = () => speakUterc(utterances);
};

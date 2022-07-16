import { isAudio } from 'app/Workplace/helpers';
import { useSESelector } from 'ducks/hooks';
import { AudioSequenceItem } from '../../types';

export const buildUtterence = (
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  robotVolume: number,
) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = voice;
  utterance.volume = robotVolume;
  utterance.rate = 1;
  utterance.pitch = 1;

  return utterance;
};

export const useAudioSeq = () => {
  const { customVolume } = useSESelector((state) => state.words);
  const buf: AudioSequenceItem[] = [];
  let isPlaying = false;

  const tryToPlay = () => {
    const item = buf.shift();
    if (!item) return;

    const end = () => {
      item?.onEnd && item.onEnd();
      isPlaying = false;
      tryToPlay();
    };

    isPlaying = true;
    if (isAudio(item.audio)) {
      item.audio.volume = customVolume;
      item.audio.play();
      item.audio.onended = end;
    } else {
      speechSynthesis.speak(item.audio);
      item.audio.onend = end;
    }
  };

  return {
    queueAudio: (item: AudioSequenceItem) => {
      buf.push(item);
      !isPlaying && tryToPlay();
    },
  };
};

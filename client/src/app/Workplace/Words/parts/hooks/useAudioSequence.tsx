import { isAudio } from 'app/Workplace/helpers';
import { useSESelector } from 'ducks/hooks';
import { useCallback, useRef, useState } from 'react';
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
  const [seqPlaying, setSeqPlaying] = useState(false);
  const seqEmpty = useRef(true);
  const customPlayingNow = useRef<HTMLAudioElement>();
  const buf = useRef<AudioSequenceItem[]>([]);

  const tryToPlay = useCallback(() => {
    const item = buf.current.shift();
    if (!item) {
      seqEmpty.current = true;
      return;
    }
    seqEmpty.current = false;

    const end = () => {
      item?.onEnd && item.onEnd();
      setSeqPlaying(false);
      tryToPlay();
    };

    setSeqPlaying(true);
    if (isAudio(item.audio)) {
      item.audio.volume = customVolume;
      item.audio.play();
      customPlayingNow.current = item.audio;
      item.audio.onended = end;
    } else {
      speechSynthesis.speak(item.audio);
      item.audio.onend = end;

      // VERY STRANGE SAFARI FIX. DONT TOUCH ME!!!!! SAFARI TRIGGER ON END ONLY IF AUDIO IS STORED GLOBAL (I E CONSOLE)
      (window as any).__continuePlay = item.audio;
    }
  }, [customVolume]);

  return {
    queueAudio: useCallback(
      (items: AudioSequenceItem[]) => {
        buf.current.push(...items);
        !seqPlaying && tryToPlay();
      },
      [seqPlaying, tryToPlay],
    ),
    seqEmpty,
    seqPlaying,
    setSeqPlaying,
    customPlayingNow,
  };
};

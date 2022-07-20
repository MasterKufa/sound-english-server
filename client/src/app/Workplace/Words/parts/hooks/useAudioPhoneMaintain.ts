import { activateAudioHandler } from 'app/Workplace/helpers';
import { Word } from 'ducks/reducers/types';
import { compose, isNil, not } from 'ramda';
import { useEffect, useMemo } from 'react';
import Silence from 'assets/silence.mp3';

export const useAudioPhoneMaintain = (data?: Word[]) => {
  const audiosToActivate = useMemo(
    () =>
      (
        (data || [])
          .map((audio) => [audio.enAudio, audio.ruAudio])
          .flat() as HTMLAudioElement[]
      ).filter(compose(not, isNil)),
    [data],
  );

  useEffect(() => {
    activateAudioHandler(audiosToActivate);

    // AS THOUGHT ONLY LEN
  }, [audiosToActivate.length]);

  useEffect(() => {
    const silence = new Audio(Silence);
    silence.loop = true;

    const handler = () => {
      if (silence.paused) silence.play();
    };

    window.addEventListener('click', handler);
    window.addEventListener('touch', handler);

    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touch', handler);
    };
  }, []);
};

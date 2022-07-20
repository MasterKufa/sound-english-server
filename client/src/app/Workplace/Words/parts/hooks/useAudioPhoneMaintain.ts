import { activateAudioHandler } from 'app/Workplace/helpers';
import { Word } from 'ducks/reducers/types';
import { compose, isNil, not } from 'ramda';
import { useEffect, useMemo } from 'react';
import Silence from 'assets/silence.mp3';
import { useAppDispatch } from 'ducks/hooks';
import { setIsPlaying } from 'ducks/reducers/words';

export const useAudioPhoneMaintain = (data?: Word[]) => {
  const dispatch = useAppDispatch();

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
    silence.onpause = () => dispatch(setIsPlaying(false));
    silence.onplay = () => dispatch(setIsPlaying(true));

    const handler = async () => {
      if (silence.paused) {
        silence.onplay = null;
        await silence.play();
        silence.onplay = () => dispatch(setIsPlaying(true));
      }
    };

    window.addEventListener('click', handler);
    window.addEventListener('touch', handler);

    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touch', handler);
    };
  }, []);
};

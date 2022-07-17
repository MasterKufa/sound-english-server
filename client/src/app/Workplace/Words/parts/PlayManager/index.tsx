import { Button } from '@mui/material';
import { activateAudioHandler } from 'app/Workplace/helpers';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import { setIsPlaying } from 'ducks/reducers/words';
import { compose, isNil, not } from 'ramda';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyledStack } from '../../styled';
import { Lang } from '../../types';
import { buildUtterence, useAudioSeq } from '../hooks/useAudioSequence';
import { usePlayNext } from '../hooks/usePlayNext';
import { PlayMode } from './PlayMode';
import { PlayProperties } from './PlayProperties';
import { VoiceControl } from './VoiceControl';

export const PlayManager: React.FC = () => {
  const {
    currentWord,
    isPlaying,
    isPlayCustomAudio,
    voice,
    robotVolume,
    pauseBetween,
  } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();
  const { data } = useGetAllQuery();
  const { defineNextWord } = usePlayNext();
  const { queueAudio, seqEmpty, setSeqPlaying, seqPlaying } = useAudioSeq();
  const nextWordTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentWord) defineNextWord();
  }, [currentWord, defineNextWord]);

  const speak = useCallback(() => {
    if (!currentWord) return;
    queueAudio([
      {
        audio:
          isPlayCustomAudio && currentWord?.enAudio
            ? currentWord?.enAudio
            : buildUtterence(
                currentWord?.english,
                Lang.english,
                voice[Lang.english],
                robotVolume,
              ),
      },
      {
        audio:
          isPlayCustomAudio && currentWord?.ruAudio
            ? currentWord?.ruAudio
            : buildUtterence(
                currentWord?.russian,
                Lang.russian,
                voice[Lang.russian],
                robotVolume,
              ),
      },
    ]);
  }, [currentWord, queueAudio, isPlayCustomAudio, voice, robotVolume]);

  useEffect(() => {
    console.log(pauseBetween);
    if (isPlaying && seqEmpty.current && !nextWordTimeout.current) {
      nextWordTimeout.current = setTimeout(() => {
        defineNextWord();
        speak();
        nextWordTimeout.current = null;
      }, pauseBetween * 1000);
    }

    if (!isPlaying) {
      speechSynthesis.cancel();
      nextWordTimeout.current && clearTimeout(nextWordTimeout.current);
      nextWordTimeout.current = null;
    }
  }, [
    isPlaying,
    speak,
    seqPlaying,
    setSeqPlaying,
    pauseBetween,
    defineNextWord,
    seqEmpty,
  ]);

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

  return (
    <>
      <StyledStack>
        <VoiceControl />
        {!!data?.length && (
          <Button
            sx={{ height: '60px' }}
            variant="contained"
            onClick={() => {
              dispatch(setIsPlaying(!isPlaying));
            }}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
        )}
      </StyledStack>
      <PlayMode />
      <PlayProperties />
    </>
  );
};

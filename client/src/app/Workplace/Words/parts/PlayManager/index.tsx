import { Button } from '@mui/material';
import { activateAudioHandler } from 'app/Workplace/helpers';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import { setIsPlaying } from 'ducks/reducers/words';
import { last, range } from 'lodash';
import { compose, isNil, not } from 'ramda';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyledStack } from '../../styled';
import { AudioSequenceItem, Lang } from '../../types';
import { buildUtterence, useAudioSeq } from '../hooks/useAudioSequence';
import { usePlayNext } from '../hooks/usePlayNext';
import { PlayMode } from './PlayMode';
import { PlayProperties } from './PlayProperties';
import { Timer } from './Timer';
import { VoiceControl } from './VoiceControl';

export const PlayManager: React.FC = () => {
  const {
    currentWord,
    isPlaying,
    isPlayCustomAudio,
    voice,
    robotVolume,
    pauseBetween,
    repeatWord,
  } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();
  const { data } = useGetAllQuery();
  const { defineNextWord } = usePlayNext();
  const { queueAudio, seqEmpty, setSeqPlaying, seqPlaying, customPlayingNow } =
    useAudioSeq();
  const nextWordTimeout = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback(() => {
    if (!currentWord) return;

    const queuePayload = range(repeatWord).flatMap(() => [
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
    ]) as AudioSequenceItem[];

    last(queuePayload)!.onEnd = () => {
      nextWordTimeout.current = setTimeout(() => {
        defineNextWord();
        nextWordTimeout.current = null;
      }, pauseBetween * 1000);
    };

    queueAudio(queuePayload);
  }, [
    currentWord,
    repeatWord,
    queueAudio,
    isPlayCustomAudio,
    voice,
    robotVolume,
    pauseBetween,
    defineNextWord,
  ]);

  useEffect(() => {
    if (isPlaying && seqEmpty.current && !nextWordTimeout.current) {
      speak();
    }

    if (!isPlaying) {
      speechSynthesis.cancel();
      customPlayingNow.current?.pause();
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
    customPlayingNow,
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
              if (!currentWord) defineNextWord();
              dispatch(setIsPlaying(!isPlaying));
            }}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
        )}
      </StyledStack>
      <PlayMode />
      <PlayProperties />
      <Timer />
    </>
  );
};

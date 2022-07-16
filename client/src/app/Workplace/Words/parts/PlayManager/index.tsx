import { Button } from '@mui/material';
import { activateAudioHandler } from 'app/Workplace/helpers';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import { setIsPlaying } from 'ducks/reducers/words';
import { compose, isNil, not } from 'ramda';
import React, { useCallback, useEffect, useMemo } from 'react';
import { StyledStack } from '../../styled';
import { Lang } from '../../types';
import { buildUtterence, useAudioSeq } from '../hooks/useAudioSequence';
import { usePlayNext } from '../hooks/usePlayNext';
import { PlayMode } from './PlayMode';
import { PlayProperties } from './PlayProperties';
import { VoiceControl } from './VoiceControl';

export const PlayManager: React.FC = () => {
  const { currentWord, isPlaying, isPlayCustomAudio, voice, robotVolume } =
    useSESelector((state) => state.words);
  const dispatch = useAppDispatch();
  const { data } = useGetAllQuery();
  const { defineNextWord } = usePlayNext();
  const { queueAudio, seqEmpty, setSeqEmpty, setSeqPlaying, seqPlaying } =
    useAudioSeq();

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
        onEnd: defineNextWord,
      },
    ]);
  }, [
    currentWord,
    queueAudio,
    isPlayCustomAudio,
    voice,
    robotVolume,
    defineNextWord,
  ]);

  useEffect(() => {
    console.log(isPlaying, seqEmpty);
    if (isPlaying && seqEmpty) {
      speak();
    }

    if (!isPlaying) {
      speechSynthesis.cancel();

      //SAFARI CANCEL UTER DURING PLAY, SO ON END NOT TRIGGERED AND YOU NEED MANUALLY DROP THE QUEUE
      !seqEmpty && setSeqEmpty(true);
      seqPlaying && setSeqPlaying(false);
      //
    }
  }, [isPlaying, seqEmpty, setSeqEmpty, speak, seqPlaying, setSeqPlaying]);

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
  }, [audiosToActivate]);

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

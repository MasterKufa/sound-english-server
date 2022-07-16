import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Slider,
} from '@mui/material';
import {
  activateAudio,
  activateAudioHandler,
  isAudio,
} from 'app/Workplace/helpers';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import {
  setCustomVolume,
  setIsPlayCustomAudio,
  setIsPlaying,
  setPauseBetween,
  setRobotVolume,
  setVoice,
  setVoiceList,
} from 'ducks/reducers/words';
import { compose, isNil, not } from 'ramda';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyledStack } from '../styled';
import { AudioSequenceItem, Lang, PlayModes } from '../types';
import { buildUtterence, useAudioSeq } from './hooks/useAudioSequence';
import { usePlayNext } from './hooks/usePlayNext';

export const PlayManager: React.FC = () => {
  const {
    currentWord,
    isPlaying,
    isPlayCustomAudio,
    voice,
    pauseBetween,
    voiceList,
    robotVolume,
  } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useGetAllQuery();
  const { defineNextWord, setPlayMode, playMode } = usePlayNext();
  const { queueAudio } = useAudioSeq();

  const speak = useCallback(() => {
    if (!currentWord) return;

    queueAudio({
      audio:
        isPlayCustomAudio && currentWord?.enAudio
          ? currentWord?.enAudio
          : buildUtterence(
              currentWord?.english,
              Lang.english,
              voice[Lang.english],
              robotVolume,
            ),
    });
    queueAudio({
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
    });
  }, [
    currentWord,
    queueAudio,
    isPlayCustomAudio,
    voice,
    robotVolume,
    defineNextWord,
  ]);

  useEffect(() => {
    if (isPlaying && !speechSynthesis.pending) speak();

    if (!isPlaying) speechSynthesis.cancel();
  }, [isPlaying, speak]);

  const buildVoicePayload = useCallback(
    (lang: Lang) => ({
      voice: voiceList.find((x) => x.lang === lang) || null,
      lang,
    }),
    [voiceList],
  );

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      dispatch(setVoiceList(voices));
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setVoice(buildVoicePayload(Lang.english)));
    dispatch(setVoice(buildVoicePayload(Lang.russian)));
  }, [buildVoicePayload, dispatch]);

  const changeVoice = useCallback(
    (lang: Lang) => (e: SelectChangeEvent<string>) => {
      dispatch(setIsPlaying(false));
      dispatch(
        setVoice({
          voice: voiceList.find((x) => x.name === e.target.value)!,
          lang,
        }),
      );
    },
    [dispatch, voiceList],
  );

  const audiosToActivate = useMemo(
    () =>
      (data || [])
        .map((audio) => [audio.enAudio, audio.ruAudio])
        .filter(compose(not, isNil))
        .flat() as HTMLAudioElement[],
    [data],
  );

  useEffect(() => {
    activateAudioHandler(audiosToActivate);
  }, [audiosToActivate]);

  return (
    <>
      <StyledStack>
        <FormControl>
          <InputLabel id="en-voice">En Voice</InputLabel>
          <Select
            sx={{ width: '125px' }}
            labelId="en-voice"
            value={voice[Lang.english]?.name || ''}
            label="En Voice"
            onChange={changeVoice(Lang.english)}
          >
            {voiceList
              .filter((x) => x.lang === Lang.english && x.name)
              .map((x) => (
                <MenuItem key={x.name} value={x.name}>
                  {x.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="ru-voice">Ru Voice</InputLabel>
          <Select
            sx={{ width: '125px' }}
            labelId="ru-voice"
            value={voice[Lang.russian]?.name || ''}
            label="Ru Voice"
            onChange={changeVoice(Lang.russian)}
          >
            {voiceList
              .filter((x) => x.lang === Lang.russian && x.name)
              .map((x) => (
                <MenuItem key={x.name} value={x.name}>
                  {x.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {!!data?.length && (
          <Button
            sx={{ height: '60px' }}
            variant="contained"
            onClick={() => {
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
        )}
      </StyledStack>
      <StyledStack>
        <FormControl>
          <FormLabel>Play Mode</FormLabel>
          <RadioGroup
            value={playMode}
            onChange={(_, val) => setPlayMode(val as PlayModes)}
            row
          >
            <FormControlLabel
              value={PlayModes.ordinal}
              control={<Radio />}
              label={PlayModes.ordinal}
            />
            <FormControlLabel
              value={PlayModes.random}
              control={<Radio />}
              label={PlayModes.random}
            />
            <FormControlLabel
              value={PlayModes.lastOccurenceBased}
              control={<Radio />}
              label={PlayModes.lastOccurenceBased}
            />
          </RadioGroup>
        </FormControl>
      </StyledStack>
      <StyledStack gap={3}>
        <FormControlLabel
          onChange={(_, checked) => dispatch(setIsPlayCustomAudio(checked))}
          control={<Checkbox defaultChecked />}
          label="Play Custom Audio"
        />
        <Box>
          Custom audio volume
          <Slider
            min={0}
            step={0.01}
            max={1}
            defaultValue={1}
            onChange={(_, val) => dispatch(setCustomVolume(val as number))}
          />
        </Box>
        <Box>
          Robot audio volume
          <Slider
            min={0}
            step={0.01}
            max={1}
            defaultValue={1}
            onChange={(_, val) => dispatch(setRobotVolume(val as number))}
          />
        </Box>
        <Box sx={{ width: '185px' }}>
          Pause between(s) = {pauseBetween}
          <Slider
            onChange={(_, val) => dispatch(setPauseBetween(val as number))}
            value={pauseBetween}
            min={0.5}
            max={10}
            step={0.5}
            marks={[
              {
                value: 0.5,
                label: 0.5,
              },
              {
                value: 10,
                label: 10,
              },
            ]}
          />
        </Box>
      </StyledStack>
    </>
  );
};

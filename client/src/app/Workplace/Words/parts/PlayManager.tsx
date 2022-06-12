import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import React, { useCallback, useEffect, useState } from 'react';
import { buildUterc, speakUterc } from '../helpers';
import { StyledStack } from '../styled';
import { Lang } from '../types';

export const PlayManager: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ruVoice, setRuVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [enVoice, setEnVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const { currentWord } = useSESelector((state) => state.words);

  const { data } = useGetAllQuery();

  const speak = useCallback(() => {
    if (!data) return;

    const utterances = buildUterc(data, { ruVoice, enVoice });
    speakUterc(utterances);
  }, [data, ruVoice, enVoice]);

  useEffect(() => {
    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoiceList(voices);
      setRuVoice(voices.find((x) => x.lang === Lang.russian) || null);
      setEnVoice(voices.find((x) => x.lang === Lang.english) || null);
    };
  }, []);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    speechSynthesis.cancel();
  }, []);

  const changeVoice = useCallback(
    (setter: (x: SpeechSynthesisVoice) => void) =>
      (e: SelectChangeEvent<string>) => {
        stopPlay();
        setter(voiceList.find((x) => x.name === e.target.value)!);
      },
    [stopPlay, voiceList],
  );

  useEffect(() => {
    window.addEventListener('onbeforeunload', stopPlay);
  }, []);

  return (
    <StyledStack>
      <FormControl>
        <InputLabel id="en-voice">En Voice</InputLabel>
        <Select
          sx={{ width: '125px' }}
          labelId="en-voice"
          value={enVoice?.name || ''}
          label="En Voice"
          onChange={changeVoice(setEnVoice)}
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
          value={ruVoice?.name || ''}
          label="Ru Voice"
          onChange={changeVoice(setRuVoice)}
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
            isPlaying ? stopPlay() : speak();

            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>
      )}
    </StyledStack>
  );
};

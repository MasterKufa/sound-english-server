import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { setIsPlaying, setVoice, setVoiceList } from 'ducks/reducers/words';
import React, { useCallback, useEffect } from 'react';
import { StyledStack } from '../../styled';
import { Lang } from '../../types';

export const VoiceControl: React.FC = () => {
  const { voice, voiceList } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();

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

  return (
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
    </StyledStack>
  );
};

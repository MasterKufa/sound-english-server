import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import { Word } from 'ducks/reducers/types';
import { changeCurrentWord } from 'ducks/reducers/words';
import { first } from 'lodash';
import { always, cond, equals } from 'ramda';
import React, { useCallback, useEffect, useState } from 'react';
import { StyledStack } from '../styled';
import { Lang, PlayModes } from '../types';

const buildUtterence = (
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = voice;
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;

  return utterance;
};

export const PlayManager: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ruVoice, setRuVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [enVoice, setEnVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [playMode, setPlayMode] = useState<PlayModes>(PlayModes.ordinal);
  const { currentWord } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useGetAllQuery();

  const defineNextWord = useCallback(() => {
    if (!data) return;

    const nextWord = cond<PlayModes[], Word>([
      [
        equals<PlayModes>(PlayModes.ordinal),
        always(
          (currentWord &&
            data[data.findIndex((x) => x.id === currentWord.id) + 1]) ||
            first(data)!,
        ),
      ],
      [
        equals<PlayModes>(PlayModes.random),
        always(data[Math.floor(Math.random() * data.length)]),
      ],
      [
        equals<PlayModes>(PlayModes.lastOccurenceBased),
        always(data[Math.floor(Math.random() * data.length)]),
      ],
    ])(playMode);

    dispatch(changeCurrentWord({ ...nextWord }));
  }, [currentWord, dispatch, playMode, data]);

  const speak = useCallback(() => {
    if (!currentWord) return;

    const uterc = [
      buildUtterence(currentWord?.english, Lang.english, enVoice),
      buildUtterence(currentWord?.russian, Lang.russian, ruVoice),
    ];
    uterc.forEach((x) => speechSynthesis.speak(x));
    uterc[1].onend = defineNextWord;
  }, [currentWord, defineNextWord, enVoice, ruVoice]);

  useEffect(() => {
    if (isPlaying && !speechSynthesis.pending) speak();

    if (!isPlaying) speechSynthesis.cancel();
  }, [isPlaying, speak]);

  useEffect(() => {
    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoiceList(voices);
      setRuVoice(voices.find((x) => x.lang === Lang.russian) || null);
      setEnVoice(voices.find((x) => x.lang === Lang.english) || null);
    };
  }, []);

  const changeVoice = useCallback(
    (setter: (x: SpeechSynthesisVoice) => void) =>
      (e: SelectChangeEvent<string>) => {
        setIsPlaying(false);
        setter(voiceList.find((x) => x.name === e.target.value)!);
      },
    [setIsPlaying, voiceList],
  );

  useEffect(() => {
    isSuccess && defineNextWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    const x = () => setIsPlaying(false);
    window.addEventListener('onbeforeunload', x);

    return () => window.removeEventListener('onbeforeunload', x);
  }, []);

  return (
    <>
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
    </>
  );
};

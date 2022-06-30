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
import { useSESelector } from 'ducks/hooks';
import { useGetAllQuery } from 'ducks/reducers/api/words.api';
import React, { useCallback, useEffect, useState } from 'react';
import { StyledStack } from '../styled';
import { AudioSequenceItem, Lang, PlayModes } from '../types';
import { usePlayNext } from './hooks/usePlayNext';

const buildUtterence = (
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = voice;
  utterance.volume = robotVolume;
  utterance.rate = 1;
  utterance.pitch = 1;

  return utterance;
};

let robotVolume = 1;
let customVolume = 1;

const AudioSeq = () => {
  const buf: AudioSequenceItem[] = [];
  let isPlaying = false;

  const tryToPlay = () => {
    const item = buf.shift();
    if (!item) return;

    const end = () => {
      item?.onEnd && item.onEnd();
      isPlaying = false;
      tryToPlay();
    };

    isPlaying = true;
    if (isAudio(item.audio)) {
      item.audio.volume = customVolume;
      item.audio.play();
      item.audio.onended = end;
    } else {
      speechSynthesis.speak(item.audio);
      item.audio.onend = end;
    }
  };

  return (item: AudioSequenceItem) => {
    buf.push(item);
    !isPlaying && tryToPlay();
  };
};

const addToAudioSeq = AudioSeq();

const activateAudio = (audio: HTMLAudioElement) => {
  audio.play();
  audio.pause();
  audio.currentTime = 0;
};

const isAudio = (item: unknown): item is HTMLAudioElement =>
  Boolean((item as HTMLAudioElement)?.play);

export const PlayManager: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ruVoice, setRuVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pauseBetween, setPauseBetween] = useState<number>(0.5);
  const [enVoice, setEnVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayCustomAudio, setIsPlayCustomAudio] = useState<boolean>(true);
  const { currentWord } = useSESelector((state) => state.words);
  const { data, isSuccess } = useGetAllQuery();
  const { defineNextWord, setPlayMode, playMode } = usePlayNext();

  const speak = useCallback(() => {
    if (!currentWord) return;

    addToAudioSeq({
      audio:
        isPlayCustomAudio && currentWord?.enAudio
          ? currentWord?.enAudio
          : buildUtterence(currentWord?.english, Lang.english, enVoice),
    });
    addToAudioSeq({
      audio:
        isPlayCustomAudio && currentWord?.ruAudio
          ? currentWord?.ruAudio
          : buildUtterence(currentWord?.russian, Lang.russian, ruVoice),
      onEnd: defineNextWord,
    });
  }, [currentWord, defineNextWord, enVoice, ruVoice, isPlayCustomAudio]);

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
    if (isSuccess) {
      const activateHandler = () => {
        data.forEach((audio) => {
          audio.enAudio && activateAudio(audio.enAudio);
          audio.ruAudio && activateAudio(audio.ruAudio);
        });

        defineNextWord();
      };

      window.addEventListener('click', activateHandler);

      return () => window.removeEventListener('click', activateHandler);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

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
      <StyledStack gap={3}>
        <FormControlLabel
          onChange={(_, checked) => setIsPlayCustomAudio(checked)}
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
            onChange={(_, val) => void (customVolume = val as number)}
          />
        </Box>
        <Box>
          Robot audio volume
          <Slider
            min={0}
            step={0.01}
            max={1}
            defaultValue={1}
            onChange={(_, val) => (robotVolume = val as number)}
          />
        </Box>
        <Box sx={{ width: '185px' }}>
          Pause between(s) = {pauseBetween}
          <Slider
            onChange={(_, val) => setPauseBetween(val as number)}
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

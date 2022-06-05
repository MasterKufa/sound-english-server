import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import {
  useAddWordMutation,
  useDeleteWordMutation,
  useGetAllQuery,
} from 'ducks/reducers/api/words.api';
import { theme } from 'globalStyle/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { TableFix } from '../common/Table';
import { Fixed } from '../common/Table/types';
import { buildUterc, speakUterc } from './helpers';
import { Columns, Lang } from './types';
import DeleteIcon from '@mui/icons-material/Delete';

const columns = [
  {
    Header: 'ID',
    accessor: Columns.id,
    fixed: Fixed.left,
    width: 70,
  },
  {
    Header: 'En',
    accessor: Columns.english,
    fixed: Fixed.center,
    width: 500,
  },
  {
    Header: 'Ru',
    accessor: Columns.russian,
    fixed: Fixed.center,
    width: 500,
  },
];

export const Words: React.FC = () => {
  const [english, setEnglish] = useState('');
  const [russian, setRussian] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [ruVoice, setRuVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [enVoice, setEnVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);

  const [addWord] = useAddWordMutation();
  const [deleteWord] = useDeleteWordMutation();

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
    <Box>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: theme.spacing(3),
        }}
      >
        <Stack
          spacing={1}
          direction="row"
          sx={{
            mb: theme.spacing(3),
          }}
        >
          <TextField
            label="En"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
          />
          <TextField
            label="Ru"
            value={russian}
            onChange={(e) => setRussian(e.target.value)}
          />
          <Button
            disabled={!russian || !english}
            variant="contained"
            onClick={() => {
              addWord({ english, russian });
              setEnglish('');
              setRussian('');
            }}
          >
            Add
          </Button>
        </Stack>
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
        <Stack spacing={1} direction="row">
          <FormControl>
            <InputLabel id="en-voice">En Voice</InputLabel>
            <Select
              sx={{ width: '150px' }}
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
              sx={{ width: '150px' }}
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
        </Stack>
      </Stack>

      {data && (
        <TableFix
          compact
          rowActions={[
            {
              name: 'Удалить',
              icon: <DeleteIcon />,
              onClick: (row) => deleteWord({ id: row.values[Columns.id] }),
            },
          ]}
          data={data}
          columns={columns}
        />
      )}
    </Box>
  );
};

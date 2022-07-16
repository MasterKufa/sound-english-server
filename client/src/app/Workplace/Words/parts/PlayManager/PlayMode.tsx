import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useSESelector } from 'ducks/hooks';
import React, { useEffect } from 'react';
import { StyledStack } from '../../styled';
import { PlayModes } from '../../types';
import { usePlayNext } from '../hooks/usePlayNext';

export const PlayMode: React.FC = () => {
  const { currentWord } = useSESelector((state) => state.words);
  const { defineNextWord, setPlayMode, playMode } = usePlayNext();

  useEffect(() => {
    if (!currentWord) defineNextWord();
  }, [currentWord, defineNextWord]);

  return (
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
  );
};

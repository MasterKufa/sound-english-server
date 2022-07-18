import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';
import { StyledStack } from '../../styled';
import { PlayModes } from '../../types';
import { usePlayNext } from '../hooks/usePlayNext';

export const PlayMode: React.FC = () => {
  const { setPlayMode, playMode } = usePlayNext();

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

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { changePlayMode } from 'ducks/reducers/words';
import React from 'react';
import { StyledStack } from '../../styled';
import { PlayModes } from '../../types';

export const PlayMode: React.FC = () => {
  const { playMode } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();

  return (
    <StyledStack>
      <FormControl>
        <FormLabel>Play Mode</FormLabel>
        <RadioGroup
          value={playMode}
          onChange={(_, val) => dispatch(changePlayMode(val as PlayModes))}
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

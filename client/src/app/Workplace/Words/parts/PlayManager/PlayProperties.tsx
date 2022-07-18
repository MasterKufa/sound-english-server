import { Box, Checkbox, FormControlLabel, Slider } from '@mui/material';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import {
  setCustomVolume,
  setIsPlayCustomAudio,
  setIsPlaying,
  setPauseBetween,
  setRobotVolume,
} from 'ducks/reducers/words';
import React from 'react';
import { StyledStack } from '../../styled';

export const PlayProperties: React.FC = () => {
  const { pauseBetween, robotVolume, customVolume, isPlayCustomAudio } =
    useSESelector((state) => state.words);
  const dispatch = useAppDispatch();

  return (
    <StyledStack gap={3}>
      <FormControlLabel
        value={isPlayCustomAudio}
        onChange={(_, checked) => {
          dispatch(setIsPlaying(false));
          dispatch(setIsPlayCustomAudio(checked));
        }}
        control={<Checkbox defaultChecked />}
        label="Play Custom Audio"
      />
      <Box>
        Custom audio volume
        <Slider
          value={customVolume}
          min={0}
          step={0.01}
          max={1}
          defaultValue={customVolume}
          onChange={(_, val) => {
            dispatch(setIsPlaying(false));
            dispatch(setCustomVolume(val as number));
          }}
        />
      </Box>
      <Box>
        Robot audio volume
        <Slider
          value={robotVolume}
          min={0}
          step={0.01}
          max={1}
          defaultValue={robotVolume}
          onChange={(_, val) => {
            dispatch(setIsPlaying(false));
            dispatch(setRobotVolume(val as number));
          }}
        />
      </Box>
      <Box sx={{ width: '185px' }}>
        Pause between(s) = {pauseBetween}
        <Slider
          onChange={(_, val) => {
            dispatch(setIsPlaying(false));
            dispatch(setPauseBetween(val as number));
          }}
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
  );
};

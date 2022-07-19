import { Box, Button } from '@mui/material';
import { NumericEvent, NumericInput } from 'components/NumericInput';
import { useAppDispatch } from 'ducks/hooks';
import { setIsPlaying } from 'ducks/reducers/words';
import { theme } from 'globalStyle/theme';
import { isNil } from 'ramda';
import React, { useEffect, useRef, useState } from 'react';

import { StyledStack } from '../../styled';

export const Timer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [ss, setSs] = useState(0);
  const [isActiveTimer, setIsActiveTimer] = useState(false);
  const timeout = useRef<NodeJS.Timer | null>();

  const onButtonClick = () => {
    if (isActiveTimer) {
      setIsActiveTimer(false);
      timeout.current && clearTimeout(timeout.current);
      timeout.current = null;
      setSs(0);

      return;
    }

    setIsActiveTimer(true);
  };

  useEffect(() => {
    if (!isActiveTimer) return;

    timeout.current = setTimeout(() => {
      if (ss > 0 && isActiveTimer) {
        setSs(ss - 1);
      }

      if (ss === 0) {
        dispatch(setIsPlaying(false));
        setIsActiveTimer(false);
      }
    }, 1000);
  }, [ss, isActiveTimer, dispatch]);

  const onChange = (threshold: number) => (_: number, event: NumericEvent) =>
    (ss >= threshold || event === NumericEvent.inc) &&
    setSs(ss + (event === NumericEvent.inc ? 1 : -1) * threshold);

  return (
    <StyledStack>
      <Box sx={{ display: 'flex', gap: theme.spacing(1) }}>
        <NumericInput
          min={0}
          max={24}
          label="hh"
          value={Math.floor(ss / 3600)}
          width={70}
          disabled={isActiveTimer}
          onChange={onChange(3600)}
        />
        <NumericInput
          min={0}
          max={60}
          value={Math.floor((ss % 3600) / 60)}
          label="mm"
          width={70}
          disabled={isActiveTimer}
          onChange={onChange(60)}
        />
        <NumericInput
          min={0}
          max={60}
          value={ss % 60}
          label="ss"
          width={70}
          disabled={isActiveTimer}
          onChange={onChange(1)}
        />
      </Box>
      <Box>
        <Button
          disabled={!isActiveTimer && !ss}
          variant="contained"
          onClick={onButtonClick}
        >
          {isActiveTimer ? 'Stop Timer' : 'Set Timer'}
        </Button>
      </Box>
    </StyledStack>
  );
};

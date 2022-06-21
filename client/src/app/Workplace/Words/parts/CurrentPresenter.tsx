import { Paper, Typography } from '@mui/material';
import { useSESelector } from 'ducks/hooks';
import { Word } from 'ducks/reducers/types';
import { theme } from 'globalStyle/theme';
import React, { useEffect, useState } from 'react';

type LastState = {
  current: Word | null;
  last: Word | null;
  lastLast: Word | null;
};

export const CurrentPresenter: React.FC = () => {
  const { currentWord } = useSESelector((state) => state.words);
  const [lastState, setLastState] = useState<LastState>({
    last: null,
    lastLast: null,
    current: null,
  });
  useEffect(() => {
    setLastState((prev) => ({
      lastLast: prev.last,
      last: prev.current,
      current: currentWord,
    }));
  }, [currentWord]);

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(3),
        mb: theme.spacing(3),
        textAlign: 'center',
        lineBreak: 'anywhere',
      }}
    >
      <Typography variant="h6">Now: </Typography>
      <Typography
        variant="h3"
        component="span"
        sx={{ color: theme.palette.info.dark }}
      >
        {lastState?.current?.english}-{lastState?.current?.russian}
      </Typography>

      <Typography variant="h6">Last and before: </Typography>
      <Typography
        variant="h4"
        component="span"
        sx={{ color: theme.palette.info.dark }}
      >
        {lastState?.last?.english}-{lastState?.last?.russian}
      </Typography>
      <Typography
        variant="h5"
        component="span"
        sx={{ color: theme.palette.info.dark }}
      >
        {lastState?.lastLast?.english}-{lastState?.lastLast?.russian}
      </Typography>
    </Paper>
  );
};

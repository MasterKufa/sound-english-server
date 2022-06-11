import { Stack } from '@mui/material';
import { theme } from 'globalStyle/theme';
import React from 'react';

export const StyledStack: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Stack
    spacing={1}
    direction="row"
    sx={{
      mb: theme.spacing(3),
    }}
  >
    {children}
  </Stack>
);

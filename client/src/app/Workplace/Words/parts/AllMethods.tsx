import { Button } from '@mui/material';
import { useDeleteAllMutation } from 'ducks/reducers/api/words.api';
import React from 'react';
import { StyledStack } from '../styled';

export const AllMethods: React.FC = () => {
  const [deleteAll] = useDeleteAllMutation();

  return (
    <StyledStack>
      <Button variant="contained" onClick={() => deleteAll()}>
        Delete All
      </Button>
    </StyledStack>
  );
};

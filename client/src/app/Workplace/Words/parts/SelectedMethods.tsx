import { Button } from '@mui/material';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import { useDeleteWordsByIdsMutation } from 'ducks/reducers/api/words.api';
import { clearSelected } from 'ducks/reducers/words';
import React from 'react';
import { StyledStack } from '../styled';

export const SelectedMethods: React.FC = () => {
  const { selectedWordsId } = useSESelector((state) => state.words);
  const dispatch = useAppDispatch();

  const [deleteByIds] = useDeleteWordsByIdsMutation();

  return (
    <StyledStack>
      <Button
        disabled={!selectedWordsId.length}
        variant="contained"
        onClick={() => dispatch(clearSelected())}
      >
        Clear Selection
      </Button>
      <Button
        disabled={!selectedWordsId.length}
        variant="contained"
        onClick={() => {
          deleteByIds({ ids: selectedWordsId });
          dispatch(clearSelected());
        }}
      >
        Delete Selected
      </Button>
    </StyledStack>
  );
};

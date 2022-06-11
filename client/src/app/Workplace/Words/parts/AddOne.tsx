import { Button, TextField } from '@mui/material';
import { useAddWordMutation } from 'ducks/reducers/api/words.api';
import React, { useState } from 'react';
import { StyledStack } from '../styled';

export const AddOne: React.FC = () => {
  const [english, setEnglish] = useState('');
  const [russian, setRussian] = useState('');

  const [addWord] = useAddWordMutation();

  return (
    <StyledStack>
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
    </StyledStack>
  );
};

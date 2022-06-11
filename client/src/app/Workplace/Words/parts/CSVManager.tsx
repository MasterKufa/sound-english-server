import { Button } from '@mui/material';
import { useAddManyWordsMutation } from 'ducks/reducers/api/words.api';
import { Word } from 'ducks/reducers/types';
import { first } from 'lodash';
import React, { useCallback, useState } from 'react';
import { StyledStack } from '../styled';
import { parse } from 'papaparse';

const CSVTemplate = window.URL.createObjectURL(
  new Blob(['english;russian'], { type: 'text/csv' }),
);

const parseCSVToWords = async (file: File): Promise<Word[] | null> => {
  let fr = new FileReader();

  fr.readAsText(file);

  const text = await new Promise<string>((resolve, reject) => {
    fr.onload = () => {
      resolve(fr.result as string);
    };
  });

  const res = parse<Word>(text, { header: true });

  return res.errors?.length
    ? null
    : res.data.filter((x) => x.english && x.russian);
};

export const CSVManager: React.FC = () => {
  const [decodedCSV, setDecodedCSV] = useState<Word[] | null>([]);

  const [addMenyWords] = useAddManyWordsMutation();

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        const parsed = await parseCSVToWords(first(e.target.files)!);

        setDecodedCSV(parsed);
      }
    },
    [setDecodedCSV],
  );

  return (
    <StyledStack>
      {decodedCSV?.length ? (
        <>
          <Button
            variant="contained"
            onClick={() => {
              addMenyWords(decodedCSV);
              setDecodedCSV([]);
            }}
          >
            Load {decodedCSV.length} words
          </Button>
          <Button variant="contained" onClick={() => setDecodedCSV([])}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button variant="contained" component="label">
            Load CSV
            <input
              onChange={handleFiles}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              hidden
            />
          </Button>
          <Button variant="contained" href={CSVTemplate}>
            Download Template
          </Button>
        </>
      )}
    </StyledStack>
  );
};

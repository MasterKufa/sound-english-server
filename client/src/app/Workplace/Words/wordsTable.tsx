import {
  useDeleteWordMutation,
  useGetAllQuery,
} from 'ducks/reducers/api/words.api';
import React from 'react';
import { TableFix } from '../common/Table';
import { Fixed } from '../common/Table/types';
import { Columns } from './types';
import DeleteIcon from '@mui/icons-material/Delete';

const columns = [
  {
    Header: 'ID',
    accessor: Columns.id,
    fixed: Fixed.left,
    width: 70,
  },
  {
    Header: 'En',
    accessor: Columns.english,
    fixed: Fixed.center,
    width: 500,
  },
  {
    Header: 'Ru',
    accessor: Columns.russian,
    fixed: Fixed.center,
    width: 500,
  },
];

export const WordsTable: React.FC = () => {
  const [deleteWord] = useDeleteWordMutation();

  const { data } = useGetAllQuery();

  return (
    <>
      {data && (
        <TableFix
          compact
          rowActions={[
            {
              name: 'Удалить',
              icon: <DeleteIcon />,
              onClick: (row) => deleteWord({ id: row.values[Columns.id] }),
            },
          ]}
          data={data}
          columns={columns}
        />
      )}
    </>
  );
};

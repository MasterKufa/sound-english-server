import {
  useDeleteWordMutation,
  useGetAllQuery,
} from 'ducks/reducers/api/words.api';
import React, { useMemo } from 'react';
import { TableFix } from '../../common/Table';
import { Fixed } from '../../common/Table/types';
import { Columns } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { CellProps } from 'react-table';
import { useDispatch } from 'react-redux';
import { toggleSelectedWord } from 'ducks/reducers/words';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useSESelector } from 'ducks/hooks';

const SelectCell: React.FC<
  CellProps<Partial<Record<Columns, string | number>>>
> = (cell) => {
  const dispatch = useDispatch();
  const { selectedWordsId } = useSESelector((state) => state.words);

  return (
    <IconButton
      onClick={() =>
        dispatch(toggleSelectedWord(cell.row.original[Columns.id] as number))
      }
    >
      {selectedWordsId.includes(cell.row.original[Columns.id] as number) ? (
        <CheckBoxIcon />
      ) : (
        <CheckBoxOutlineBlankIcon />
      )}
    </IconButton>
  );
};

const useColumns = () =>
  useMemo(
    () => [
      {
        accessor: Columns.id,
        hidden: true,
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

      {
        accessor: Columns.select,
        fixed: Fixed.center,
        minWidth: 50,
        Cell: SelectCell,
      },
    ],
    [],
  );

export const WordsTable: React.FC = () => {
  const { data } = useGetAllQuery();
  const columns = useColumns();

  return <>{data && <TableFix compact data={data} columns={columns} />}</>;
};

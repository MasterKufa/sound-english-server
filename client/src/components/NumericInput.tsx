import { Box, TextField, IconButton, IconButtonProps } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FC } from 'react';

const IconButtonStyled: FC<IconButtonProps> = (props) => (
  <IconButton
    onClick={props.onClick}
    size="small"
    sx={{ p: 0, verticalAlign: 'top' }}
  >
    {props.children}
  </IconButton>
);

export const NumericInput: FC<{
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}> = ({ value, onChange, max = 10, min = 1 }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <TextField size="small" value={value} />
      <Box>
        <IconButtonStyled onClick={() => value < max && onChange(value + 1)}>
          <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
        </IconButtonStyled>
        <IconButtonStyled onClick={() => value > min && onChange(value - 1)}>
          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
        </IconButtonStyled>
      </Box>
    </Box>
  );
};

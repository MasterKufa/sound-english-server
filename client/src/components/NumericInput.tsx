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

export enum NumericEvent {
  inc = 'inc',
  dec = 'dec',
}

export const NumericInput: FC<{
  value: number;
  onChange: (value: number, event: NumericEvent) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
  label?: string;
  width?: number;
}> = ({ value, onChange, max = 10, min = 1, disabled, label, width }) => {
  return (
    <Box sx={{ display: 'flex', width }}>
      <TextField label={label} disabled={disabled} size="small" value={value} />
      <Box sx={{ width: 'min-content' }}>
        <IconButtonStyled
          disabled={disabled}
          onClick={() => value < max && onChange(value + 1, NumericEvent.inc)}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
        </IconButtonStyled>
        <IconButtonStyled
          disabled={disabled}
          onClick={() => value > min && onChange(value - 1, NumericEvent.dec)}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
        </IconButtonStyled>
      </Box>
    </Box>
  );
};

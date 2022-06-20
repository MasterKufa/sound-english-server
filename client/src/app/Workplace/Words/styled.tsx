import styled from '@emotion/styled';
import { theme } from 'globalStyle/theme';

export const StyledStack = styled.div<{ gap?: number }>`
  display: flex;
  margin-bottom: ${theme.spacing(2)};
  gap: ${({ gap }) => theme.spacing(gap || 1)};
  flex-wrap: wrap;
  justify-content: center;
`;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { xor } from 'lodash';
import { Word } from './types';

type WordsState = {
  selectedWordsId: number[];
  currentWord: Word | null;
};

const initialState: WordsState = {
  selectedWordsId: [],
  currentWord: null,
};

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    toggleSelectedWord: (state, action: PayloadAction<number>) =>
      void (state.selectedWordsId = xor(state.selectedWordsId, [
        action.payload,
      ])),
    clearSelected: (state, _: PayloadAction<void>) =>
      void (state.selectedWordsId = []),
  },
});

export const { toggleSelectedWord, clearSelected } = wordsSlice.actions;

export default wordsSlice.reducer;

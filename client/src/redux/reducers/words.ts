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
    toggleSelectedWord: (state, action: PayloadAction<number | number[]>) =>
      void (state.selectedWordsId = xor(
        state.selectedWordsId,
        Array.isArray(action.payload) ? action.payload : [action.payload],
      )),
    clearSelected: (state, _: PayloadAction<void>) =>
      void (state.selectedWordsId = []),
    changeCurrentWord: (state, action: PayloadAction<Word | null>) =>
      void (state.currentWord = action.payload),
  },
});

export const { toggleSelectedWord, clearSelected, changeCurrentWord } =
  wordsSlice.actions;

export default wordsSlice.reducer;

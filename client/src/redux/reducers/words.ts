import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lang } from 'app/Workplace/Words/types';
import { xor } from 'lodash';
import { CustomAudio, Word } from './types';

type AddDraft = {
  input: Record<Lang, string>;
  audio: Record<Lang, CustomAudio>;
};

type WordsState = {
  selectedWordsId: number[];
  currentWord: Word | null;
  addDraft: AddDraft;
};

export const DefaultCustomAudio = {
  isRecording: false,
  isPlaying: false,
  hasRecord: false,
};

const DefaultAddDraft = {
  input: {
    [Lang.english]: '',
    [Lang.russian]: '',
  },
  audio: {
    [Lang.english]: DefaultCustomAudio,
    [Lang.russian]: DefaultCustomAudio,
  },
};

const initialState: WordsState = {
  selectedWordsId: [],
  currentWord: null,
  addDraft: DefaultAddDraft,
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
      void ((state.currentWord as Word | null) = action.payload),
    setCustomAudioPlaying: (
      state,
      action: PayloadAction<{ isPlaying: boolean; lang: Lang }>,
    ) =>
      void (state.addDraft.audio[action.payload.lang].isPlaying =
        action.payload.isPlaying),
    setCustomAudioRecording: (
      state,
      action: PayloadAction<{ isRecording: boolean; lang: Lang }>,
    ) =>
      void (state.addDraft.audio[action.payload.lang].isRecording =
        action.payload.isRecording),
    setCustomAudioHasRecord: (
      state,
      action: PayloadAction<{ hasRecord: boolean; lang: Lang }>,
    ) =>
      void (state.addDraft.audio[action.payload.lang].hasRecord =
        action.payload.hasRecord),
    setInputWord: (
      state,
      action: PayloadAction<{ input: string; lang: Lang }>,
    ) =>
      void (state.addDraft.input[action.payload.lang] = action.payload.input),
    resetAddWord: (state) => void (state.addDraft = DefaultAddDraft),
  },
});

export const {
  toggleSelectedWord,
  clearSelected,
  changeCurrentWord,
  setCustomAudioPlaying,
  setCustomAudioRecording,
  setCustomAudioHasRecord,
  setInputWord,
  resetAddWord,
} = wordsSlice.actions;

export default wordsSlice.reducer;

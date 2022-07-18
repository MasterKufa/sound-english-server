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
  isPlaying: boolean;
  isPlayCustomAudio: boolean;
  voice: Record<Lang, SpeechSynthesisVoice | null>;
  pauseBetween: number;
  repeatWord: number;
  voiceList: SpeechSynthesisVoice[];
  robotVolume: number;
  customVolume: number;
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
  isPlaying: false,
  isPlayCustomAudio: true,
  voice: {
    [Lang.english]: null,
    [Lang.russian]: null,
  },
  pauseBetween: 0.5,
  repeatWord: 1,
  voiceList: [],
  robotVolume: 1,
  customVolume: 1,
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
    setIsPlaying: (state, action: PayloadAction<boolean>) =>
      void (state.isPlaying = action.payload),
    setIsPlayCustomAudio: (state, action: PayloadAction<boolean>) =>
      void (state.isPlayCustomAudio = action.payload),
    setVoice: (
      state,
      action: PayloadAction<{ lang: Lang; voice: SpeechSynthesisVoice | null }>,
    ) => void (state.voice[action.payload.lang] = action.payload.voice),
    setVoiceList: (state, action: PayloadAction<SpeechSynthesisVoice[]>) =>
      void (state.voiceList = action.payload),
    setPauseBetween: (state, action: PayloadAction<number>) =>
      void (state.pauseBetween = action.payload),
    setRobotVolume: (state, action: PayloadAction<number>) =>
      void (state.robotVolume = action.payload),
    setCustomVolume: (state, action: PayloadAction<number>) =>
      void (state.customVolume = action.payload),
    changeRepeatWord: (state, action: PayloadAction<number>) =>
      void (state.repeatWord = action.payload),
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
  setIsPlaying,
  setVoice,
  setVoiceList,
  setPauseBetween,
  setIsPlayCustomAudio,
  setRobotVolume,
  setCustomVolume,
  changeRepeatWord,
} = wordsSlice.actions;

export default wordsSlice.reducer;

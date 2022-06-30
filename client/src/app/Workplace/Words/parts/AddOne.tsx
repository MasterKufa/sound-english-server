import { Box, Button, IconButton, TextField } from '@mui/material';
import { useAddWordMutation } from 'ducks/reducers/api/words.api';
import React, { useCallback, useEffect, useState } from 'react';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { StyledStack } from '../styled';
import { theme } from 'globalStyle/theme';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Lang } from '../types';

type CustomAudio = {
  isRecording: boolean;
  isPlaying: boolean;
  hasRecord: boolean;
};

const DefaultCustomAudio = {
  isRecording: false,
  isPlaying: false,
  hasRecord: false,
};

let EnChunks: Blob[] = [];
let RuChunks: Blob[] = [];
const audio = document.createElement('audio');
const blobToBase64 = (blob: Blob[]): Promise<string> =>
  new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(
      new Blob(blob, {
        type: 'audio/mp3',
      }),
    );
  });

export const AddOne: React.FC = () => {
  const [english, setEnglish] = useState('');
  const [russian, setRussian] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [englishCustomAudio, setEnglishCustomAudio] =
    useState<CustomAudio>(DefaultCustomAudio);
  const [russianCustomAudio, setRussianCustomAudio] =
    useState<CustomAudio>(DefaultCustomAudio);

  const [addWord] = useAddWordMutation();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => setMediaRecorder(new MediaRecorder(stream)));
    }
  }, []);

  const onMicroClick = useCallback(
    (lang: Lang) => () => {
      if (!mediaRecorder) return;

      const state =
        lang === Lang.english ? englishCustomAudio : russianCustomAudio;

      const setState =
        lang === Lang.english ? setEnglishCustomAudio : setRussianCustomAudio;
      if (state.hasRecord) {
        EnChunks = [];

        setState({ ...state, hasRecord: false });
        return;
      }
      if (state.isRecording) {
        mediaRecorder.stop();
        setState({
          ...state,
          isRecording: false,
          hasRecord: true,
        });
      } else {
        mediaRecorder.ondataavailable = (e) => {
          (Lang.english === lang ? EnChunks : RuChunks).push(e.data);
        };
        mediaRecorder.start();
        setState({ ...state, isRecording: true });
      }
    },
    [mediaRecorder, englishCustomAudio, russianCustomAudio],
  );

  const onPlayClick = useCallback(
    (lang: Lang) => () => {
      if (!englishCustomAudio.hasRecord) return;
      const state =
        lang === Lang.english ? englishCustomAudio : russianCustomAudio;

      const setState =
        lang === Lang.english ? setEnglishCustomAudio : setRussianCustomAudio;

      if (state.isPlaying) {
        audio.pause();
        setState({ ...state, isPlaying: false });
      } else {
        const blob = new Blob(Lang.english === lang ? EnChunks : RuChunks, {
          type: 'audio/mp3',
        });
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
        audio.play();
        setState({ ...state, isPlaying: true });

        audio.onended = () => setState({ ...state, isPlaying: false });
      }
    },
    [englishCustomAudio, russianCustomAudio],
  );

  const onAdd = useCallback(async () => {
    const base64EnAudio = EnChunks.length
      ? await blobToBase64(EnChunks)
      : undefined;
    const base64RuAudio = RuChunks.length
      ? await blobToBase64(RuChunks)
      : undefined;
    addWord({ english, russian, base64EnAudio, base64RuAudio });
    setEnglish('');
    setRussian('');
    EnChunks = [];
    RuChunks = [];
    setEnglishCustomAudio(DefaultCustomAudio);
    setRussianCustomAudio(DefaultCustomAudio);
  }, [addWord, english, russian]);

  return (
    <StyledStack>
      <TextField
        label="En"
        value={english}
        onChange={(e) => setEnglish(e.target.value)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onMicroClick(Lang.english)}>
          {englishCustomAudio.hasRecord ? (
            <RestartAltIcon />
          ) : (
            <KeyboardVoiceIcon
              sx={{
                color: englishCustomAudio.isRecording
                  ? theme.palette.info.dark
                  : 'auto',
              }}
            />
          )}
        </IconButton>

        {englishCustomAudio.hasRecord && (
          <IconButton onClick={onPlayClick(Lang.english)}>
            {englishCustomAudio.isPlaying ? (
              <StopIcon />
            ) : (
              <PlayCircleOutlineIcon />
            )}
          </IconButton>
        )}
      </Box>

      <TextField
        label="Ru"
        value={russian}
        onChange={(e) => setRussian(e.target.value)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onMicroClick(Lang.russian)}>
          {russianCustomAudio.hasRecord ? (
            <RestartAltIcon />
          ) : (
            <KeyboardVoiceIcon
              sx={{
                color: russianCustomAudio.isRecording
                  ? theme.palette.info.dark
                  : 'auto',
              }}
            />
          )}
        </IconButton>

        {russianCustomAudio.hasRecord && (
          <IconButton onClick={onPlayClick(Lang.russian)}>
            {russianCustomAudio.isPlaying ? (
              <StopIcon />
            ) : (
              <PlayCircleOutlineIcon />
            )}
          </IconButton>
        )}
      </Box>
      <Button
        disabled={!russian || !english}
        variant="contained"
        onClick={onAdd}
      >
        Add
      </Button>
    </StyledStack>
  );
};

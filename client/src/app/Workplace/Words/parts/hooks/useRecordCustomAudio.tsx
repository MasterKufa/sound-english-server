import { activateAudioHandler, blobToBase64 } from 'app/Workplace/helpers';
import { useAppDispatch, useSESelector } from 'ducks/hooks';
import {
  setCustomAudioPlaying,
  setCustomAudioRecording,
  setCustomAudioHasRecord,
} from 'ducks/reducers/words';
import { useCallback, useEffect, useRef } from 'react';
import { Lang } from '../../types';

type LocalAudioRef = Record<Lang, { chunks: Blob[]; audio: HTMLAudioElement }>;
const createDefaultLocalAudio = () => ({ chunks: [], audio: new Audio() });
const DEFAULT_LOCAL_AUDIO = {
  [Lang.english]: createDefaultLocalAudio(),
  [Lang.russian]: createDefaultLocalAudio(),
};

export const useRecordCustomAudio = () => {
  const localAudio = useRef<LocalAudioRef>(DEFAULT_LOCAL_AUDIO);
  const mediaRecorder = useRef<MediaRecorder>();
  const { addDraft } = useSESelector((state) => state.words);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => (mediaRecorder.current = new MediaRecorder(stream)));
    }
  }, []);

  const onMicroClick = useCallback(
    (lang: Lang) => () => {
      if (!mediaRecorder) return;

      if (addDraft.audio[lang].hasRecord) {
        localAudio.current[lang].chunks = [];
        localAudio.current[lang].audio.src = '';
        dispatch(setCustomAudioHasRecord({ hasRecord: false, lang }));

        return;
      }
      if (addDraft.audio[lang].isRecording) {
        mediaRecorder.current?.stop();

        dispatch(setCustomAudioRecording({ isRecording: false, lang }));
        dispatch(setCustomAudioHasRecord({ hasRecord: true, lang }));
      } else if (mediaRecorder.current) {
        mediaRecorder.current.ondataavailable = (e) => {
          localAudio.current[lang].chunks?.push(e.data);
        };

        mediaRecorder.current.onstop = () => {
          blobToBase64(localAudio.current[lang].chunks).then((base64) => {
            localAudio.current[lang].audio.src = base64;
            localAudio.current[lang].chunks = [];

            activateAudioHandler([localAudio.current[lang].audio]);
          });
        };

        mediaRecorder.current.start();
        dispatch(setCustomAudioRecording({ isRecording: true, lang }));
      }
    },
    [addDraft, dispatch],
  );

  const onPlayClick = useCallback(
    (lang: Lang) => () => {
      if (!addDraft.audio[lang].hasRecord) return;

      if (addDraft.audio[lang].isPlaying) {
        localAudio.current[lang].audio.pause();

        dispatch(setCustomAudioPlaying({ isPlaying: false, lang }));
      } else {
        localAudio.current[lang].audio.play();
        dispatch(setCustomAudioPlaying({ isPlaying: true, lang }));

        localAudio.current[lang].audio.onended = () =>
          dispatch(setCustomAudioPlaying({ isPlaying: false, lang }));
      }
    },
    [dispatch, addDraft],
  );

  const readAudioChunks = useCallback(async () => {
    localAudio.current[Lang.english].chunks = [];
    localAudio.current[Lang.russian].chunks = [];

    return {
      base64EnAudio: localAudio.current[Lang.english].audio.src,
      base64RuAudio: localAudio.current[Lang.russian].audio.src,
    };
  }, []);

  const resetCustomAudio = useCallback(
    () => (localAudio.current = DEFAULT_LOCAL_AUDIO),
    [],
  );

  return {
    onPlayClick,
    onMicroClick,
    readAudioChunks,
    resetCustomAudio,
  };
};

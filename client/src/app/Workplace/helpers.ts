import { MAIN_AUDIO_FORMAT } from './Words/constants';

export const blobToBase64 = (blob: Blob[]): Promise<string> =>
  new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(
      new Blob(blob, {
        type: MAIN_AUDIO_FORMAT,
      }),
    );
  });

export const activateAudio = (audio: HTMLAudioElement) => {
  audio.play();

  audio.pause();
  audio.currentTime = 0;
};

export const activateAudioHandler = (audios: HTMLAudioElement[]) => {
  const removeHandlers = () => {
    window.removeEventListener('mousedown', activateHandler);
    window.removeEventListener('touchstart', activateHandler);
  };

  const activateHandler = () => {
    audios.forEach((audio) => activateAudio(audio));

    removeHandlers();
  };

  window.addEventListener('mousedown', activateHandler);
  window.addEventListener('touchstart', activateHandler);

  return removeHandlers;
};

export const isAudio = (item: unknown): item is HTMLAudioElement =>
  Boolean((item as HTMLAudioElement)?.play);

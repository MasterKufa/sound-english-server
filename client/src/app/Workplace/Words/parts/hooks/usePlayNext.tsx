import { useAppDispatch, useSESelector } from 'ducks/hooks';
import {
  useGetAllQuery,
  useWordSpokenMutation,
} from 'ducks/reducers/api/words.api';
import { Word } from 'ducks/reducers/types';
import { changeCurrentWord } from 'ducks/reducers/words';
import { first } from 'lodash';
import { always, cond, equals } from 'ramda';
import { useCallback, useState } from 'react';
import { PlayModes } from '../../types';

export const usePlayNext = () => {
  const [wordSpoken] = useWordSpokenMutation();
  const { currentWord } = useSESelector((state) => state.words);
  const { data } = useGetAllQuery();
  const [playMode, setPlayMode] = useState<PlayModes>(PlayModes.ordinal);

  const dispatch = useAppDispatch();

  const defineNextWord = useCallback(() => {
    if (!data) return;
    if (currentWord) wordSpoken({ id: currentWord.id });

    const nextWord = cond<PlayModes[], Word>([
      [
        equals<PlayModes>(PlayModes.ordinal),
        always(
          (currentWord &&
            data[data.findIndex((x) => x.id === currentWord.id) + 1]) ||
            first(data)!,
        ),
      ],
      [
        equals<PlayModes>(PlayModes.random),
        always(data[Math.floor(Math.random() * data.length)]),
      ],
      [
        equals<PlayModes>(PlayModes.lastOccurenceBased),
        () => {
          const sortedByOccurence = [...data].sort((x, y) =>
            x.lastSpeechTimestamp > y.lastSpeechTimestamp ? -1 : 1,
          );

          return sortedByOccurence[
            Math.floor((1 / (Math.random() ** 4 + 0.5) / 2) * data.length)
          ];
        },
      ],
    ])(playMode);

    nextWord && dispatch(changeCurrentWord({ ...nextWord }));
  }, [data, currentWord, wordSpoken, playMode, dispatch]);

  return { defineNextWord, setPlayMode, playMode };
};

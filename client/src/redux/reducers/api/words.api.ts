import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ROUTES } from '../../constants';
import { Word } from '../types';
import { addAuthHeader } from './helpers';

enum Tags {
  all = 'all',
}

export const wordsApiSlice = createApi({
  reducerPath: 'wordsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ROUTES.WORDS.BASE,
    prepareHeaders: addAuthHeader,
  }),
  tagTypes: [Tags.all],
  endpoints: (builder) => ({
    addWord: builder.mutation<void, Partial<Word>>({
      query: (body) => ({
        url: ROUTES.WORDS.ADD_ONE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tags.all],
    }),
    wordSpoken: builder.mutation<void, { id: number }>({
      query: (body) => ({
        url: ROUTES.WORDS.WORD_SPOKEN,
        method: 'POST',
        body,
      }),
      async onQueryStarted({ id }, { dispatch }) {
        dispatch(
          wordsApiSlice.util.updateQueryData(
            'getAll',
            undefined,
            (draft) =>
              draft.map((x) =>
                x.id === id ? { ...x, lastSpeechTimestamp: Date.now() } : x,
              ) as Word[],
          ),
        );
      },
    }),
    addManyWords: builder.mutation<void, Word[]>({
      query: (body) => ({
        url: ROUTES.WORDS.ADD_MANY,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tags.all],
    }),
    deleteWord: builder.mutation<void, { id: number }>({
      query: (body) => ({
        url: ROUTES.WORDS.DELETE_ONE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tags.all],
    }),
    deleteWordsByIds: builder.mutation<void, { ids: number[] }>({
      query: (body) => ({
        url: ROUTES.WORDS.DELETE_BY_IDS,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tags.all],
    }),
    deleteAll: builder.mutation<void, void>({
      query: (body) => ({
        url: ROUTES.WORDS.DELETE_ALL,
        method: 'POST',
      }),
      invalidatesTags: [Tags.all],
    }),
    getAll: builder.query<Word[], void>({
      query: () => ({
        url: ROUTES.WORDS.ALL,
      }),
      transformResponse: (baseQueryReturnValue: Word[]): Word[] =>
        baseQueryReturnValue.map((word) => {
          const enAudio = word?.base64EnAudio ? new Audio() : undefined;
          if (enAudio) enAudio.src = word.base64EnAudio!;

          const ruAudio = word?.base64RuAudio ? new Audio() : undefined;
          if (ruAudio) ruAudio.src = word.base64RuAudio!;

          return {
            ...word,
            enAudio,
            ruAudio,
          };
        }),

      providesTags: [Tags.all],
    }),
  }),
});

export const {
  useAddWordMutation,
  useGetAllQuery,
  useDeleteWordMutation,
  useAddManyWordsMutation,
  useDeleteAllMutation,
  useDeleteWordsByIdsMutation,
  useWordSpokenMutation,
} = wordsApiSlice;
export default wordsApiSlice.reducer;

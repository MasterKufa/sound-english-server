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
    addWord: builder.mutation<void, Word>({
      query: (body) => ({
        url: ROUTES.WORDS.ADD_ONE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [Tags.all],
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
    getAll: builder.query<Word[], void>({
      query: () => ({
        url: ROUTES.WORDS.ALL,
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
} = wordsApiSlice;
export default wordsApiSlice.reducer;

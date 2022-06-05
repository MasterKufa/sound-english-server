import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ROUTES } from '../../constants';
import { addAuthHeader } from './helpers';
import { AuthPayload, EmittedToken } from '../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ROUTES.AUTH.BASE,
    prepareHeaders: addAuthHeader,
  }),

  endpoints: (builder) => ({
    auth: builder.mutation<EmittedToken, AuthPayload>({
      query: (body) => ({
        url: ROUTES.AUTH.LOGIN,
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<EmittedToken, AuthPayload>({
      query: (body) => ({
        url: ROUTES.AUTH.REGISTER,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useAuthMutation, useRegisterMutation } = authApi;
export default authApi.reducer;

import { Roles, User } from 'src/users/types';

export type AuthPayload = {
  username: string;
  password: string;
  secret: string;
  secretAnswer: string;
  email: string;
};

export type AuthResponsePayload = {
  userName: string;
  webrtcNumber: string;
  userId: number;
  role: Roles;
};

export type EmittedToken = {
  access_token: string;
};

export type WithUser<T> = T & {
  user: Omit<User, 'passwordHash'>;
};

export type ReqWithUser<T> = {
  body: T;
  user: Omit<User, 'passwordHash'>;
};

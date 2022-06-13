export enum AuthPage {
  auth = 'auth',
  register = 'register',
}

export enum AppPage {
  Authentication = 'authentication',
  Workplace = 'workplace',
}

export enum WorkPage {
  Words = 'Words',
}

export type AuthSlice = {
  passwordInput: string;
  secondPasswordInput: string;
  emailInput: string;
};

export type MainSlice = {
  isBlockingLoader: boolean;
};

export type DecodedToken = {
  user_id: string;
  exp: number;
};

export type AuthPayload = { email: string; password: string };

export type EmittedToken = {
  access_token: string;
  token_type: string;
};

export type Word = {
  english: string;
  russian: string;
  id: number;
  lastSpeechTimestamp: number;
};

declare global {
  interface Window {
    localStorage: { authToken: string };
  }
}

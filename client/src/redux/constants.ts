export const HOST = 'http://localhost:3000/api';
export const BASE_API = HOST;

export const ROUTES = {
  AUTH: {
    BASE: BASE_API + '/auth',
    LOGIN: '/login',
    REGISTER: '/register',
  },
  WORDS: {
    BASE: BASE_API + '/words',
    ADD_ONE: '/add_one',
    DELETE_ONE: '/delete_one',
    ALL: '/all',
  },
};

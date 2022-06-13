export const HOST =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api';
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
    ADD_MANY: '/add_many',
    DELETE_ONE: '/delete_one',
    DELETE_ALL: '/delete_all',
    DELETE_BY_IDS: '/delete_by_ids',
    WORD_SPOKEN: '/word_spoken',
    ALL: '/all',
  },
};

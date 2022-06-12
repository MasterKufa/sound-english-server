export const BASE_API_ROUTE = '/api';

export const ROUTES = {
  API: {
    AUTH: {
      BASE: BASE_API_ROUTE + '/auth',
      LOGIN: '/login',
      REGISTER: '/register',
      LOGOUT: '/logout',
      VERIFY: '/verify_token',
    },
    USERS: {
      BASE: BASE_API_ROUTE + '/users',
    },
    WORDS: {
      BASE: BASE_API_ROUTE + '/words',
      ADD_ONE: '/add_one',
      ADD_MANY: '/add_many',
      DELETE_ONE: '/delete_one',
      DELETE_ALL: '/delete_all',
      DELETE_BY_IDS: '/delete_by_ids',
      ALL: '/all',
    },
  },
};

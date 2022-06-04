const BASE_API_ROUTE = 'api';

export const ROUTES = {
  API: {
    AUTH: {
      BASE: BASE_API_ROUTE + '/auth',
      LOGIN: 'login',
      REGISTER: 'register',
      LOGOUT: '/logout',
      VERIFY: '/verify_token',
    },
    USERS: {
      BASE: BASE_API_ROUTE + '/users',
    },
  },
};

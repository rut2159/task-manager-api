import axios, { AxiosError } from 'axios';

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'user';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearLocalAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const handleLogout = () => {
  clearLocalAuth();
  window.location.href = '/login';
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('[api] Unauthorized. Logging out user.');
      handleLogout();
    }

    if (status === 403) {
      console.warn('[api] Forbidden access. Redirecting to login.');
      handleLogout();
    }

    if (status === 429) {
      console.warn('[api] Too many requests. Please retry later.');
    }

    if (status === 500) {
      console.error('[api] Server error:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

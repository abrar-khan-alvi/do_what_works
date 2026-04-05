import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRedirecting = false;

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (isRedirecting) {
    return Promise.reject(new axios.Cancel('Redirect in progress'));
  }
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleAuthFailure = () => {
  if (isRedirecting) return;
  isRedirecting = true;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// On 401, try to silently refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops if the refresh request itself fails
    if (originalRequest.url?.includes('/auth/token/refresh/')) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/api/v1/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          handleAuthFailure();
        }
      } else {
        handleAuthFailure();
      }
    }

    return Promise.reject(error);
  }
);

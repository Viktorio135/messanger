import axios from 'axios';
import { refreshToken } from './utils'; // Импортируем функцию refreshToken

const baseURL = 'http://127.0.0.1:8000/'; // Замените на ваш базовый URL

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshTokenString = localStorage.getItem('refreshToken');
      try {
        const response = await refreshToken(refreshTokenString);
        localStorage.setItem('accessToken', response.access);
        originalRequest.headers['Authorization'] = `Bearer ${response.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
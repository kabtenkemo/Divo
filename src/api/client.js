import axios from 'axios';

const hostname = window.location.hostname;
const apiHost = hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname;

const PROD_API_URL = 'https://madares-alahad.runasp.net/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_API_URL : `http://${apiHost}:5050/api`);

export const API = axios.create({
  baseURL: API_BASE_URL,
});

export const PublicAPI = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('divo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('divo_token');
      localStorage.removeItem('divo_admin');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function errorMessage(err) {
  return err?.response?.data?.message || 'حدث خطأ غير متوقع، حاول مرة أخرى';
}
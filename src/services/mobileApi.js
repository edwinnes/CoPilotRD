import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://nosotrosrd-backend-810002215622.us-east1.run.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-client-platform': 'android',
    'x-app-version': '2.0.0',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@copilot_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API] Error al recuperar token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function fetchAuthSdui(role = 'CLIENT') {
  try {
    const response = await api.get(`/api/v1/auth/sdui?role=${role}`);
    return response.data;
  } catch (error) {
    console.warn('[fetchAuthSdui error]:', error.message);
    throw new Error('Sin conexión con el servidor.');
  }
}

export default api;

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
    } catch (error) {
      console.warn('[API] Error al recuperar token', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export async function fetchAuthSdui(role = 'CLIENT') {
  try {
    const response = await api.get('/api/v1/sdui/auth', {
      params: { role },
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if (status === 404) {
      console.warn('[SDUI] Endpoint no disponible:', status);

      throw new Error(
        'El servicio de autenticación no está disponible.'
      );
    }

    if (status === 401 || status === 403) {
      throw new Error(
        'No tienes autorización para acceder al servicio.'
      );
    }

    if (status >= 500) {
      throw new Error(
        'El servidor presenta un error interno.'
      );
    }

    if (!error.response) {
      throw new Error(
        'No se pudo establecer conexión con el servidor.'
      );
    }

    throw new Error(
      `Error del servicio de autenticación (${status}).`
    );
  }
}

export default api;

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// URL base oficial del backend en Google Cloud Run
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

// Interceptor para inyectar el token JWT de sesión automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@copilot_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API] Error al recuperar token de AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Solicita una cotización de viaje según el contrato técnico.
 */
export async function requestTripQuote(payload) {
  try {
    const response = await api.post('/api/v1/clients/fares/quote', payload);
    return response.data;
  } catch (error) {
    console.warn('[API] Error al cotizar tarifa:', error?.response?.data || error.message);
    throw error;
  }
}

/**
 * Envía la solicitud en firme de un viaje al backend para el despacho de conductores.
 */
export async function requestTripDispatch(tripData) {
  try {
    const response = await api.post('/api/v1/clients/trips/request', tripData);
    return response.data;
  } catch (error) {
    console.warn('[API] Error al solicitar despacho de viaje:', error?.response?.data || error.message);
    throw error;
  }
}

export default api;

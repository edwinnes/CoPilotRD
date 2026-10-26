import axios from 'axios';
import { getAccessToken, expireSession } from '../context/AuthContext';
import { apiOrigin, assertRelativeApiPath } from '../security/apiPolicy.mjs';
import { authSduiResponseSchema } from '../security/schemas';

// No implicit production destination. Configure the reviewed staging server.
const configuredUrl = process.env.EXPO_PUBLIC_API_URL || '';
const api = axios.create({ timeout: 15000, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  const baseURL = apiOrigin(configuredUrl);
  assertRelativeApiPath(config.url);
  config.baseURL = baseURL;
  const token = getAccessToken();
  if (config.requiresAuth !== false && !token) throw new Error('Inicia sesión para continuar.');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, async error => {
  if (error.response?.status === 401) {
    try { await expireSession(); } catch { /* Navigation already locked. */ }
  }
  return Promise.reject(error);
});
export async function fetchAuthSdui(role = 'CLIENT') {
  const response = await api.get('/api/v1/auth/sdui', { params: { role }, requiresAuth: false });
  return authSduiResponseSchema.parse(response.data);
}
// Existing callers referenced missing exports. These actions stay explicitly
// unavailable until their payloads, authorization and responses are verified.
const unavailable = async () => { throw new Error('Servicio pendiente de contrato e integración con el servidor.'); };
export const requestTrip = unavailable;
export const requestSduiTrip = unavailable;
export const fetchSduiConfig = unavailable;
export const getIncomingTrips = unavailable;
export const updateTripStatus = unavailable;
export const getDeviceSecurityInfo = unavailable;
export const loginWithGoogle = unavailable;
export const getBaseUrl = () => configuredUrl;
export const setCustomBaseUrl = () => { throw new Error('No se permite cambiar el servidor desde la interfaz.'); };
export default api;

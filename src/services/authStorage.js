import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { assertSession } from '../security/sessionCore.mjs';

const KEY = 'copilot_session_v2';
const DISABLED_KEY = 'copilot_session_disabled_v2';
const LEGACY_KEYS = ['@copilot_user', '@copilot_token',
  'nosotrosrd_auth_jwt_token', 'nosotrosrd_auth_user_data'];
const OPTIONS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
let webSession = null; // Web credentials survive only in this tab's memory.

export async function purgeLegacyAuth() {
  await AsyncStorage.multiRemove(LEGACY_KEYS);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    for (const key of LEGACY_KEYS) window.localStorage.removeItem(key);
  }
  if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) {
    for (const key of LEGACY_KEYS) await SecureStore.deleteItemAsync(key);
  }
}
export async function saveAuthSession(session) {
  const value = assertSession(session);
  if (Platform.OS === 'web') { webSession = value; return; }
  if (!await SecureStore.isAvailableAsync()) throw new Error('Almacenamiento seguro no disponible.');
  // No plaintext fallback and no successful result if persistence failed.
  await SecureStore.setItemAsync(KEY, JSON.stringify(value), OPTIONS);
  await AsyncStorage.removeItem(DISABLED_KEY);
}
export async function getAuthSession() {
  if (Platform.OS === 'web') return webSession ? assertSession(webSession) : null;
  if (await AsyncStorage.getItem(DISABLED_KEY) === '1') return null;
  if (!await SecureStore.isAvailableAsync()) return null;
  const raw = await SecureStore.getItemAsync(KEY, OPTIONS);
  return raw ? assertSession(JSON.parse(raw)) : null;
}
export async function clearAuthSession() {
  webSession = null;
  // Attempt all cleanup even if one store is unavailable.
  const tasks = [purgeLegacyAuth()];
  // Non-secret tombstone prevents accidental restore after a failed secure deletion.
  tasks.push(AsyncStorage.setItem(DISABLED_KEY, '1'));
  if (Platform.OS !== 'web') tasks.push(SecureStore.deleteItemAsync(KEY));
  const results = await Promise.allSettled(tasks);
  if (results.some(result => result.status === 'rejected')) {
    throw new Error('No se pudo completar la eliminación del almacenamiento de sesión.');
  }
}

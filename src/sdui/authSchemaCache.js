import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateAuthSchema } from './validateAuthSchema';

const CACHE_PREFIX = '@copilotrd_sdui_auth_v1_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCacheKey(role) {
  if (role !== 'CLIENT') {
    throw new Error('Rol SDUI no admitido.');
  }

  return `${CACHE_PREFIX}${role}`;
}

export async function readAuthSchemaCache(role = 'CLIENT') {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(role));

    if (!raw) return null;

    const entry = JSON.parse(raw);

    if (
      !entry ||
      typeof entry.savedAt !== 'number' ||
      entry.savedAt > Date.now() ||
      Date.now() - entry.savedAt > CACHE_TTL_MS
    ) {
      return null;
    }

    const result = validateAuthSchema(entry.schema);

    return result.valid ? result.schema : null;
  } catch (error) {
    console.warn('[SDUI] No se pudo leer la caché:', error?.message);
    return null;
  }
}

export async function saveAuthSchemaCache(
  payload,
  role = 'CLIENT'
) {
  const result = validateAuthSchema(payload);

  if (!result.valid) {
    return {
      saved: false,
      reason: result.reason,
    };
  }

  try {
    await AsyncStorage.setItem(
      getCacheKey(role),
      JSON.stringify({
        savedAt: Date.now(),
        schema: result.schema,
      })
    );

    return { saved: true };
  } catch (error) {
    console.warn('[SDUI] No se pudo guardar la caché:', error?.message);

    return {
      saved: false,
      reason: 'CACHE_WRITE_ERROR',
    };
  }
}

export async function clearAuthSchemaCache(role = 'CLIENT') {
  await AsyncStorage.removeItem(getCacheKey(role));
}

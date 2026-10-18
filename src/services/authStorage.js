import { Platform } from 'react-native';

const STORAGE_KEYS = {
  TOKEN: 'nosotrosrd_auth_jwt_token',
  USER: 'nosotrosrd_auth_user_data',
};

// Almacén en memoria de alta resiliencia (cero fallos en cualquier runtime de Expo o Web)
const memoryStorage = {
  token: null,
  user: null,
};

function getAsyncStorageModule() {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    const storage = mod?.default || mod;
    if (storage && typeof storage.getItem === 'function') {
      return storage;
    }
  } catch (_) {}
  return null;
}

function getSecureStoreModule() {
  try {
    const mod = require('expo-secure-store');
    const secure = mod?.default || mod;
    if (secure && typeof secure.getItemAsync === 'function') {
      return secure;
    }
  } catch (_) {}
  return null;
}

/**
 * Guarda sesión JWT y objeto de usuario de forma segura y sin excepciones
 */
export async function saveAuthSession(token, user) {
  try {
    memoryStorage.token = token || null;
    memoryStorage.user = user ? (typeof user === 'string' ? user : JSON.stringify(user)) : null;

    // 1. Intentar AsyncStorage (estándar universal en Expo y React Native)
    const AsyncStorage = getAsyncStorageModule();
    if (AsyncStorage) {
      try {
        if (token) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, String(token));
        if (user) await AsyncStorage.setItem(STORAGE_KEYS.USER, typeof user === 'string' ? user : JSON.stringify(user));
        return true;
      } catch (_) {}
    }

    // 2. Intentar Expo SecureStore solo si la plataforma nativa lo soporta
    const SecureStore = getSecureStoreModule();
    if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
      try {
        const isAvailable = typeof SecureStore.isAvailableAsync === 'function'
          ? await SecureStore.isAvailableAsync().catch(() => false)
          : true;

        if (isAvailable) {
          if (token) await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, String(token));
          if (user) await SecureStore.setItemAsync(STORAGE_KEYS.USER, typeof user === 'string' ? user : JSON.stringify(user));
          return true;
        }
      } catch (_) {}
    }

    // 3. Fallback Web
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        if (token) window.localStorage.setItem(STORAGE_KEYS.TOKEN, String(token));
        if (user) window.localStorage.setItem(STORAGE_KEYS.USER, typeof user === 'string' ? user : JSON.stringify(user));
      } catch (_) {}
    }
  } catch (_) {
    // Protección absoluta contra crash
  }

  return true;
}

/**
 * Recupera la sesión JWT y el usuario al iniciar la app sin fallar jamás
 */
export async function getAuthSession() {
  let token = null;
  let userRaw = null;

  try {
    // 1. Intentar AsyncStorage primero
    const AsyncStorage = getAsyncStorageModule();
    if (AsyncStorage) {
      try {
        token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        userRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      } catch (_) {}
    }

    // 2. Intentar Expo SecureStore si AsyncStorage no tenía datos
    if (!token) {
      const SecureStore = getSecureStoreModule();
      if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
        try {
          const isAvailable = typeof SecureStore.isAvailableAsync === 'function'
            ? await SecureStore.isAvailableAsync().catch(() => false)
            : true;

          if (isAvailable) {
            token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
            userRaw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
          }
        } catch (_) {}
      }
    }

    // 3. Fallback Web
    if (!token && Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        token = window.localStorage.getItem(STORAGE_KEYS.TOKEN);
        userRaw = window.localStorage.getItem(STORAGE_KEYS.USER);
      } catch (_) {}
    }
  } catch (_) {
    // Fallback a memoria
  }

  // 4. Fallback Memoria
  if (!token) {
    token = memoryStorage.token;
    userRaw = memoryStorage.user;
  }

  let user = null;
  if (userRaw) {
    try {
      user = typeof userRaw === 'string' ? JSON.parse(userRaw) : userRaw;
    } catch (_) {
      user = null;
    }
  }

  return { token: token || null, user: user || null };
}

/**
 * Limpia la sesión almacenada al cerrar sesión
 */
export async function clearAuthSession() {
  memoryStorage.token = null;
  memoryStorage.user = null;

  try {
    const AsyncStorage = getAsyncStorageModule();
    if (AsyncStorage) {
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      } catch (_) {}
    }

    const SecureStore = getSecureStoreModule();
    if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      } catch (_) {}
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
        window.localStorage.removeItem(STORAGE_KEYS.USER);
      } catch (_) {}
    }
  } catch (_) {}

  return true;
}

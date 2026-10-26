import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { createSessionController } from '../security/sessionCore.mjs';
import { getAuthSession, saveAuthSession, clearAuthSession, purgeLegacyAuth } from '../services/authStorage';
import { authAdapter } from '../services/authAdapter';
import { eventManager } from '../services/eventManager';
import { loginSchema, registrationSchema, validateInput } from '../security/schemas';

const AuthContext = createContext(null);
let activeController = null;
export const getAccessToken = () => activeController?.getToken() || null;
export const expireSession = () => activeController?.logout();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(null);
  const [controller] = useState(() => createSessionController({
    storage: { read: getAuthSession, write: saveAuthSession, clear: clearAuthSession },
    verifySession: authAdapter.verifySession,
    onChange(session) { setUser(session?.user || null); eventManager.emit('session:changed'); },
  }));
  useEffect(() => {
    let mounted = true;
    activeController = controller;
    (async () => {
      try { await purgeLegacyAuth(); await controller.restore(); }
      catch { if (mounted) setStorageError('No se pudo limpiar el almacenamiento anterior.'); }
      finally { if (mounted) setLoading(false); }
    })();
    // Lock as soon as the app leaves the foreground. No implicit biometric unlock.
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') void controller.logout().catch(() => {
        if (mounted) setStorageError('No se pudo eliminar la sesión del dispositivo.');
      });
    });
    const timer = setInterval(() => controller.getToken(), 1000);
    return () => {
      mounted = false; sub.remove(); clearInterval(timer);
      if (activeController === controller) activeController = null;
    };
  }, [controller]);
  const run = async action => {
    if (loading || storageError) return { success: false, message: storageError || 'Inicializando sesión.' };
    try {
      const result = await controller.authenticate(action);
      return { success: true, user: result.user };
    } catch (error) { return { success: false, message: error.message }; }
  };
  return <AuthContext.Provider value={{ user, loading, storageError,
    login: (identifier, password) => run(() => authAdapter.login(validateInput(loginSchema, { identifier, password }))),
    register: data => run(() => authAdapter.register(validateInput(registrationSchema, data))),
    logout: async () => {
      try { await controller.logout(); }
      catch { setStorageError('No se pudo eliminar la sesión del dispositivo.'); }
    },
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth requiere AuthProvider.');
  return value;
}

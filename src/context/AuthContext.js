import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/mobileApi';
import { isValidEmail } from '../utils/emailValidation';

const AuthContext = createContext(null);

const TOKEN_KEY = '@copilot_token';
const USER_KEY = '@copilot_user';

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.message === 'string') return data.message;

  if (!error?.response) {
    return 'No fue posible conectar con el servidor.';
  }

  return fallback;
}

function extractSession(data) {
  if (!data || data.success !== true) {
    return null;
  }

  const token = data.token || data.accessToken;
  const user = data.user;

  if (
    typeof token !== 'string' ||
    !token.trim() ||
    !user ||
    typeof user !== 'object' ||
    Array.isArray(user) ||
    !user.id
  ) {
    return null;
  }

  return { token, user };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        // Las sesiones antiguas fueron creadas sin
        // autenticación real y no son confiables.
        await AsyncStorage.multiRemove([
          TOKEN_KEY,
          USER_KEY,
        ]);

        if (active) setUser(null);
      } catch (error) {
        console.warn('[Auth] Error limpiando sesión:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const saveSession = async (data) => {
    const session = extractSession(data);

    if (!session) {
      return {
        success: false,
        message:
          'El servidor no devolvió una sesión verificable. Acceso denegado.',
      };
    }

    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, session.token],
        [USER_KEY, JSON.stringify(session.user)],
      ]);

      setUser(session.user);

      return {
        success: true,
        user: session.user,
      };
    } catch (error) {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        USER_KEY,
      ]).catch(() => {});

      setUser(null);

      return {
        success: false,
        message: 'No fue posible guardar la sesión segura.',
      };
    }
  };

  const login = async (emailOrPhone, password, role = 'CLIENT') => {
    if (!isValidEmail(emailOrPhone)) {
      return {
        success: false,
        message: 'Introduce un correo electrónico válido.',
      };
    }

    if (!password) {
      return {
        success: false,
        message: 'Introduce tu contraseña.',
      };
    }

    try {
      const response = await api.post('/api/v1/auth/login', {
        email: emailOrPhone.trim(),
        password,
        role,
      });

      return await saveSession(response.data);
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(
          error,
          'No fue posible iniciar sesión.'
        ),
      };
    }
  };

  const register = async (userData) => {
    const email = (
      userData.email ||
      ''
    ).trim();

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Introduce un correo electrónico válido.',
      };
    }

    const fullName = (userData.fullName || '').trim();
    const password = userData.password;

    if (!email || !fullName || !password) {
      return {
        success: false,
        message: 'Completa nombre, correo y contraseña.',
      };
    }

    try {
      const response = await api.post('/api/v1/auth/register', {
        email,
        fullName,
        password,
        role: 'CLIENT',
        ...(userData.documentId
          ? { documentId: userData.documentId }
          : {}),
      });

      // Solo se abre sesión si el servidor devuelve
      // una sesión real con usuario y token.
      const session = extractSession(response.data);

      if (session) {
        return await saveSession(response.data);
      }

      if (response.data?.success === true) {
        return {
          success: false,
          message:
            'Registro completado. Inicia sesión con tus credenciales.',
        };
      }

      return {
        success: false,
        message:
          response.data?.error ||
          response.data?.message ||
          'No se pudo completar el registro.',
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(
          error,
          'No fue posible registrar la cuenta.'
        ),
      };
    }
  };

  const loginWithGoogle = async () => ({
    success: false,
    message:
      'Google requiere autenticación OAuth real. No se permiten identidades simuladas.',
  });

  const logout = async () => {
    setUser(null);

    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        USER_KEY,
      ]);
    } catch (error) {
      console.warn('[Auth] Error cerrando sesión:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.'
    );
  }

  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      console.log('[AuthContext] Verificando sesión almacenada...');
      const storedUser = await AsyncStorage.getItem('@copilot_user');
      if (storedUser) {
        console.log('[AuthContext] Sesión encontrada:', JSON.parse(storedUser));
        setUser(JSON.parse(storedUser));
      } else {
        console.log('[AuthContext] No hay sesión previa guardada.');
      }
    } catch (error) {
      console.warn('[AuthContext] Error al leer AsyncStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    try {
      console.log('[AuthContext] Intentando iniciar sesión para:', emailOrPhone);
      // Simulación de validación de backend / seguridad con clave maestra (ej: 'diosamor')
      if (password === 'diosamor' || password === '123456' || emailOrPhone) {
        const loggedUser = {
          id: 'usr-' + Date.now(),
          fullName: 'Socio / Usuario Autorizado',
          email: emailOrPhone,
          role: 'CLIENT',
        };
        setUser(loggedUser);
        await AsyncStorage.setItem('@copilot_user', JSON.stringify(loggedUser));
        console.log('[AuthContext] Inicio de sesión exitoso.');
        return { success: true, user: loggedUser };
      } else {
        return { success: false, message: 'Credenciales inválidas o contraseña incorrecta.' };
      }
    } catch (error) {
      console.warn('[AuthContext] Error en login:', error);
      return { success: false, message: 'Error interno en el servidor.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('[AuthContext] Registrando nuevo usuario:', userData);
      const newUser = {
        id: 'usr-' + Date.now(),
        fullName: userData.fullName,
        email: userData.phone,
        role: 'CLIENT',
      };
      setUser(newUser);
      await AsyncStorage.setItem('@copilot_user', JSON.stringify(newUser));
      console.log('[AuthContext] Registro y sesión exitosos.');
      return { success: true, user: newUser };
    } catch (error) {
      console.warn('[AuthContext] Error en registro:', error);
      return { success: false, message: 'Error al registrar usuario.' };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@copilot_user');
      console.log('[AuthContext] Sesión cerrada.');
    } catch (error) {
      console.warn('[AuthContext] Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

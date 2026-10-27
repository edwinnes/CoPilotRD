import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@copilotrd_theme_preference';

const ThemeContext = createContext(null);

const palettes = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    primary: '#007AFF',
  },
  dark: {
    background: '#000000',
    surface: '#151A27',
    text: '#FFFFFF',
    muted: '#94A3B8',
    border: '#222B40',
    primary: '#007AFF',
  },
};

export function ThemeProvider({ children }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  const [preference, setPreference] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          active &&
          ['light', 'dark', 'system'].includes(saved)
        ) {
          setPreference(saved);
        }
      } catch (error) {
        console.warn('[ThemeProvider] Error al cargar tema:', error);
      } finally {
        if (active) setReady(true);
      }
    }

    restore();

    return () => {
      active = false;
    };
  }, []);

  const resolvedTheme =
    preference === 'system'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : preference;

  useEffect(() => {
    if (!ready) return;

    try {
      setColorScheme(resolvedTheme);
    } catch (error) {
      console.warn(
        '[ThemeProvider] NativeWind no permite cambiar el tema todavía:',
        error?.message || error
      );
    }
  }, [resolvedTheme, ready, setColorScheme]);

  async function changeTheme(nextPreference) {
    if (!['light', 'dark', 'system'].includes(nextPreference)) {
      return;
    }

    setPreference(nextPreference);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        nextPreference
      );
    } catch (error) {
      console.warn('[ThemeProvider] Error al guardar tema:', error);
    }
  }

  const value = useMemo(
    () => ({
      preference,
      theme: resolvedTheme,
      colors: palettes[resolvedTheme],
      changeTheme,
      ready,
    }),
    [preference, resolvedTheme, ready]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useAppTheme debe utilizarse dentro de ThemeProvider'
    );
  }

  return context;
}

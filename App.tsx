import './global.css';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { getChromePalette } from './src/theme/chromePalette';
import { registerRootComponent } from "expo";
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Punto de entrada principal de CoPilotRD (React Native & Expo)
 * Inicializa el proveedor global de autenticación y el gestor de navegación reactivo.
 */
function AppContent() {
  const { theme } = useAppTheme();
  const palette = getChromePalette(theme);

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
        backgroundColor={palette.background}
      />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

registerRootComponent(App);

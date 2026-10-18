import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Punto de entrada principal de CoPilotRD (React Native & Expo)
 * Inicializa el proveedor global de autenticación y el gestor de navegación reactivo.
 */
export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#000000" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

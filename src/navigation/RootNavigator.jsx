import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthSduiScreen from '../screens/AuthSduiScreen';
import ClientMainDashboard from '../screens/ClientMainDashboard';

function MainNavigator() {
  const { user, loading } = useAuth();
  const [authenticatedUser, setAuthenticatedUser] = useState(user);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Cargando CoPilotRD...</Text>
      </View>
    );
  }

  // Si no hay usuario autenticado, mostramos la pantalla de login SDUI directamente
  if (!authenticatedUser) {
    return (
      <AuthSduiScreen 
        onAuthSuccess={(usr) => setAuthenticatedUser(usr)} 
      />
    );
  }

  // Una vez iniciada sesión, pasamos al dashboard principal
  return <ClientMainDashboard />;
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#38BDF8',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});

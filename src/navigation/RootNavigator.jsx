import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthSduiScreen from '../screens/AuthSduiScreen';
import ClientMainDashboard from '../screens/ClientMainDashboard';
export default function RootNavigator() {
  const { user, loading, storageError } = useAuth();
  if (loading) return <View><ActivityIndicator accessibilityLabel="Cargando sesión" /></View>;
  if (storageError) return <View><Text>{storageError}</Text></View>;
  return user ? <ClientMainDashboard /> : <AuthSduiScreen />;
}

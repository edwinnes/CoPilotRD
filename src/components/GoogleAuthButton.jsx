import React from 'react';
import { Text, View } from 'react-native';
export default function GoogleAuthButton() {
  return <View accessibilityLabel="Acceso con Google no disponible" style={{ padding: 12 }}>
    <Text style={{ color: '#94A3B8' }}>Google no disponible: falta integrar OAuth con verificación del servidor.</Text>
  </View>;
}

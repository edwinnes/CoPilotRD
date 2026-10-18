import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * Componente Oficial CoPilotLogo para React Native & Expo
 * Renderiza la imagen gráfica de alta resolución del logotipo oficial de CoPilotRD / NosotrosRD.
 */
export default function CoPilotLogo({ size = 72, style, rounded = true }) {
  const [hasError, setHasError] = useState(false);

  // Carga directa del asset local empaquetado en mobile-app/assets/logo.png
  const logoAsset = require('../../assets/logo.png');

  return (
    <View style={[styles.wrapper, style]}>
      {!hasError ? (
        <Image
          source={logoAsset}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: rounded ? Math.round(size * 0.25) : 8,
            },
          ]}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallbackBox,
            {
              width: size,
              height: size,
              borderRadius: rounded ? Math.round(size * 0.25) : 8,
            },
          ]}
        >
          <Text style={[styles.fallbackEmoji, { fontSize: Math.round(size * 0.45) }]}>🚗</Text>
          <View style={styles.fallbackBar} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#0B0F19',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fallbackBox: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fallbackEmoji: {
    textAlign: 'center',
  },
  fallbackBar: {
    position: 'absolute',
    bottom: 4,
    width: 22,
    height: 3,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
});

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { loginWithGoogle } from '../services/mobileApi';

/**
 * GoogleAuthButton para la App Móvil (React Native / Expo)
 * Conecta directamente con el endpoint oficial POST /api/v1/auth/google
 */
export default function GoogleAuthButton({
  role = 'CLIENT',
  onSuccess,
  onError,
  label = 'Continuar con Google',
  disabled = false,
  style,
  testEmail,
  testName,
}) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const email =
        testEmail ||
        (role === 'DRIVER'
          ? 'conductor.google@copilotrd.com'
          : 'pasajero.google@copilotrd.com');
      const fullName =
        testName ||
        (role === 'DRIVER'
          ? 'Piloto Google Verificado'
          : 'Pasajero Google NosotrosRD');

      const res = await loginWithGoogle(email, fullName, role);

      if (res && res.token) {
        Alert.alert(
          'Google Identity Services',
          `Sesión iniciada con éxito para ${res.user?.fullName || fullName} (${role}).`
        );
        if (onSuccess) onSuccess(res);
      } else {
        throw new Error(res?.error || 'No se pudo completar la autenticación');
      }
    } catch (err) {
      const errorMsg = err?.message || 'Error de conexión con /api/v1/auth/google';
      Alert.alert('Error de Autenticación', errorMsg);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={loading || disabled}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#1F2937" style={styles.spinner} />
      ) : (
        <View style={styles.googleIconContainer}>
          <Text style={styles.googleIconText}>G</Text>
        </View>
      )}

      <Text style={styles.buttonText}>
        {loading ? 'Verificando con Google...' : label}
      </Text>

      <View style={styles.gisBadge}>
        <Text style={styles.gisBadgeText}>GIS</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 4,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  googleIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  spinner: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  gisBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  gisBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
});

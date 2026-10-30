import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function EmailVerificationScreen({
  email = '',
  onVerify,
  onResend,
  onBack,
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const pasteCode = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      const digits = value.replace(/\D/g, '').slice(0, 6);

      if (digits.length !== 6) {
        Alert.alert(
          'Código inválido',
          'El portapapeles no contiene un código de seis dígitos.'
        );
        return;
      }

      setCode(digits);
    } catch {
      Alert.alert('Error', 'No se pudo leer el portapapeles.');
    }
  };

  const verifyCode = async () => {
    if (loading || code.length !== 6) return;

    if (typeof onVerify !== 'function') {
      Alert.alert(
        'Verificación pendiente',
        'Estamos preparando la conexión segura con el servidor.'
      );
      return;
    }

    setLoading(true);
    try {
      await onVerify(code);
    } catch {
      Alert.alert('Error', 'No se pudo verificar el código.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (loading) return;

    if (typeof onResend !== 'function') {
      Alert.alert(
        'Reenvío pendiente',
        'Estamos preparando el envío de códigos por correo.'
      );
      return;
    }

    setLoading(true);
    try {
      await onResend();
    } catch {
      Alert.alert('Error', 'No se pudo reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>
          CoPilot<Text style={styles.logoBlue}>RD®</Text>
        </Text>

        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✉</Text>
        </View>

        <Text style={styles.title}>Verifica tu correo electrónico</Text>

        <Text style={styles.description}>
          Introduce el código de seis dígitos enviado a:
        </Text>

        <Text style={styles.email}>{email}</Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(value) =>
            setCode(value.replace(/\D/g, '').slice(0, 6))
          }
          placeholder="000000"
          placeholderTextColor="#9AA7BB"
          keyboardType="number-pad"
          maxLength={6}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          selectTextOnFocus
          editable={!loading}
          accessibilityLabel="Código de verificación de seis dígitos"
        />

        <Text style={styles.expiry}>
          El código vence en 10 minutos.
        </Text>

        <TouchableOpacity
          style={styles.pasteButton}
          onPress={pasteCode}
          disabled={loading}
        >
          <Text style={styles.pasteText}>Pegar código</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (code.length !== 6 || loading) && styles.disabledButton,
          ]}
          onPress={verifyCode}
          disabled={code.length !== 6 || loading}
        >
          <Text style={styles.verifyText}>
            {loading ? 'Procesando...' : 'Verificar código'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resendCode}
          disabled={loading}
          style={styles.resendButton}
        >
          <Text style={styles.resendText}>Reenviar código</Text>
        </TouchableOpacity>

        {typeof onBack === 'function' && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          CoPilotRD® Beta · Tu seguridad es nuestra prioridad
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FF',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 75,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 35,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#06164B',
    marginBottom: 48,
  },
  logoBlue: {
    color: '#1874EA',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E6EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 42,
    color: '#1768E8',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#071638',
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    color: '#66738B',
    textAlign: 'center',
    fontSize: 15,
  },
  email: {
    color: '#1768E8',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 68,
    borderWidth: 1,
    borderColor: '#CCD8ED',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 12,
    color: '#06164B',
  },
  expiry: {
    marginTop: 12,
    color: '#66738B',
    fontSize: 13,
  },
  pasteButton: {
    padding: 16,
  },
  pasteText: {
    color: '#1768E8',
    fontWeight: '700',
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#1768E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.45,
  },
  verifyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  resendButton: {
    marginTop: 22,
    padding: 10,
  },
  resendText: {
    color: '#1768E8',
    fontWeight: '700',
  },
  backButton: {
    marginTop: 12,
    padding: 10,
  },
  backText: {
    color: '#66738B',
  },
  footer: {
    marginTop: 55,
    textAlign: 'center',
    color: '#66738B',
    fontSize: 12,
  },
});

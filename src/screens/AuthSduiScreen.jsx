import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { fetchAuthSdui } from '../services/mobileApi';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import CoPilotLogo from '../components/CoPilotLogo';
import SettingsScreen from './SettingsScreen';

/**
 * Pantalla de Autenticación SDUI (Cliente) - CoPilotRD
 * Interfaz estricta conectada a Cloud Run sin fallbacks locales.
 */
export default function AuthSduiScreen({ onAuthSuccess }) {
  const { login, register } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const role = 'CLIENT';
  const [sduiSchema, setSduiSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'

  // Estados del Formulario
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAuthSchema() {
      setLoadingSchema(true);
      setConnectionError(false);
      try {
        const res = await fetchAuthSdui(role);
        if (isMounted && res && res.schema) {
          setSduiSchema(res.schema);
        } else {
          if (isMounted) setConnectionError(true);
        }
      } catch (err) {
        if (isMounted) setConnectionError(true);
      } finally {
        if (isMounted) setLoadingSchema(false);
      }
    }
    loadAuthSchema();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitLogin = async () => {
    if (!emailOrPhone || !password) {
      setErrorMessage('Por favor ingresa tu correo o teléfono y tu contraseña.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await login(emailOrPhone, password, role);
      if (res.success && res.user) {
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Los datos ingresados no son correctos.');
      }
    } catch (err) {
      setErrorMessage('No pudimos conectar con el servidor. Verifica tu conexión a internet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRegister = async () => {
    if (!fullName || !emailOrPhone || !password) {
      setErrorMessage('Por favor completa todos los campos obligatorios.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await register({
        fullName,
        phone: emailOrPhone,
        documentId,
        role,
        password,
      });

      if (res.success && res.user) {
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'No se pudo completar el registro en este momento.');
      }
    } catch (err) {
      setErrorMessage('Hubo un problema al registrar tu cuenta. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showSettings) return <SettingsScreen onClose={() => setShowSettings(false)} />;

  // Pantalla de bloqueo si hay error de conexión con el servidor (sin fallbacks)
  if (connectionError) {
    return (
      <View style={styles.blockContainer}>
        <View style={styles.blockCard}>
          <Text style={styles.blockIcon}>⚠️</Text>
          <Text style={styles.blockTitle}>Acceso no disponible</Text>
          <Text style={styles.blockText}>
            El servicio de autenticación aún no tiene una integración verificada. No es posible iniciar sesión ni crear cuentas desde esta versión.
          </Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}><Text style={styles.blockText}>Abrir seguridad, privacidad y ajustes</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pantalla de carga (Skeleton / Indicador limpio)
  if (loadingSchema) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Conectando con el sistema...</Text>
      </View>
    );
  }

  const dividerText = sduiSchema?.dividerText || 'O continúa con';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <TouchableOpacity onPress={() => setShowSettings(true)}><Text style={styles.forgotText}>Seguridad, privacidad y ajustes</Text></TouchableOpacity>
      {/* Tarjeta Central */}
      <View style={styles.authCard}>
        
        <View style={styles.logoWrapper}>
          <CoPilotLogo size={36} />
        </View>

        {/* Marca CoPilotRD */}
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>
            CoPilot<Text style={styles.brandAccent}>RD</Text>
          </Text>
          <Text style={styles.brandRegistered}>®</Text>
        </View>

        <Text style={styles.subtitleText}>
          {mode === 'LOGIN' ? 'Iniciar Sesión' : 'Crear Cuenta de Pasajero'}
        </Text>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {/* Inputs de Formulario */}
        <View style={styles.formContainer}>
          {mode === 'REGISTER' && (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nombre y Apellido"
                  placeholderTextColor="#64748B"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🪪</Text>
                <TextInput
                  style={styles.textInput}
                  value={documentId}
                  onChangeText={setDocumentId}
                  placeholder="Cédula JCE (opcional)"
                  placeholderTextColor="#64748B"
                />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.textInput}
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="Correo o Teléfono"
              placeholderTextColor="#64748B"
              keyboardPosition="below"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signInBtn, submitting && styles.btnDisabled]}
            onPress={mode === 'LOGIN' ? handleSubmitLogin : handleSubmitRegister}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signInBtnText}>
                {mode === 'LOGIN' ? 'Entrar' : 'Registrarse'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'LOGIN' && (
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => Alert.alert('Recuperación no disponible', 'Falta integrar la verificación de correo o SMS. No se han enviado instrucciones.')}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Separador */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{dividerText}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botones Sociales */}
        <View style={styles.socialButtonsContainer}>
          <GoogleAuthButton
            role={role}
            label="Continuar con Google"
            onSuccess={(res) => {
              if (res?.user && onAuthSuccess) onAuthSuccess(res.user);
            }}
          />

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Apple no disponible', 'Falta integrar Sign in with Apple y la verificación del servidor.')}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <View style={styles.socialBtnContent}>
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialBtnText}>Continuar con Apple</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pie de Alternancia */}
        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>
            {mode === 'LOGIN' ? '¿Nuevo en CoPilotRD? ' : '¿Ya tienes cuenta? '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
              setErrorMessage(null);
            }}
          >
            <Text style={styles.footerLinkText}>
              {mode === 'LOGIN' ? 'Crea una cuenta' : 'Inicia Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: { marginTop: 12, color: '#94A3B8', fontSize: 13 },
  blockContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  blockCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0E121B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
  },
  blockIcon: { fontSize: 32, marginBottom: 12 },
  blockTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  blockText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  authCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0E121B',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#1A2133',
    alignItems: 'center',
  },
  logoWrapper: { marginBottom: 8 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandAccent: { color: '#94A3B8' },
  brandRegistered: { fontSize: 11, color: '#94A3B8', marginLeft: 3, marginTop: 2 },
  subtitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 16,
  },
  errorBanner: {
    width: '100%',
    backgroundColor: '#450A0A',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: { color: '#FCA5A5', fontSize: 12, textAlign: 'center' },
  formContainer: { width: '100%', marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151A27',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222B40',
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: { fontSize: 15, marginRight: 10 },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  eyeBtn: { padding: 6 },
  eyeIcon: { fontSize: 15 },
  signInBtn: {
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signInBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.65 },
  forgotBtn: { marginTop: 12, alignItems: 'center' },
  forgotText: { color: '#64748B', fontSize: 12 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E2538' },
  dividerText: { color: '#64748B', fontSize: 12, marginHorizontal: 10 },
  socialButtonsContainer: { width: '100%', gap: 10 },
  socialBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appleIcon: { fontSize: 18, color: '#000000', marginBottom: 2 },
  socialBtnText: { color: '#000000', fontSize: 14, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerPrompt: { color: '#64748B', fontSize: 12 },
  footerLinkText: { color: '#007AFF', fontSize: 12, fontWeight: '700' },
});

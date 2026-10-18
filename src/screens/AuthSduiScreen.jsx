import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Alert,
} from 'react-native';
import { fetchAuthSdui } from '../services/mobileApi';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

/**
 * Componente Skeleton Loader para la Tarjeta de Autenticación
 */
function AuthSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.authCard}>
      {/* Title Skeleton */}
      <Animated.View style={[styles.skeletonBlock, { width: 180, height: 32, opacity }]} />
      <Animated.View style={[styles.skeletonBlock, { width: 130, height: 16, marginTop: 12, opacity }]} />

      {/* Input Skeletons */}
      <View style={{ width: '100%', marginTop: 28, gap: 14 }}>
        <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 52, borderRadius: 14, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 52, borderRadius: 14, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 52, borderRadius: 14, opacity }]} />
      </View>

      {/* Social Buttons Skeletons */}
      <View style={{ width: '100%', marginTop: 24, gap: 12 }}>
        <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 52, borderRadius: 14, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 52, borderRadius: 14, opacity }]} />
      </View>
    </View>
  );
}

/**
 * Pantalla de Autenticación SDUI (Cliente) - CoPilotRD
 * Incluye Skeleton Loader y Manejador de Solicitudes/Red con mensaje amigable.
 */
export default function AuthSduiScreen({ onAuthSuccess }) {
  const { login, register, loginWithGoogle } = useAuth();

  const role = 'CLIENT';
  const [sduiSchema, setSduiSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'

  // Estados del Formulario
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Manejo de Mensajes de Red / Múltiples Solicitudes
  const [networkNotice, setNetworkNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAuthSchema() {
      setLoadingSchema(true);
      setNetworkNotice(null);
      try {
        const res = await fetchAuthSdui(role);
        if (isMounted) {
          if (res && res.schema) {
            setSduiSchema(res.schema);
          } else {
            setNetworkNotice('Estamos teniendo múltiples solicitudes, por favor espera un momento.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setNetworkNotice('Estamos teniendo múltiples solicitudes, por favor espera un momento.');
        }
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
      setNetworkNotice('Por favor ingresa tu Correo o Teléfono y Contraseña.');
      return;
    }
    setSubmitting(true);
    setNetworkNotice(null);

    try {
      const res = await login(emailOrPhone, password, role);
      if (res.success && res.user) {
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        setNetworkNotice(res.message || 'Estamos teniendo múltiples solicitudes, por favor espera un momento.');
      }
    } catch (err) {
      setNetworkNotice('Estamos teniendo múltiples solicitudes, por favor espera un momento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRegister = async () => {
    if (!fullName || !emailOrPhone) {
      setNetworkNotice('Por favor ingresa tu Nombre y Teléfono.');
      return;
    }
    setSubmitting(true);
    setNetworkNotice(null);

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
        setNetworkNotice(res.message || 'Estamos teniendo múltiples solicitudes, por favor espera un momento.');
      }
    } catch (err) {
      setNetworkNotice('Estamos teniendo múltiples solicitudes, por favor espera un momento.');
    } finally {
      setSubmitting(false);
    }
  };

  const dividerText = sduiSchema?.dividerText || 'Or continue with';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Banner de Mensaje de Red / Sobrecarga */}
      {networkNotice && (
        <View style={styles.networkBanner}>
          <Text style={styles.networkBannerIcon}>⏳</Text>
          <Text style={styles.networkBannerText}>{networkNotice}</Text>
        </View>
      )}

      {/* RENDERIZADO: Skeleton si está cargando, o Tarjeta de Autenticación */}
      {loadingSchema ? (
        <AuthSkeleton />
      ) : (
        <View style={styles.authCard}>
          
          {/* Marca CoPilotRD */}
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>
              CoPilot<Text style={styles.brandAccent}>RD</Text>
            </Text>
            <Text style={styles.brandRegistered}>®</Text>
          </View>

          <Text style={styles.subtitleText}>
            {mode === 'LOGIN' ? 'Login or Register' : 'Crear Cuenta de Pasajero'}
          </Text>

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
                placeholder="Email o Teléfono Dominicano"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
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
              <Text style={styles.signInBtnText}>
                {submitting ? 'Cargando...' : mode === 'LOGIN' ? 'Sign In' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            {mode === 'LOGIN' && (
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => Alert.alert('Recuperación', 'Instrucciones enviadas a tu teléfono.')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
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
              label="Continue with Google"
              onSuccess={(res) => {
                if (res?.user && onAuthSuccess) onAuthSuccess(res.user);
              }}
            />

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={async () => {
                const res = await loginWithGoogle('apple.user@copilotrd.com', 'Usuario Apple', role);
                if (res.success && onAuthSuccess) onAuthSuccess(res.user);
              }}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <View style={styles.socialBtnContent}>
                <Text style={styles.appleIcon}></Text>
                <Text style={styles.socialBtnText}>Continue with Apple</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pie de Alternancia */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>
              {mode === 'LOGIN' ? 'New to CoPilotRD? ' : '¿Ya tienes cuenta? '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                setNetworkNotice(null);
              }}
            >
              <Text style={styles.footerLinkText}>
                {mode === 'LOGIN' ? 'Create an account' : 'Inicia Sesión'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  networkBanner: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkBannerIcon: { fontSize: 16 },
  networkBannerText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0E121B',
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#1A2133',
    alignItems: 'center',
  },
  skeletonBlock: {
    backgroundColor: '#1A2133',
    borderRadius: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandAccent: { color: '#94A3B8' },
  brandRegistered: { fontSize: 13, color: '#94A3B8', marginLeft: 4, marginTop: 3 },
  subtitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 20,
  },
  formContainer: { width: '100%', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151A27',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222B40',
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: { fontSize: 16, marginRight: 12 },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  eyeBtn: { padding: 6 },
  eyeIcon: { fontSize: 16 },
  signInBtn: {
    backgroundColor: '#007AFF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  signInBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.65 },
  forgotBtn: { marginTop: 14, alignItems: 'center' },
  forgotText: { color: '#64748B', fontSize: 13 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E2538' },
  dividerText: { color: '#64748B', fontSize: 13, marginHorizontal: 12 },
  socialButtonsContainer: { width: '100%', gap: 12 },
  socialBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appleIcon: { fontSize: 20, color: '#000000', marginBottom: 2 },
  socialBtnText: { color: '#000000', fontSize: 15, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerPrompt: { color: '#64748B', fontSize: 13 },
  footerLinkText: { color: '#007AFF', fontSize: 13, fontWeight: '700' },
});

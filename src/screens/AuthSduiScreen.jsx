import { Eye, EyeOff, UserRound, IdCard, Mail, LockKeyhole } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
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
import AuthSduiRenderer from '../sdui/AuthSduiRenderer';
import { useAppTheme } from '../context/ThemeContext';
import { getChromePalette } from '../theme/chromePalette';
import AuthSduiSkeleton from '../sdui/AuthSduiSkeleton';
import EmailVerificationScreen from './EmailVerificationScreen';
import { validateAuthSchema } from '../sdui/validateAuthSchema';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import CoPilotWordmark from '../components/CoPilotWordmark';
import { isValidEmail, normalizeEmailInput } from '../utils/emailValidation';
import { formatCedula, isValidCedulaFormat } from '../utils/cedulaValidation';

import AnimatedToast from '../components/AnimatedToast';
import ChromeButton from '../components/ChromeButton';
import AppleLogo from '../components/AppleLogo';
import ChromeSurface from '../components/ChromeSurface';

/**
 * Pantalla de Autenticación SDUI (Cliente) - CoPilotRD
 * Interfaz estricta conectada a Cloud Run sin fallbacks locales.
 */
export default function AuthSduiScreen({ onAuthSuccess }) {
  const { theme } = useAppTheme();
  const palette = getChromePalette(theme);
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    loginWithGoogle,
  } = useAuth();

  const role = 'CLIENT';
  const [sduiSchema, setSduiSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [verificationEmail, setVerificationEmail] = useState(null);

  // Estados del Formulario
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const toastId = useRef(0);
  const [retryCount, setRetryCount] = useState(0);

  const showToast = (message, type = 'error') => {
    toastId.current += 1;
    setToast({ id: toastId.current, message, type });
  };

  useEffect(() => {
    if (connectionError) {
      showToast(
        'No se pudo cargar la configuración visual del servidor.',
        'warning'
      );
    }
  }, [connectionError]);

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
    }
  }, [errorMessage]);


  useEffect(() => {
    let active = true;

    async function loadAuthSchema() {
      setLoadingSchema(true);
      setConnectionError(false);
      setSduiSchema(null);

      try {
        const response = await fetchAuthSdui(role);
        const result = validateAuthSchema(response);

        if (!active) return;

        if (result.valid) {
          setSduiSchema(result.schema);
        } else {
          setConnectionError(true);
        }
      } catch (_) {
        if (active) setConnectionError(true);
      } finally {
        if (active) setLoadingSchema(false);
      }
    }

    loadAuthSchema();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const handleSubmitLogin = async () => {
    if (!isValidEmail(emailOrPhone)) {
      setErrorMessage('Introduce un correo electrónico válido.');
      return;
    }

    if (!password) {
      setErrorMessage('Introduce tu contraseña.');
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
    if (!fullName.trim() || !password) {
      setErrorMessage('Completa tu nombre y contraseña.');
      return;
    }

    if (!isValidEmail(emailOrPhone)) {
      setErrorMessage('Introduce un correo electrónico válido.');
      return;
    }

    if (documentId && !isValidCedulaFormat(documentId)) {
      setErrorMessage('La cédula debe tener el formato 000-0000000-0.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await register({
        fullName,
        email: emailOrPhone.trim(),
        documentId,
        role,
        password,
      });

      if (res.success && res.requiresVerification && res.email) {
        setPassword('');
        setVerificationEmail(res.email);
        setMode('LOGIN');
      } else if (res.code === 'VERIFICATION_PENDING') {
        setPassword('');
        setVerificationEmail(emailOrPhone.trim().toLowerCase());
        setMode('LOGIN');
        setErrorMessage(null);
      } else if (res.success && res.user) {
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

  // Un error del esquema SDUI no bloquea el formulario.
  // Login y registro siguen requiriendo autenticación real.
  // El aviso se muestra dentro de la pantalla.
  const dividerText = sduiSchema?.dividerText || 'O continúa con';

  if (mode === 'LOGIN') {
    const handleRemoteAction = (action) => {
      switch (action) {
        case 'login':
          handleSubmitLogin();
          break;

        case 'navigate_register':
          setErrorMessage(null);
          setMode('REGISTER');
          break;

        case 'forgot_password':
          Alert.alert(
            'Recuperación de contraseña',
            'Este proceso todavía no está disponible. No se ha enviado ninguna solicitud.'
          );
          break;

        default:
          break;
      }
    };

    const handleSocialAuth = (provider) => {
      if (provider === 'google' || provider === 'apple') {
        Alert.alert(
          'Autenticación externa',
          'Este proveedor todavía requiere integración OAuth real.'
        );
      }
    };

    if (verificationEmail) {
      return (
        <EmailVerificationScreen
          email={verificationEmail}
          onVerify={async (code) => {
            const result = await verifyEmail(verificationEmail, code);

            if (!result.success) {
              Alert.alert(
                'No se pudo verificar',
                result.message || 'Comprueba el código e inténtalo de nuevo.'
              );
              return;
            }

            setVerificationEmail(null);
            setMode('LOGIN');
            setErrorMessage(null);

            Alert.alert(
              'Correo verificado',
              result.message || 'Ya puedes iniciar sesión.'
            );
          }}
          onResend={async () => {
            const result = await resendVerification(verificationEmail);

            Alert.alert(
              result.success ? 'Solicitud recibida' : 'No se pudo solicitar',
              result.message || 'Inténtalo nuevamente más tarde.'
            );
          }}
          onBack={() => {
            setVerificationEmail(null);
            setMode('LOGIN');
            setErrorMessage(null);
          }}
        />
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {loadingSchema ? (
            <AuthSduiSkeleton />
          ) : sduiSchema ? (
            <View style={{ width: '100%' }}>

              <AuthSduiRenderer
                schema={sduiSchema}
              values={{
                identifier: emailOrPhone,
                password,
              }}
              onChangeField={(key, value) => {
                if (key === 'identifier') setEmailOrPhone(normalizeEmailInput(value));
                if (key === 'password') setPassword(value);
              }}
              onAction={handleRemoteAction}
              onSocialAuth={handleSocialAuth}
              submitting={submitting}
              />
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Text style={{
                color: '#C8CDD5',
                textAlign: 'center',
                marginBottom: 20,
              }}>
                No se pudo cargar la interfaz desde Google Cloud.
              </Text>
              <TouchableOpacity
                onPress={() => setRetryCount(value => value + 1)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  borderRadius: 12,
                  backgroundColor: '#BFC4CC',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {toast && (
          <AnimatedToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() =>
              setToast(current =>
                current?.id === toast.id ? null : current
              )
            }
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]} contentContainerStyle={styles.content}>
      
      {/* Tarjeta Central */}
      <View style={styles.authCard}>
        


        {/* Marca CoPilotRD */}
        <View style={styles.brandRow}>
          <CoPilotWordmark
            size={34}
            style={{ marginBottom: 8 }}
          />
        </View>

        <Text style={[styles.subtitleText, { color: palette.muted }]}>
          {mode === 'LOGIN' ? 'Iniciar Sesión' : 'Crear Cuenta de Pasajero'}
        </Text>



        {/* Inputs de Formulario */}
        <View style={[styles.formContainer, { marginTop: 36 }]}>
          {mode === 'REGISTER' && (
            <>
              <ChromeSurface
                  variant="input"
                  radius={14}
                  style={{
                    height: 60,
                    marginBottom: 12,
                  }}
                  contentStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                <UserRound size={19} color={palette.muted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: palette.text }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nombre y Apellido"
                  placeholderTextColor={palette.muted}
                  autoCapitalize="words"
                />
              </ChromeSurface>

              <ChromeSurface
                  variant="input"
                  radius={14}
                  style={{
                    height: 60,
                    marginBottom: 12,
                  }}
                  contentStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                <IdCard size={19} color={palette.muted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: palette.text }]}
                  value={documentId}
                  onChangeText={(text) => setDocumentId(formatCedula(text))}
                  placeholder="000-0000000-0 (opcional)"
                  placeholderTextColor={palette.muted}
                  keyboardType="number-pad"
                  maxLength={13}
                  autoCorrect={false}
                />
              </ChromeSurface>
            </>
          )}

          <ChromeSurface
                  variant="input"
                  radius={14}
                  style={{
                    height: 60,
                    marginBottom: 12,
                  }}
                  contentStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
            <Mail size={19} color={palette.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: palette.text }]}
              value={emailOrPhone}
              onChangeText={(text) => setEmailOrPhone(normalizeEmailInput(text))}
               keyboardType="email-address"
              placeholder="Correo electrónico"
              placeholderTextColor={palette.muted}
              keyboardPosition="below"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ChromeSurface>

          <ChromeSurface
                  variant="input"
                  radius={14}
                  style={{
                    height: 60,
                    marginBottom: 12,
                  }}
                  contentStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
            <LockKeyhole size={19} color={palette.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: palette.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor={palette.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? <EyeOff size={20} color={palette.muted} /> : <Eye size={20} color={palette.muted} />}
            </TouchableOpacity>
          </ChromeSurface>

          <ChromeButton
        title={mode === 'LOGIN' ? 'Entrar' : 'Registrarse'}
        height={60}
        style={{ marginTop: 4 }}
        disabled={submitting}
        loading={submitting}
        onPress={
          mode === 'LOGIN'
            ? handleSubmitLogin
            : handleSubmitRegister
        }
      />

          {mode === 'LOGIN' && (
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => Alert.alert('Recuperación de contraseña', 'Este proceso todavía no está disponible. No se ha enviado ninguna solicitud de recuperación.')}
            >
              <Text style={[styles.forgotText, { color: palette.silver }]}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Separador */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: palette.silver }]} />
          <Text style={[styles.dividerText, { color: palette.silver }]}>{dividerText}</Text>
          <View style={[styles.dividerLine, { backgroundColor: palette.silver }]} />
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
            accessibilityRole="button"
            accessibilityLabel="Continuar con Apple"
            style={[
              styles.socialBtn,
              {
                height: 60,
                backgroundColor: 'transparent',
                borderWidth: 0,
                overflow: 'hidden',
              },
            ]}
            onPress={() => Alert.alert(
              'Apple',
              'Se requiere Sign in with Apple real. No se permiten identidades simuladas.'
            )}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <ChromeSurface
              variant="secondary"
              radius={15}
              style={{ width: '100%', height: '100%' }}
              contentStyle={{
                backgroundColor: palette.surface,
              }}
            >
              <View style={styles.socialBtnContent}>
                <AppleLogo size={23} />
                <Text
                  style={[
                    styles.socialBtnText,
                    {
                      color: palette.text,
                      fontSize: 15,
                      fontWeight: '700',
                    },
                  ]}
                >
                  Continuar con Apple
                </Text>
              </View>
            </ChromeSurface>
          </TouchableOpacity>
        </View>

        {/* Pie de Alternancia */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerPrompt, { color: palette.muted }]}>
            {mode === 'LOGIN' ? '¿Nuevo en CoPilotRD? ' : '¿Ya tienes cuenta? '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
              setErrorMessage(null);
            }}
          >
            <Text style={[styles.footerLinkText, { color: palette.silver }]}>
              {mode === 'LOGIN' ? 'Crea una cuenta' : 'Inicia Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
      </ScrollView>
      {toast && (
        <AnimatedToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() =>
            setToast(current =>
              current?.id === toast.id ? null : current
            )
          }
        />
      )}
    </View>
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
    maxWidth: 420,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
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
  inputIcon: { marginRight: 10 },
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
  forgotText: { color: '#C7CBD2', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#C7CBD2', opacity: 0.65 },
  dividerText: { color: '#C7CBD2', fontSize: 12, fontWeight: '600', marginHorizontal: 14 },
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
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flex: 1,
    paddingHorizontal: 14,
  },
  appleIcon: { fontSize: 18, color: '#000000', marginBottom: 2 },
  socialBtnText: { color: '#000000', fontSize: 14, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerPrompt: { color: '#64748B', fontSize: 12 },
  footerLinkText: { color: '#C7CBD2', fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
});

import React, { useEffect } from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSettingsStore } from '../state/settingsStore';
import { useDisplaySettings } from '../hooks/useDisplaySettings';
import { useAuth } from '../context/AuthContext';
export default function SettingsScreen({ onClose }) {
  const { settings, ready, error, hydrate, update, reset } = useSettingsStore();
  const { colors, fontSize } = useDisplaySettings();
  const { logout } = useAuth();
  useEffect(() => { if (!ready) void hydrate(); }, [ready, hydrate]);
  const save = patch => { void update(patch).catch(() => {}); };
  const label = { color: colors.text, fontSize, marginVertical: 10 };
  const button = (title, action, disabled = false) => <TouchableOpacity key={title}
    accessibilityRole="button" disabled={disabled || !ready} onPress={action}
    style={{ padding: 12, opacity: disabled ? 0.55 : 1, borderWidth: 1,
      borderColor: colors.muted, borderRadius: 8, marginVertical: 6 }}>
    <Text style={{ color: colors.text, fontSize }}>{title}</Text>
  </TouchableOpacity>;
  const pending = (title, reason) => <View key={title} style={{ marginVertical: 8 }}>
    <Text style={label}>{title} · No disponible</Text>
    <Text style={{ color: colors.muted, fontSize }}>{reason}</Text>
  </View>;
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }}
    contentContainerStyle={{ padding: 20, paddingTop: 70, paddingBottom: 90 }}>
    {button('Volver', onClose)}
    <Text style={{ ...label, fontWeight: 'bold' }}>Seguridad y privacidad</Text>
    {error && <Text accessibilityRole="alert" style={label}>{error}</Text>}
    {pending('Cambiar o restablecer contraseña', 'Requiere verificación real por correo o SMS desde el servidor.')}
    {pending('PIN de 4 o 6 dígitos · abrir la app / pagos', 'Falta integrar un verificador seguro, límites de intentos y recuperación. No se guarda un PIN en texto plano.')}
    {pending('Face ID / huella', 'Requiere módulo nativo compatible, credencial vinculada y validación en dispositivo. No habilita pagos ni sustituye 2FA.')}
    {pending('Autenticación de dos pasos', 'Requiere alta, desafío, verificación, revocación y códigos de recuperación del servidor.')}
    {pending('Dispositivos y cierre remoto', 'No existe un contrato verificado para listar o revocar sesiones remotas.')}
    {button('Cerrar sesión en este dispositivo', () => { void logout(); })}
    {pending('Compartir ruta automáticamente', 'Requiere contactos consentidos, viaje real y enlace de acceso limitado. No se envía ubicación.')}
    {button('Permisos de cámara y ubicación', () => { void Linking.openSettings().catch(() => Alert.alert('Permisos', 'Abre los ajustes del sistema manualmente.')); })}
    <Text style={{ ...label, fontWeight: 'bold' }}>Configuración de la app</Text>
    {pending('Sonido, volumen, voz guía, tonos, silencio y vibración', 'Falta un reproductor integrado y eventos reales de viaje. No se modifican el volumen ni las alertas del sistema.')}
    {pending('Audio por altavoz o Bluetooth', 'La ruta de audio la administra el sistema; requiere integración nativa y pruebas en automóvil.')}
    {pending('Notificaciones push: maestro, viajes, seguridad, promociones y recibos', 'No hay registro de tokens push, servicio de envío ni preferencias sincronizadas. Las alertas de emergencia no se presentan como operativas.')}
    {pending('Navegación con Waze / Google Maps y ahorro de datos', 'Falta un destino verificado para lanzar navegación. El mapa no inventa rutas ni vehículos.')}
    {button(`Tema: ${settings.theme === 'dark' ? 'oscuro' : 'claro'}`, () => save({ theme: settings.theme === 'dark' ? 'light' : 'dark' }))}
    {button(`Texto: ${settings.textSize === 'large' ? 'grande' : 'normal'}`, () => save({ textSize: settings.textSize === 'large' ? 'normal' : 'large' }))}
    <Text style={{ color: colors.muted, fontSize }}>Los ajustes de apariencia se aplican a esta pantalla. El resto de pantallas conserva su diseño actual.</Text>
    {button('Restablecer ajustes de apariencia', () => Alert.alert('Restablecer ajustes', 'Se restaurarán tema y tamaño de texto locales.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restablecer', onPress: () => { void reset().catch(() => {}); } },
    ]))}
  </ScrollView>;
}

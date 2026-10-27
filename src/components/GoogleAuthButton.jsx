import React from 'react';
import {
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  View,
} from 'react-native';
import ChromeSurface from './ChromeSurface';
import GoogleLogo from './GoogleLogo';
import { useAppTheme } from '../context/ThemeContext';

export default function GoogleAuthButton({
  disabled = false,
  style,
}) {
  const { theme } = useAppTheme();
  const dark = theme === 'dark';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Continuar con Google"
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      onPress={() =>
        Alert.alert(
          'Google',
          'El acceso con Google estará disponible cuando se configure OAuth real. No se permiten cuentas simuladas.'
        )
      }
    >
      <ChromeSurface
        variant="secondary"
        radius={15}
        style={styles.surface}
        contentStyle={{
          backgroundColor: dark ? '#20252D' : '#F5F7FA',
        }}
      >
        <View style={styles.content}>
          <GoogleLogo size={23} />
          <Text
            style={[
              styles.text,
              { color: dark ? '#F1F3F6' : '#171B22' },
            ]}
          >
            Continuar con Google
          </Text>
        </View>
      </ChromeSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 60,
    borderRadius: 15,
    overflow: 'hidden',
  },
  surface: {
    width: '100%',
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

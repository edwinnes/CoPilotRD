import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';

export default function ChromeButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  height = 60,
  style,
}) {
  const { theme } = useAppTheme();
  const dark = theme === 'dark';

  const colors = dark
    ? ['#555D68', '#F3F5F7', '#A0A8B3', '#E2E6EB', '#626B77']
    : ['#8E97A3', '#FFFFFF', '#BAC1CB', '#F0F2F5', '#89929E'];

  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.86}
      style={[
        styles.outer,
        { height, opacity: inactive ? 0.6 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        locations={[0, 0.23, 0.53, 0.77, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.reflection} />
        {loading ? (
          <ActivityIndicator color="#171B22" size="small" />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#AAB1BC',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  reflection: {
    position: 'absolute',
    top: 1,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  label: {
    color: '#171B22',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
});

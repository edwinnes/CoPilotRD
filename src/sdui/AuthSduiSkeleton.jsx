import { useAppTheme } from '../context/ThemeContext';
import { getChromePalette } from '../theme/chromePalette';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

export default function AuthSduiSkeleton() {
  const { theme } = useAppTheme();
  const palette = getChromePalette(theme);
  const opacity = useRef(new Animated.Value(0.45)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const contentWidth = Math.max(0, width - 48);

  return (
    <Animated.View
      accessibilityLabel="Cargando interfaz de autenticación"
      style={[styles.container, { opacity }]}
    >
      <View style={[styles.logo, styles.block, { backgroundColor: palette.skeleton }]} />
      <View style={[styles.subtitle, styles.block, { backgroundColor: palette.skeleton }]} />

      <View style={[styles.input, styles.block, { backgroundColor: palette.skeleton }]} />
      <View style={[styles.input, styles.block, { backgroundColor: palette.skeleton }]} />

      <View style={[styles.button, styles.block, { backgroundColor: palette.skeleton }]} />
      <View style={[styles.link, styles.block, { backgroundColor: palette.skeleton }]} />

      <View style={[styles.divider, styles.block, { backgroundColor: palette.skeleton }]} />

      <View style={[styles.social, styles.block, { backgroundColor: palette.skeleton }]} />
      <View style={[styles.social, styles.block, { backgroundColor: palette.skeleton }]} />

      <View
        style={[
          styles.footer,
          styles.block,
          { backgroundColor: palette.skeleton },
          { maxWidth: contentWidth * 0.75 },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  block: {
    borderRadius: 12,
  },
  logo: {
    width: '55%',
    height: 42,
    marginBottom: 22,
  },
  subtitle: {
    width: '40%',
    height: 22,
    marginBottom: 42,
  },
  input: {
    width: '100%',
    height: 64,
    marginBottom: 18,
  },
  button: {
    width: '100%',
    height: 62,
    marginTop: 14,
    marginBottom: 24,
  },
  link: {
    width: '44%',
    height: 20,
    marginBottom: 42,
  },
  divider: {
    width: '38%',
    height: 16,
    marginBottom: 32,
  },
  social: {
    width: '100%',
    height: 62,
    marginBottom: 16,
  },
  footer: {
    width: '75%',
    height: 20,
    marginTop: 30,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Info,
  Check,
  TriangleAlert,
  XCircle,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { getChromePalette } from '../theme/chromePalette';

export default function AnimatedToast({
  message,
  type = 'error',
  onDismiss,
}) {
  const { theme } = useAppTheme();
  const palette = getChromePalette(theme);
  const isDark = theme === 'dark';
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    translateY.setValue(-80);
    opacity.setValue(0);

    const enter = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]);

    enter.start();

    const timeout = setTimeout(() => {
      dismiss();
    }, 4200);

    return () => {
      clearTimeout(timeout);
      enter.stop();
    };
  }, [message]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && onDismiss) onDismiss();
    });
  };

  if (!message) return null;

  const variants = {
    info: { title: 'Información', Icon: Info },
    success: { title: 'Éxito', Icon: Check },
    warning: { title: 'Atención', Icon: TriangleAlert },
    error: { title: 'Error', Icon: XCircle },
  };

  const variant = variants[type] || variants.error;
  const VariantIcon = variant.Icon;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: palette.alertSurface,
            borderColor: palette.alertBorder,
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? '#353B45' : '#E0E4EA',
              borderColor: palette.silver,
            },
          ]}
        >
          <VariantIcon size={21} color={palette.text} strokeWidth={2} />
        </View>

        <View style={styles.messageGroup}>
          <Text style={[styles.title, { color: palette.text }]}>
            {variant.title}
          </Text>
          <Text style={[styles.message, { color: palette.muted }]}>
            {message}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cerrar notificación"
          onPress={dismiss}
          style={styles.closeButton}
        >
          <X size={20} color={palette.muted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'android'
      ? (StatusBar.currentHeight || 24) + 16
      : 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
  },
  toast: {
    minHeight: 78,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageGroup: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  closeButton: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

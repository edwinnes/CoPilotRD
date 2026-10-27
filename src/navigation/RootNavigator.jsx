import { getChromePalette } from '../theme/chromePalette';
import { useAppTheme } from '../context/ThemeContext';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import AuthSduiScreen from '../screens/AuthSduiScreen';
import ClientMainDashboard from '../screens/ClientMainDashboard';

function AuthSkeleton() {
  const { theme } = useAppTheme();
  const palette = getChromePalette(theme);
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Animated.View style={[styles.title, { opacity, backgroundColor: palette.silver }]} />

      <Animated.View style={[styles.field, { opacity, backgroundColor: palette.skeleton }]} />
      <Animated.View style={[styles.field, { opacity, backgroundColor: palette.skeleton }]} />
      <Animated.View style={[styles.field, { opacity, backgroundColor: palette.skeleton }]} />

      <Animated.View style={[styles.button, { opacity, backgroundColor: palette.silver }]} />

      <Text style={[styles.caption, { color: palette.muted }]}>
        Preparando CoPilotRD...
      </Text>
    </View>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return <AuthSduiScreen />;
  }

  return <ClientMainDashboard />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 28,
    paddingTop: 120,
  },
  title: {
    width: '65%',
    height: 38,
    borderRadius: 12,
    backgroundColor: '#263044',
    alignSelf: 'center',
    marginBottom: 58,
  },
  field: {
    height: 58,
    backgroundColor: '#1A2232',
    borderRadius: 14,
    marginBottom: 18,
  },
  button: {
    height: 58,
    backgroundColor: '#164E91',
    borderRadius: 14,
    marginTop: 16,
  },
  caption: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});

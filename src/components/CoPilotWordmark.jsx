import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';

export default function CoPilotWordmark({ size = 32, style, topMargin = 20 }) {
  const { theme } = useAppTheme();
  const dark = theme === 'dark';
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(9)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        style,
        {
          marginTop: topMargin,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.nameRow}>
        <Text
          accessibilityLabel="CoPilotRD, marca registrada"
          style={[
            styles.name,
            {
              fontSize: size,
              color: dark ? '#F0F2F5' : '#343B45',
              textShadowColor: dark
                ? 'rgba(225,232,240,0.28)'
                : 'rgba(70,80,95,0.10)',
              textShadowRadius: dark ? 5 : 2,
            },
          ]}
        >
          CoPilot<Text style={{
            color: dark ? '#B8C0CB' : '#717C89',
          }}>RD</Text>
        </Text>
        <Text
          style={[
            styles.registered,
            {
              color: dark ? '#C7CDD6' : '#596473',
              fontSize: Math.max(10, size * 0.34),
            },
          ]}
        >
          ®
        </Text>
      </View>
      <LinearGradient
        colors={
          dark
            ? ['transparent', '#697481', '#F5F7FA', '#697481', 'transparent']
            : ['transparent', '#A0AAB7', '#606B79', '#A0AAB7', 'transparent']
        }
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accent}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  registered: {
    fontWeight: '600',
    marginLeft: 2,
    marginTop: 2,
  },
  accent: {
    width: '78%',
    height: 1,
    marginTop: 7,
    opacity: 0.85,
  },
});

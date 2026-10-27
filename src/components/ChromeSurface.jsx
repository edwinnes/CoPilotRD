import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';

export default function ChromeSurface({
  children,
  style,
  contentStyle,
  radius = 15,
  variant = 'input',
}) {
  const { theme } = useAppTheme();
  const dark = theme === 'dark';

  const inputColors = dark
    ? ['#6B7480', '#343B45', '#171B21', '#424B57']
    : ['#AEB6C1', '#F0F2F5', '#FFFFFF', '#BCC4CF'];

  const secondaryColors = dark
    ? ['#737D89', '#242B34', '#111419', '#59636F']
    : ['#A6AFBA', '#FFFFFF', '#EDF0F4', '#B4BDC8'];

  const colors = variant === 'secondary'
    ? secondaryColors
    : inputColors;

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.25, 0.75, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.outer,
        {
          borderRadius: radius,
          borderColor: dark ? '#69727E' : '#B0B8C3',
        },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            borderRadius: Math.max(radius - 2, 0),
            backgroundColor: dark
              ? '#171B21'
              : '#F8FAFC',
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 1,
    padding: 1,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
});

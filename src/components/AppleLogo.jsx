import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

export default function AppleLogo({ size = 23 }) {
  const { theme } = useAppTheme();
  const color = theme === 'dark' ? '#F1F3F6' : '#171B22';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M17.05 12.54c.02 2.18 1.92 2.91 1.94 2.92-.02.05-.3 1.03-1 2.04-.6.87-1.23 1.74-2.21 1.76-.96.02-1.27-.57-2.37-.57-1.1 0-1.45.55-2.36.59-.95.03-1.67-.95-2.27-1.82-1.23-1.78-2.17-5.02-.91-7.21a3.53 3.53 0 0 1 2.99-1.83c.93-.02 1.81.63 2.38.63.56 0 1.62-.78 2.73-.67.46.02 1.75.19 2.58 1.4-.07.04-1.54.9-1.52 2.76ZM15.24 7.18a3.7 3.7 0 0 0 .85-2.7 3.75 3.75 0 0 0-2.46 1.28 3.55 3.55 0 0 0-.88 2.61c.94.07 1.9-.48 2.49-1.19Z"
      />
    </Svg>
  );
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#007AFF',
        },
        light: {
          background: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        dark: {
          background: '#000000',
          surface: '#151A27',
          text: '#FFFFFF',
          muted: '#94A3B8',
          border: '#222B40',
        },
      },
    },
  },
  plugins: [],
};

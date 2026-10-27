/**
 * CoPilotRD® — Paleta cromada compartida.
 * LIGHT predeterminado; DARK opcional.
 * No contiene lógica de autenticación.
 */

export const chromePalette = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    input: '#F1F3F6',
    inputBorder: '#CBD1D9',
    text: '#171B22',
    muted: '#64707E',
    silver: '#C5CAD2',
    silverHighlight: '#F1F3F6',
    buttonText: '#171B22',
    skeleton: '#E2E6EC',
    alertSurface: '#F5F6F8',
    alertBorder: '#C7CDD5',
  },

  dark: {
    background: '#050608',
    surface: '#111419',
    input: '#171B21',
    inputBorder: '#343B45',
    text: '#E5E7EB',
    muted: '#A6ADB8',
    silver: '#C7CBD2',
    silverHighlight: '#EEF0F3',
    buttonText: '#111318',
    skeleton: '#242A33',
    alertSurface: '#171B21',
    alertBorder: '#444B56',
  },
};

export function getChromePalette(theme) {
  return theme === 'dark'
    ? chromePalette.dark
    : chromePalette.light;
}

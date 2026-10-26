import { useSettingsStore } from '../state/settingsStore';
export function useDisplaySettings() {
  const settings = useSettingsStore(state => state.settings);
  return { ...settings, fontSize: settings.textSize === 'large' ? 19 : 15,
    colors: settings.theme === 'light'
      ? { background: '#F8FAFC', text: '#0F172A', muted: '#475569' }
      : { background: '#0A0E1A', text: '#F8FAFC', muted: '#CBD5E1' } };
}

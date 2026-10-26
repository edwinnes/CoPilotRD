import { create } from 'zustand';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventManager } from '../services/eventManager';

// Only non-sensitive display preferences persist here. Security and server
// capabilities never become enabled just by writing a local preference.
export const settingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  textSize: z.enum(['normal', 'large']),
}).strict();
export const DEFAULT_SETTINGS = Object.freeze({ theme: 'dark', textSize: 'normal' });
const KEY = 'copilot_display_settings_v1';
let writes = Promise.resolve();
let revision = 0;
export const useSettingsStore = create((set, get) => ({
  settings: { ...DEFAULT_SETTINGS }, ready: false, error: null,
  async hydrate() {
    const current = revision;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const settings = raw ? settingsSchema.parse(JSON.parse(raw)) : { ...DEFAULT_SETTINGS };
      if (current === revision) set({ settings, ready: true, error: null });
    } catch {
      if (current === revision) set({ settings: { ...DEFAULT_SETTINGS }, ready: true,
        error: 'No se pudieron recuperar los ajustes locales.' });
    }
  },
  update(patch) {
    const validatedPatch = settingsSchema.partial().parse(patch);
    ++revision;
    const operation = writes.then(async () => {
      const next = settingsSchema.parse({ ...get().settings, ...validatedPatch });
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      set({ settings: next, ready: true, error: null });
      eventManager.emit('settings:changed');
    });
    writes = operation.catch(() => { set({ error: 'No se pudieron guardar los ajustes.' }); });
    return operation;
  },
  reset() { return get().update({ ...DEFAULT_SETTINGS }); },
}));

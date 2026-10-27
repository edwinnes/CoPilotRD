import { create } from 'zustand';
import { validateAuthSchema } from '../sdui/validateAuthSchema';

const initialState = {
  schema: null,
  status: 'idle',
  source: null,
  error: null,
  isConnected: null,
};

export const useSduiStore = create((set) => ({
  ...initialState,

  startLoading: () => set((state) => ({
    status: state.schema ? 'refreshing' : 'loading',
    error: null,
  })),

  setSchema: (payload, source = 'remote') => {
    const result = validateAuthSchema(payload);

    if (!result.valid) {
      set((state) => ({
        status: state.schema ? 'ready' : 'error',
        error: result.reason,
      }));

      return false;
    }

    if (!['remote', 'cache'].includes(source)) {
      return false;
    }

    set({
      schema: result.schema,
      status: 'ready',
      source,
      error: null,
    });

    return true;
  },

  setError: (message) => set((state) => ({
    status: state.schema ? 'ready' : 'error',
    error: String(message || 'SDUI_ERROR'),
  })),

  setConnectivity: (isConnected) => set({
    isConnected:
      typeof isConnected === 'boolean'
        ? isConnected
        : null,
  }),

  reset: () => set({ ...initialState }),
}));

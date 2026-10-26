// Events carry no credentials, profile, coordinates or payment data.
const listeners = new Map();
const supported = new Set(['session:changed', 'session:expired', 'settings:changed']);
export const eventManager = {
  subscribe(name, listener) {
    if (!supported.has(name)) throw new Error('Evento no permitido.');
    const set = listeners.get(name) || new Set();
    set.add(listener);
    listeners.set(name, set);
    return () => { set.delete(listener); if (!set.size) listeners.delete(name); };
  },
  emit(name) {
    if (!supported.has(name)) throw new Error('Evento no permitido.');
    for (const callback of [...(listeners.get(name) || [])]) {
      try { callback(); } catch { /* One subscriber must not interrupt logout. */ }
    }
  },
};

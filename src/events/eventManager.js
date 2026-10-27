/**
 * CoPilotRD® — Event Manager
 *
 * Comunicación entre servicios, SDUI y estados de interfaz.
 * No persistir credenciales ni datos sensibles en eventos.
 */

export const AppEvents = Object.freeze({
  SDUI_LOADING: 'sdui:loading',
  SDUI_READY: 'sdui:ready',
  SDUI_ERROR: 'sdui:error',
  NETWORK_CHANGED: 'network:changed',
  AUTH_REGISTER_PENDING: 'auth:register-pending',
  AUTH_VERIFICATION_REQUIRED: 'auth:verification-required',
  AUTH_VERIFIED: 'auth:verified',
  AUTH_SESSION_EXPIRED: 'auth:session-expired',
  UI_ALERT: 'ui:alert',
});

const listeners = new Map();

export function subscribe(event, callback) {
  if (!Object.values(AppEvents).includes(event)) {
    throw new Error('Evento no permitido.');
  }

  if (typeof callback !== 'function') {
    throw new TypeError('El listener debe ser una función.');
  }

  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }

  listeners.get(event).add(callback);

  return () => {
    const group = listeners.get(event);
    if (!group) return;

    group.delete(callback);

    if (group.size === 0) {
      listeners.delete(event);
    }
  };
}

export function emit(event, payload = null) {
  if (!Object.values(AppEvents).includes(event)) {
    throw new Error('Evento no permitido.');
  }

  const group = listeners.get(event);
  if (!group) return;

  for (const callback of [...group]) {
    try {
      callback(payload);
    } catch (_) {
      console.warn('[EventManager] Error en listener:', event);
    }
  }
}

export function clearEventListeners(event) {
  if (event === undefined) {
    listeners.clear();
    return;
  }

  if (!Object.values(AppEvents).includes(event)) {
    throw new Error('Evento no permitido.');
  }

  listeners.delete(event);
}

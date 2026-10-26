// Expiration is a client-side hygiene check. Only the server verifies signatures,
// issuer, audience, revocation and permissions. Never authorize using decoded roles.
export function assertSession(value, now = Date.now()) {
  if (!value || typeof value.token !== 'string' || value.token.length > 12000 ||
      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.token) ||
      !value.user || typeof value.user.id !== 'string' || !value.user.id.trim() ||
      !Number.isSafeInteger(value.expiresAt) || value.expiresAt <= now) {
    throw new Error('Sesión inválida o vencida.');
  }
  return { token: value.token, user: value.user, expiresAt: value.expiresAt };
}

export function createSessionController({ storage, verifySession, onChange, now = Date.now }) {
  let generation = 0;
  let session = null;
  let writes = Promise.resolve();
  const serialize = (task) => {
    const next = writes.then(task, task);
    writes = next.catch(() => {});
    return next;
  };
  const publish = (value) => { session = value; onChange(value); };
  return {
    async restore() {
      const current = ++generation;
      publish(null);
      try {
        const saved = await storage.read();
        if (!saved || current !== generation) return;
        // A cached profile alone cannot restore authentication.
        assertSession(saved, now());
        const verified = assertSession(await verifySession(saved.token), now());
        if (current === generation) publish(verified);
      } catch {
        if (current === generation) {
          publish(null);
          await serialize(() => storage.clear());
        }
      }
    },
    async authenticate(action) {
      const current = ++generation;
      const result = assertSession(await action(), now());
      if (current !== generation) throw new Error('Operación de acceso cancelada.');
      await serialize(async () => {
        if (current === generation) await storage.write(result);
      });
      if (current !== generation) throw new Error('Operación de acceso cancelada.');
      try { assertSession(result, now()); }
      catch (error) {
        publish(null);
        await serialize(() => storage.clear());
        throw error;
      }
      publish(result);
      return result;
    },
    async logout() {
      ++generation;
      publish(null); // Lock immediately, even if deletion fails.
      await serialize(() => storage.clear());
    },
    getToken() {
      if (!session) return null;
      if (session.expiresAt <= now()) {
        ++generation;
        publish(null);
        void serialize(() => storage.clear()).catch(() => {});
        return null;
      }
      return session.token;
    },
  };
}

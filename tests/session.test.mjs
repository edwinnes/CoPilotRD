import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSession, createSessionController } from '../src/security/sessionCore.mjs';
const fixture = (overrides = {}) => ({ token: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.c2ln',
  user: { id: 'test-user' }, expiresAt: 2000, ...overrides });
function setup(overrides = {}) {
  const changes = [];
  let saved = null;
  const storage = { read: async () => saved, write: async x => { saved = x; }, clear: async () => { saved = null; }, ...overrides.storage };
  const controller = createSessionController({ storage, verifySession: async () => fixture(),
    now: () => 1000, onChange: x => changes.push(x), ...overrides, storage });
  return { controller, changes, get saved() { return saved; } };
}
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
test('rejects profile-only sessions, malformed tokens, expired sessions and invalid expiry', () => {
  for (const value of [null, {}, {user: {id:'x'}}, fixture({token:'x'}), fixture({expiresAt:1000}),
    fixture({expiresAt:Infinity}), fixture({user:{}}), fixture({token:'a'.repeat(12001)})]) {
    assert.throws(() => assertSession(value,1000));
  }
});
test('publishes only after successful secure persistence', async () => {
  const s = setup(); await s.controller.authenticate(async () => fixture());
  assert.equal(s.controller.getToken(), fixture().token); assert.deepEqual(s.saved,fixture());
});
test('does not authenticate after server denial', async () => {
  const s=setup(); await assert.rejects(s.controller.authenticate(async () => {throw Error('denied');}));
  assert.equal(s.controller.getToken(),null); assert.equal(s.saved,null);
});
test('fails closed when secure write fails', async () => {
  const s=setup({storage:{write:async()=>{throw Error('locked');}}});
  await assert.rejects(s.controller.authenticate(async()=>fixture())); assert.equal(s.controller.getToken(),null);
});
test('logout cancels an in-flight login response', async () => {
  const d=deferred();const s=setup();const login=s.controller.authenticate(()=>d.promise);
  await s.controller.logout();d.resolve(fixture());await assert.rejects(login,/cancelada/);
  assert.equal(s.controller.getToken(),null);assert.equal(s.saved,null);
});
test('logout waits behind an in-flight write and removes its result', async () => {
  const entered=deferred(),finish=deferred();let stored;
  const s=setup({storage:{write:async x=>{entered.resolve();await finish.promise;stored=x;},clear:async()=>{stored=null;}}});
  const login=s.controller.authenticate(async()=>fixture());await entered.promise;
  const logout=s.controller.logout();assert.equal(s.controller.getToken(),null);
  finish.resolve();await assert.rejects(login,/cancelada/);await logout;assert.equal(stored,null);
});
test('stale first login cannot replace a newer login', async () => {
  const d=deferred();const s=setup();const first=s.controller.authenticate(()=>d.promise);
  await s.controller.authenticate(async()=>fixture({user:{id:'new'}}));d.resolve(fixture());
  await assert.rejects(first,/cancelada/);assert.equal(s.changes.at(-1).user.id,'new');
});
test('cached session requires verification by server', async () => {
  let checked=false;
  const s=setup({storage:{read:async()=>fixture()},verifySession:async token=>{checked=token;return fixture();}});
  await s.controller.restore();assert.equal(checked,fixture().token);assert.equal(s.controller.getToken(),fixture().token);
});
test('failed revalidation deletes cache and keeps navigation locked', async () => {
  let cleared=false;const s=setup({storage:{read:async()=>fixture(),clear:async()=>{cleared=true;}},verifySession:async()=>{throw Error('revoked');}});
  await s.controller.restore();assert.equal(s.controller.getToken(),null);assert.equal(cleared,true);
});
test('unverified profiles are cleared rather than trusted', async () => {
  let verified=false,cleared=false;const s=setup({storage:{read:async()=>({user:{id:'x'}}),clear:async()=>{cleared=true;}},verifySession:async()=>{verified=true;return fixture();}});
  await s.controller.restore();assert.equal(verified,false);assert.equal(cleared,true);assert.equal(s.controller.getToken(),null);
});
test('late restore cannot resurrect a logged-out session', async () => {
  const d=deferred();const entered=deferred();const s=setup({storage:{read:async()=>fixture()},verifySession:async()=>{entered.resolve();return d.promise;}});
  const restore=s.controller.restore();await entered.promise;await s.controller.logout();d.resolve(fixture());await restore;
  assert.equal(s.controller.getToken(),null);
});
test('expiration clears auth in memory immediately', async () => {
  let clock=1000;const s=setup({now:()=>clock});await s.controller.authenticate(async()=>fixture());clock=2000;
  assert.equal(s.controller.getToken(),null);assert.equal(s.changes.at(-1),null);
});
test('logout stays locked and reports secure deletion failure', async () => {
  const s=setup({storage:{clear:async()=>{throw Error('locked');}}});await s.controller.authenticate(async()=>fixture());
  await assert.rejects(s.controller.logout());assert.equal(s.controller.getToken(),null);
});
test('session expiring during secure write is deleted and never published', async () => {
  let clock=1000,cleared=false;
  const s=setup({now:()=>clock,storage:{write:async()=>{clock=2000;},clear:async()=>{cleared=true;}}});
  await assert.rejects(s.controller.authenticate(async()=>fixture()),/vencida/);
  assert.equal(s.controller.getToken(),null);assert.equal(cleared,true);
});

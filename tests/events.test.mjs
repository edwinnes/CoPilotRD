import test from 'node:test';
import assert from 'node:assert/strict';
// Load this dependency-free ESM module without changing the app package type.
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/services/eventManager.js', import.meta.url), 'utf8');
const { eventManager } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
test('unsubscribe removes observers and exceptions cannot interrupt logout', () => {
  let count=0;
  const bad=eventManager.subscribe('session:changed',()=>{throw Error('UI error');});
  const good=eventManager.subscribe('session:changed',()=>{count++;});
  eventManager.emit('session:changed');assert.equal(count,1);good();bad();
  eventManager.emit('session:changed');assert.equal(count,1);
});
test('rejects arbitrary event names',()=>{
  assert.throws(()=>eventManager.subscribe('token',()=>{}));assert.throws(()=>eventManager.emit('token'));
});

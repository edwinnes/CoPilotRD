import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { assertSession } from '../src/security/sessionCore.mjs';
const source=fs.readFileSync(new URL('../src/services/authStorage.js',import.meta.url),'utf8')
  .replace(/^import .*;\n/gm,'').replace(/export async function /g,'async function ');
function load({platform='android',available=true,failWrite=false,failDelete=false}={}) {
  const plain=new Map(),secure=new Map(),browser=new Map();
  const api=new vm.Script(source+'\n({saveAuthSession,getAuthSession,clearAuthSession,purgeLegacyAuth});').runInNewContext({
    assertSession,Platform:{OS:platform},
    AsyncStorage:{getItem:async k=>plain.get(k)||null,setItem:async(k,v)=>{plain.set(k,v);},removeItem:async k=>{plain.delete(k);},multiRemove:async keys=>{keys.forEach(k=>plain.delete(k));}},
    SecureStore:{WHEN_UNLOCKED_THIS_DEVICE_ONLY:'device',isAvailableAsync:async()=>available,
      setItemAsync:async(k,v)=>{if(failWrite)throw Error('secure write failed');secure.set(k,v);},
      getItemAsync:async k=>secure.get(k)||null,deleteItemAsync:async k=>{if(failDelete)throw Error('delete failed');secure.delete(k);}},
    window:{localStorage:{removeItem:k=>browser.delete(k)}},
  });
  return {api,plain,secure,browser};
}
const session=()=>({token:'header.payload.signature',user:{id:'test'},expiresAt:Date.now()+60000});
test('native credentials are stored only in SecureStore',async()=>{
  const s=load();const value=session();await s.api.saveAuthSession(value);
  assert.equal(s.plain.size,0);assert.equal(s.browser.size,0);
  assert.equal((await s.api.getAuthSession()).token,value.token);
});
test('secure write failure is returned with no plaintext fallback',async()=>{
  const s=load({failWrite:true});await assert.rejects(s.api.saveAuthSession(session()));
  assert.equal(s.plain.size,0);assert.equal(s.secure.size,0);
});
test('unavailable secure storage cannot report successful native persistence',async()=>{
  const s=load({available:false});await assert.rejects(s.api.saveAuthSession(session()));
  assert.equal(await s.api.getAuthSession(),null);assert.equal(s.plain.size,0);
});
test('logout tombstone prevents restoring tokens when secure deletion fails',async()=>{
  const s=load({failDelete:true});await s.api.saveAuthSession(session());
  await assert.rejects(s.api.clearAuthSession());assert.equal(s.secure.size,1);
  assert.equal(s.plain.get('copilot_session_disabled_v2'),'1');assert.equal(await s.api.getAuthSession(),null);
});
test('logout removes legacy data and current secure credentials',async()=>{
  const s=load();s.plain.set('@copilot_user','tampered');s.plain.set('@copilot_token','old');
  await s.api.saveAuthSession(session());await s.api.clearAuthSession();
  assert.equal(s.plain.has('@copilot_user'),false);assert.equal(s.plain.has('@copilot_token'),false);
  assert.equal(s.secure.size,0);assert.equal(await s.api.getAuthSession(),null);
});
test('web sessions persist only within the module memory and clear on logout',async()=>{
  const s=load({platform:'web'});await s.api.saveAuthSession(session());assert.equal(s.plain.size,0);
  assert.equal(s.secure.size,0);assert.equal(s.browser.size,0);assert.ok(await s.api.getAuthSession());
  assert.equal(await load({platform:'web'}).api.getAuthSession(),null);
  await s.api.clearAuthSession();assert.equal(await s.api.getAuthSession(),null);
});
test('malformed secure session cannot restore authentication',async()=>{
  const s=load();s.secure.set('copilot_session_v2','{"user":{"id":"tampered"}}');
  await assert.rejects(s.api.getAuthSession());
});

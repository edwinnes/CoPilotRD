import test from 'node:test';
import assert from 'node:assert/strict';
import { apiOrigin, assertRelativeApiPath } from '../src/security/apiPolicy.mjs';
test('API has no HTTP, embedded credentials, path, query or fragment destinations', () => {
  for (const input of ['',undefined,'http://example.test','https://user:secret@example.test',
    'https://example.test/path','https://example.test/?key=secret','https://example.test/#key']) {
    assert.throws(()=>apiOrigin(input));
  }
  assert.equal(apiOrigin('https://staging.example.test/'),'https://staging.example.test');
});
test('API refuses absolute, scheme-relative, backslash and whitespace destinations', () => {
  for (const input of [null,'https://evil.test','//evil.test/path','/\\evil.test',' /path','/path\n']) {
    assert.throws(()=>assertRelativeApiPath(input));
  }
  assert.equal(assertRelativeApiPath('/api/v1/auth/sdui'),'/api/v1/auth/sdui');
});

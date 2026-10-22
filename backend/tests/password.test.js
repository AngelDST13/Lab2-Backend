import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

describe('password', () => {
  it('verifica la contraseña correcta y rechaza una incorrecta', async () => {
    const hash = await hashPassword('Secreta123');
    assert.equal(await verifyPassword('Secreta123', hash), true);
    assert.equal(await verifyPassword('secreta123', hash), false);
  });

  it('la misma contraseña produce hashes distintos (sal aleatoria)', async () => {
    const [first, second] = await Promise.all([hashPassword('Secreta123'), hashPassword('Secreta123')]);
    assert.notEqual(first, second);
  });

  it('nunca guarda la contraseña en texto plano', async () => {
    const hash = await hashPassword('Secreta123');
    assert.ok(!hash.includes('Secreta123'));
    assert.match(hash, /^scrypt\$/);
  });
});

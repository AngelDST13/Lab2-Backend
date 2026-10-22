import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendTurn, getHistory } from '../src/services/conversationMemory.js';

describe('conversationMemory', () => {
  it('una conversación nueva no tiene historial', () => {
    assert.deepEqual(getHistory('nueva'), []);
  });

  it('guarda los intercambios en orden: cliente y asistente', () => {
    appendTurn('orden', 'hola', '¿en qué te ayudo?');
    assert.deepEqual(getHistory('orden'), [
      { role: 'user', text: 'hola' },
      { role: 'assistant', text: '¿en qué te ayudo?' },
    ]);
  });

  it('conserva solo los últimos 6 intercambios y siempre empieza con el cliente', () => {
    for (let turn = 1; turn <= 9; turn++) appendTurn('larga', `pregunta ${turn}`, `respuesta ${turn}`);
    const history = getHistory('larga');
    assert.equal(history.length, 12);
    assert.equal(history[0].role, 'user');
    assert.equal(history[0].text, 'pregunta 4');
  });

  it('las conversaciones no se mezclan entre usuarios', () => {
    appendTurn('1:abc', 'soy Ana', 'hola Ana');
    appendTurn('2:abc', 'soy Carlos', 'hola Carlos');
    assert.equal(getHistory('1:abc')[0].text, 'soy Ana');
    assert.equal(getHistory('2:abc')[0].text, 'soy Carlos');
  });
});

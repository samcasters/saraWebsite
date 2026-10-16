'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isIsoDate, isMonth, cleanGuestName, cleanNote } = require('./validate');

test('accepts a real calendar date', () => {
  assert.equal(isIsoDate('2026-10-16'), true);
  assert.equal(isIsoDate('2026-02-31'), false);
  assert.equal(isIsoDate('16-10-2026'), false);
});

test('accepts a month', () => {
  assert.equal(isMonth('2026-10'), true);
  assert.equal(isMonth('2026-13'), false);
  assert.equal(isMonth('2026-1'), false);
});

test('cleans a guest name', () => {
  assert.equal(cleanGuestName('  Ada   Lovelace '), 'Ada Lovelace');
  assert.equal(cleanGuestName(''), null);
  assert.equal(cleanGuestName('x'.repeat(81)), null);
});

test('cleans a note', () => {
  assert.equal(cleanNote(undefined), '');
  assert.equal(cleanNote('  hello '), 'hello');
  assert.equal(cleanNote('x'.repeat(501)), null);
});

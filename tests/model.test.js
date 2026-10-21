import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, cleanName, normalizeState, addDoor, renameDoor, removeDoor, confirmDoor, lastConfirmation, clearHistory, MAX_EVENTS } from '../src/model.js';

test('starts with a single door and no confirmations', () => {
  const state = initialState();
  assert.equal(state.doors.length, 1); assert.equal(state.events.length, 0); assert.equal(lastConfirmation(state, 'home'), null);
});
test('adds a door and selects it', () => {
  const next = addDoor(initialState(), '  Garaje   lateral ', 'garage');
  assert.equal(next.doors[1].name, 'Garaje lateral'); assert.equal(next.selectedDoorId, 'garage');
});
test('prevents empty and duplicated door names', () => {
  assert.throws(() => addDoor(initialState(), '  ', 'x'));
  assert.throws(() => addDoor(initialState(), 'PUERTA PRINCIPAL', 'x'));
});
test('renames a door without mutating history', () => {
  const first = confirmDoor(initialState(), 'home', 1000, 'e1');
  const second = renameDoor(first, 'home', 'Casa');
  assert.equal(second.doors[0].name, 'Casa'); assert.equal(second.events[0].doorName, 'Puerta principal');
});
test('records confirmations with timestamp, keeping most recent first', () => {
  const first = confirmDoor(initialState(), 'home', 1000, 'e1');
  const second = confirmDoor(first, 'home', 2000, 'e2');
  assert.equal(lastConfirmation(second, 'home').id, 'e2'); assert.deepEqual(second.events.map((e) => e.id), ['e2','e1']);
});
test('cannot confirm missing doors', () => {
  assert.throws(() => confirmDoor(initialState(), 'not-a-door', 1000, 'e1'));
});
test('removing a door preserves historical entries and another door', () => {
  let state = addDoor(initialState(), 'Garaje', 'g');
  state = confirmDoor(state, 'g', 1000, 'e1');
  state = removeDoor(state, 'g');
  assert.equal(state.doors.length, 1); assert.equal(state.events[0].doorName, 'Garaje');
  assert.throws(() => removeDoor(state, 'home'));
});
test('clears confirmation history', () => {
  const state = confirmDoor(initialState(), 'home', 1000, 'e1');
  assert.equal(clearHistory(state).events.length, 0);
});
test('limits history to MAX_EVENTS', () => {
  let state = initialState(); for (let i = 1; i <= MAX_EVENTS + 1; i++) state = confirmDoor(state, 'home', i, `e${i}`);
  assert.equal(state.events.length, MAX_EVENTS); assert.equal(state.events[0].id, `e${MAX_EVENTS + 1}`);
});
test('recovers from invalid or tampered storage', () => {
  assert.deepEqual(normalizeState(null), initialState());
  const next = normalizeState({doors:[{id:'home',name:'  Puerta  '}], selectedDoorId:'unknown', events:[{id:'invalid',doorId:'home',doorName:'X',timestamp:'not a number'}]});
  assert.equal(next.selectedDoorId,'home'); assert.equal(next.events.length,0);
});
test('door names are whitespace normalized and length-limited', () => {
  assert.equal(cleanName('  puerta\tprincipal  '), 'puerta principal'); assert.equal(cleanName('x'.repeat(55)).length,48);
});

export const STORAGE_KEY = 'cerre-la-puerta:v1';
export const MAX_DOORS = 20;
export const MAX_EVENTS = 500;

export function initialState() {
  return { version: 1, doors: [{ id: 'home', name: 'Puerta principal' }], selectedDoorId: 'home', events: [] };
}

export function cleanName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ').slice(0, 48);
}

export function normalizeState(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.doors) || !Array.isArray(value.events)) return initialState();
  const unique = new Set();
  const doors = value.doors.filter((door) => {
    if (!door || typeof door.id !== 'string' || !door.id || unique.has(door.id) || !cleanName(door.name)) return false;
    unique.add(door.id);
    return true;
  }).slice(0, MAX_DOORS).map((door) => ({ id: door.id, name: cleanName(door.name) }));
  if (!doors.length) return initialState();
  const events = value.events.filter((entry) =>
    entry && typeof entry.id === 'string' && typeof entry.doorId === 'string' &&
    typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp) &&
    entry.timestamp > 0 && entry.timestamp < Date.now() + 86400000 &&
    typeof entry.doorName === 'string'
  ).slice(0, MAX_EVENTS).map((entry) => ({
    id: entry.id, doorId: entry.doorId, doorName: cleanName(entry.doorName), timestamp: entry.timestamp
  }));
  return { version: 1, doors, selectedDoorId: doors.some((d) => d.id === value.selectedDoorId) ? value.selectedDoorId : doors[0].id, events };
}

export function addDoor(state, name, id) {
  const trimmed = cleanName(name);
  if (!trimmed) throw new Error('Escribí un nombre para la puerta.');
  if (state.doors.length >= MAX_DOORS) throw new Error('Podés registrar hasta 20 puertas.');
  if (state.doors.some((d) => d.name.toLocaleLowerCase('es') === trimmed.toLocaleLowerCase('es'))) throw new Error('Ya tenés una puerta con ese nombre.');
  if (!id || state.doors.some((d) => d.id === id)) throw new Error('No se pudo crear la puerta.');
  return { ...state, doors: [...state.doors, { id, name: trimmed }], selectedDoorId: id };
}

export function renameDoor(state, id, name) {
  const trimmed = cleanName(name);
  if (!trimmed) throw new Error('Escribí un nombre para la puerta.');
  if (!state.doors.some((d) => d.id === id)) throw new Error('No existe esa puerta.');
  if (state.doors.some((d) => d.id !== id && d.name.toLocaleLowerCase('es') === trimmed.toLocaleLowerCase('es'))) throw new Error('Ya tenés una puerta con ese nombre.');
  return { ...state, doors: state.doors.map((door) => door.id === id ? { ...door, name: trimmed } : door) };
}

export function removeDoor(state, id) {
  if (state.doors.length <= 1) throw new Error('Debe quedar al menos una puerta.');
  const doors = state.doors.filter((door) => door.id !== id);
  if (doors.length === state.doors.length) throw new Error('No existe esa puerta.');
  return { ...state, doors, selectedDoorId: state.selectedDoorId === id ? doors[0].id : state.selectedDoorId };
}

export function confirmDoor(state, doorId, timestamp, id) {
  const door = state.doors.find((d) => d.id === doorId);
  if (!door) throw new Error('Elegí una puerta válida.');
  if (!Number.isFinite(timestamp) || timestamp <= 0 || !id) throw new Error('No se pudo guardar el registro.');
  const entry = { id, doorId, doorName: door.name, timestamp };
  return { ...state, events: [entry, ...state.events].slice(0, MAX_EVENTS) };
}

export function lastConfirmation(state, doorId) {
  return state.events.find((entry) => entry.doorId === doorId) ?? null;
}

export function clearHistory(state) {
  return { ...state, events: [] };
}

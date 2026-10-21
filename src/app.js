import { STORAGE_KEY, initialState, normalizeState, addDoor, renameDoor, removeDoor, confirmDoor, lastConfirmation, clearHistory } from './model.js';

const $ = (selector) => document.querySelector(selector);
const dom = {
  picker: $('#door-picker'), count: $('#door-count'), status: $('#status-card'), statusCaption: $('#status-caption'),
  statusTitle: $('#status-title'), statusDetail: $('#status-detail'), statusTimestamp: $('#status-timestamp'),
  confirm: $('#confirm-button'), add: $('#add-door'), rename: $('#rename-door'), remove: $('#delete-door'),
  history: $('#history-list'), historyCount: $('#history-count'), clear: $('#clear-history'),
  dialog: $('#door-dialog'), form: $('#door-form'), title: $('#dialog-title'), name: $('#door-name'),
  error: $('#dialog-error'), save: $('#save-door'), announce: $('#announcement')
};

let state = load();
let filter = 'all';
let editingId = null;
const dateFormatter = new Intl.DateTimeFormat('es-UY', { dateStyle: 'full', timeStyle: 'short' });
const timeFormatter = new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'short', year: 'numeric' });

function load() {
  try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? normalizeState(JSON.parse(stored)) : initialState(); }
  catch { return initialState(); }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { announce('No se pudo guardar en este navegador. Revisá el almacenamiento disponible.'); return false; }
}
function uid() { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function announce(message) { dom.announce.textContent = ''; requestAnimationFrame(() => { dom.announce.textContent = message; }); }
function update(next) { state = next; persist(); render(); }
function activeDoor() { return state.doors.find((door) => door.id === state.selectedDoorId) ?? state.doors[0]; }
function timeAgo(timestamp) {
  const mins = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} ${hrs === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
}
function renderPicker() {
  dom.picker.replaceChildren();
  for (const door of state.doors) {
    const option = document.createElement('option'); option.value = door.id; option.textContent = door.name; dom.picker.append(option);
  }
  dom.picker.value = state.selectedDoorId;
  dom.count.textContent = `${state.doors.length} ${state.doors.length === 1 ? 'puerta' : 'puertas'}`;
  dom.remove.disabled = state.doors.length === 1;
}
function renderStatus() {
  const door = activeDoor();
  const latest = lastConfirmation(state, door.id);
  dom.status.classList.toggle('confirmed', Boolean(latest));
  dom.statusCaption.textContent = latest ? 'ÚLTIMA CONFIRMACIÓN REGISTRADA' : 'SIN CONFIRMACIÓN REGISTRADA';
  dom.statusTitle.textContent = latest ? 'Sí, lo registraste.' : 'Todavía no hay registro.';
  dom.statusDetail.textContent = latest ? `Confirmaste el cierre de “${door.name}”.` : 'Después de comprobar la puerta, tocá el botón para guardar la hora.';
  dom.statusTimestamp.hidden = !latest;
  if (latest) { dom.statusTimestamp.textContent = `${timeAgo(latest.timestamp)} · ${dateFormatter.format(new Date(latest.timestamp))}`; }
}
function historyItem(entry) {
  const li = document.createElement('li'); li.className = 'history-item';
  const icon = document.createElement('span'); icon.className = 'history-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = '✓';
  const info = document.createElement('span'); info.className = 'history-info';
  const name = document.createElement('strong'); name.textContent = entry.doorName;
  const date = document.createElement('span'); date.className = 'history-date'; date.textContent = dayFormatter.format(new Date(entry.timestamp));
  info.append(name, date);
  const time = document.createElement('time'); time.dateTime = new Date(entry.timestamp).toISOString(); time.textContent = timeFormatter.format(new Date(entry.timestamp));
  li.append(icon, info, time); return li;
}
function renderHistory() {
  const entries = filter === 'selected' ? state.events.filter((entry) => entry.doorId === state.selectedDoorId) : state.events;
  dom.historyCount.textContent = `${entries.length} ${entries.length === 1 ? 'registro' : 'registros'}`;
  dom.history.replaceChildren();
  if (!entries.length) {
    const li = document.createElement('li'); li.className = 'empty-history';
    li.innerHTML = '<span class="empty-symbol" aria-hidden="true">↺</span><strong>Todavía no hay movimientos</strong><span>Tus confirmaciones van a aparecer acá.</span>';
    dom.history.append(li);
  } else {
    for (const entry of entries.slice(0, 50)) dom.history.append(historyItem(entry));
    if (entries.length > 50) {
      const li = document.createElement('li'); li.className = 'history-more'; li.textContent = `Mostrando los 50 registros más recientes de ${entries.length}.`; dom.history.append(li);
    }
  }
  dom.clear.disabled = !state.events.length;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function render() { renderPicker(); renderStatus(); renderHistory(); }
function openDoorDialog(id = null) {
  editingId = id;
  const door = state.doors.find((d) => d.id === id);
  dom.title.textContent = id ? 'Renombrar puerta' : 'Agregar una puerta';
  dom.save.textContent = id ? 'Guardar cambios' : 'Guardar puerta';
  dom.name.value = door?.name ?? '';
  dom.error.hidden = true;
  dom.dialog.showModal();
  dom.name.focus(); dom.name.select();
}
function handleError(error) { dom.error.textContent = error.message || 'Ocurrió un error.'; dom.error.hidden = false; }

// Every confirmation is initiated by the user, after a physical check. No automatic lock inference.
dom.confirm.addEventListener('click', () => {
  const selected = activeDoor();
  update(confirmDoor(state, selected.id, Date.now(), uid()));
  dom.confirm.classList.remove('pulse'); void dom.confirm.offsetWidth; dom.confirm.classList.add('pulse');
  announce(`Confirmación de ${selected.name} registrada. Recordá que esto no verifica el estado físico de la puerta.`);
});
dom.picker.addEventListener('change', (event) => {
  state = { ...state, selectedDoorId: event.target.value }; persist(); render();
});
dom.add.addEventListener('click', () => openDoorDialog());
dom.rename.addEventListener('click', () => openDoorDialog(activeDoor().id));
dom.remove.addEventListener('click', () => {
  const door = activeDoor();
  if (!window.confirm(`¿Eliminar “${door.name}”? El historial anterior se conservará.`)) return;
  try { update(removeDoor(state, door.id)); announce('Puerta eliminada.'); } catch (error) { announce(error.message); }
});
dom.form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    if (editingId) update(renameDoor(state, editingId, dom.name.value));
    else update(addDoor(state, dom.name.value, uid()));
    dom.dialog.close(); announce(editingId ? 'Nombre actualizado.' : 'Puerta agregada.');
  } catch (error) { handleError(error); }
});
$('#close-dialog').addEventListener('click', () => dom.dialog.close());
$('#cancel-dialog').addEventListener('click', () => dom.dialog.close());
dom.dialog.addEventListener('click', (event) => { if (event.target === dom.dialog) dom.dialog.close(); });
dom.clear.addEventListener('click', () => {
  if (!state.events.length) return;
  if (window.confirm('¿Borrar todo el historial de confirmaciones? Esta acción no se puede deshacer.')) {
    update(clearHistory(state)); announce('Historial borrado.');
  }
});
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter; renderHistory(); }));

render();
setInterval(renderStatus, 60_000);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

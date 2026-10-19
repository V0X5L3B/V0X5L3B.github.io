// Page Not Found gate. Tab or Ctrl (or a long press on the sign) opens the terminal.
// Only a salted PBKDF2 hash of the password is stored here, never the password itself.
const SALT = 'v0x5l3b-gate';
const ROUNDS = 150000;
const HASH = '';
const KEY = 'v0x-gate';

const $ = (id) => document.getElementById(id);
const notfound = $('notfound');
const term = $('term');
const log = $('term-log');
const form = $('term-form');
const input = $('term-input');
const inside = $('inside');
let busy = false;

function line(text, cls) {
  const p = document.createElement('p');
  p.textContent = text;
  if (cls) p.className = cls;
  log.appendChild(p);
  $('term-body').scrollTop = 1e9;
}

function openTerm() {
  if (!term.hidden || !inside.hidden) return;
  term.hidden = false;
  if (!log.childElementCount) line('enter password', 'dim');
  input.focus();
}

function closeTerm() {
  term.hidden = true;
  input.value = '';
  input.blur();
}

function unlock() {
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  closeTerm();
  notfound.hidden = true;
  inside.hidden = false;
  document.title = 'v0x5l3b';
}

function lock() {
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  inside.hidden = true;
  notfound.hidden = false;
  log.textContent = '';
  document.title = 'Page Not Found';
}

async function hash(text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(text), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: ROUNDS }, key, 256);
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy) return;
  const value = input.value;
  input.value = '';
  if (!value) return;
  line('password: ' + '*'.repeat(value.length));
  busy = true;
  let ok = false;
  try { ok = HASH !== '' && (await hash(value)) === HASH; } catch (err) { ok = false; }
  busy = false;
  if (ok) {
    line('access granted', 'ok');
    setTimeout(unlock, 500);
  } else {
    line('access denied', 'err');
    input.focus();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !term.hidden) { closeTerm(); return; }
  if (term.hidden && inside.hidden && (e.key === 'Tab' || e.key === 'Control')) {
    e.preventDefault();
    openTerm();
  }
});

$('term-close').addEventListener('click', closeTerm);
term.addEventListener('click', () => input.focus());
$('lock').addEventListener('click', lock);

// Phones have no Tab or Ctrl key, so a long press on the sign opens the terminal too.
let pressTimer = 0;
const stop = $('stop');
stop.addEventListener('pointerdown', () => { pressTimer = setTimeout(openTerm, 700); });
['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => stop.addEventListener(t, () => clearTimeout(pressTimer)));
stop.addEventListener('contextmenu', (e) => e.preventDefault());

try { if (sessionStorage.getItem(KEY) === '1') unlock(); } catch (e) {}

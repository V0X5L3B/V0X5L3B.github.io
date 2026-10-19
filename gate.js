// Page Not Found gate. Tab or Ctrl (or a long press on the sign) opens the terminal.
// Only a salted PBKDF2 hash of the password is stored here, never the password itself.
const SALT = 'v0x5l3b-gate';
const ROUNDS = 150000;
const HASH = 'a6e4b2c9f10ab2baf843a5fbb7e15dde20fff80693671fb30bca392a98b9a836';
const KEY = 'v0x-gate';
const PROMPT = 'guest@v0x5l3b ~ % ';
const TRIES = 3;

const $ = (id) => document.getElementById(id);
const notfound = $('notfound');
const term = $('term');
const body = $('term-body');
const log = $('term-log');
const form = $('term-form');
const input = $('term-input');
const promptEl = $('term-prompt');
const typed = $('term-typed');
const title = $('term-title');
const inside = $('inside');

let mode = 'shell'; // shell | pass | busy
let tries = 0;
let opened = false;

function line(text) {
  const p = document.createElement('p');
  p.textContent = text;
  log.appendChild(p);
  body.scrollTop = 1e9;
}

function setMode(next) {
  mode = next;
  promptEl.textContent = next === 'shell' ? PROMPT : next === 'pass' ? 'Password:' : '';
  title.textContent = next === 'shell' ? 'guest — -zsh — 80×24' : 'guest — unlock — 80×24';
  form.classList.toggle('is-busy', next === 'busy');
  input.type = next === 'pass' ? 'password' : 'text';
  input.value = '';
  typed.textContent = '';
  body.scrollTop = 1e9;
}

function stamp() {
  const d = new Date();
  const parts = d.toString().split(' '); // Mon Oct 19 2026 22:14:43 ...
  return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[4]}`;
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function typeCommand(cmd) {
  setMode('busy');
  promptEl.textContent = PROMPT;
  for (const ch of cmd) {
    typed.textContent += ch;
    await wait(70 + Math.random() * 60);
  }
  await wait(180);
  line(PROMPT + cmd);
  startUnlock();
}

function startUnlock() {
  tries = 0;
  setMode('pass');
}

function openTerm() {
  if (!term.hidden || !inside.hidden) return;
  term.hidden = false;
  input.focus();
  if (!opened) {
    opened = true;
    line(`Last login: ${stamp()} on ttys001`);
    typeCommand('unlock');
  }
}

function closeTerm() {
  term.hidden = true;
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
  opened = false;
  setMode('shell');
  document.title = 'Page Not Found';
}

async function hash(text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(text), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: ROUNDS }, key, 256);
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword(value) {
  line('Password:');
  setMode('busy');
  let ok = false;
  try { ok = (await hash(value)) === HASH; } catch (err) { ok = false; }
  if (ok) {
    await wait(300);
    unlock();
    return;
  }
  await wait(900); // a real login pauses before saying no
  tries += 1;
  if (tries < TRIES) {
    line('Sorry, try again.');
    setMode('pass');
  } else {
    line(`unlock: ${TRIES} incorrect password attempts`);
    setMode('shell');
  }
}

function runCommand(raw) {
  line(PROMPT + raw);
  const cmd = raw.trim();
  const [name, ...args] = cmd.split(/\s+/);
  switch (name) {
    case '': break;
    case 'unlock': case 'login': case 'sudo': startUnlock(); return;
    case 'clear': log.textContent = ''; break;
    case 'exit': line('[Process completed]'); setTimeout(() => { closeTerm(); log.textContent = ''; opened = false; }, 600); break;
    case 'whoami': line('guest'); break;
    case 'pwd': line('/Users/guest'); break;
    case 'ls': break;
    case 'date': line(new Date().toString().replace(/ \(.*\)$/, '')); break;
    case 'echo': line(args.join(' ')); break;
    case 'help': line('unlock  clear  whoami  pwd  ls  date  echo  exit'); break;
    default: line(`zsh: command not found: ${name}`);
  }
  setMode('shell');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value;
  if (mode === 'pass') checkPassword(value);
  else if (mode === 'shell') runCommand(value);
});

input.addEventListener('input', () => {
  if (mode === 'busy') { input.value = ''; return; }
  typed.textContent = mode === 'pass' ? '' : input.value; // passwords never echo
  body.scrollTop = 1e9;
});

input.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) e.preventDefault();
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
    if (mode === 'busy') return;
    line((mode === 'pass' ? 'Password:' : PROMPT + input.value) + '^C');
    setMode('shell');
  }
  if (e.ctrlKey && e.key === 'l') { e.preventDefault(); log.textContent = ''; }
});

document.addEventListener('keydown', (e) => {
  if (!term.hidden) {
    if (e.key === 'Escape') closeTerm();
    else if (e.key === 'Tab') e.preventDefault();
    if (document.activeElement !== input) input.focus();
    return;
  }
  if (inside.hidden && (e.key === 'Tab' || e.key === 'Control')) {
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

setMode('shell');
try { if (sessionStorage.getItem(KEY) === '1') unlock(); } catch (e) {}

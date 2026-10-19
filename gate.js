// Page Not Found gate. Tab or Ctrl (or a long press on the X) opens a terminal modelled on
// macOS Terminal + zsh. Only a salted PBKDF2 hash of the password is stored here, never the
// password itself. The check lowercases input so any capitalization works.
const SALT = 'v0x5l3b-gate';
const ROUNDS = 150000;
const HASH = 'f3a2420596a5c871d749ebce2ed6c068377d9d98fd2bcd383279ebd8c415d41d';
const KEY = 'v0x-gate';
const LAST = 'v0x-lastlogin';
const USER = 'guest';
const HOST = 'v0x5l3b';
const HOME = '/Users/guest';
const TRIES = 3;

const $ = (id) => document.getElementById(id);
const notfound = $('notfound');
const term = $('term');
const bar = $('term-bar');
const body = $('term-body');
const log = $('term-log');
const lineEl = $('term-line');
const input = $('term-input');
const promptEl = $('term-prompt');
const beforeEl = $('term-before');
const cursorEl = $('term-cursor');
const afterEl = $('term-after');
const title = $('term-title');
const inside = $('inside');

/* ---------- a small read-only file system ---------- */

const loaded = new Date();
const dir = (children = {}) => ({ type: 'dir', children });
const file = (content = '') => ({ type: 'file', content });
const FS = dir({
  Applications: dir(),
  Library: dir(),
  System: dir(),
  Users: dir({
    Shared: dir(),
    guest: dir({
      '.zshrc': file('export PATH="/opt/homebrew/bin:$PATH"\nalias ll="ls -la"\n'),
      Desktop: dir(),
      Documents: dir(),
      Downloads: dir(),
      Library: dir(),
      Movies: dir(),
      Music: dir(),
      Pictures: dir(),
      Public: dir(),
    }),
  }),
  Volumes: dir(),
  bin: dir(),
  cores: dir(),
  dev: dir(),
  etc: dir(),
  opt: dir(),
  private: dir(),
  sbin: dir(),
  tmp: dir(),
  usr: dir(),
  var: dir(),
});

function resolve(path) {
  let parts;
  if (path.startsWith('/')) parts = [];
  else if (path === '~' || path.startsWith('~/')) { parts = HOME.split('/').filter(Boolean); path = path.slice(1); }
  else parts = cwd.split('/').filter(Boolean);
  for (const seg of path.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return '/' + parts.join('/');
}

function nodeAt(abs) {
  let node = FS;
  for (const seg of abs.split('/').filter(Boolean)) {
    if (node.type !== 'dir' || !Object.prototype.hasOwnProperty.call(node.children, seg)) return null;
    node = node.children[seg];
  }
  return node;
}

/* ---------- session state ---------- */

let mode = 'shell'; // shell | pass | busy | done
let cwd = HOME;
let oldpwd = HOME;
let history = [];
let hIdx = 0;
let draft = '';
let authCmd = 'unlock';
let tries = 0;
let started = false;
let autoText = '';
let typingAhead = false; // Enter pressed while the intro was still typing
let intro = false;
let session = 0; // bumps on close so a half-typed intro stops

const COMMANDS = ['cat', 'cd', 'clear', 'date', 'echo', 'exit', 'history', 'hostname', 'll', 'ls', 'man',
  'mkdir', 'pwd', 'rm', 'sudo', 'touch', 'uname', 'unlock', 'uptime', 'which', 'whoami'];
const BUILTINS = ['cd', 'echo', 'exit', 'history', 'pwd', 'which'];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, '0');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const stamp = (d) => `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${clock(d)}`;
const lsDate = `${MONTHS[loaded.getMonth()]} ${String(loaded.getDate()).padStart(2)} ${pad(loaded.getHours())}:${pad(loaded.getMinutes())}`;

function tz() {
  try { return new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop(); } catch (e) { return 'UTC'; }
}

function dirLabel() {
  if (cwd === HOME) return '~';
  if (cwd === '/') return '/';
  return cwd.split('/').pop();
}

const shellPrompt = () => `${USER}@${HOST} ${dirLabel()} % `;

/* ---------- output ---------- */

function out(text = '') {
  for (const row of String(text).split('\n')) {
    const p = document.createElement('p');
    p.textContent = row;
    log.appendChild(p);
  }
  body.scrollTop = body.scrollHeight;
}

function cols() {
  const w = $('term-measure').getBoundingClientRect().width / 10 || 7.2;
  return Math.max(20, Math.floor((body.clientWidth - 10) / w));
}

function rows() {
  const lh = parseFloat(getComputedStyle(body).lineHeight) || 15.6;
  return Math.max(5, Math.floor((body.clientHeight - 6) / lh));
}

function columns(names) {
  if (!names.length) return '';
  const w = Math.ceil((Math.max(...names.map((n) => n.length)) + 1) / 8) * 8;
  const per = Math.max(1, Math.floor(cols() / w));
  const height = Math.ceil(names.length / per);
  const lines = [];
  for (let r = 0; r < height; r++) {
    let s = '';
    for (let c = 0; c < per; c++) {
      const n = names[c * height + r];
      if (n !== undefined) s += (c * height + r + height < names.length ? n.padEnd(w) : n);
    }
    lines.push(s);
  }
  return lines.join('\n');
}

function setTitle() {
  const job = mode === 'pass' || (mode === 'busy' && authCmd) ? authCmd : '-zsh';
  title.textContent = `${USER} — ${mode === 'done' ? '' : job + ' — '}${cols()}×${rows()}`;
}

/* ---------- the live input line ---------- */

function render() {
  lineEl.classList.toggle('is-typing', mode === 'busy');
  lineEl.classList.toggle('is-done', mode === 'done');
  if (mode === 'done') {
    promptEl.textContent = '';
    beforeEl.textContent = '';
    cursorEl.textContent = ' ';
    afterEl.textContent = '';
    return;
  }
  let text;
  let pos;
  if (mode === 'busy') {
    text = autoText;
    pos = text.length;
  } else {
    const v = input.value;
    text = mode === 'pass' ? '*'.repeat(v.length) : v;
    pos = input.selectionStart == null ? v.length : Math.min(input.selectionStart, v.length);
  }
  beforeEl.textContent = text.slice(0, pos);
  cursorEl.textContent = text[pos] || ' ';
  afterEl.textContent = text.slice(pos + 1);
  body.scrollTop = body.scrollHeight;
}

function setMode(next, promptText) {
  mode = next;
  input.type = next === 'pass' ? 'password' : 'text';
  if (promptText !== undefined) promptEl.textContent = promptText;
  else if (next === 'shell') promptEl.textContent = shellPrompt();
  else if (next === 'pass') promptEl.textContent = 'Password:';
  if (next !== 'busy') {
    input.value = '';
    autoText = '';
  }
  setTitle();
  render();
}

function echoLine() {
  const v = input.value;
  out(promptEl.textContent + (mode === 'pass' ? '*'.repeat(v.length) : v));
}

/* ---------- unlock flow ---------- */

async function hash(text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(text), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: ROUNDS }, key, 256);
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
}

function askPassword(cmd) {
  authCmd = cmd;
  tries = 0;
  setMode('pass');
}

async function checkPassword() {
  const value = input.value;
  echoLine();
  autoText = '';
  setMode('busy', '');
  let ok = false;
  try { ok = (await hash(value.trim().toLowerCase())) === HASH; } catch (err) { ok = false; }
  if (ok) {
    await wait(350);
    unlock();
    return;
  }
  await wait(1100); // sudo pauses before saying no
  tries += 1;
  if (tries < TRIES) {
    out('Sorry, try again.');
    setMode('pass');
  } else {
    out(`${authCmd}: ${TRIES} incorrect password attempts`);
    authCmd = '';
    setMode('shell');
  }
}

async function autoType(cmd) {
  authCmd = '';
  typingAhead = false;
  intro = true;
  const id = session;
  setMode('busy', shellPrompt());
  await wait(500);
  for (const ch of cmd) {
    if (id !== session) return;
    autoText += ch;
    render();
    await wait(55 + Math.random() * 70);
  }
  await wait(160);
  if (id !== session) return;
  out(shellPrompt() + cmd);
  intro = false;
  const early = input.value; // keep anything typed while the command was being typed
  askPassword(cmd);
  input.value = early;
  input.setSelectionRange(early.length, early.length);
  render();
  if (typingAhead) { typingAhead = false; if (early) checkPassword(); }
}

/* ---------- commands ---------- */

function tokenize(line) {
  const env = { HOME, USER, LOGNAME: USER, SHELL: '/bin/zsh', PWD: cwd, OLDPWD: oldpwd, PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin', TERM: 'xterm-256color', HOST };
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  const expand = (s) => s.replace(/\$\{?([A-Za-z_]+)\}?/g, (_, k) => env[k] ?? '');
  while ((m = re.exec(line))) {
    if (m[1] !== undefined) tokens.push(expand(m[1]));
    else if (m[2] !== undefined) tokens.push(m[2]);
    else tokens.push(expand(m[3] === '~' ? HOME : m[3].replace(/^~\//, HOME + '/')));
  }
  return tokens;
}

function ls(args) {
  const flags = args.filter((a) => a.startsWith('-') && a.length > 1).join('');
  const targets = args.filter((a) => !a.startsWith('-') || a.length === 1);
  const all = flags.includes('a');
  const long = flags.includes('l');
  const path = targets[0] || '.';
  const abs = resolve(path);
  const node = nodeAt(abs);
  if (!node) return out(`ls: ${path}: No such file or directory`);
  if (node.type === 'file') {
    return out(long ? `-rw-r--r--  1 ${USER}  staff  ${String(node.content.length).padStart(4)} ${lsDate} ${path}` : path);
  }
  let names = Object.keys(node.children).sort();
  if (!all) names = names.filter((n) => !n.startsWith('.'));
  if (all) names = ['.', '..', ...names];
  if (!long) return names.length ? out(columns(names)) : undefined;
  const mine = abs === HOME || abs.startsWith(HOME + '/');
  const owner = mine ? `${USER}  staff` : 'root  wheel';
  const perm = mine ? 'drwx------' : 'drwxr-xr-x';
  const lines = [`total ${names.length * 8}`];
  for (const n of names) {
    const child = n === '.' || n === '..' ? dir() : node.children[n];
    if (child.type === 'dir') {
      const count = Object.keys(child.children).length + 2;
      lines.push(`${perm}  ${String(count).padStart(2)} ${owner}  ${String(count * 32).padStart(4)} ${lsDate} ${n}`);
    } else {
      lines.push(`-rw-r--r--   1 ${owner}  ${String(child.content.length).padStart(4)} ${lsDate} ${n}`);
    }
  }
  out(lines.join('\n'));
}

function run(raw) {
  const line = raw.trim();
  if (!line) return;
  history.push(raw);
  let [name, ...args] = tokenize(line);
  if (name === undefined) return;
  if (name === 'll') { name = 'ls'; args = ['-la', ...args]; }
  switch (name) {
    case 'unlock':
    case 'login':
      return askPassword(name);
    case 'sudo':
      if (!args.length) return out('usage: sudo -h | -K | -k | -V\nusage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]\nusage: sudo [-ABbEHkNnPS] [-C num] [-D directory] [-g group] [-h host] [-p prompt] [-R directory] [-T timeout] [-u user] [VAR=value] [-i | -s] [command [arg ...]]');
      return askPassword('sudo');
    case 'clear':
      log.textContent = '';
      return;
    case 'exit':
      out('\nSaving session...\n...copying shared history...\n...saving history...truncating history files...\n...completed.\n\n[Process completed]');
      return 'done';
    case 'whoami': return out(USER);
    case 'hostname': return out(HOST);
    case 'pwd': return out(cwd);
    case 'echo': return out(args.filter((a, i) => !(i === 0 && a === '-n')).join(' '));
    case 'ls': return ls(args);
    case 'cd': {
      let target = args[0] || HOME;
      if (target === '-') { target = oldpwd; out(target === HOME ? '~' : target); }
      const abs = resolve(target);
      const node = nodeAt(abs);
      if (!node) return out(`cd: no such file or directory: ${args[0]}`);
      if (node.type !== 'dir') return out(`cd: not a directory: ${args[0]}`);
      oldpwd = cwd;
      cwd = abs;
      return;
    }
    case 'cat': {
      const lines = [];
      for (const a of args) {
        const node = nodeAt(resolve(a));
        if (!node) lines.push(`cat: ${a}: No such file or directory`);
        else if (node.type === 'dir') lines.push(`cat: ${a}: Is a directory`);
        else lines.push(node.content.replace(/\n$/, ''));
      }
      return lines.length ? out(lines.join('\n')) : undefined;
    }
    case 'mkdir':
    case 'touch':
    case 'rm':
      if (!args.length) {
        return out({
          mkdir: 'usage: mkdir [-pv] [-m mode] directory_name ...',
          touch: 'usage: touch [-A [-][[hh]mm]SS] [-achm] [-r file] [-t [[CC]YY]MMDDhhmm[.SS]]\n       [-d YYYY-MM-DDThh:mm:SS[.frac][tz]] file ...',
          rm: 'usage: rm [-f | -i] [-dIPRrvWx] file ...\n       unlink [--] file',
        }[name]);
      }
      return out(args.filter((a) => !a.startsWith('-')).map((a) => `${name}: ${a}: Read-only file system`).join('\n'));
    case 'date': {
      const d = new Date();
      return out(`${stamp(d)} ${tz()} ${d.getFullYear()}`);
    }
    case 'uptime': {
      const d = new Date();
      return out(`${pad(d.getHours())}:${pad(d.getMinutes())}  up 3 days,  4:12, 2 users, load averages: 1.42 1.57 1.63`);
    }
    case 'uname': {
      const f = args.join('');
      if (f.includes('a')) return out(`Darwin ${HOST} 24.6.0 Darwin Kernel Version 24.6.0: Mon Jul 14 11:28:17 PDT 2025; root:xnu-11417.140.69~1/RELEASE_ARM64_T6000 arm64`);
      if (f.includes('m')) return out('arm64');
      if (f.includes('r')) return out('24.6.0');
      if (f.includes('n')) return out(HOST);
      return out('Darwin');
    }
    case 'history':
      return out(history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n'));
    case 'man':
      if (!args.length) return out("What manual page do you want?\nFor example, try 'man man'.");
      return out(args.map((a) => `No manual entry for ${a}`).join('\n'));
    case 'which':
      return out(args.map((a) => {
        if (a === 'll') return 'll: aliased to ls -la';
        if (BUILTINS.includes(a)) return `${a}: shell built-in command`;
        if (a === 'unlock') return '/usr/local/bin/unlock';
        if (COMMANDS.includes(a)) return ['clear', 'uptime', 'which', 'whoami', 'sudo', 'man'].includes(a) ? `/usr/bin/${a}` : `/bin/${a}`;
        return `${a} not found`;
      }).join('\n'));
    default:
      if (name.includes('/')) {
        const node = nodeAt(resolve(name));
        if (!node) return out(`zsh: no such file or directory: ${name}`);
        return out(`zsh: permission denied: ${name}`);
      }
      return out(`zsh: command not found: ${name}`);
  }
}

/* ---------- tab completion ---------- */

function complete() {
  const v = input.value;
  const pos = input.selectionStart ?? v.length;
  if (pos !== v.length) return;
  const start = v.lastIndexOf(' ') + 1;
  const partial = v.slice(start);
  const isCmd = v.slice(0, start).trim() === '';
  let options;
  let base = '';
  let typedName = partial;
  if (isCmd && !partial.includes('/')) {
    options = COMMANDS.filter((c) => c.startsWith(partial)).map((c) => ({ name: c, tail: ' ' }));
  } else {
    const slash = partial.lastIndexOf('/');
    base = slash >= 0 ? partial.slice(0, slash + 1) : '';
    typedName = partial.slice(slash + 1);
    const node = nodeAt(resolve(base || '.'));
    if (!node || node.type !== 'dir') return;
    options = Object.keys(node.children)
      .filter((n) => n.startsWith(typedName) && (typedName.startsWith('.') || !n.startsWith('.')))
      .sort()
      .map((n) => ({ name: n, tail: node.children[n].type === 'dir' ? '/' : ' ' }));
  }
  if (!options.length) return;
  if (options.length === 1) {
    input.value = v.slice(0, start) + base + options[0].name + options[0].tail;
  } else {
    let common = options[0].name;
    for (const o of options) while (!o.name.startsWith(common)) common = common.slice(0, -1);
    if (common.length > typedName.length) {
      input.value = v.slice(0, start) + base + common;
    } else {
      echoLine();
      out(columns(options.map((o) => o.name + (o.tail === '/' ? '/' : ''))));
    }
  }
  input.setSelectionRange(input.value.length, input.value.length);
  render();
}

/* ---------- keyboard ---------- */

function submit() {
  if (mode === 'pass') { checkPassword(); return; }
  if (mode !== 'shell') return;
  const v = input.value;
  echoLine();
  authCmd = '';
  const result = run(v);
  hIdx = history.length;
  draft = '';
  if (result === 'done') { setMode('done'); setTitle(); return; }
  if (mode === 'pass') return; // a command asked for the password
  setMode('shell');
}

function moveTo(i) { input.setSelectionRange(i, i); render(); }

input.addEventListener('keydown', (e) => {
  if (e.isComposing) return;
  const k = e.key;
  if (mode === 'done') { e.preventDefault(); return; }
  if (k === 'Enter') { e.preventDefault(); if (intro) typingAhead = true; else submit(); return; }
  if (k === 'Tab') { e.preventDefault(); if (mode === 'shell') complete(); return; }
  if (e.ctrlKey && !e.metaKey && !e.altKey) {
    const v = input.value;
    const pos = input.selectionStart ?? v.length;
    const c = k.toLowerCase();
    if (c === 'c') {
      e.preventDefault();
      if (mode === 'busy') return;
      out(promptEl.textContent + (mode === 'pass' ? '*'.repeat(v.length) : v) + '^C');
      authCmd = '';
      setMode('shell');
      return;
    }
    if (c === 'l') { e.preventDefault(); log.textContent = ''; render(); return; }
    if (c === 'd') { e.preventDefault(); if (mode === 'shell' && !v) { out(promptEl.textContent); run('exit'); setMode('done'); } return; }
    if (c === 'a') { e.preventDefault(); moveTo(0); return; }
    if (c === 'e') { e.preventDefault(); moveTo(v.length); return; }
    if (c === 'u') { e.preventDefault(); input.value = v.slice(pos); moveTo(0); return; }
    if (c === 'k') { e.preventDefault(); input.value = v.slice(0, pos); moveTo(pos); return; }
    if (c === 'w') {
      e.preventDefault();
      const head = v.slice(0, pos).replace(/\S+\s*$/, '');
      input.value = head + v.slice(pos);
      moveTo(head.length);
      return;
    }
  }
  if (e.metaKey && k.toLowerCase() === 'k') { e.preventDefault(); log.textContent = ''; render(); return; }
  if (mode === 'shell' && (k === 'ArrowUp' || k === 'ArrowDown')) {
    e.preventDefault();
    if (k === 'ArrowUp' && hIdx > 0) {
      if (hIdx === history.length) draft = input.value;
      hIdx -= 1;
      input.value = history[hIdx];
    } else if (k === 'ArrowDown' && hIdx < history.length) {
      hIdx += 1;
      input.value = hIdx === history.length ? draft : history[hIdx];
    }
    moveTo(input.value.length);
    return;
  }
  if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); return; }
  requestAnimationFrame(render);
});

input.addEventListener('input', render);
input.addEventListener('select', render);
document.addEventListener('selectionchange', () => { if (document.activeElement === input) render(); });
input.addEventListener('focus', () => { term.classList.add('is-active'); render(); });
input.addEventListener('blur', () => term.classList.remove('is-active'));

/* ---------- window ---------- */

function focusInput() {
  if (term.hidden) return;
  input.focus({ preventScroll: true });
}

function openTerm() {
  if (!inside.hidden) return;
  if (!term.hidden) { focusInput(); return; }
  term.hidden = false;
  focusInput();
  if (!started) {
    started = true;
    let prev = null;
    try { prev = localStorage.getItem(LAST); localStorage.setItem(LAST, new Date().toISOString()); } catch (e) {}
    const when = prev && !isNaN(Date.parse(prev)) ? new Date(prev) : new Date();
    out(`Last login: ${stamp(when)} on ttys00${1 + Math.floor(Math.random() * 3)}`);
    autoType('unlock');
  } else {
    setTitle();
  }
}

function resetSession() {
  session += 1;
  intro = false;
  log.textContent = '';
  started = false;
  cwd = HOME;
  oldpwd = HOME;
  history = [];
  hIdx = 0;
  draft = '';
  authCmd = '';
  setMode('shell');
}

function closeTerm() {
  term.hidden = true;
  input.blur();
  term.classList.remove('is-max');
  term.style.setProperty('--dx', '0px');
  term.style.setProperty('--dy', '0px');
  resetSession();
}

function minimize() {
  term.hidden = true;
  input.blur();
}

function toggleMax() {
  term.classList.toggle('is-max');
  setTitle();
  focusInput();
}

function unlock() {
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  term.hidden = true;
  input.blur();
  resetSession();
  notfound.hidden = true;
  inside.hidden = false;
  document.title = 'v0x5l3b';
}

function lock() {
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  inside.hidden = true;
  notfound.hidden = false;
  document.title = 'Page Not Found';
}

$('term-close').addEventListener('click', closeTerm);
$('term-min').addEventListener('click', minimize);
$('term-max').addEventListener('click', toggleMax);
bar.addEventListener('dblclick', (e) => { if (!e.target.closest('.dot')) toggleMax(); });
$('lock').addEventListener('click', lock);

// Click anywhere in the window to type, unless the click was selecting text.
term.addEventListener('click', (e) => {
  if (e.target.closest('.dot')) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) focusInput();
});

// Drag the window by its title bar.
let drag = null;
bar.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.dot') || term.classList.contains('is-max')) return;
  const dx = parseFloat(term.style.getPropertyValue('--dx')) || 0;
  const dy = parseFloat(term.style.getPropertyValue('--dy')) || 0;
  drag = { x: e.clientX - dx, y: e.clientY - dy };
  bar.setPointerCapture(e.pointerId);
});
bar.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = term.getBoundingClientRect();
  const maxX = (innerWidth + r.width) / 2 - 60;
  const maxY = (innerHeight - r.height) / 2;
  const nx = Math.max(-maxX, Math.min(maxX, e.clientX - drag.x));
  const ny = Math.max(-maxY, Math.min(innerHeight / 2 + r.height / 2 - 40, e.clientY - drag.y));
  term.style.setProperty('--dx', nx + 'px');
  term.style.setProperty('--dy', ny + 'px');
});
['pointerup', 'pointercancel'].forEach((t) => bar.addEventListener(t, () => { drag = null; focusInput(); }));

if (window.ResizeObserver) new ResizeObserver(() => { if (!term.hidden) setTitle(); }).observe(body);

document.addEventListener('keydown', (e) => {
  if (!inside.hidden) return;
  if (term.hidden) {
    if (e.key === 'Tab' || e.key === 'Control') { e.preventDefault(); openTerm(); }
    return;
  }
  if (document.activeElement !== input && !e.metaKey) {
    if (e.key === 'Tab') e.preventDefault();
    focusInput();
  }
});

// Phones have no Tab or Ctrl key, so a long press on the X opens the terminal too.
let pressTimer = 0;
const mark = $('mark');
mark.addEventListener('pointerdown', () => { pressTimer = setTimeout(openTerm, 700); });
['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => mark.addEventListener(t, () => clearTimeout(pressTimer)));
mark.addEventListener('contextmenu', (e) => e.preventDefault());

setMode('shell');
try { if (sessionStorage.getItem(KEY) === '1') unlock(); } catch (e) {}

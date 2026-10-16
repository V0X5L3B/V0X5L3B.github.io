/*
 * Automatic seasonal themes.
 * The month (visitor's local time) picks the holiday; months not listed use the default look.
 * Preview any one with  ?holiday=halloween  (or ?holiday=none). Visitors can switch it off in the footer.
 *
 * To add or change a holiday: edit HOLIDAYS below and the matching
 * :root[data-holiday="<id>"] colour block in assets/css/holidays.css.
 */

import { forestBackdrop, forestAir, forestFloor } from "./forest.js";
import { graveyardBackdrop, graveyardFloor, wakeFloatGhost } from "./graveyard.js";

const NS = "http://www.w3.org/2000/svg";
const OFF_KEY = "v0x-holiday";

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* Small flat SVG icons. Colours come from CSS vars (--c) where they should follow the palette. */
const F = 'fill="var(--c,currentColor)"';
const ICONS = {
  pumpkinPlain: `<svg viewBox="0 0 64 56"><path d="M30 14c-1-6 1-10 7-12l1.5 3.5c-3 1.2-4 3.4-3.6 7z" fill="#3f6f2d"/><ellipse cx="32" cy="34" rx="28" ry="20" fill="#cf6310"/><ellipse cx="32" cy="34" rx="18" ry="20" fill="#e57c1c"/><ellipse cx="32" cy="34" rx="8" ry="20" fill="#cf6310"/></svg>`,
  ghost: `<svg viewBox="0 0 40 48"><path d="M20 2C10 2 4 10 4 20v26l6-5 5 5 5-5 5 5 5-5 6 5V20C36 10 30 2 20 2z" fill="#f3f0ea" stroke="#9a94a6" stroke-width="1.2"/><ellipse cx="14" cy="20" rx="3" ry="4.2" fill="#1c1626"/><ellipse cx="26" cy="20" rx="3" ry="4.2" fill="#1c1626"/><ellipse cx="20" cy="29" rx="3.2" ry="4" fill="#1c1626"/></svg>`,
  bat: `<svg viewBox="0 0 48 24"><path ${F} d="M24 7l-2.5-5-1.5 5.5C16 5 8 5 0 1c3 4 3 9 7 11 2.5-2.5 6-3 8.5 0 1.5 3 4 5 8.5 11 4.5-6 7-8 8.5-11 2.5-3 6-2.5 8.5 0 4-2 4-7 7-11-8 4-16 4-20 5.500L26.500 2z"/></svg>`,
  cobweb: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M0 0L120 0M0 0L112 38M0 0L88 88M0 0L38 112M0 0L0 120"/><path d="M34 0Q30 30 0 34M64 0Q58 58 0 64M94 0Q84 84 0 94M118 0Q104 104 0 118"/></svg>`,
  leaf: `<svg viewBox="0 0 32 32"><path ${F} d="M16 2C8 8 3 16 8 25c2 3 6 5 8 6 2-1 6-3 8-6 5-9 0-17-8-23z"/><path d="M16 6v24" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/></svg>`,
  snow: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--c,#fff)" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M9 4l3 2.500 3-2.500M9 20l3-2.500 3 2.500"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path ${F} d="M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z"/></svg>`,
  clover: `<svg viewBox="0 0 24 24"><g ${F}><path transform="translate(12 12) rotate(0) scale(.62) translate(-12 -21)" d="M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z"/><path transform="translate(12 12) rotate(120) scale(.62) translate(-12 -21)" d="M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z"/><path transform="translate(12 12) rotate(240) scale(.62) translate(-12 -21)" d="M12 21s-8-5.200-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 5.800-8 11-8 11z"/></g><path d="M12 12q1 6 5 9" fill="none" stroke="var(--c,currentColor)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24"><path ${F} d="M12 2l2.900 6.600 7.100.7-5.400 4.700 1.600 7L12 17.300 5.800 21l1.600-7L2 9.300l7.100-.7z"/></svg>`,
  spark: `<svg viewBox="0 0 24 24"><path ${F} d="M12 1c.8 6 3 9.200 11 11-8 1.800-10.200 5-11 11-.8-6-3-9.200-11-11 8-1.800 10.200-5 11-11z"/></svg>`,
  confetti: `<svg viewBox="0 0 12 20"><rect ${F} x="2" y="1" width="8" height="18" rx="1.500"/></svg>`,
  spider: `<svg viewBox="0 0 24 26"><g fill="none" stroke="#7c6a92" stroke-width="1.200" stroke-linecap="round"><path d="M9 14L2 9M9 16L1 17M9.500 18L3 24M11 19L8 25M15 14l7-5M15 16l8 1M14.500 18l6.500 6M13 19l3 6"/></g><ellipse cx="12" cy="17" rx="5" ry="6" fill="#1c1626" stroke="#7c6a92" stroke-width="1"/><circle cx="12" cy="9.500" r="3.500" fill="#1c1626" stroke="#7c6a92" stroke-width="1"/><circle cx="10.600" cy="9" r=".8" fill="#ff4d4d"/><circle cx="13.400" cy="9" r=".8" fill="#ff4d4d"/><path d="M12 12.500l-1.600 3.500h3.200z" fill="#e8751a"/></svg>`,
  witch: `<svg viewBox="0 0 64 36"><path d="M2 27C18 24 38 26 60 22" stroke="#6b5585" stroke-width="2.600" stroke-linecap="round" fill="none"/><path d="M60 22l4-3-5 1.500 3 4z" fill="#6b5585"/><path d="M26 25c-1-7 1-11 5-12l4 1c3 2 4 6 3 10z" fill="#1c1626" stroke="#4b3a5c" stroke-width=".8"/><circle cx="35" cy="9" r="4.200" fill="#1c1626" stroke="#4b3a5c" stroke-width=".8"/><path d="M28 8.500l5-1 3-7c.5 3 1.500 5 3.500 6.500l3 .5c-2 1.500-5 2.500-8.500 2.500z" fill="#2a1d3a" stroke="#4b3a5c" stroke-width=".8"/><path d="M26 25c-5 1-9 3-12 7 6-1 9-3 14-3" fill="#1c1626" stroke="#4b3a5c" stroke-width=".8"/></svg>`,
  tree: `<svg viewBox="0 0 48 62"><path d="M24 9L12 26h6L8 42h8L4 56h40L32 42h8L30 26h6z" fill="#2f8f57"/><rect x="21" y="56" width="6" height="6" fill="#6b4a2a"/><path d="M24 0l1.800 4 4.200.4-3.200 2.800 1 4.200L24 9.200l-3.800 2.200 1-4.200L18 4.400l4.200-.4z" fill="#ffd166"/><circle cx="19" cy="34" r="1.800" fill="#ff4d5e"/><circle cx="29" cy="46" r="1.800" fill="#ffd166"/><circle cx="17" cy="48" r="1.800" fill="#5aa9ff"/><circle cx="26" cy="27" r="1.600" fill="#ffd166"/></svg>`,
  /* default forest scene */
};

/*
 * fx: floating particles   { icon, mode: fall|rise|drift, n, size:[min,max], colors:[1..3] (→ --fx1..3) }
 * row: icons shown in a decorative row above the footer
 * corners: cobwebs etc. in the hero corners;  float: a fixed bobbing icon (wakeFloat: its behaviour);  lights: string lights under the header
 */
export const HOLIDAYS = {
  halloween: {
    month: 9, name: "Halloween", greet: "Happy Halloween",
    fx: [
      { icon: "bat", mode: "drift", n: 3, size: [26, 40], colors: [1, 2, 3] },
      { icon: "leaf", mode: "fall", n: 5, size: [14, 22], colors: [4, 5, 6] },
      { icon: "ghost", mode: "float", n: 1, size: [30, 36], colors: [1] },
      { icon: "witch", mode: "drift", n: 1, size: [44, 52], colors: [1] },
    ],
    // painted night sky and hill behind the page, and a small graveyard above the footer (graveyard.js)
    backdrop: graveyardBackdrop, floor: graveyardFloor,
    corners: ["cobweb"], float: "ghost", wakeFloat: wakeFloatGhost, scene: true,
  },
  november: {
    month: 10, name: "Thanksgiving season", greet: "Happy Thanksgiving",
    fx: [{ icon: "leaf", mode: "fall", n: 16, size: [16, 30], colors: [1, 2, 3] }],
    row: ["leaf", "pumpkinPlain", "leaf", "pumpkinPlain", "pumpkinPlain", "leaf", "pumpkinPlain", "leaf"],
  },
  december: {
    month: 11, name: "Winter holidays", greet: "Happy holidays",
    fx: [{ icon: "snow", mode: "fall", n: 26, size: [10, 22], colors: [1, 2, 3] }],
    row: ["tree", "star", "tree", "tree", "star", "tree"], lights: true,
  },
  january: {
    month: 0, name: "New Year", greet: "Happy New Year",
    fx: [
      { icon: "confetti", mode: "fall", n: 20, size: [8, 14], colors: [1, 2, 3] },
      { icon: "spark", mode: "fall", n: 8, size: [12, 22], colors: [1, 1, 1] },
    ],
  },
  february: {
    month: 1, name: "Valentine's", greet: "Happy Valentine's",
    fx: [{ icon: "heart", mode: "rise", n: 16, size: [14, 28], colors: [1, 2, 3] }],
    row: ["heart", "heart", "heart", "heart", "heart"],
  },
  march: {
    month: 2, name: "St. Patrick's", greet: "Happy St. Patrick's",
    fx: [{ icon: "clover", mode: "fall", n: 16, size: [16, 30], colors: [1, 2, 3] }],
    row: ["clover", "clover", "clover", "clover", "clover"],
  },
  july: {
    month: 6, name: "Independence Day", greet: "Happy 4th of July",
    fx: [
      { icon: "star", mode: "fall", n: 14, size: [14, 26], colors: [1, 2, 3] },
      { icon: "spark", mode: "fall", n: 6, size: [12, 20], colors: [2, 2, 2] },
    ],
    row: ["star", "star", "star", "star", "star"],
  },
};

const known = (id) => typeof id === "string" && Object.hasOwn(HOLIDAYS, id);
const byMonth = (m) => Object.entries(HOLIDAYS).find(([, h]) => h.month === m)?.[0] ?? null;

let state = { id: null, override: null, none: false };
let decor = null;           // the fixed fx layer
let extras = [];            // other nodes we inserted (rows, corners, lights, ...)
let scenes = [];            // painted backdrops, which also hold listeners

const rand = (a, b) => a + Math.random() * (b - a);
const make = (cls, html) => {
  const d = document.createElement("div");
  d.className = cls;
  d.setAttribute("aria-hidden", "true");
  if (html) d.innerHTML = html; // static, trusted markup from ICONS above
  return d;
};

function clear() {
  decor?.remove(); decor = null;
  extras.forEach((n) => n.remove()); extras = [];
  scenes.forEach((b) => b.destroy()); scenes = [];
  document.documentElement.removeAttribute("data-holiday");
  document.documentElement.removeAttribute("data-scene");
}

/* ---------------- default look (no holiday): a painted redwood forest ---------------- */
function buildForest() {
  document.documentElement.setAttribute("data-scene", "forest");
  scenes.push(forestBackdrop());                   // canvases behind the page (forest.js)
  const air = forestAir();                         // animals, dust and fireflies over the page
  document.body.append(air); extras.push(air);
  const floor = forestFloor();                     // log, ferns, mushrooms, a deer, an owl and two banana slugs above the footer
  document.querySelector("footer.foot")?.before(floor); extras.push(floor);
  for (const n of [air, floor]) if (n.wake) scenes.push(n.wake());   // their behaviour (alive.js), stopped in clear()
}

function build(id) {
  const H = HOLIDAYS[id];
  const root = document.documentElement;
  root.setAttribute("data-holiday", id);

  /* floating particles */
  decor = make("decor");
  H.fx?.forEach((f) => {
    for (let i = 0; i < f.n; i++) {
      const el = document.createElement("span");
      el.className = `fx fx--${f.mode}`;
      const size = rand(f.size[0], f.size[1]);
      const c = f.colors[i % f.colors.length];
      const col = typeof c === "string" ? c : `var(--fx${c})`;
      const t = f.mode === "drift" ? rand(18, 34) : rand(11, 24);
      el.style.cssText = [
        `--x:${rand(0, 98).toFixed(1)}%`,
        `--y:${rand(8, 78).toFixed(1)}%`,
        `--s:${size.toFixed(0)}px`,
        `--t:${t.toFixed(1)}s`,
        `--d:-${rand(0, t).toFixed(1)}s`,
        `--sw:${rand(-70, 70).toFixed(0)}px`,
        `--r:${rand(-320, 320).toFixed(0)}deg`,
        `--o:${rand(0.55, 0.9).toFixed(2)}`,
        `--c:${col}`,
      ].join(";");
      el.innerHTML = ICONS[f.icon];
      decor.append(el);
    }
  });
  document.body.append(decor);

  /* painted background and floor scene */
  if (H.backdrop) scenes.push(H.backdrop());
  if (H.floor) {
    const fl = H.floor();
    document.querySelector("footer.foot")?.before(fl); extras.push(fl);
    if (fl.wake) scenes.push(fl.wake());           // its animals' behaviour (alive.js), stopped in clear()
  }

  /* decorative row above footer */
  if (H.row?.length) {
    const row = make("decor-row");
    H.row.forEach((k, i) => {
      const s = document.createElement("span");
      const HT = { tombstone: 62, candle: 56, cauldron: 50, candycorn: 40, skull: 42, pumpkin: 60, pumpkinPlain: 46, ghost: 62, cat: 50, witchhat: 40 };
      s.style.setProperty("--h", `${HT[k] ?? [44, 58, 40, 64, 50, 56, 42, 60][i % 8]}px`);
      s.dataset.k = k;
      s.innerHTML = ICONS[k];
      row.append(s);
    });
    if (H.fog) row.classList.add("has-fog");
    if (H.scene) row.classList.add("is-scene");
    document.querySelector("footer.foot")?.before(row);
    extras.push(row);
  }

  /* hero corner decor (cobwebs) */
  if (H.corners) {
    const hero = document.querySelector(".hero");
    H.corners.forEach(() => {
      ["l", "r"].forEach((side) => {
        const c = make(`corner corner--${side}`, ICONS.cobweb);
        hero?.append(c); extras.push(c);
      });
    });
  }

  /* fixed bobbing icon */
  if (H.float) {
    const f = make("decor-float", ICONS[H.float]);
    document.body.append(f); extras.push(f);
    if (H.wakeFloat) scenes.push(H.wakeFloat(f));
  }

  /* Halloween extras: hanging spiders and glowing eyes (the moon, sky and fog are painted by graveyard.js) */
  if (H.scene) {
    const spiders = make("spiders");
    [{ l: "13%", len: 44, t: 5.6 }, { l: "90%", len: 64, t: 6.3 }].forEach((sp, i) => {
      const e = document.createElement("div");
      e.className = "spider";
      e.style.cssText = `--l:${sp.l};--len:${sp.len}px;--t:${sp.t}s;animation-delay:-${i * 1.7}s`;
      e.innerHTML = `<i></i>${ICONS.spider}`;
      spiders.append(e);
    });
    document.querySelector(".bar")?.append(spiders); extras.push(spiders);

    [["2.5%", "64%", 0], ["95%", "82%", 2.6]].forEach(([x, y, d]) => {
      const e = document.createElement("i");
      e.className = "eyes";
      e.style.cssText = `left:${x};top:${y};animation-delay:-${d}s`;
      e.innerHTML = "<b></b><b></b>";
      decor.append(e);
    });

  }

  /* string lights under the header */
  if (H.lights) {
    const l = make("lights");
    for (let i = 0; i < 30; i++) l.append(document.createElement("i"));
    document.querySelector(".bar")?.append(l); extras.push(l);
  }
}

function paintNote() {
  const note = document.getElementById("holidayNote");
  const greet = document.getElementById("greet");
  const termGreet = document.getElementById("termGreet");
  const id = state.none ? null : state.override ?? byMonth(new Date().getMonth());
  const on = store.get(OFF_KEY) !== "off";
  if (!note) return;
  if (!known(id)) { note.hidden = true; if (greet) greet.hidden = true; if (termGreet) termGreet.hidden = true; return; }
  note.hidden = false;
  note.replaceChildren();
  const label = document.createElement("span");
  label.textContent = `Seasonal theme: ${HOLIDAYS[id].name} (${on ? "on" : "off"}) `;
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "chip";
  btn.textContent = on ? "Turn off" : "Turn on";
  btn.setAttribute("aria-pressed", String(!on));
  btn.addEventListener("click", () => setEnabled(!on));
  note.append(label, btn);
  if (greet) {
    greet.hidden = !on;
    const g = HOLIDAYS[id].greet; greet.textContent = on ? (typeof g === "function" ? g() : g) : "";
  }
  if (termGreet) {                                  // the same greeting as a comment line in the hero terminal
    const g = HOLIDAYS[id].greet;
    termGreet.hidden = !on;
    termGreet.textContent = on ? `# ${typeof g === "function" ? g() : g}` : "";
  }
}

export function apply() {
  clear();
  const params = new URLSearchParams(location.search);
  const q = params.get("holiday");
  if (q === "none") { state.override = null; state.none = true; }
  else if (known(q)) { state.override = q; state.none = false; }
  const id = state.none ? null : state.override ?? byMonth(new Date().getMonth());
  state.id = id;
  paintNote();
  if (known(id) && store.get(OFF_KEY) !== "off") build(id);
  else buildForest();
}

export function setEnabled(on) {
  store.set(OFF_KEY, on ? "on" : "off");
  apply();
}

/** Console helper: preview a holiday without saving anything. */
export function preview(id) {
  if (id !== null && !known(id)) return false;
  state.override = id; state.none = id === null;
  clear();
  paintNote();
  if (id) build(id); else buildForest();
  return true;
}

export const current = () => state.id;

export function initHoliday() {
  const params = new URLSearchParams(location.search);
  const q = params.get("holiday");
  if (known(q)) state.override = q;
  apply();
}

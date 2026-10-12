/*
 * Automatic seasonal themes.
 * The month (visitor's local time) picks the holiday; months not listed use the default look.
 * Preview any one with  ?holiday=halloween  (or ?holiday=none). Visitors can switch it off in the footer.
 *
 * To add or change a holiday: edit HOLIDAYS below and the matching
 * :root[data-holiday="<id>"] colour block in assets/css/holidays.css.
 */

const NS = "http://www.w3.org/2000/svg";
const OFF_KEY = "v0x-holiday";

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* Small flat SVG icons. Colours come from CSS vars (--c) where they should follow the palette. */
const F = 'fill="var(--c,currentColor)"';
const ICONS = {
  pumpkin: `<svg viewBox="0 0 64 56"><path d="M30 14c-1-6 1-10 7-12l1.5 3.5c-3 1.2-4 3.4-3.6 7z" fill="#3f6f2d"/><ellipse cx="32" cy="34" rx="28" ry="20" fill="#d9690f"/><ellipse cx="32" cy="34" rx="18" ry="20" fill="#ec8222"/><ellipse cx="32" cy="34" rx="8" ry="20" fill="#d9690f"/><path d="M15 27l9 1-5 8zM49 27l-9 1 5 8z" fill="#ffd45e"/><path d="M18 40l5 4 4-3 5 4 5-4 4 3 5-4c-2 8-8 11-14 11s-12-3-14-11z" fill="#ffd45e"/></svg>`,
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
  tree: `<svg viewBox="0 0 48 62"><path d="M24 9L12 26h6L8 42h8L4 56h40L32 42h8L30 26h6z" fill="#2f8f57"/><rect x="21" y="56" width="6" height="6" fill="#6b4a2a"/><path d="M24 0l1.800 4 4.200.4-3.200 2.800 1 4.200L24 9.200l-3.800 2.200 1-4.200L18 4.400l4.200-.4z" fill="#ffd166"/><circle cx="19" cy="34" r="1.800" fill="#ff4d5e"/><circle cx="29" cy="46" r="1.800" fill="#ffd166"/><circle cx="17" cy="48" r="1.800" fill="#5aa9ff"/><circle cx="26" cy="27" r="1.600" fill="#ffd166"/></svg>`,
};

/*
 * fx: floating particles   { icon, mode: fall|rise|drift, n, size:[min,max], colors:[1..3] (→ --fx1..3) }
 * row: icons shown in a decorative row above the footer
 * corners: cobwebs etc. in the hero corners;  float: a fixed bobbing icon;  lights: string lights under the header
 */
export const HOLIDAYS = {
  halloween: {
    month: 9, name: "Halloween", greet: "Happy Halloween",
    fx: [{ icon: "bat", mode: "drift", n: 6, size: [26, 42], colors: [1, 2, 3] }],
    row: ["pumpkin", "ghost", "pumpkinPlain", "pumpkin", "pumpkin", "ghost", "pumpkinPlain", "pumpkin"],
    corners: ["cobweb"], float: "ghost",
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

const byMonth = (m) => Object.entries(HOLIDAYS).find(([, h]) => h.month === m)?.[0] ?? null;

let state = { id: null, override: null, none: false };
let decor = null;           // the fixed fx layer
let extras = [];            // other nodes we inserted (rows, corners, lights, ...)

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
  document.documentElement.removeAttribute("data-holiday");
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
        `--c:var(--fx${c})`,
      ].join(";");
      el.innerHTML = ICONS[f.icon];
      decor.append(el);
    }
  });
  document.body.append(decor);

  /* decorative row above footer */
  if (H.row?.length) {
    const row = make("decor-row");
    H.row.forEach((k, i) => {
      const s = document.createElement("span");
      s.style.setProperty("--h", `${[44, 58, 40, 64, 50, 56, 42, 60][i % 8]}px`);
      s.innerHTML = ICONS[k];
      row.append(s);
    });
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
  const id = state.none ? null : state.override ?? byMonth(new Date().getMonth());
  const on = store.get(OFF_KEY) !== "off";
  if (!note) return;
  if (!id || !HOLIDAYS[id]) { note.hidden = true; if (greet) greet.hidden = true; return; }
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
    greet.textContent = on ? HOLIDAYS[id].greet : "";
  }
}

export function apply() {
  clear();
  const params = new URLSearchParams(location.search);
  const q = params.get("holiday");
  if (q === "none") { state.override = null; state.none = true; }
  else if (q && HOLIDAYS[q]) { state.override = q; state.none = false; }
  const id = state.none ? null : state.override ?? byMonth(new Date().getMonth());
  state.id = id;
  paintNote();
  if (id && HOLIDAYS[id] && store.get(OFF_KEY) !== "off") build(id);
}

export function setEnabled(on) {
  store.set(OFF_KEY, on ? "on" : "off");
  apply();
}

/** Console helper: preview a holiday without saving anything. */
export function preview(id) {
  if (id !== null && !HOLIDAYS[id]) return false;
  state.override = id; state.none = id === null;
  clear();
  paintNote();
  if (id) build(id);
  return true;
}

export const current = () => state.id;

export function initHoliday() {
  const params = new URLSearchParams(location.search);
  const q = params.get("holiday");
  if (q && HOLIDAYS[q]) state.override = q;
  apply();
}

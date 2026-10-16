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
  candle: `<svg viewBox="0 0 24 58"><rect x="6" y="24" width="12" height="32" rx="2" fill="#efe6cf"/><path d="M6 30c3 0 3 6 6 6s0-6 3-6" fill="none" stroke="#d8ccae"/><path d="M12 24v-4" stroke="#333" stroke-width="1.500"/><g class="flame"><path d="M12 2c5 6 5 11 0 16-5-5-5-10 0-16z" fill="#ffb938"/><path d="M12 8c2.500 3.500 2.500 6 0 8.500-2.500-2.500-2.500-5 0-8.500z" fill="#fff1b8"/></g></svg>`,
  tomb: `<svg viewBox="0 0 44 64"><path d="M4 62V24C4 11 12 2 22 2s18 9 18 22v38z" fill="#8b8896" stroke="#5d5a69" stroke-width="1.500"/><path d="M22 14v20M14.500 22h15" stroke="#4d4a59" stroke-width="2.800" stroke-linecap="round"/><path d="M8 62q2-6 4 0M30 62q2-8 5 0" stroke="#4f8a3a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  cauldron: `<svg viewBox="0 0 64 60"><path d="M16 50l-4 8M48 50l4 8" stroke="#6a6575" stroke-width="3.500" stroke-linecap="round"/><path d="M8 18c-4 16 2 36 24 36s28-20 24-36z" fill="#2a2630" stroke="#6a6575" stroke-width="1.500"/><ellipse cx="32" cy="18" rx="24" ry="6.500" fill="#2a2630" stroke="#6a6575" stroke-width="1.500"/><ellipse cx="32" cy="18" rx="20" ry="4.500" fill="#6fe04a"/><circle cx="26" cy="11" r="3.500" fill="#8bf06a"/><circle cx="38" cy="8" r="2.500" fill="#8bf06a"/><circle cx="33" cy="3" r="1.800" fill="#8bf06a"/></svg>`,
  candycorn: `<svg viewBox="0 0 28 38"><path d="M2 36C2.400 30 3 25 4 21h20c1 4 1.600 9 2 15z" fill="#ffd23f"/><path d="M4 21c1-4 2-7 4-10h12c2 3 3 6 4 10z" fill="#f08a1c"/><path d="M8 11C10 5 12 2 14 2s4 3 6 9z" fill="#f7f1e6"/></svg>`,
  tombstone: `<svg viewBox="0 0 40 54"><path d="M4 51V18C4 8 11 2 20 2s16 6 16 16v33z" fill="#6f6c7c" stroke="#4a4756" stroke-width="1.5"/><path d="M8 51V19C8 11 13 6 20 6" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/><text x="20" y="26" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="700" fill="#2b2833">RIP</text><path d="M20 31v10M16 35h8" stroke="#2b2833" stroke-width="1.6" stroke-linecap="round"/><path d="M0 51h40" stroke="#3a6b2d" stroke-width="3.500"/></svg>`,
  candy: `<svg viewBox="0 0 32 40"><path d="M16 2c-3 0-5 3-6 7l-.55 4h13.1L22 9c-1-4-3-7-6-7z" fill="#fff6e0"/><path d="M9.450 13h13.100L24.070 24H7.930z" fill="#ff8a1f"/><path d="M7.930 24h16.140L26 38c0 1.100-1 2-2 2H8c-1 0-2-.9-2-2z" fill="#ffc933"/></svg>`,
  skull: `<svg viewBox="0 0 40 44"><path d="M20 2C10 2 3 9 3 19c0 6 3 10 7 12v8h4v-4h3v4h6v-4h3v4h4v-8c4-2 7-6 7-12C37 9 30 2 20 2z" fill="#eee8dc" stroke="#9a948a" stroke-width="1.2"/><ellipse cx="13" cy="20" rx="4.200" ry="5" fill="#1c1626"/><ellipse cx="27" cy="20" rx="4.200" ry="5" fill="#1c1626"/><path d="M20 26l-2.500 5h5z" fill="#1c1626"/></svg>`,
  witchhat: `<svg viewBox="0 0 56 48"><ellipse cx="28" cy="40" rx="26" ry="6" fill="#3a2a4d" stroke="#6b5585" stroke-width="1.200"/><path d="M14 40C20 28 24 14 32 3c1 6 5 9 6 13 2 8 4 16 4 24z" fill="#46335f" stroke="#6b5585" stroke-width="1.200"/><path d="M15.500 33.500h26.400l.9 5.500H14.500z" fill="#e8751a"/><rect x="25" y="33" width="7" height="6.500" rx="1" fill="none" stroke="#ffd45e" stroke-width="1.600"/></svg>`,
  cat: `<svg viewBox="0 0 52 58"><path d="M37 52c11 1 13-11 8-20" fill="none" stroke="#2a2036" stroke-width="5.500" stroke-linecap="round"/><ellipse cx="24" cy="40" rx="15" ry="16" fill="#1d1626" stroke="#4b3a5c" stroke-width="1.200"/><path d="M13 14l1.500-12 8 7zM35 14l-1.500-12-8 7z" fill="#1d1626" stroke="#4b3a5c" stroke-width="1.200" stroke-linejoin="round"/><circle cx="24" cy="19" r="11" fill="#1d1626" stroke="#4b3a5c" stroke-width="1.200"/><ellipse cx="19.500" cy="18.500" rx="2.400" ry="3.300" fill="#ffd45e"/><ellipse cx="28.500" cy="18.500" rx="2.400" ry="3.300" fill="#ffd45e"/><rect x="19" y="16" width="1" height="5" rx=".5" fill="#1d1626"/><rect x="28" y="16" width="1" height="5" rx=".5" fill="#1d1626"/><path d="M22.500 24h3l-1.500 2z" fill="#c4698a"/></svg>`,
  spider: `<svg viewBox="0 0 24 26"><g fill="none" stroke="#7c6a92" stroke-width="1.200" stroke-linecap="round"><path d="M9 14L2 9M9 16L1 17M9.500 18L3 24M11 19L8 25M15 14l7-5M15 16l8 1M14.500 18l6.500 6M13 19l3 6"/></g><ellipse cx="12" cy="17" rx="5" ry="6" fill="#1c1626" stroke="#7c6a92" stroke-width="1"/><circle cx="12" cy="9.500" r="3.500" fill="#1c1626" stroke="#7c6a92" stroke-width="1"/><circle cx="10.600" cy="9" r=".8" fill="#ff4d4d"/><circle cx="13.400" cy="9" r=".8" fill="#ff4d4d"/><path d="M12 12.500l-1.600 3.500h3.200z" fill="#e8751a"/></svg>`,
  moon: `<svg viewBox="0 0 120 120"><defs><radialGradient id="mglow"><stop offset=".55" stop-color="#ffe9a8" stop-opacity=".30"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="60" r="60" fill="url(#mglow)"/><circle cx="60" cy="60" r="36" fill="#f6ecc9" stroke="#cdbb85" stroke-width="1"/><circle cx="48" cy="50" r="7" fill="#e3d4a2"/><circle cx="72" cy="66" r="9" fill="#e3d4a2"/><circle cx="58" cy="76" r="4.500" fill="#e3d4a2"/><circle cx="74" cy="46" r="3.500" fill="#e3d4a2"/><path d="M52 52l-3-7-2.500 4.500C42 47 37 47 33 45c2 2.500 2 5.500 4 6.500 1.500-1.500 3.500-1.800 5 0 1 2 2.500 3 4.500 6.500 2-3.500 3.500-4.500 4.500-6.500 1.500-1.800 3.500-1.500 5 0 2-1 2-4 4-6.500-4 2-9 2-13.500 4z" fill="#1c1626" transform="translate(16 -2) scale(.9)"/></svg>`,
  witch: `<svg viewBox="0 0 64 36"><path d="M2 27C18 24 38 26 60 22" stroke="#6b5585" stroke-width="2.600" stroke-linecap="round" fill="none"/><path d="M60 22l4-3-5 1.500 3 4z" fill="#6b5585"/><path d="M26 25c-1-7 1-11 5-12l4 1c3 2 4 6 3 10z" fill="#1c1626" stroke="#4b3a5c" stroke-width=".8"/><circle cx="35" cy="9" r="4.200" fill="#1c1626" stroke="#4b3a5c" stroke-width=".8"/><path d="M28 8.500l5-1 3-7c.5 3 1.500 5 3.500 6.500l3 .5c-2 1.500-5 2.500-8.500 2.500z" fill="#2a1d3a" stroke="#4b3a5c" stroke-width=".8"/><path d="M26 25c-5 1-9 3-12 7 6-1 9-3 14-3" fill="#1c1626" stroke="#4b3a5c" stroke-width=".8"/></svg>`,
  tree: `<svg viewBox="0 0 48 62"><path d="M24 9L12 26h6L8 42h8L4 56h40L32 42h8L30 26h6z" fill="#2f8f57"/><rect x="21" y="56" width="6" height="6" fill="#6b4a2a"/><path d="M24 0l1.800 4 4.200.4-3.200 2.800 1 4.200L24 9.200l-3.800 2.200 1-4.200L18 4.400l4.200-.4z" fill="#ffd166"/><circle cx="19" cy="34" r="1.800" fill="#ff4d5e"/><circle cx="29" cy="46" r="1.800" fill="#ffd166"/><circle cx="17" cy="48" r="1.800" fill="#5aa9ff"/><circle cx="26" cy="27" r="1.600" fill="#ffd166"/></svg>`,
  /* default forest scene */
  butterfly: `<svg viewBox="0 0 40 32"><g class="wing wing--l"><path d="M20 15C15 3 4 0 2 6s5 11 18 10z" fill="var(--b1)"/><path d="M20 17C11 17 5 22 8 28s10 1 12-10z" fill="var(--b2)"/></g><g class="wing wing--r"><path d="M20 15C25 3 36 0 38 6s-5 11-18 10z" fill="var(--b1)"/><path d="M20 17c9 0 15 5 12 11s-10 1-12-10z" fill="var(--b2)"/></g><rect x="19" y="10" width="2" height="15" rx="1" fill="#5a4a52"/><path d="M20 10q-2-5-5-6M20 10q2-5 5-6" stroke="#5a4a52" stroke-width=".9" fill="none" stroke-linecap="round"/></svg>`,
  slug: `<svg viewBox="0 0 96 30"><path d="M6 27c-4 0-5-4-1-5 10-2 22-3 36-9 8-4 14-9 24-9 12 0 20 7 22 14 1 5-2 9-8 9z" fill="#f2c94c" stroke="#c99a1e" stroke-width="1.2"/><path d="M48 13c8-3 16-3 22 1" stroke="#d9ac2c" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="60" cy="19" r="1.4" fill="#b8891a"/><circle cx="52" cy="21" r="1.1" fill="#b8891a"/><circle cx="40" cy="22" r="1.2" fill="#b8891a"/><path d="M78 9l4-8M84 11l7-6" stroke="#c99a1e" stroke-width="1.6" stroke-linecap="round"/><circle cx="82" cy="1.6" r="1.6" fill="#7a5a10"/><circle cx="91" cy="5" r="1.6" fill="#7a5a10"/></svg>`,
  fern: `<svg viewBox="0 0 60 50" fill="none" stroke="var(--fern)" stroke-width="2.2" stroke-linecap="round"><path d="M30 50C28 32 20 18 6 8"/><path d="M24 36l-9-1M21 29l-9-3M17 22l-8-4M13 16l-6-4M25 33l3-9M21 26l3-9M17 19l3-8"/><path d="M32 50c2-16 10-28 22-36"/><path d="M36 37l9-2M39 30l8-4M43 23l7-5M37 33l-2-9M40 26l-2-8M44 20l-1-7"/></svg>`,
  mushroom: `<svg viewBox="0 0 40 40"><path d="M16 22h8l1 16h-10z" fill="#f4ead8" stroke="#d9c9a8"/><path d="M3 23C3 11 11 4 20 4s17 7 17 19z" fill="#e8798f"/><circle cx="13" cy="13" r="2.4" fill="#fff4f6"/><circle cx="24" cy="10" r="2" fill="#fff4f6"/><circle cx="29" cy="18" r="2.2" fill="#fff4f6"/><circle cx="18" cy="19" r="1.6" fill="#fff4f6"/></svg>`,
};

/*
 * fx: floating particles   { icon, mode: fall|rise|drift, n, size:[min,max], colors:[1..3] (→ --fx1..3) }
 * row: icons shown in a decorative row above the footer
 * corners: cobwebs etc. in the hero corners;  float: a fixed bobbing icon;  lights: string lights under the header
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
    // a small graveyard scene, spaced out on a hill (fewer pieces reads better than a crowded shelf)
    row: ["tombstone", "pumpkin", "candle", "cauldron", "cat", "pumpkinPlain", "tombstone"],
    corners: ["cobweb"], float: "ghost", scene: true,
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
  document.documentElement.removeAttribute("data-scene");
}

/* ---------------- default look (no holiday): a pastel redwood forest ---------------- */
/* seeded random, so the treeline looks the same on every visit */
function seeded(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }

/* one layer of redwoods: tall straight trunks (their own path, so they can be tinted like bark)
   and narrow, layered crowns that start high up the trunk */
function treeline(seed, count, minH, maxH) {
  const r = seeded(seed), W = 1600, H = 420;
  let crowns = "", trunks = "";
  for (let i = 0; i < count; i++) {
    const x = (i + 0.15 + r() * 0.7) * (W / count), h = minH + r() * (maxH - minH), w = 34 + r() * 30;
    const top = H - h, crownEnd = top + h * (0.48 + r() * 0.12), tw = w * (0.11 + r() * 0.05);
    trunks += `M${(x - tw * 0.7).toFixed(1)} ${(top + h * 0.2).toFixed(1)}L${(x - tw * 1.25).toFixed(1)} ${H}H${(x + tw * 1.25).toFixed(1)}L${(x + tw * 0.7).toFixed(1)} ${(top + h * 0.2).toFixed(1)}Z`;
    const steps = 7;
    crowns += `M${(x - tw).toFixed(1)} ${crownEnd.toFixed(1)}`;
    for (let k = steps; k >= 1; k--) {             // left side, bottom to top: drooping branch tiers
      const y = top + (crownEnd - top) * (k / steps), spread = (w / 2) * (0.3 + 0.7 * Math.sqrt(k / steps)) * (0.85 + r() * 0.3);
      crowns += `Q${(x - spread * 0.6).toFixed(1)} ${(y - 2).toFixed(1)} ${(x - spread).toFixed(1)} ${(y + 7).toFixed(1)}L${(x - spread * 0.35).toFixed(1)} ${(y - 3).toFixed(1)}`;
    }
    crowns += `L${x.toFixed(1)} ${top.toFixed(1)}`;
    for (let k = 1; k <= steps; k++) {             // right side, top to bottom
      const y = top + (crownEnd - top) * (k / steps), spread = (w / 2) * (0.3 + 0.7 * Math.sqrt(k / steps)) * (0.85 + r() * 0.3);
      crowns += `L${(x + spread * 0.35).toFixed(1)} ${(y - 3).toFixed(1)}Q${(x + spread * 0.6).toFixed(1)} ${(y - 2).toFixed(1)} ${(x + spread).toFixed(1)} ${(y + 7).toFixed(1)}`;
    }
    crowns += `L${(x + tw).toFixed(1)} ${crownEnd.toFixed(1)}Z`;
  }
  return `<svg viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice"><path class="trunk" d="${trunks}"/><path class="crown" d="${crowns}"/></svg>`;
}

function buildForest() {
  const root = document.documentElement;
  root.setAttribute("data-scene", "forest");

  /* background: light rays, three layers of redwoods and a band of mist */
  const scene = make("forest");
  scene.innerHTML =
    `<div class="forest__rays"></div>` +
    `<div class="forest__layer forest__layer--far">${treeline(11, 16, 260, 410)}</div>` +
    `<div class="forest__mist"></div>` +
    `<div class="forest__layer forest__layer--mid">${treeline(29, 9, 300, 420)}</div>` +
    `<div class="forest__layer forest__layer--near">${treeline(47, 5, 340, 420)}</div>`;
  document.body.prepend(scene); extras.push(scene);

  /* a few butterflies, and fireflies after dark */
  const air = make("forest-air");
  [["--b1:#f7b6c8;--b2:#f3d0dc", 18, 26], ["--b1:#cdb8f5;--b2:#e2d6fb", 32, 34], ["--b1:#f6dc8a;--b2:#fbeab8", 62, 30]].forEach(([cols, y, t], i) => {
    const b = document.createElement("span");
    b.className = "bfly";
    b.style.cssText = `${cols};--y:${y}%;--t:${t}s;--d:-${(i * t) / 3}s`;
    b.innerHTML = ICONS.butterfly;
    air.append(b);
  });
  const r = seeded(5);
  for (let i = 0; i < 10; i++) {
    const f = document.createElement("i");
    f.className = "firefly";
    f.style.cssText = `left:${(r() * 96 + 2).toFixed(1)}%;top:${(48 + r() * 46).toFixed(1)}%;--t:${(5 + r() * 6).toFixed(1)}s;--d:-${(r() * 8).toFixed(1)}s`;
    air.append(f);
  }
  document.body.append(air); extras.push(air);

  /* forest floor above the footer: ferns, mushrooms and two banana slugs out for a crawl */
  const floor = make("decor-row forest-floor");
  ["fern", "mushroom", "slug", "fern", "fern", "mushroom", "slug", "fern"].forEach((k) => {
    const sp = document.createElement("span");
    sp.dataset.k = k;
    sp.innerHTML = ICONS[k];
    floor.append(sp);
  });
  document.querySelector("footer.foot")?.before(floor); extras.push(floor);
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
  }

  /* Halloween scene: moon, hanging spiders, glowing eyes, fog */
  if (H.scene) {
    const hero = document.querySelector(".hero");
    const moon = make("moon", ICONS.moon);
    hero?.append(moon); extras.push(moon);

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

    const sky = make("hsky");                         // slow aurora glow + twinkling stars behind everything
    document.body.prepend(sky); extras.push(sky);

    const fog = make("fog");
    document.body.append(fog); extras.push(fog);
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

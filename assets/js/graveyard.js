/*
 * Halloween at the same level as the forest.
 *   background  a night (or dusk) sky with a big textured moon and stars, a haunted house on a far hill,
 *               a hill with an iron fence, crooked tombstones and bare trees, and a gnarled tree framing the edge
 *   floor       a small graveyard above the footer: tombstones, a ghost that rises from behind a grave to
 *               look around, wave and swoop, carved pumpkins, a bubbling cauldron, a black cat that blinks,
 *               yawns and watches the pointer, a crow that hops, caws and flies off, and candles
 * The animals' behaviour loops are at the bottom (alive.js runs them).
 * Colours: the --gy-* and --gf-* variables in holidays.css.
 */
import { Backdrop, palette, mix, rgba, seeded } from "./scene.js";
import { Life, rnd, pick, chance } from "./alive.js";

const NAMES = ["haze", "sky1", "sky2", "glow", "moon", "moon-lo", "cloud", "hill-far", "hill-mid", "ground", "tree", "rim", "stone", "stone-hi", "window", "star"];
const read = () => Object.assign(palette("gy-", NAMES), { dark: document.documentElement.dataset.theme === "dark" });

/* a smooth, seeded ridge line */
const ridge = (w, base, amp, ph) => (x) =>
  base - amp * (0.55 * Math.sin((x / w) * 3.1 + ph) + 0.3 * Math.sin((x / w) * 7.3 + ph * 1.7) + 0.15 * Math.sin((x / w) * 17 + ph * 3));

function fillRidge(ctx, w, H, y, fill) {
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, y(x));
  ctx.lineTo(w, H); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}

/* a bare, twisted tree: limbs made of short wobbly segments that fork as they thin out */
function gnarl(segs, x, y, ang, len, wid, depth, r) {
  let px = x, py = y, a = ang, wd = wid;
  for (let i = 0; i < 4; i++) {
    a += (r() - 0.5) * 0.55;
    const L = len / 4, nx = px + Math.cos(a) * L, ny = py + Math.sin(a) * L, nw = wd * 0.85;
    segs.push([px, py, nx, ny, wd]);
    px = nx; py = ny; wd = nw;
  }
  if (depth <= 0 || wd < 0.7) {                     // a little curl at the tip
    segs.push([px, py, px + Math.cos(a + 0.9) * len * 0.15, py + Math.sin(a + 0.9) * len * 0.15, wd * 0.7]);
    return;
  }
  const n = r() < 0.35 ? 3 : 2;
  for (let k = 0; k < n; k++) {
    const spread = (k - (n - 1) / 2) * (0.55 + r() * 0.35) + (r() - 0.5) * 0.3;
    gnarl(segs, px, py, a + spread - 0.08, len * (0.62 + r() * 0.16), wd * 0.92, depth - 1, r);
  }
}
function drawGnarl(ctx, segs, col, rim, rimA) {
  ctx.lineCap = "round"; ctx.strokeStyle = col;
  for (const [x0, y0, x1, y1, w] of segs) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  if (!rim) return;
  ctx.strokeStyle = rgba(rim, rimA);                 // moonlight catching the right side of each limb
  for (const [x0, y0, x1, y1, w] of segs) {
    if (w < 2) continue;
    const o = w * 0.2;
    ctx.lineWidth = Math.max(0.8, w * 0.18); ctx.beginPath(); ctx.moveTo(x0 + o, y0 - o * 0.3); ctx.lineTo(x1 + o, y1 - o * 0.3); ctx.stroke();
  }
}

/* bark on the thick limbs: dark grooves, and thin ridges catching the moonlight on the right */
function barkLines(ctx, segs, P, a, r) {
  const groove = new Path2D(), ridge = new Path2D(), knots = [];
  for (const [x0, y0, x1, y1, w] of segs) {
    if (w < 4.5) continue;
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    for (let q = 0, m = Math.min(7, Math.floor(w / 3.5)); q < m; q++) {
      const o = (-0.42 + ((q + 0.2 + r() * 0.6) / m) * 0.84) * w, t0 = -0.1 + r() * 0.2, t1 = 1.1 - r() * 0.3;
      const into = o > w * 0.05 && r() < 0.55 ? ridge : groove, wob = (r() - 0.5) * w * 0.12;
      into.moveTo(x0 + dx * t0 + nx * o, y0 + dy * t0 + ny * o);
      into.quadraticCurveTo(x0 + dx * 0.5 + nx * (o + wob), y0 + dy * 0.5 + ny * (o + wob), x0 + dx * t1 + nx * o * 0.92, y0 + dy * t1 + ny * o * 0.92);
    }
    if (w > 14 && r() < 0.18) knots.push([x0 + dx * 0.5 - nx * w * 0.1, y0 + dy * 0.5 - ny * w * 0.1, w * 0.13, Math.atan2(dy, dx)]);
  }
  const dark = mix(P.tree, P.dark ? [0, 0, 0] : [58, 40, 80], P.dark ? 0.6 : 0.45);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(dark, (P.dark ? 0.6 : 0.4) * a); ctx.lineWidth = 1.3; ctx.stroke(groove);
  ctx.strokeStyle = rgba(P.rim, (P.dark ? 0.16 : 0.32) * a); ctx.lineWidth = 0.9; ctx.stroke(ridge);
  for (const [x, y, R, ang] of knots) {             // old knots where limbs broke off
    ctx.fillStyle = rgba(dark, 0.7 * a); ctx.beginPath(); ctx.ellipse(x, y, R * 1.6, R, ang, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(P.rim, (P.dark ? 0.2 : 0.45) * a); ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.ellipse(x, y, R * 2.2, R * 1.5, ang, -0.4, 1.4); ctx.stroke();
  }
}

/* a hollow in an old trunk */
function hollow(ctx, x, y, R, P) {
  const dark = mix(P.tree, [0, 0, 0], P.dark ? 0.7 : 0.55);
  ctx.fillStyle = rgba(mix(P.tree, P.rim, P.dark ? 0.12 : 0.3)); ctx.beginPath(); ctx.ellipse(x, y, R * 0.75, R * 1.25, 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(dark); ctx.beginPath(); ctx.ellipse(x - R * 0.06, y + R * 0.08, R * 0.58, R * 1.05, 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = rgba(P.rim, P.dark ? 0.3 : 0.6); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(x, y, R * 0.75, R * 1.25, 0.08, -1.2, 1.1); ctx.stroke();
}

function moon(ctx, x, y, R, P) {
  const halo = ctx.createRadialGradient(x, y, R * 0.9, x, y, R * 4.2);
  halo.addColorStop(0, rgba(P.moon, P.dark ? 0.34 : 0.5)); halo.addColorStop(1, rgba(P.moon, 0));
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, R * 4.2, 0, Math.PI * 2); ctx.fill();
  const d = ctx.createRadialGradient(x - R * 0.35, y - R * 0.35, R * 0.1, x, y, R);
  d.addColorStop(0, rgba(mix(P.moon, [255, 255, 255], 0.45))); d.addColorStop(1, rgba(P.moon));
  ctx.fillStyle = d; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  const r = seeded(17);                            // the dark seas: many faint overlapping blots
  ctx.fillStyle = rgba(P["moon-lo"], 0.16);
  for (const [dx, dy, rr] of [[-0.3, -0.25, 0.3], [0.12, -0.35, 0.2], [0.25, 0.08, 0.28], [-0.12, 0.3, 0.2], [-0.48, 0.12, 0.16]]) {
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(x + (dx + (r() - 0.5) * rr * 0.8) * R, y + (dy + (r() - 0.5) * rr * 0.6) * R, rr * R * (0.5 + r() * 0.5), rr * R * (0.35 + r() * 0.4), r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const [dx, dy, rr] of [[0.42, -0.08, 0.08], [-0.05, 0.55, 0.06], [0.5, 0.45, 0.05], [-0.6, -0.4, 0.05], [0.05, 0.02, 0.04], [0.3, -0.62, 0.045], [-0.35, 0.62, 0.04]]) {
    ctx.fillStyle = rgba(P["moon-lo"], 0.32); ctx.beginPath(); ctx.arc(x + dx * R, y + dy * R, rr * R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(mix(P.moon, [255, 255, 255], 0.6), 0.7); ctx.lineWidth = Math.max(0.8, R * 0.012);
    ctx.beginPath(); ctx.arc(x + dx * R + rr * R * 0.25, y + dy * R + rr * R * 0.25, rr * R, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  }
  const sh = ctx.createLinearGradient(x - R, y - R, x + R, y + R);  // soft shading toward the lower right
  sh.addColorStop(0.45, rgba(P["moon-lo"], 0)); sh.addColorStop(1, rgba(P["moon-lo"], 0.4));
  ctx.fillStyle = sh; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  ctx.restore();
}

function clouds(ctx, w, h, P, r, x0, y0, n) {
  for (let i = 0; i < n; i++) {
    const cx = x0 + (r() - 0.5) * w * 0.4, cy = y0 + (r() - 0.3) * h * 0.1, L = w * (0.08 + r() * 0.12), T = 5 + r() * 6;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(L / T, 1);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, T);
    g.addColorStop(0, rgba(P.cloud, P.dark ? 0.6 : 0.75)); g.addColorStop(1, rgba(P.cloud, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, T, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

/* a crooked old house on the hill, with a couple of lit windows */
function house(ctx, x, y, s, P) {
  const c = rgba(P["hill-far"].map((v, i) => Math.round(v * 0.82 + P.tree[i] * 0.18)));
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - 26 * s, y); ctx.lineTo(x - 26 * s, y - 22 * s); ctx.lineTo(x - 30 * s, y - 22 * s); ctx.lineTo(x - 12 * s, y - 40 * s);
  ctx.lineTo(x - 8 * s, y - 36 * s); ctx.lineTo(x - 8 * s, y - 50 * s); ctx.lineTo(x - 2 * s, y - 50 * s); ctx.lineTo(x - 2 * s, y - 40 * s);
  ctx.lineTo(x + 4 * s, y - 34 * s); ctx.lineTo(x + 4 * s, y - 46 * s); ctx.lineTo(x + 11 * s, y - 72 * s); ctx.lineTo(x + 18 * s, y - 46 * s);
  ctx.lineTo(x + 18 * s, y - 30 * s); ctx.lineTo(x + 30 * s, y - 30 * s); ctx.lineTo(x + 30 * s, y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(x + 11 * s, y - 72 * s); ctx.lineTo(x + 11 * s, y - 80 * s); ctx.lineTo(x + 15 * s, y - 78 * s); ctx.stroke();
  const glow = (wx, wy, ww, wh) => {
    const g = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, ww * 3);
    g.addColorStop(0, rgba(P.window, P.dark ? 0.45 : 0.3)); g.addColorStop(1, rgba(P.window, 0));
    ctx.fillStyle = g; ctx.fillRect(wx - ww * 3, wy - ww * 3, ww * 7, ww * 7);
    ctx.fillStyle = rgba(P.window, P.dark ? 1 : 0.85); ctx.fillRect(wx, wy, ww, wh);
  };
  glow(x + 8.5 * s, y - 52 * s, 4.5 * s, 6 * s);
  glow(x - 18 * s, y - 16 * s, 5 * s, 6 * s);
  glow(x + 21 * s, y - 22 * s, 5 * s, 6 * s);
}

function tombstone(ctx, x, y, s, kind, tilt, P, rimA) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.beginPath();
  if (kind === 0) { ctx.moveTo(-9 * s, 0); ctx.lineTo(-9 * s, -16 * s); ctx.arc(0, -16 * s, 9 * s, Math.PI, 0); ctx.lineTo(9 * s, 0); }
  else if (kind === 1) { ctx.rect(-2.2 * s, -30 * s, 4.4 * s, 30 * s); ctx.rect(-9 * s, -23 * s, 18 * s, 4.4 * s); }
  else { ctx.moveTo(-7 * s, 0); ctx.lineTo(-7 * s, -22 * s); ctx.lineTo(0, -29 * s); ctx.lineTo(7 * s, -22 * s); ctx.lineTo(7 * s, 0); }
  ctx.fillStyle = rgba(P.stone); ctx.fill();
  if (rimA) {
    ctx.strokeStyle = rgba(P["stone-hi"], rimA); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(kind === 1 ? 2.2 * s : 7 * s, 0); ctx.lineTo(kind === 1 ? 2.2 * s : 7 * s, kind === 1 ? -30 * s : -20 * s); ctx.stroke();
  }
  ctx.restore();
}

function fence(ctx, w, y, P, r, x0, x1, s) {
  ctx.strokeStyle = rgba(P.tree); ctx.fillStyle = rgba(P.tree); ctx.lineCap = "butt";
  const top = (x) => y(x) - 26 * s, mid = (x) => y(x) - 9 * s;
  ctx.lineWidth = 1.6 * s;
  for (const f of [top, mid]) { ctx.beginPath(); for (let x = x0; x <= x1; x += 6) (x === x0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, f(x) + 3 * s); ctx.stroke(); }
  for (let x = x0; x <= x1; x += 9 * s) {
    if (r() < 0.08) continue;                       // a missing bar here and there
    const lean = (r() - 0.5) * 0.12, by = y(x) + 4, ty = top(x) - 4 * s;
    const tx = x + (by - ty) * lean;
    ctx.lineWidth = 1.3 * s; ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty - 4 * s); ctx.lineTo(tx - 2 * s, ty + 0.5 * s); ctx.lineTo(tx + 2 * s, ty + 0.5 * s); ctx.fill();
  }
}

const k = (w) => Math.min(1.2, Math.max(0.65, w / 1280));

const LAYERS = [
  { /* sky: dusk or night, a warm glow low down, stars at night */
    name: "sky", res: 0.5, depth: 0, seed: 2,
    draw(ctx, w, h, P, r, H) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, rgba(P.haze)); g.addColorStop(0.18, rgba(P.sky1)); g.addColorStop(0.55, rgba(P.sky2)); g.addColorStop(0.85, rgba(mix(P.sky2, P.glow, P.dark ? 0.28 : 0.45)));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, H);
      const low = ctx.createRadialGradient(w * 0.3, h * 0.95, 0, w * 0.3, h * 0.95, w * 0.6);
      low.addColorStop(0, rgba(P.glow, P.dark ? 0.18 : 0.3)); low.addColorStop(1, rgba(P.glow, 0));
      ctx.fillStyle = low; ctx.fillRect(0, 0, w, H);
      if (!P.dark) return;
      for (let i = 0, n = Math.round(w * h / 9000); i < n; i++) {
        const x = r() * w, y = Math.pow(r(), 1.6) * h * 0.7, s = 0.4 + Math.pow(r(), 3) * 1.4;
        ctx.fillStyle = rgba(P.star, 0.35 + r() * 0.6); ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      }
    },
  },
  { name: "twinkle", html: true, depth: 0 },
  { /* far: the moon behind thin clouds, a far hill with a crooked house and spindly trees */
    name: "far", res: 1, depth: 8, seed: 13,
    draw(ctx, w, h, P, r, H) {
      const s = k(w), mx = w * (w < 700 ? 0.8 : 0.79), my = h * (w < 700 ? 0.13 : 0.19), R = Math.max(30, Math.min(64, w * 0.045));
      moon(ctx, mx, my, R, P);
      clouds(ctx, w, h, P, r, mx, my + R * 1.05, 3);
      clouds(ctx, w, h, P, r, w * 0.3, h * 0.32, 4);
      const y = ridge(w, h * 0.72, h * 0.05, 1.2);
      const hx = w * (w < 700 ? 0.25 : 0.5);
      fillRidge(ctx, w, H, y, rgba(P["hill-far"]));
      house(ctx, hx, y(hx) + 3, 1.15 * s, P);
      const segs = [];
      for (let i = 0; i < Math.round(w / 110); i++) {
        const x = r() * w;
        if (Math.abs(x - hx) < 60 * s) continue;
        gnarl(segs, x, y(x) + 2, -Math.PI / 2 + (r() - 0.5) * 0.3, (14 + r() * 16) * s, 2.4 * s, 3, r);
      }
      drawGnarl(ctx, segs, rgba(P["hill-far"].map((v, i) => Math.round(v * 0.8 + P.tree[i] * 0.2))), null);
    },
  },
  { /* mid: graveyard hill with an iron fence, tombstones and bare trees */
    name: "mid", res: 1, depth: 22, seed: 31,
    draw(ctx, w, h, P, r, H) {
      const s = k(w), y = ridge(w, h * 0.84, h * 0.035, 4.2);
      const segs = [];
      for (const fx of w < 700 ? [0.62] : [0.36, 0.66, 0.92]) {
        const x = w * fx + (r() - 0.5) * 40;
        gnarl(segs, x, y(x) + 4, -Math.PI / 2 + (r() - 0.5) * 0.25, (74 + r() * 40) * s, 11 * s, 5, r);
        for (const sd of [-1, 1]) segs.push([x, y(x) - 2, x + sd * 16 * s, y(x) + 8, 7 * s]);   // roots
      }
      const midTree = { ...P, tree: P["hill-mid"].map((v, i) => Math.round(v * 0.55 + P.tree[i] * 0.45)) };
      drawGnarl(ctx, segs, rgba(midTree.tree), P.rim, P.dark ? 0.14 : 0.14);
      barkLines(ctx, segs, midTree, 0.7, r);
      fence(ctx, w, y, { ...P, tree: P["hill-mid"].map((v, i) => Math.round(v * 0.5 + P.tree[i] * 0.5)) }, r, w * 0.04, w * 0.58, s);
      fillRidge(ctx, w, H, y, rgba(P["hill-mid"]));
      for (let i = 0, n = Math.round(w / 70); i < n; i++) {
        const x = (i + 0.2 + r() * 0.6) * (w / n);
        tombstone(ctx, x, y(x) + 4, (0.75 + r() * 0.5) * s, Math.floor(r() * 3), (r() - 0.5) * 0.3, { ...P, stone: P["hill-mid"].map((v, i) => Math.round(v * 0.6 + P.stone[i] * 0.4)) }, P.dark ? 0.35 : 0.5);
      }
      const mist = ctx.createLinearGradient(0, h * 0.78, 0, h);
      mist.addColorStop(0, rgba(P.haze, 0)); mist.addColorStop(0.6, rgba(P.haze, P.dark ? 0.25 : 0.4)); mist.addColorStop(1, rgba(P.haze, 0.1));
      ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.fillStyle = mist; ctx.fillRect(0, h * 0.78, w, H); ctx.restore();
    },
  },
  { name: "fog", html: true, depth: 12 },
  { /* near: a gnarled old tree framing the left edge, a smaller one on the right, dark ground */
    name: "near", res: 1, depth: 42, seed: 59,
    draw(ctx, w, h, P, r, H) {
      const s = k(w), y = ridge(w, h * 0.975, h * 0.012, 2.4);
      const segs = [];
      const big = Math.min(76, Math.max(24, w * 0.045)), x0 = big * 0.3;
      gnarl(segs, x0, h + 10, -Math.PI / 2 + 0.14, h * (w < 700 ? 0.22 : 0.36), big, w < 700 ? 4 : 6, r);
      const hx = segs[1][0], hy = segs[1][1];      // where the hollow goes, low on the trunk
      for (const [ang, L] of [[-0.12, 1.6], [0.35, 1.1], [Math.PI + 0.3, 1]]) {     // roots gripping the ground
        let px = x0, py = h - big * 0.35, a = ang, wd = big * 0.55;
        for (let q = 0; q < 3; q++) { const nx = px + Math.cos(a) * big * L * 0.45, ny = py + Math.sin(a) * big * L * 0.45 + big * 0.12; segs.push([px, py, nx, ny, wd]); px = nx; py = ny; wd *= 0.62; a += 0.25 * Math.sign(Math.cos(ang)); }
      }
      if (w > 700) gnarl(segs, w + 10, h + 10, -Math.PI / 2 - 0.3, h * 0.3, big * 0.75, 5, r);
      drawGnarl(ctx, segs, rgba(P.tree), P.rim, P.dark ? 0.16 : 0.18);
      barkLines(ctx, segs, P, 1, r);
      if (w > 700 && hx > big * 0.4) hollow(ctx, hx + big * 0.05, hy + big * 0.3, big * 0.2, P);
      fillRidge(ctx, w, H, y, rgba(P.ground));
      ctx.strokeStyle = rgba(P.ground); ctx.lineWidth = 1.2; ctx.lineCap = "round";   // grass along the edge
      ctx.beginPath();
      for (let x = 0; x < w; x += 3 + r() * 5) { const yy = y(x) + 2, hh = 4 + r() * 9; ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 1, yy - hh * 0.6, x + (r() - 0.5) * 6, yy - hh); }
      ctx.stroke();
      if (w > 700) { tombstone(ctx, w * 0.06, y(w * 0.06) + 6, 1.6 * s, 0, -0.12, P, P.dark ? 0.4 : 0.5); tombstone(ctx, w * 0.95, y(w * 0.95) + 6, 1.4 * s, 1, 0.1, P, P.dark ? 0.4 : 0.5); }
    },
  },
];

export function graveyardBackdrop() {
  return new Backdrop("graveyard", LAYERS, read).mount();
}

/* ---------------- the graveyard floor above the footer ---------------- */
function grassAndLeaves() {
  const r = seeded(91);
  let grass = "", leaves = "";
  const ground = (x) => 150 - 6 * Math.sin((x / 1200) * Math.PI) - 3 * Math.sin(x * 0.012);
  for (let x = 2; x < 1200; x += 4 + r() * 7) {
    const y = ground(x) + 2;
    for (let q = 0; q < 2; q++) { const h = 4 + r() * 9, l = (r() - 0.5) * 7; grass += `M${(x + q * 2).toFixed(1)} ${y.toFixed(1)}q${(l * 0.3).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${l.toFixed(1)} ${(-h).toFixed(1)}`; }
  }
  for (let i = 0; i < 26; i++) {
    const x = 20 + r() * 1160, y = ground(x) + 6 + r() * 18, a = (r() * 360).toFixed(0), c = r() < 0.5 ? "gf-leaf" : "gf-leaf2";
    leaves += `<path class="${c}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a})" d="M0-4C3-3 4 0 0 4C-4 0-3-3 0-4Z"/>`;
  }
  let fence = "";
  for (let x = 14; x < 1200; x += 24) {
    const lean = (((x * 7) % 9) - 4) * 0.6, t = ground(x) - 58;
    fence += `<g transform="rotate(${lean.toFixed(1)} ${x} ${ground(x)})"><path d="M${x} ${ground(x) + 4}V${t + 6}"/><path class="gf-spear" d="M${x - 2.6} ${t + 7}L${x} ${t}L${x + 2.6} ${t + 7}Z"/></g>`;
  }
  return { grass, leaves, fence, ground };
}

function jack(x, y, s, face) {
  const eyes = face === 1 ? "M-15-34l7-10 6 10ZM15-34l-7-10-6 10Z" : "M-16-33c2-7 9-9 12-4-4 1-8 3-12 4ZM16-33c-2-7-9-9-12-4 4 1 8 3 12 4Z";
  const mouth = face === 1 ? "M-19-20c6 6 32 6 38 0l-3 9-4-4-4 5-4-5-4 5-4-5-4 5-4-5-4 4Z" : "M-16-19c8 10 24 10 32 0-4 2-7 3-9 3l-2 4-3-4c-3 .4-5 .4-8 0l-3 4-2-4c-2 0-4-1-5-3Z";
  return `<g class="gf-jack" transform="translate(${x} ${y}) scale(${s})">
    <ellipse class="gf-jack-glow" cx="0" cy="-24" rx="62" ry="42"/>
    <path class="gf-stem" d="M-3-46c-1-7 2-12 8-14l2.4 3.6c-4 1.6-5.6 4.6-4.8 10Z"/>
    <ellipse class="gf-pump" cx="-20" cy="-24" rx="15" ry="22"/><ellipse class="gf-pump" cx="20" cy="-24" rx="15" ry="22"/>
    <ellipse class="gf-pump" cx="-9" cy="-24.5" rx="15" ry="24"/><ellipse class="gf-pump" cx="9" cy="-24.5" rx="15" ry="24"/>
    <ellipse class="gf-pump gf-pump--mid" cx="0" cy="-25" rx="13" ry="25"/>
    <path class="gf-rib" d="M-9-47C-15-38-15-12-9-1M9-47C15-38 15-12 9-1M-21-44C-31-35-31-13-21-4M21-44C31-35 31-13 21-4"/>
    <path class="gf-carve-lip" d="${eyes}M-3-29l3-5 3 5Z${mouth}"/>
    <path class="gf-carve" d="${eyes}M-3-29l3-5 3 5Z${mouth}"/>
    <path class="gf-pump-shine" d="M-26-38c-3 5-4 12-3 18M-4-45c4-1 9 0 12 2"/>
  </g>`;
}

export function graveyardFloor() {
  const { grass, leaves, fence, ground } = grassAndLeaves();
  const r = seeded(5);
  let web = "";                                    // a small cobweb between two fence bars
  for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * (Math.PI / 2); web += `M1150 96L${(1150 + Math.cos(a) * -34).toFixed(1)} ${(96 + Math.sin(a) * -34).toFixed(1)}`; }
  for (let q = 1; q <= 4; q++) {
    const R = q * 8; web += "M";
    for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * (Math.PI / 2); web += `${i ? "L" : ""}${(1150 + Math.cos(a) * -R).toFixed(1)} ${(96 + Math.sin(a) * -R + (r() - 0.5)).toFixed(1)}`; }
  }
  const candle = (x, h, d) => `<g class="gf-candle" transform="translate(${x} 0)">
      <ellipse class="gf-candle-glow" cx="0" cy="${-h - 8}" rx="16" ry="18" style="animation-delay:${d}s"/>
      <path class="gf-wax" d="M-4.5 0V${-h}c1.5-1.2 7.5-1.2 9 0V0Z"/>
      <path class="gf-drip" d="M-4.5 ${-h + 1}v6c0 2 2 2 2 0v-4c0 2 2 3 2 1v-2"/>
      <path class="gf-wick" d="M0 ${-h}v-3"/>
      <path class="gf-flame" style="animation-delay:${d}s" d="M0 ${-h - 15}C3 ${-h - 9} 3.4 ${-h - 4} 0 ${-h - 2.5}C-3.4 ${-h - 4} -3 ${-h - 9} 0 ${-h - 15}Z"/>
      <path class="gf-flame-in" style="animation-delay:${d}s" d="M0 ${-h - 10}C1.5 ${-h - 7} 1.6 ${-h - 4.5} 0 ${-h - 3.6}C-1.6 ${-h - 4.5} -1.5 ${-h - 7} 0 ${-h - 10}Z"/>
    </g>`;
  const svg = `<svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="gfSoil" x1="0" y1="0" x2="0" y2="1"><stop class="gf-s1" offset="0"/><stop class="gf-s2" offset="1"/></linearGradient>
      <linearGradient id="gfStone" x1="0" y1="0" x2="1" y2="1"><stop class="gf-t1" offset="0"/><stop class="gf-t2" offset=".6"/><stop class="gf-t3" offset="1"/></linearGradient>
      <radialGradient id="gfPump" cx=".4" cy=".35" r=".75"><stop class="gf-p1" offset="0"/><stop class="gf-p2" offset=".6"/><stop class="gf-p3" offset="1"/></radialGradient>
      <radialGradient id="gfFire" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff4b0"/><stop offset=".45" stop-color="#ffc040"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient>
      <radialGradient id="gfGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
      <radialGradient id="gfGreen"><stop offset="0" stop-color="#8ef06a" stop-opacity=".6"/><stop offset="1" stop-color="#8ef06a" stop-opacity="0"/></radialGradient>
      <linearGradient id="gfFog" x1="0" y1="0" x2="0" y2="1"><stop class="gf-f1" offset="0"/><stop class="gf-f2" offset=".7"/></linearGradient>
      <linearGradient id="gfGhost" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3dcf3"/></linearGradient>
    </defs>
    <g class="gf-fence">${fence}<path d="M0 ${ground(0) - 44}${Array.from({ length: 41 }, (_, i) => `L${i * 30} ${(ground(i * 30) - 44).toFixed(1)}`).join("")}M0 ${ground(0) - 16}${Array.from({ length: 41 }, (_, i) => `L${i * 30} ${(ground(i * 30) - 16).toFixed(1)}`).join("")}"/></g>
    <path class="gf-web" d="${web}"/>

    <g class="gf-ghost"><g class="gf-ghost__bob">
      <path class="gf-ghost-body" d="M180 136V96C180 80 190 70 204 70S228 80 228 96V136Q224 143 220 136Q216 143 212 136Q208 143 204 136Q200 143 196 136Q192 143 188 136Q184 143 180 136Z"/>
      <g class="gf-ghost__arm"><path class="gf-ghost-arm" d="M226 104c8-4 12-12 11-18-4 4-8 8-12 9Z"/></g>
      <g class="gf-ghost__face">
        <g class="gf-ghost__eyes"><ellipse class="gf-ghost-eye" cx="200" cy="92" rx="2.6" ry="3.6"/><ellipse class="gf-ghost-eye" cx="213" cy="92" rx="2.6" ry="3.6"/></g>
        <ellipse class="gf-ghost-mouth" cx="207" cy="102" rx="3" ry="2.4"/>
        <ellipse class="gf-blush" cx="195" cy="99" rx="3" ry="1.6"/><ellipse class="gf-blush" cx="219" cy="99" rx="3" ry="1.6"/>
      </g>
    </g></g>
    <g transform="translate(176 ${(ground(176) + 3).toFixed(1)}) rotate(-5)">
      <path class="gf-stone" d="M-24 0V-42C-24-57-13-65 0-65S24-57 24-42V0Z"/>
      <path class="gf-stone-side" d="M15 0V-42C15-53 10-59 4-62C15-61 24-53 24-42V0Z"/>
      <path class="gf-bevel" d="M-18-3V-42C-18-53-10-59 0-59S18-53 18-42"/>
      <text class="gf-engrave" x="0" y="-31" text-anchor="middle">RIP</text>
      <path class="gf-engrave-line" d="M-11-22H11M-8-16H8"/>
      <path class="gf-crack" d="M9-63l-4 9 5 6-6 11"/>
      <path class="gf-moss" d="M-24 0c1-7 6-10 10-7 3-5 8-4 10 1 4-3 9-1 9 6ZM10 0c1-4 5-6 8-4 2-3 5-2 6 1V0Z"/>
    </g>

    <g transform="translate(300 ${(ground(300) + 3).toFixed(1)}) rotate(7)">
      <path class="gf-stone" d="M-5.5 0V-50H-19V-61H-5.5V-78H5.5V-61H19V-50H5.5V0Z"/>
      <path class="gf-stone-side" d="M2.5 0V-50H5.5V0ZM2.5-61V-78H5.5V-61Z"/>
      <path class="gf-crack" d="M-12-55l5 3M2-30l-3 7 2 5"/>
      <path class="gf-moss" d="M-8 0c1-5 4-7 7-5 2-3 6-2 7 2 2-1 4 0 4 3Z"/>
    </g>

    ${jack(420, ground(420) + 5, 0.95, 1)}
    <g class="gf-plain" transform="translate(478 ${(ground(478) + 4).toFixed(1)}) scale(.55)">
      <path class="gf-stem" d="M-3-46c-1-7 2-12 8-14l2.4 3.6c-4 1.6-5.6 4.6-4.8 10Z"/>
      <ellipse class="gf-pump" cx="-14" cy="-23" rx="16" ry="22"/><ellipse class="gf-pump" cx="14" cy="-23" rx="16" ry="22"/><ellipse class="gf-pump gf-pump--mid" cx="0" cy="-24" rx="15" ry="24"/>
      <path class="gf-rib" d="M-6-46C-12-36-12-12-6-1M6-46C12-36 12-12 6-1"/>
    </g>

    <g class="gf-cauldron" transform="translate(612 ${(ground(612) + 3).toFixed(1)})">
      <ellipse class="gf-green-glow" cx="0" cy="-52" rx="60" ry="40"/>
      <path class="gf-log" d="M-30 0l26-9 3 5-26 9ZM30 0l-26-9-3 5 26 9Z"/>
      <path class="gf-fire" d="M-14-4C-15-14-8-16-6-24C-2-16 2-18 0-28C6-20 12-16 8-6C12-10 14-12 15-16C18-8 14 0 8 0H-8C-12 0-14-1-14-4Z"/>
      <path class="gf-pot-leg" d="M-18-12l-6 12M18-12l6 12M0-10v10"/>
      <path class="gf-pot" d="M-28-52C-34-30-24-10 0-10S34-30 28-52Z"/>
      <path class="gf-pot-shine" d="M-23-46C-25-34-20-22-10-16"/>
      <ellipse class="gf-brew" cx="0" cy="-52" rx="28" ry="6.5"/>
      <path class="gf-pot-rim" d="M-31-52C-31-57 31-57 31-52C31-47-31-47-31-52Z"/>
      <ellipse class="gf-brew" cx="0" cy="-53" rx="25" ry="4.4"/>
      <circle class="gf-bubble" cx="-9" cy="-55" r="3.2"/><circle class="gf-bubble" cx="6" cy="-55" r="2.4"/><circle class="gf-bubble" cx="14" cy="-55" r="1.8"/>
      <path class="gf-steam" d="M-6-62c-6-8 4-12-2-20M8-62c-5-7 4-11-1-18"/>
    </g>

    <g class="gf-cat" transform="translate(770 ${(ground(770) + 3).toFixed(1)})">
      <path class="gf-cat-tail" d="M14-6C30-4 36-18 30-30C27-36 30-42 34-44"/>
      <path class="gf-cat-body" d="M-16 0C-20-14-16-30-8-36L14-36C20-30 22-14 18 0Z"/>
      <path class="gf-cat-rim" d="M15-36C20-30 22-14 18 0"/>
      <path class="gf-cat-paw" d="M-8 0c0-3 3-4 5-2M4 0c0-3 3-4 5-2"/>
      <g class="gf-cat__head">
        <path class="gf-cat-body" d="M-8-35C-12-42-12-50-8-56L-9-66L-2-60C2-61 6-61 10-60L16-66L16-55C20-49 19-41 14-35C8-31.5-2-31.5-8-35Z"/>
        <path class="gf-cat-ear" d="M-6.5-61.5L-7.6-63.6L-3.2-60.6ZM12.6-61.2L14.4-63.4L14.2-58.6Z"/>
        <path class="gf-cat-rim" d="M16-55C20-49 19-41 14-36"/>
        <g class="gf-cat-eyes"><ellipse cx="-1.6" cy="-49" rx="2.6" ry="3"/><ellipse cx="8.6" cy="-49" rx="2.6" ry="3"/></g>
        <g class="gf-cat__pupils"><path class="gf-cat-pupil" d="M-1.6-51.4v4.8"/><path class="gf-cat-pupil" d="M8.6-51.4v4.8"/></g>
        <path class="gf-cat-nose" d="M2.4-44.4h2.4l-1.2 1.4Z"/>
        <ellipse class="gf-cat__mouth" cx="3.6" cy="-40.6" rx="2.2" ry="2"/>
        <path class="gf-whisk" d="M-2-43l-9-1M-2-42l-9 2M9-43l9-1M9-42l9 2"/>
      </g>
    </g>

    <g transform="translate(930 ${(ground(930) + 3).toFixed(1)})">
      <path class="gf-stone" d="M-17 0V-60H-19V-66H19V-60H17V0Z"/>
      <path class="gf-stone-side" d="M11 0V-60H17V0Z"/>
      <path class="gf-bevel" d="M-12-4V-56H12"/>
      <path class="gf-engrave-line" d="M-8-44H8M-8-38H8M-6-32H6"/>
      <path class="gf-crack" d="M-17-30l6 3-2 6"/>
      <path class="gf-moss" d="M-17 0c1-5 5-8 9-5 2-3 6-3 8 1 3-2 7-1 8 4Z"/>
      <g transform="translate(0 -66)"><g class="gf-crow"><g class="gf-crow__face"><g class="gf-crow__hop">
        <path class="gf-crow-spread gf-crow-spread--far" d="M1-9C-1-21-6-30-14-34C-12-28-11-23-11-18C-14-18-17-16-19-13C-11-10-4-9 1-9Z"/>
        <path class="gf-crow-tail" d="M-6-6L-18-2L-16 1L-5-2Z"/>
        <path class="gf-crow-body" d="M-8-4C-8-12 0-16 6-14C10-13 12-10 11-6C9-2 2 0-4 0C-7 0-8-2-8-4Z"/>
        <path class="gf-crow-wing" d="M-6-8C-2-12 6-12 8-8C4-6-2-5-8-4Z"/>
        <g class="gf-crow-head"><path class="gf-crow-body" d="M5-14C6-20 13-21 15-17C16-14 14-12 10-11Z"/><path class="gf-crow-beak" d="M14.6-17.4L20-16.2L14.8-15.6Z"/><path class="gf-crow-beak gf-crow__jaw" d="M14.8-15.8L19.4-15.8L14.6-14.4Z"/><circle class="gf-crow-eye" cx="11.6" cy="-17" r="1.1"/></g>
        <path class="gf-crow-feet" d="M0 0v2M3 0v2"/>
        <path class="gf-crow-spread gf-crow-spread--near" d="M2-9C-2-20-10-27-21-29C-16-24-13-19-12-14C-16-14-19-12-21-9C-12-7-4-7 2-9Z"/>
      </g></g></g></g>
    </g>

    <g class="gf-candles" transform="translate(1000 ${(ground(1000) + 4).toFixed(1)})">${candle(-12, 22, 0)}${candle(0, 32, -0.7)}${candle(12, 17, -1.3)}</g>
    ${jack(1090, ground(1090) + 5, 0.7, 2)}

    <path class="gf-soil" d="M0 180V${ground(0)}${Array.from({ length: 61 }, (_, i) => `L${i * 20} ${ground(i * 20).toFixed(1)}`).join("")}V180Z"/>
    <path class="gf-grass" d="${grass}"/>
    ${leaves}
    <rect class="gf-fog" x="-100" y="128" width="1400" height="52"/>
  </svg>`;
  const el = document.createElement("div");
  el.className = "graveyard-floor";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = svg;                              // static markup built above, no visitor input
  el.wake = () => wakeGraveyard(el);
  return el;
}

/* ---------------- the animals' behaviour ---------------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const side = (c, n) => { const b = c.box; return n.x < b.left + b.width / 2 ? "l" : "r"; };
async function pose(c, cls, ms, on = c.el) { on.classList.add(cls); const ok = await c.wait(ms); on.classList.remove(cls); return ok; }

/* the ghost behind the RIP stone: rises, looks about, waves, says boo, swoops out and back, sinks again.
   Hovering near the grave makes it peek; coming close while it is up makes it pop up and hide. */
async function ghost(c) {
  const DOWN = 84;
  c.set(0, DOWN);
  while (c.alive) {
    await c.wait(rnd(1500, 6500));
    if (!c.alive) break;
    c.scared(1500);
    let ok = await c.go({ y: rnd(-4, 3) }, 1500, "cubic-bezier(.2,.8,.3,1)");
    for (let i = 0, m = 1 + Math.floor(rnd(0, 4)); i < m && ok; i++) {
      const h = pick(["l", "r", "wave", "wave", "boo", "swoop", "blink"]);
      if (h === "l" || h === "r") ok = await pose(c, `is-${h}`, rnd(900, 1800));
      else if (h === "swoop") {
        ok = await c.go({ x: -64, y: -22, r: -8 }, 1800, "cubic-bezier(.4,0,.3,1)")
          && await c.go({ x: -26, y: -34, r: 6 }, 1500, "ease-in-out")
          && await c.go({ x: 0, y: 0, r: 0 }, 1700, "ease-in-out");
      } else ok = await c.act(`is-${h}`, h === "wave" ? 1500 : h === "boo" ? 900 : 200);
      if (ok) ok = await c.wait(rnd(400, 1500));
    }
    if (!ok && c.scared(3000)) await c.act("is-boo", 700);
    await c.go({ x: 0, y: DOWN, r: 0 }, 1000, "cubic-bezier(.55,0,.8,.45)");
  }
}

/* the black cat: blinks, tilts and turns its head, yawns, swishes its tail; watches the pointer
   with wide pupils and a lashing tail, then gives a slow blink */
async function cat(c) {
  while (c.alive) {
    const n = c.scared(3500);
    if (n) {
      c.el.classList.add("is-wide"); c.pace(3);
      await pose(c, `is-${side(c, n)}`, rnd(1800, 2800));
      c.el.classList.remove("is-wide"); c.pace(1);
      await c.act("is-sblink", 1400);
      continue;
    }
    const h = pick(["blink", "blink", "tilt", "l", "r", "yawn", "sblink", "swish"]);
    if (h === "blink") await c.act("is-blink", 200);
    else if (h === "yawn" || h === "sblink") await c.act(`is-${h}`, h === "yawn" ? 1700 : 1400);
    else if (h === "swish") { c.pace(rnd(1.8, 2.8)); await c.wait(rnd(1800, 3200)); c.pace(1); }
    else await pose(c, `is-${h}`, rnd(1100, 2600));
    await c.wait(rnd(700, 3000));
  }
}

/* the crow on the tall stone: hops, turns, caws, ruffles; after a while (or when the pointer comes
   close) it flies off across the graveyard and later glides back in to land */
async function crow(c) {
  c.set(0, 0);
  while (c.alive) {
    let ok = true;
    const until = performance.now() + rnd(5000, 15000);
    while (ok && c.alive && performance.now() < until) {
      const h = pick(["l", "r", "hop", "hop", "caw", "ruffle", "turn"]);
      if (h === "hop") { c.el.classList.add("is-hop"); ok = await c.go({ x: clamp(c.x + rnd(-6, 6), -8, 8) }, 320, "ease-out"); c.el.classList.remove("is-hop"); }
      else if (h === "turn") { c.face(-c.dir); ok = await c.wait(300); }
      else if (h === "l" || h === "r") ok = await pose(c, `is-${h}`, rnd(700, 2000));
      else ok = await c.act(`is-${h}`, h === "caw" ? 900 : 600);
      if (ok) ok = await c.wait(rnd(500, 2200));
      if (!ok && c.loved) ok = true;               // petted: stays on its stone
    }
    if (!c.alive) break;
    const n = c.scared(6000), away = n ? (side(c, n) === "l" ? 1 : -1) : chance(0.5) ? 1 : -1;
    c.el.classList.add("is-fly"); c.face(away); c.pace(1.5);
    await c.go({ x: away * 40, y: -30, r: -14 * away }, 450, "ease-out");
    await c.go({ x: away * rnd(950, 1100), y: -rnd(40, 70), r: -4 * away }, 3400, "cubic-bezier(.3,0,.8,.8)");
    await c.wait(rnd(6000, 16000));
    if (!c.alive) break;
    const from = chance(0.5) ? 1 : -1;
    c.set(from * 1050, -64, 0); c.face(-from); c.pace(1.1);
    await c.go({ x: from * 80, y: -24, r: 6 * from }, 3000, "cubic-bezier(.2,.6,.4,1)");
    await c.go({ x: 0, y: 0, r: 0 }, 650, "ease-out");
    c.el.classList.remove("is-fly"); c.pace(1);
  }
}

/* the little ghost near the bottom-right corner of the window: drifts about, leans into its moves,
   sometimes loops or fades out for a moment, and flees (going see-through) from the pointer */
async function floatGhost(c) {
  const el = c.el;
  const area = () => { const W = document.documentElement.clientWidth || innerWidth, H = innerHeight; return [W - Math.min(340, W * 0.36), W - 58, H * 0.45, H - 72]; };
  el.classList.add("is-alive");
  let [, x1, , y1] = area();
  c.set(x1, y1);
  while (c.alive) {
    const [x0, xa, y0, ya] = area();
    const n = c.scared(2500);
    if (n) {
      const b = c.box, ang = Math.atan2(b.top + b.height / 2 - n.y, b.left + b.width / 2 - n.x);
      el.classList.add("is-shy");
      await c.go({ x: clamp(c.x + Math.cos(ang) * 170, x0, xa), y: clamp(c.y + Math.sin(ang) * 170, y0, ya), r: Math.cos(ang) * 14 }, 650, "cubic-bezier(.2,.7,.3,1)");
      await c.wait(1400);
      el.classList.remove("is-shy");
      continue;
    }
    const tx = rnd(x0, xa), ty = rnd(y0, ya), d = Math.hypot(tx - c.x, ty - c.y);
    let ok = await c.go({ x: tx, y: ty, r: clamp((tx - c.x) * 0.05, -12, 12) }, 700 + d / 0.05, "ease-in-out");
    if (ok) ok = await c.go({ r: 0 }, 500, "ease-out");
    if (ok && chance(0.15)) ok = await c.act("is-loop", 1300);
    else if (ok && chance(0.15)) ok = await c.act("is-fade", 2400);
    if (ok) await c.wait(rnd(1200, 4500));
  }
}

function wakeGraveyard(floor) {
  const life = new Life();
  const q = (s) => floor.querySelector(s);
  life.add(q(".gf-ghost"), ghost, { radius: 60, name: "ghost", pet: "is-wave", petMs: 1500 });
  life.add(q(".gf-cat"), cat, { radius: 110, skittish: false, name: "cat", pet: "is-sblink", petMs: 1400 });
  life.add(q(".gf-crow"), crow, { radius: 70, face: q(".gf-crow__face"), name: "crow", pet: "is-caw", petMs: 900 });
  return life;
}

/** Behaviour for the floating ghost icon (holiday.js makes the element). */
export function wakeFloatGhost(el) {
  const life = new Life();
  life.add(el, floatGhost, { radius: 70, name: "ghost", pet: "is-loop", petMs: 1300 });
  return life;
}

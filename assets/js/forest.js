/*
 * The default look: a painted redwood forest.
 *   background  far trees lost in the haze, light shafts, closer redwoods with bark and needle
 *               sprays, sword ferns and sorrel on the ground, two big trunks framing the edges
 *   floor       a little scene above the footer: a mossy log, mushrooms, ferns, two banana slugs,
 *               a deer walking through and an owl on the log
 *   air         redwood animals wandering over the page (critters.js), dust by day and fireflies at night
 * Colours: the --fs-* and --ff-* variables in forest.css.
 */
import { Backdrop, palette, mix, rgba, seeded } from "./scene.js";
import { screenCritters, DEER, OWL } from "./critters.js";

const NAMES = ["haze", "sky", "ray", "bark", "bark-hi", "bark-lo", "ink", "leaf", "leaf-hi", "leaf-lo", "moss", "fern", "fern-hi", "ground", "sorrel", "cap"];
const read = () => Object.assign(palette("fs-", NAMES), { dark: document.documentElement.dataset.theme === "dark" });
const tint = (P, k, f) => mix(P[k], P.haze, f);

/* ---------------- one redwood ---------------- */
function tree(x, w, base, top, r) {
  const len = base - top, lean = (r() - 0.5) * 0.018, ph = r() * 6.28, flare = 0.45 + r() * 0.4;
  return {
    x, w, base, top, len, ph,
    cx: (y) => x + lean * (base - y) + Math.sin(((base - y) / len) * 5 + ph) * w * 0.025,
    hw: (y) => { const d = base - y; return (w / 2) * (1 - 0.22 * (d / len)) * (1 + flare * Math.exp(-d / (w * 0.5))); },
  };
}

function outline(t) {
  const p = new Path2D(), n = 48, ys = [];
  for (let i = 0; i <= n; i++) ys.push(t.base + t.w * 0.3 - (t.len + t.w * 0.3 + 4) * (i / n));
  const bump = (y, s) => 1 + 0.025 * Math.sin(y * 0.031 + t.ph * s) + 0.015 * Math.sin(y * 0.13 + t.ph * 2 * s);
  ys.forEach((y, i) => { const x = t.cx(y) - t.hw(y) * bump(y, 1); if (i) p.lineTo(x, y); else p.moveTo(x, y); });
  for (let i = n; i >= 0; i--) { const y = ys[i]; p.lineTo(t.cx(y) + t.hw(y) * bump(y, 3), y); }
  p.closePath();
  return p;
}

/* bark: a rounded gradient, long fibrous furrows that bunch up toward the edges like a cylinder,
   moss creeping up the lit side, a few stubs where old branches broke off */
function trunk(ctx, t, P, r, f, lod) {
  const bark = tint(P, "bark", f), hi = tint(P, "bark-hi", f), lo = tint(P, "bark-lo", f), ink = tint(P, "ink", f);
  const path = outline(t);
  const gy = t.base - t.len * 0.25, cx = t.cx(gy), hw = t.hw(gy);
  const g = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
  g.addColorStop(0, rgba(hi)); g.addColorStop(0.24, rgba(bark)); g.addColorStop(0.6, rgba(bark)); g.addColorStop(1, rgba(lo));
  ctx.fillStyle = g;
  ctx.fill(path);

  ctx.save();
  ctx.clip(path);
  const n = Math.max(4, Math.round(t.w / (lod === 2 ? 3.4 : lod === 1 ? 3.6 : 5)));
  const thick = new Path2D(), thin = new Path2D(), ridge = new Path2D();
  const step = lod === 2 ? 5 : 8;
  for (let j = 0; j < n; j++) {
    const u = Math.sin(-Math.PI / 2 + Math.PI * ((j + 0.15 + r() * 0.7) / n));
    const into = r() < 0.4 ? thick : thin, lit = u < 0.25 && r() < 0.55;
    const phase = r() * 6.28, amp = 0.3 + r() * (lod === 2 ? 1.6 : 0.9);
    let y = t.base + t.w * 0.2 - r() * 20;
    while (y > t.top - 10) {
      const end = y - (40 + r() * (lod === 2 ? 320 : 200));
      let first = true;
      for (let yy = y; yy >= end; yy -= step) {
        const x = t.cx(yy) + u * t.hw(yy) * 0.97 + Math.sin(yy * 0.04 + phase) * amp;
        if (first) { into.moveTo(x, yy); if (lit) ridge.moveTo(x - 1.6, yy); first = false; }
        else { into.lineTo(x, yy); if (lit) ridge.lineTo(x - 1.6, yy); }
      }
      y = end - (3 + r() * 22);
    }
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(ink, lod ? 0.42 : 0.3); ctx.lineWidth = lod === 2 ? 2.4 : lod === 1 ? 1.5 : 1.1; ctx.stroke(thick);
  ctx.strokeStyle = rgba(ink, lod ? 0.3 : 0.2); ctx.lineWidth = lod === 2 ? 1.1 : 0.8; ctx.stroke(thin);
  if (lod) { ctx.strokeStyle = rgba(hi, 0.45); ctx.lineWidth = lod === 2 ? 1.2 : 0.8; ctx.stroke(ridge); }

  /* round it off: light rim on the left, shadow on the right, darker where it meets the ground */
  const s = ctx.createLinearGradient(cx - hw * 1.05, 0, cx + hw * 1.05, 0);
  s.addColorStop(0, rgba(hi, 0.6)); s.addColorStop(0.09, rgba(hi, 0)); s.addColorStop(0.52, rgba(lo, 0)); s.addColorStop(1, rgba(lo, 0.65));
  ctx.fillStyle = s;
  ctx.fillRect(cx - hw * 4, t.top - 20, hw * 8, t.len + t.w + 40);
  const ao = ctx.createLinearGradient(0, t.base - t.w * 0.9, 0, t.base + 2);
  ao.addColorStop(0, rgba(lo, 0)); ao.addColorStop(1, rgba(lo, 0.55));
  ctx.fillStyle = ao;
  ctx.fillRect(cx - hw * 4, t.base - t.w, hw * 8, t.w * 1.4);

  if (lod) {                                       // patches of moss near the base, mostly on the lit side
    const moss = tint(P, "moss", f), mossHi = tint(P, "leaf-hi", f);
    const mp = new Path2D(), mh = new Path2D(), sc = lod === 2 ? 1.5 : 1;
    for (let c = 0, m = lod === 2 ? 7 : 4; c < m; c++) {
      const py = t.base - Math.pow(r(), 1.5) * t.w * (c < 2 ? 0.5 : 1.6), pu = -0.95 + r() * 1.1;
      const R = t.w * (0.12 + r() * 0.16);
      for (let k = 0, q = Math.round(R * 2.2 * sc); k < q; k++) {
        const ang = r() * 6.283, d = Math.sqrt(r());
        const yy = py + Math.sin(ang) * d * R * 0.7, x = t.cx(yy) + pu * t.hw(yy) + Math.cos(ang) * d * R;
        const rad = (0.6 + r() * 1.5) * sc, into = Math.sin(ang) < -0.3 && r() < 0.7 ? mh : mp;
        into.moveTo(x + rad, yy); into.ellipse(x, yy, rad, rad * 0.8, 0, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = rgba(moss, 0.9); ctx.fill(mp);
    ctx.fillStyle = rgba(mossHi, 0.85); ctx.fill(mh);
  }
  if (lod === 2) {                                 // an old knot
    const yy = t.base - t.w * (1.3 + r() * 1.2), x = t.cx(yy) - t.hw(yy) * (0.1 + r() * 0.3), R = t.w * 0.05;
    ctx.fillStyle = rgba(ink, 0.35); ctx.beginPath(); ctx.ellipse(x, yy, R, R * 1.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(hi, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x + 0.6, yy, R * 1.6, R * 2.6, 0, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke();
  }
  ctx.restore();

  if (lod) {                                       // broken branch stubs
    ctx.strokeStyle = rgba(lo, 0.9); ctx.lineCap = "round";
    for (let k = 0, m = 2 + Math.floor(r() * 3); k < m; k++) {
      const yy = t.base - t.len * (0.35 + r() * 0.55);
      if (yy < 0) continue;
      const side = r() < 0.5 ? -1 : 1, x = t.cx(yy) + side * t.hw(yy) * 0.92, L = t.w * (0.12 + r() * 0.16);
      ctx.lineWidth = Math.max(1.2, t.w * 0.05);
      ctx.beginPath(); ctx.moveTo(x - side * 2, yy); ctx.lineTo(x + side * L, yy - L * 0.6); ctx.stroke();
    }
  }
}

/* one flat spray as a filled shape: a stem with a serrated edge where the needles stick out.
   width(s) gives the needle length along the stem (0 = base, 1 = tip). Added to path P. */
function spray(P, x, y, ang, len, droop, width) {
  const steps = Math.max(4, Math.round(len / 2.6));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    pts.push([x + Math.cos(ang) * len * s, y + Math.sin(ang) * len * s + droop * len * s * s]);
  }
  const L = [], R = [];
  for (let i = 1; i < steps; i++) {
    const [px, py] = pts[i - 1], [nx, ny] = pts[i], ta = Math.atan2(ny - py, nx - px), nl = width(i / steps);
    for (const [arr, sg] of [[L, -1], [R, 1]]) {
      arr.push([nx + Math.cos(ta + sg * 1.57) * nl * 0.35, ny + Math.sin(ta + sg * 1.57) * nl * 0.35]);
      arr.push([nx + Math.cos(ta + sg * 0.95) * nl, ny + Math.sin(ta + sg * 0.95) * nl]);
    }
  }
  P.moveTo(x, y);
  for (const [px, py] of L) P.lineTo(px, py);
  P.lineTo(pts[steps][0], pts[steps][1]);
  for (let i = R.length - 1; i >= 0; i--) P.lineTo(R[i][0], R[i][1]);
  P.closePath();
}
const taper = (w0) => (s) => w0 * (1 - 0.62 * s) * Math.min(1, 0.45 + s * 4);

/* a branch from the trunk that rises a little, then droops under a pad of hanging sprays */
function branch(ctx, t, y, side, P, r, f, k, P3) {
  const x0 = t.cx(y) + side * t.hw(y) * 0.85, L = t.w * (0.9 + r() * 1.1) + 26 * k;
  const ex = x0 + side * L, ey = y + L * (0.08 + r() * 0.12), qx = x0 + side * L * 0.5, qy = y - L * (0.1 + r() * 0.1);
  const at = (s) => [(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * qx + s * s * ex, (1 - s) * (1 - s) * y + 2 * (1 - s) * s * qy + s * s * ey];
  ctx.strokeStyle = rgba(tint(P, "bark-lo", f), 0.9); ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, t.w * 0.06);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(qx, qy, ex, ey); ctx.stroke();
  const out = side > 0 ? 0 : Math.PI, dir = (a) => (side > 0 ? a : Math.PI - a);
  for (let s = 0.18; s <= 1.001; s += 0.06 + r() * 0.05) {      // little fans of sprays all along the branch
    const [bx, by] = at(s), g = (0.65 + s * 0.55) * k;
    for (let q = 0, m = 3 + Math.floor(r() * 3); q < m; q++) {
      const a = -0.7 + (q / (m - 1)) * 2.1 + (r() - 0.5) * 0.35, sz = (13 + r() * 13) * g;
      const into = a > 0.9 ? P3.lo : a < -0.2 && r() < 0.7 ? P3.hi : P3.mid;
      spray(into, bx, by + (into === P3.lo ? 2 * k : 0), dir(a), sz, a < 0 ? 0.55 : 0.32, taper(5.2 * g));
    }
  }
  for (let q = 0; q < 3; q++) spray(q ? P3.mid : P3.lo, ex, ey, out + side * (-0.3 + q * 0.35), (20 + r() * 8) * k, 0.4, taper(5.4 * k));
  spray(P3.hi, ex, ey - 1, dir(-0.35), 15 * k, 0.5, taper(4.4 * k));
}

function needles(ctx, P, f, k, P3) {
  ctx.fillStyle = rgba(tint(P, "leaf-lo", f), 0.92); ctx.fill(P3.lo);
  ctx.fillStyle = rgba(tint(P, "leaf", f)); ctx.fill(P3.mid);
  ctx.fillStyle = rgba(tint(P, "leaf-hi", f), 0.95); ctx.fill(P3.hi);
}
const sprays = () => ({ lo: new Path2D(), mid: new Path2D(), hi: new Path2D() });

/* sword fern: a fan of long arching fronds with narrow leaflets */
function fern(ctx, x, y, size, P, r, f, k) {
  const back = new Path2D(), mid = new Path2D(), front = new Path2D();
  const n = 9 + Math.floor(r() * 5);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1) - 0.5, a = -Math.PI / 2 + u * 2.3 + (r() - 0.5) * 0.2;
    const L = size * (0.75 + r() * 0.4) * (1 - Math.abs(u) * 0.3), pin = size * (0.085 + r() * 0.03);
    const into = Math.abs(u) > 0.35 ? back : i % 3 ? mid : front;
    spray(into, x + u * size * 0.15, y, a, L, 0.55 + r() * 0.35, (s) => pin * Math.sin(Math.PI * Math.min(1, s * 1.1 + 0.06)) + 0.6 * k);
  }
  ctx.fillStyle = rgba(tint(P, "leaf-lo", f), 0.95); ctx.fill(back);
  ctx.fillStyle = rgba(tint(P, "fern", f)); ctx.fill(mid);
  ctx.fillStyle = rgba(tint(P, "fern-hi", f)); ctx.fill(front);
}

/* redwood sorrel: a low carpet of clover-like trios of leaves */
function sorrel(ctx, x, y, n, spread, P, r, f, k) {
  const leaf = new Path2D(), lite = new Path2D(), vein = new Path2D();
  for (let i = 0; i < n; i++) {
    const sx = x + (r() - 0.5) * spread, cy = y - (1 + r() * 5) * k, R = (2.6 + r() * 1.8) * k, into = r() < 0.35 ? lite : leaf;
    for (let q = 0; q < 3; q++) {
      const a = -Math.PI / 2 + (q - 1) * 2.0944 + (r() - 0.5) * 0.4, lx = sx + Math.cos(a) * R * 0.9, ly = cy + Math.sin(a) * R * 0.5;
      into.moveTo(lx + R, ly); into.ellipse(lx, ly, R, R * 0.6, a, 0, Math.PI * 2);
      vein.moveTo(sx, cy); vein.lineTo(sx + Math.cos(a) * R * 1.5, cy + Math.sin(a) * R * 0.8);
    }
  }
  ctx.fillStyle = rgba(tint(P, "sorrel", f), 0.95); ctx.fill(leaf);
  ctx.fillStyle = rgba(tint(P, "leaf-hi", f), 0.95); ctx.fill(lite);
  ctx.strokeStyle = rgba(tint(P, "leaf-lo", f), 0.45); ctx.lineWidth = 0.5 * k; ctx.stroke(vein);
}

function mushroom(ctx, x, y, s, P, f) {
  const cap = tint(P, "cap", f), stem = mix(tint(P, "haze", 0), [255, 250, 240], 0.6);
  ctx.fillStyle = rgba(mix(stem, P["bark-lo"], 0.15)); ctx.beginPath();
  ctx.moveTo(x - s * 0.18, y); ctx.lineTo(x - s * 0.12, y - s * 0.75); ctx.lineTo(x + s * 0.12, y - s * 0.75); ctx.lineTo(x + s * 0.2, y); ctx.fill();
  ctx.fillStyle = rgba(cap); ctx.beginPath();
  ctx.ellipse(x, y - s * 0.75, s * 0.5, s * 0.36, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = rgba(mix(cap, [255, 255, 255], 0.65));
  for (const [dx, dy, rr] of [[-0.22, -0.92, 0.07], [0.08, -1.0, 0.06], [0.26, -0.84, 0.05]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, rr * s, 0, Math.PI * 2); ctx.fill(); }
}

/* rolling ground from y to the bottom of the canvas */
function ground(ctx, w, y, H, P, r, f, bumps) {
  const p = new Path2D();
  p.moveTo(0, H); p.lineTo(0, y);
  for (let x = 0; x <= w + 40; x += 40) p.lineTo(x, y + Math.sin(x * 0.006 + bumps) * 6 + Math.sin(x * 0.021 + bumps * 2) * 3);
  p.lineTo(w, H); p.closePath();
  const g = ctx.createLinearGradient(0, y - 8, 0, y + 70);
  g.addColorStop(0, rgba(tint(P, "ground", f))); g.addColorStop(1, rgba(tint(P, "leaf-lo", Math.min(1, f + 0.25))));
  ctx.fillStyle = g; ctx.fill(p);
  const litter = new Path2D();                     // fallen needles
  for (let i = 0, m = Math.round(w / 6); i < m; i++) {
    const x = r() * w, yy = y + 4 + r() * 40, a = r() * Math.PI, L = 2 + r() * 4;
    litter.moveTo(x, yy); litter.lineTo(x + Math.cos(a) * L, yy + Math.sin(a) * L * 0.4);
  }
  ctx.strokeStyle = rgba(tint(P, "bark", f), 0.55); ctx.lineWidth = 1; ctx.stroke(litter);
}

/* soft mist that only tints what is already drawn */
function mist(ctx, w, y0, y1, P, a) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, rgba(P.haze, 0)); g.addColorStop(0.55, rgba(P.haze, a)); g.addColorStop(1, rgba(P.haze, a * 0.4));
  ctx.fillStyle = g; ctx.fillRect(0, y0, w, y1 - y0);
  ctx.restore();
}
/* the top of a layer melts into the haze of the canopy */
function fadeTop(ctx, w, to, a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const g = ctx.createLinearGradient(0, 0, 0, to);
  g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, to);
  ctx.restore();
}

const scaleOf = (w) => Math.min(1.25, Math.max(0.7, w / 1280));

const LAYERS = [
  { /* far: a pale wall of thin trunks with tufts of foliage, out of focus on purpose */
    name: "far", res: 0.6, depth: 10, seed: 11,
    draw(ctx, w, h, P, r, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
      sky.addColorStop(0, rgba(P.sky, P.dark ? 0.5 : 0.75)); sky.addColorStop(1, rgba(P.sky, 0));
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      const f = P.dark ? 0.55 : 0.68, k = scaleOf(w), n = Math.round(w / 64) + 3, base = h * 0.79;
      for (let i = 0; i < n; i++) {
        const t = tree((i + 0.1 + r() * 0.8) * (w / n), (7 + r() * 15) * k, base + r() * h * 0.03, -40, r);
        trunk(ctx, t, P, r, f + r() * 0.12, 0);
        const blob = new Path2D();
        for (let c = 0, m = 7 + Math.floor(r() * 6); c < m; c++) {
          const yy = h * (0.04 + r() * 0.5), side = c % 2 ? 1 : -1, x = t.cx(yy) + side * (t.hw(yy) + 4 + r() * 16 * k);
          blob.moveTo(x + 14 * k, yy); blob.ellipse(x, yy, (8 + r() * 12) * k, (3 + r() * 4) * k, side * 0.18, 0, Math.PI * 2);
        }
        ctx.fillStyle = rgba(tint(P, "leaf", f + 0.05), 0.9); ctx.fill(blob);
      }
      ground(ctx, w, base + 4, H, P, r, f + 0.1, 1.3);
      fadeTop(ctx, w, h * 0.55, 0.85);
      mist(ctx, w, h * 0.5, h * 0.9, P, P.dark ? 0.55 : 0.75);
    },
  },
  { /* mid: redwoods with bark, moss and branches of hanging sprays, ferns at their feet */
    name: "mid", res: 1, depth: 26, seed: 29,
    draw(ctx, w, h, P, r, H) {
      const f = P.dark ? 0.3 : 0.46, k = scaleOf(w), n = Math.max(3, Math.round(w / 165)), base = h * 0.885;
      const trees = [];
      for (let i = 0; i < n; i++) trees.push(tree((i + 0.12 + r() * 0.76) * (w / n), (26 + r() * 30) * k, base + r() * h * 0.025, -60, r));
      trees.sort((a, b) => a.w - b.w);
      for (const t of trees) {
        trunk(ctx, t, P, r, f, 1);
        const P3 = sprays();
        for (let b = 0, m = 4 + Math.floor(r() * 4); b < m; b++) {
          const yy = h * (0.02 + (b / m) * 0.42 + r() * 0.05);
          branch(ctx, t, yy, b % 2 ? 1 : -1, P, r, f, 0.85 * k, P3);
        }
        needles(ctx, P, f, 0.85 * k, P3);
      }
      ground(ctx, w, base + 2, H, P, r, f + 0.05, 4.1);
      for (const t of trees) fern(ctx, t.cx(t.base) + (r() - 0.5) * t.w * 1.8, t.base + 10, 34 * k, P, r, f, 0.8 * k);
      for (let i = 0, m = Math.round(w / 220); i < m; i++) fern(ctx, r() * w, base + 14 + r() * 10, (20 + r() * 14) * k, P, r, f + 0.05, 0.7 * k);
      for (let i = 0, m = Math.round(w / 90); i < m; i++) sorrel(ctx, r() * w, base + 16 + r() * 18, 5, 30 * k, P, r, f, 0.8 * k);
      fadeTop(ctx, w, h * 0.3, 0.6);
      mist(ctx, w, h * 0.62, h * 0.95, P, P.dark ? 0.35 : 0.5);
    },
  },
  { /* light shafts from the canopy (drawn small, so they come out soft) */
    name: "rays", res: 0.25, depth: 0, seed: 3,
    draw(ctx, w, h, P, r) {
      const a = P.dark ? 0.14 : 0.7;
      const glow = ctx.createRadialGradient(w * 0.14, -h * 0.08, 0, w * 0.14, -h * 0.08, Math.max(w, h) * 0.8);
      glow.addColorStop(0, rgba(P.ray, a)); glow.addColorStop(1, rgba(P.ray, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      const tilt = Math.tan(0.4);
      for (let i = 0; i < 7; i++) {
        const x0 = w * (-0.02 + i * 0.12 + r() * 0.07), w0 = w * (0.012 + r() * 0.04), len = h * (0.8 + r() * 0.35), dx = tilt * len, w1 = w0 * 2.6;
        const g = ctx.createLinearGradient(x0, 0, x0 + dx, len);
        g.addColorStop(0, rgba(P.ray, a * (0.5 + r() * 0.6))); g.addColorStop(0.7, rgba(P.ray, a * 0.18)); g.addColorStop(1, rgba(P.ray, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x0, -10); ctx.lineTo(x0 + w0, -10); ctx.lineTo(x0 + dx + w0 / 2 + w1 / 2, len); ctx.lineTo(x0 + dx + w0 / 2 - w1 / 2, len); ctx.fill();
      }
    },
  },
  { name: "mist", html: true, depth: 14 },
  { /* near: two huge trunks framing the page, ferns and sorrel along the very bottom */
    name: "near", res: 1, depth: 48, seed: 47,
    draw(ctx, w, h, P, r, H) {
      const f = P.dark ? 0.12 : 0.2, k = scaleOf(w), base = h * 0.985;
      const W = Math.min(190, Math.max(54, w * 0.105));
      const edge = [tree(-W * 0.12, W, base, -80, r), tree(w + W * 0.08, W * 0.9, base + 4, -80, r)];
      for (const t of edge) trunk(ctx, t, P, r, f, 2);
      if (w > 760) {                                // one spray reaching in from each big trunk
        const P3 = sprays();
        branch(ctx, edge[0], h * 0.1, 1, P, r, f, 1.15 * k, P3);
        branch(ctx, edge[1], h * 0.2, -1, P, r, f, 1.15 * k, P3);
        needles(ctx, P, f, 1.15 * k, P3);
      }
      ground(ctx, w, base, H, P, r, f + 0.1, 2.2);
      fern(ctx, W * 0.55, base + 8, 70 * k, P, r, f, 1.2 * k);
      fern(ctx, w - W * 0.6, base + 10, 64 * k, P, r, f, 1.2 * k);
      if (w > 760) { fern(ctx, w * 0.3, base + 18, 40 * k, P, r, f + 0.1, k); fern(ctx, w * 0.74, base + 16, 46 * k, P, r, f + 0.1, k); }
      for (let i = 0, m = Math.round(w / 60); i < m; i++) sorrel(ctx, r() * w, base + 10 + r() * 30, 7, 40 * k, P, r, f, k);
      for (const x of [W * 1.05, w - W * 1.15]) { mushroom(ctx, x, base + 6, 16 * k, P, f); mushroom(ctx, x + 12 * k, base + 8, 11 * k, P, f); }
    },
  },
];

export function forestBackdrop() {
  return new Backdrop("forest", LAYERS, read).mount();
}

/* ---------------- animals, dust and fireflies over the page ---------------- */
export function forestAir() {
  const air = document.createElement("div");
  air.className = "forest-air";
  air.setAttribute("aria-hidden", "true");
  air.append(...screenCritters());
  const r = seeded(5);
  for (let i = 0; i < 14; i++) {                   // fireflies (night) and dust in the light (day)
    const f = document.createElement("i");
    f.className = i % 2 ? "firefly" : "firefly mote";
    f.style.cssText = `left:${(r() * 96 + 2).toFixed(1)}%;top:${(30 + r() * 64).toFixed(1)}%;--t:${(6 + r() * 7).toFixed(1)}s;--d:-${(r() * 9).toFixed(1)}s`;
    air.append(f);
  }
  return air;
}

/* ---------------- the forest floor above the footer ---------------- */
function fernSVG(x, y, size, n, r, cls) {
  let d = "", lf = "";
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.6 + (r() - 0.5) * 0.2, L = size * (0.6 + r() * 0.45), bend = (a + Math.PI / 2) * 0.95;
    let px = x, py = y;
    const steps = Math.round(L / 4.2);
    d += `M${px.toFixed(1)} ${py.toFixed(1)}`;
    for (let j = 1; j <= steps; j++) {
      const s = j / steps, aa = a + bend * s * s, nx = px + Math.cos(aa) * (L / steps), ny = py + Math.sin(aa) * (L / steps);
      d += `L${nx.toFixed(1)} ${ny.toFixed(1)}`;
      const pl = size * 0.15 * Math.sin(Math.PI * Math.min(1, s * 1.1 + 0.1)) + 1.4;
      for (const sg of [-1, 1]) {
        const pa = aa + sg * 1.2, ex = nx + Math.cos(pa) * pl, ey = ny + Math.sin(pa) * pl;
        const mx = nx + Math.cos(pa) * pl * 0.5 + Math.cos(aa) * 1.6, my = ny + Math.sin(pa) * pl * 0.5 + Math.sin(aa) * 1.6;
        lf += `M${nx.toFixed(1)} ${ny.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      }
      px = nx; py = ny;
    }
  }
  return `<g class="${cls}"><path class="ff-leaflets" d="${lf}"/><path class="ff-stems" d="${d}"/></g>`;
}

function sorrelSVG(x, y, n, spread, r) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const sx = x + (r() - 0.5) * spread, h = 7 + r() * 10, cy = y - h, R = 3.4 + r() * 1.8;
    s += `<path class="ff-stem" d="M${sx.toFixed(1)} ${y}Q${(sx + 1).toFixed(1)} ${(y - h / 2).toFixed(1)} ${sx.toFixed(1)} ${cy.toFixed(1)}"/>`;
    for (let q = 0; q < 3; q++) {
      const a = (-90 + (q - 1) * 120 + (r() - 0.5) * 20);
      s += `<g transform="translate(${sx.toFixed(1)} ${cy.toFixed(1)}) rotate(${a.toFixed(0)})"><path class="ff-sorrel" d="M0 0C${R * 0.4} ${-R * 0.5} ${R * 1.3} ${-R * 0.9} ${R * 1.6} ${-R * 0.25}C${R * 1.75} 0 ${R * 1.6} ${R * 0.2} ${R * 1.6} ${R * 0.25}C${R * 1.3} ${R * 0.9} ${R * 0.4} ${R * 0.5} 0 0Z"/><path class="ff-vein" d="M.6 0H${R * 1.45}"/></g>`;
    }
  }
  return s;
}

/* a banana slug, side view, facing right; tail tip at 0,0 */
const SLUG = `
  <ellipse class="ff-shadow" cx="44" cy="1.5" rx="46" ry="3"/>
  <g class="slug__body">
    <path class="ff-slug" d="M0-1C9-2 22-8 37-12.5C48-16 59-18.5 70-17.5C80-16.5 88-11.5 91-5.5C92.5-1.5 89.5 0 85 0H5C1 0-1 0 0-1Z"/>
    <path class="ff-slug-foot" d="M4 0H86"/>
    <path class="ff-slug-keel" d="M2-1.5C12-3.5 24-8.5 37-12.5C42-14 47-15.3 52-16.2"/>
    <path class="ff-slug-mantle" d="M51-15.5C59-19.5 73-19.5 81-14.5C79-8.5 71-6.5 62-6.5C55-6.5 50-9.5 51-15.5Z"/>
    <path class="ff-slug-groove" d="M55-14.5C61-17 71-17 77-13.8M56-11.5C62-14 70-14 75-11.3M58-9C63-10.8 68-10.8 72-9.2"/>
    <path class="ff-slug-groove" d="M14-3.2l3 2.6M20-5l3.2 3.6M26-7l3.4 4.2M32-9l3.6 5M38-11l3.6 5.6M44-12.6l3.4 5.8"/>
    <ellipse class="ff-slug-hole" cx="74" cy="-10" rx="1.7" ry="1.3"/>
    <path class="ff-slug-spot" d="M30-6.5c1.6-.8 3.3-.4 3 1-.5 1.2-2.6 1.3-3.4.6-.4-.4-.2-1.2.4-1.6ZM45-10c1.2-.5 2.4 0 2.1.9-.4.9-1.8 1-2.4.4-.3-.4-.1-1 .3-1.3ZM64-15c1-.4 2 0 1.8.7-.3.7-1.5.8-2 .3-.2-.3 0-.8.2-1Z"/>
    <path class="ff-slug-shine" d="M8-3C18-6 30-10.5 42-14C52-16.8 62-17.6 72-16.4"/>
    <circle class="ff-slug-glint" cx="66" cy="-15.2" r="1.1"/><circle class="ff-slug-glint" cx="38" cy="-11.6" r=".8"/>
  </g>
  <g class="slug__eyes">
    <path class="ff-slug-tent ff-slug-tent--back" d="M84-13.5Q87-21 86.5-27"/><circle class="ff-slug-eye" cx="86.5" cy="-27.5" r="1.6"/>
    <path class="ff-slug-tent" d="M86.5-12.5Q91-19.5 92.5-25.5"/><circle class="ff-slug-eye" cx="92.7" cy="-26" r="1.8"/>
    <path class="ff-slug-tent" d="M90.5-4.5l4.5 1.6M89.5-7l4.2-.6"/>
  </g>`;

function logSVG() {
  /* a fallen redwood lying left to right; cut end on the left shows the rings */
  let rings = "";
  for (let i = 1; i <= 6; i++) rings += `<ellipse class="ff-ring" cx="430" cy="128" rx="${(i * 1.6).toFixed(1)}" ry="${(i * 3.6).toFixed(1)}"/>`;
  return `
  <g class="ff-log">
    <path class="ff-bark" d="M430 104C520 100 640 101 770 106C780 116 781 140 770 152C640 155 520 154 430 152Z"/>
    <path class="ff-bark-line" d="M440 112C520 110 600 111 700 113M446 120C540 118 640 120 760 121M440 129C520 128 610 129 720 131M452 137C530 136 620 138 768 139M440 145C540 146 640 146 748 147M500 108C560 107 640 107 720 109"/>
    <path class="ff-bark-shade" d="M430 140C520 143 640 144 772 141C772 147 771 150 770 152C640 155 520 154 430 152Z"/>
    <path class="ff-moss-top" d="M436 106C470 99 500 104 530 100C560 97 590 103 620 99C650 96 690 103 720 100C745 98 762 104 772 108C760 111 740 108 712 110C680 112 650 106 622 110C590 113 560 107 530 111C500 114 470 108 436 110Z"/>
    <path class="ff-moss-drip" d="M470 109q2 7 0 11M548 110q3 6 1 9M612 109q2 8-1 12M690 110q2 5 0 8"/>
    <ellipse class="ff-cut" cx="430" cy="128" rx="13" ry="24"/>${rings}
    <path class="ff-crack" d="M430 128l9-13M430 128l-6 15"/>
    <ellipse class="ff-cut-rim" cx="430" cy="128" rx="13" ry="24"/>
    <g class="ff-shelf">
      <path d="M560 132c4-10 22-11 28-1-8 3-20 4-28 1Z"/><path d="M574 141c3-8 17-9 22-1-7 2-16 3-22 1Z"/><path d="M655 128c3-8 18-9 23-1-7 2-16 3-23 1Z"/>
    </g>
    <path class="ff-shelf-line" d="M564 131c6-5 16-5 21 0M578 140c4-4 12-4 15 0M659 127c5-4 13-4 16 0"/>
  </g>`;
}

function mushroomSVG(x, y, s, flip = 1) {
  const cw = s * 0.62, ch = s * 0.44, sw = s * 0.11, sh = s * 0.78;
  return `<g class="ff-shroom" transform="translate(${x} ${y}) scale(${flip} 1)">
    <path class="ff-stalk" d="M${-sw} 0C${-sw * 0.8} ${-sh * 0.5} ${-sw * 0.7} ${-sh * 0.8} ${-sw * 0.6} ${-sh}H${sw * 0.6}C${sw * 0.9} ${-sh * 0.6} ${sw * 1.1} ${-sh * 0.3} ${sw * 1.3} 0Z"/>
    <path class="ff-gills" d="M${-cw * 0.9} ${-sh}Q0 ${-sh + ch * 0.32} ${cw * 0.9} ${-sh}Z"/>
    <path class="ff-gill-line" d="M${-cw * 0.6} ${-sh + 1}L${-sw * 0.5} ${-sh + ch * 0.14}M${-cw * 0.3} ${-sh + 1.5}L0 ${-sh + ch * 0.16}M${cw * 0.3} ${-sh + 1.5}L${sw * 0.4} ${-sh + ch * 0.15}M${cw * 0.6} ${-sh + 1}L${sw * 0.7} ${-sh + ch * 0.12}"/>
    <path class="ff-cap" d="M${-cw} ${-sh}C${-cw} ${-sh - ch * 1.2} ${cw} ${-sh - ch * 1.2} ${cw} ${-sh}Q0 ${-sh + ch * 0.18} ${-cw} ${-sh}Z"/>
    <path class="ff-cap-shine" d="M${-cw * 0.7} ${-sh - ch * 0.4}C${-cw * 0.5} ${-sh - ch * 0.8} ${-cw * 0.1} ${-sh - ch * 0.92} ${cw * 0.2} ${-sh - ch * 0.88}"/>
    <g class="ff-cap-dot"><circle cx="${-cw * 0.45}" cy="${-sh - ch * 0.45}" r="${s * 0.06}"/><circle cx="${cw * 0.05}" cy="${-sh - ch * 0.72}" r="${s * 0.05}"/><circle cx="${cw * 0.5}" cy="${-sh - ch * 0.38}" r="${s * 0.055}"/><circle cx="${cw * 0.2}" cy="${-sh - ch * 0.25}" r="${s * 0.035}"/></g>
  </g>`;
}

export function forestFloor() {
  const r = seeded(77);
  let litter = "";
  for (let i = 0; i < 140; i++) {
    const x = r() * 1200, y = 150 + r() * 26, a = r() * Math.PI, L = 3 + r() * 5;
    litter += `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a) * L).toFixed(1)} ${(Math.sin(a) * L * 0.35).toFixed(1)}`;
  }
  let tufts = "";                                  // moss and grass along the top of the soil
  for (let x = 4; x < 1200; x += 6 + r() * 10) {
    const y = 156 - Math.sin(x * 0.0105) * 3 - Math.sin(x * 0.004 + 1) * 3 + r() * 3;
    for (let q = 0, m = 2 + Math.floor(r() * 3); q < m; q++) {
      const h = 3 + r() * 7, lean = (r() - 0.5) * 6;
      tufts += `M${(x + q * 1.6).toFixed(1)} ${y.toFixed(1)}q${(lean * 0.3).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}`;
    }
  }
  let mossDots = "";                               // little cushions of moss and lichen on the log
  for (let i = 0; i < 70; i++) {
    const x = 442 + r() * 322, y = 101 + r() * 8, rr = 0.8 + r() * 1.8;
    mossDots += `<circle class="${r() < 0.3 ? "ff-lichen" : "ff-moss-dot"}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}"/>`;
  }
  let pebbles = "";
  for (const [x, y, rx] of [[262, 160, 6], [272, 162, 4], [808, 159, 5], [1012, 161, 7], [520, 162, 4]]) pebbles += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.6}"/>`;
  const cone = (x, y) => `<g class="ff-cone" transform="translate(${x} ${y}) rotate(-20)"><ellipse rx="6" ry="4.4"/><path d="M-4-2l2 1.6 2-2 2 2 2-1.6M-5 1l2 1.4 2-1.8 2 1.8 2-1.6M-3 3.5l2-1.2 2 1.2 2-1.2"/></g>`;
  const svg = `<svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="ffSoil" x1="0" y1="0" x2="0" y2="1"><stop class="ff-s1" offset="0"/><stop class="ff-s2" offset=".35"/><stop class="ff-s3" offset="1"/></linearGradient>
      <linearGradient id="ffLog" x1="0" y1="0" x2="0" y2="1"><stop class="ff-l1" offset="0"/><stop class="ff-l2" offset=".45"/><stop class="ff-l3" offset="1"/></linearGradient>
      <linearGradient id="ffSlug" x1="0" y1="0" x2="0" y2="1"><stop class="ff-g1" offset="0"/><stop class="ff-g2" offset=".55"/><stop class="ff-g3" offset="1"/></linearGradient>
      <radialGradient id="ffCap" cx=".38" cy=".3" r=".8"><stop class="ff-c1" offset="0"/><stop class="ff-c2" offset=".6"/><stop class="ff-c3" offset="1"/></radialGradient>
    </defs>
    ${fernSVG(170, 150, 70, 11, r, "ff-fern ff-fern--back")}
    ${fernSVG(880, 152, 64, 10, r, "ff-fern ff-fern--back")}
    <g transform="translate(990 151) scale(.84)">${DEER}</g>
    <path class="ff-soil" d="M0 180V156C60 150 130 146 210 150S360 158 440 154 600 148 700 151 880 158 960 154 1110 146 1200 152V180Z"/>
    <path class="ff-litter" d="${litter}"/>
    <path class="ff-tufts" d="${tufts}"/>
    <g class="ff-pebble">${pebbles}</g>
    ${logSVG()}
    <path class="ff-stub" d="M705 118l18-17 4 3-15 18z"/><path class="ff-stub-end" d="M723 101l4 3"/>
    <g class="ff-mossy">${mossDots}</g>
    <path class="ff-trail" d="M150 154C210 153 270 151.5 340 152.5"/><path class="ff-trail" d="M470 103C530 100 600 100.5 670 101.5"/>
    ${fernSVG(612, 102, 24, 7, r, "ff-fern ff-fern--sprout")}
    <g transform="translate(748 106)">${OWL}</g>
    ${mushroomSVG(330, 154, 30)}${mushroomSVG(845, 156, 36)}${mushroomSVG(872, 157, 26, -1)}${mushroomSVG(825, 157, 20)}
    ${cone(250, 158)}${cone(985, 160)}${cone(560, 158)}
    ${fernSVG(80, 160, 92, 13, r, "ff-fern")}
    ${fernSVG(1120, 160, 88, 13, r, "ff-fern")}
    ${fernSVG(960, 160, 46, 9, r, "ff-fern")}
    <g class="ff-sorrels">${sorrelSVG(225, 162, 9, 70, r)}${sorrelSVG(395, 163, 8, 60, r)}${sorrelSVG(470, 166, 6, 50, r)}${sorrelSVG(570, 165, 10, 90, r)}${sorrelSVG(745, 164, 9, 80, r)}${sorrelSVG(1030, 165, 9, 70, r)}${sorrelSVG(1180, 166, 5, 30, r)}</g>
    <g class="slug slug--a" transform="translate(140 154) scale(.82)"><g class="slug__go"><g class="slug__turn">${SLUG}</g></g></g>
    <g class="slug slug--b" transform="translate(462 103) scale(.64)"><g class="slug__go"><g class="slug__turn">${SLUG}</g></g></g>
  </svg>`;
  const el = document.createElement("div");
  el.className = "forest-floor";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = svg;                              // static markup built above, no visitor input
  return el;
}

/*
 * Painted backdrops: a few stacked canvases behind the page.
 * Each layer is drawn once from a fixed seed (so it looks the same on every visit) and only
 * redrawn when the window gets wider/narrower or light/dark flips. Colours come from CSS
 * variables, so forest.css / holidays.css stay the single place to tune them.
 * While scrolling, layers drift up a little at different speeds for depth
 * (off when animations are switched off or the visitor prefers reduced motion).
 */

const root = document.documentElement;

/* small seeded random (mulberry32) */
export function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* colours as [r, g, b] */
export function hex(s) {
  s = String(s).trim().replace("#", "");
  if (s.length === 3) s = [...s].map((c) => c + c).join("");
  const n = parseInt(s, 16);
  return Number.isNaN(n) ? [128, 128, 128] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
export const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Read --<prefix><name> colour variables into { name: [r,g,b] }. */
export function palette(prefix, names) {
  const cs = getComputedStyle(root);
  return Object.fromEntries(names.map((n) => [n, hex(cs.getPropertyValue(`--${prefix}${n}`))]));
}

export const still = () => root.classList.contains("calm") || matchMedia("(prefers-reduced-motion: reduce)").matches;

/* after the browser has shown the next frame, so a theme flip is never held up by drawing */
const afterPaint = (fn) => requestAnimationFrame(() => setTimeout(fn, 0));

/**
 * layers: [{ name, res, depth, draw(ctx, w, h, pal, rnd) } | { name, html: true, depth }]
 *  res   canvas pixels per CSS pixel before the devicePixelRatio cap; below 1 blurs on purpose (far away = soft)
 *  depth how many CSS px the layer rises over the whole page scroll
 * read(): returns the palette object passed to every draw call.
 */
export class Backdrop {
  constructor(cls, layers, read) {
    this.el = document.createElement("div");
    this.el.className = `backdrop ${cls}`;
    this.el.setAttribute("aria-hidden", "true");
    this.layers = layers;
    this.read = read;
    this.w = 0; this.h = 0; this.theme = null; this.set = null; this.ms = 0;
    this.ext = Math.max(0, ...layers.map((l) => l.depth || 0)) + 90;   // drawn below the fold: room for drifting and for a phone's toolbar hiding

    this.onResize = () => { clearTimeout(this.rt); this.rt = setTimeout(() => this.fit(), 180); };
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => this.drift()); };
    this.mo = new MutationObserver(() => {
      if (root.dataset.theme !== this.theme) { this.theme = root.dataset.theme; afterPaint(() => this.paint(true)); }
    });
  }

  mount() {
    document.body.prepend(this.el);
    this.theme = root.dataset.theme;
    this.mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("resize", this.onResize, { passive: true });
    if (!still()) addEventListener("scroll", this.onScroll, { passive: true });
    afterPaint(() => this.paint(!still()));
    return this;
  }

  destroy() {
    this.mo.disconnect();
    removeEventListener("resize", this.onResize);
    removeEventListener("scroll", this.onScroll);
    clearTimeout(this.rt); cancelAnimationFrame(this.raf);
    this.el.remove();
  }

  size() { return [root.clientWidth || innerWidth, innerHeight]; }

  /* redraw on a width change, or when the window grows taller than what was drawn */
  fit() {
    const [w, h] = this.size();
    if (w !== this.w || h > this.h + this.ext - 20) this.paint(false);
  }

  paint(fade) {
    if (!this.el.isConnected) return;
    const t0 = performance.now();
    const [w, h] = this.size();
    this.w = w; this.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pal = this.read();
    const H = h + this.ext;
    const set = document.createElement("div");
    set.className = "backdrop__set";
    for (const L of this.layers) {
      let node;
      if (L.html) {
        node = document.createElement("div");
      } else {
        node = document.createElement("canvas");
        const k = dpr * (L.res ?? 1);
        node.width = Math.round(w * k); node.height = Math.round(H * k);
        node.style.height = `${H}px`;
        const ctx = node.getContext("2d");
        ctx.scale(k, k);
        L.draw(ctx, w, h, pal, seeded(L.seed ?? 7), H);
      }
      node.className = `bd-${L.name}`;
      node.dataset.depth = L.depth || 0;
      set.append(node);
    }
    const old = this.set;
    this.set = set;
    if (fade) {
      set.style.opacity = "0";
      this.el.append(set);
      requestAnimationFrame(() => requestAnimationFrame(() => { set.style.opacity = "1"; }));
      const done = () => old?.remove();
      set.addEventListener("transitionend", done, { once: true });
      setTimeout(done, 1200);
    } else {
      this.el.append(set);
      old?.remove();
    }
    this.drift();
    this.ms = Math.round(performance.now() - t0);
    this.el.dataset.ms = this.ms;
  }

  drift() {
    this.raf = 0;
    if (still() || !this.set) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / max));
    for (const n of this.el.querySelectorAll("[data-depth]")) {
      const d = +n.dataset.depth;
      if (d) n.style.transform = `translate3d(0, ${(-p * d).toFixed(1)}px, 0)`;
    }
  }
}

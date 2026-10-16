/*
 * Gives the animals their behaviour. Each animal runs a small loop of moves, stops and habits
 * (look around, flick a tail, graze, blink...) with fresh random timing every round, so no two
 * loops look the same, and reacts when the pointer comes close.
 *   moves   Web Animations on the animal's own transform (translate + rotate), eased in and out
 *   gaits   CSS animations whose name starts with "g-" (legs, wings, tails). pace(rate) sets how
 *           fast they run; pace(0) freezes them mid-step, which is how an animal stops
 *   habits  act(cls, ms) adds a class for a while; the CSS for that class does the motion
 * Nothing runs when animations are switched off or the visitor prefers reduced motion.
 */
import { still } from "./scene.js";

export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const chance = (p) => Math.random() < p;

/* distance from a point to a box */
function gap(x, y, b) {
  const dx = Math.max(b.left - x, 0, x - b.right), dy = Math.max(b.top - y, 0, y - b.bottom);
  return Math.hypot(dx, dy);
}

export class Critter {
  constructor(el, life, { radius = 80, face = null, unit = "px" } = {}) {
    this.el = el; this.life = life; this.radius = radius; this.unit = unit;
    this.faceEl = face;
    this.x = 0; this.y = 0; this.r = 0; this.dir = 1; this.rate = 1;
    this.anim = null; this.wake = null; this.near = null; this.calmUntil = 0;
  }

  get alive() { return this.life.on; }
  get box() { return this.el.getBoundingClientRect(); }

  tf(x = this.x, y = this.y, r = this.r) { return `translate(${x.toFixed(1)}${this.unit}, ${y.toFixed(1)}${this.unit}) rotate(${r.toFixed(1)}deg)`; }

  set(x = this.x, y = this.y, r = this.r) {
    this.x = x; this.y = y; this.r = r;
    this.el.style.transform = this.tf();
  }

  /* glide to a new spot. Resolves true when it got there, false when something interrupted it. */
  async go({ x = this.x, y = this.y, r = this.r }, ms, easing = "ease-in-out") {
    if (!this.alive) return false;
    if (this.near) return this.pending();
    this.pace(this.rate);
    const a = this.el.animate([{ transform: this.tf() }, { transform: this.tf(x, y, r) }], { duration: Math.max(1, ms), easing, fill: "forwards" });
    this.anim = a;
    try { await a.finished; } catch { return false; }
    if (this.anim !== a) return false;
    this.anim = null;
    this.set(x, y, r);
    a.cancel();
    return true;
  }

  /* turn the shortest way round to a heading (degrees) */
  heading(deg) { return this.r + ((((deg - this.r) % 360) + 540) % 360) - 180; }

  /* wait, unless the pointer comes close */
  wait(ms) {
    if (!this.alive) return Promise.resolve(false);
    if (this.near) return this.pending();
    return new Promise((done) => {
      const t = setTimeout(() => { this.wake = null; done(true); }, ms);
      this.wake = () => { clearTimeout(t); this.wake = null; done(false); };
    });
  }

  /* a scare is waiting to be dealt with: moves and waits give way (a frame later, so a loop that
     ignores it can't spin) until the brain takes it with scared() */
  pending() { return new Promise((done) => setTimeout(() => done(false), 16)); }

  /* run a habit: a class on the animal (or one of its parts) for a while */
  async act(cls, ms, on = this.el) {
    on.classList.add(cls);
    const ok = await this.wait(ms);
    on.classList.remove(cls);
    this.pace(this.rate);                          // a habit may have replaced a gait animation; give it back its speed
    return ok;
  }

  /* how fast the legs / wings / tail run: 1 normal, 2 hurrying, 0 frozen */
  pace(rate) {
    this.rate = rate;
    for (const a of this.el.getAnimations({ subtree: true })) {
      if (!a.animationName?.startsWith("g-")) continue;
      if (rate === 0) { if (a.playState === "running") a.pause(); }
      else { a.playbackRate = rate; if (a.playState === "paused") a.play(); }
    }
  }

  /* face left (-1) or right (1); the CSS on the face element turns it */
  face(dir) {
    this.dir = dir;
    this.faceEl?.classList.toggle("is-back", dir < 0);
  }

  /* stop where it is right now (mid-move) */
  halt() {
    if (this.anim) {
      const m = new DOMMatrixReadOnly(getComputedStyle(this.el).transform);
      const a = this.anim;
      this.anim = null;
      this.set(m.e, m.f, this.heading((Math.atan2(m.b, m.a) * 180) / Math.PI));
      a.cancel();
    }
    this.wake?.();
  }

  /* the pointer came close: remember where it was and break off whatever was going on */
  notice(x, y) {
    if (performance.now() < this.calmUntil || this.near) return;
    this.near = { x, y };
    this.halt();
  }

  /* used by brains: take the pending scare, if any, and stay unbothered for a while after */
  scared(ms = 2500) {
    const n = this.near;
    if (n) { this.near = null; this.calmUntil = performance.now() + ms; }
    return n;
  }
}

/** A group of animals sharing one pointer watcher. destroy() stops them all. */
export class Life {
  constructor() {
    this.on = !still();
    this.list = [];
    this.px = -1e4; this.py = -1e4; this.raf = 0;
    this.onMove = (e) => {
      this.px = e.clientX; this.py = e.clientY;
      if (!this.raf) this.raf = requestAnimationFrame(() => this.check());
    };
    if (this.on) {
      addEventListener("pointermove", this.onMove, { passive: true });
      addEventListener("pointerdown", this.onMove, { passive: true });
    }
  }

  /** brain(critter) is an async loop; it should end when critter.alive turns false */
  add(el, brain, opts) {
    const c = new Critter(el, this, opts);
    this.list.push(c);
    if (this.on && el) brain(c).catch(() => {});
    return c;
  }

  check() {
    this.raf = 0;
    for (const c of this.list) {
      if (!c.radius) continue;
      const b = c.box;
      if (!b.width) continue;                     // hidden right now
      if (gap(this.px, this.py, b) < c.radius) c.notice(this.px, this.py);
    }
  }

  destroy() {
    this.on = false;
    removeEventListener("pointermove", this.onMove);
    removeEventListener("pointerdown", this.onMove);
    cancelAnimationFrame(this.raf);
    for (const c of this.list) c.halt();
    this.list = [];
  }
}

/*
 * Background music: original pieces, played live by the visitor's browser with Web Audio.
 * Nothing is recorded or downloaded. songs.js holds the pieces (chords, form, which parts play
 * where); this file is the band that plays them: electric piano, pads, choir, bass, kalimba,
 * music box, celesta, harp, a theremin, soft drums, and vinyl / rain / wind / bird / cricket
 * sounds, plus a scheduler that writes the next few seconds of notes ahead of time.
 * Every piece is seeded, so it plays the same way each time. The same code renders offline
 * (OfflineAudioContext), which is how the mix levels were checked.
 */

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const mod12 = (n) => ((n % 12) + 12) % 12;

/* small seeded random (mulberry32), same as scene.js */
export function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/* ---------------- chords and scales ---------------- */
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const pc = (s) => mod12(NOTE[s[0]] + (s[1] === "#" ? 1 : s[1] === "b" ? -1 : 0));
/* intervals above the root */
const QUAL = {
  "": [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], maj9: [0, 4, 7, 11, 14],
  m7: [0, 3, 7, 10], m9: [0, 3, 7, 10, 14], m11: [0, 3, 7, 10, 14, 17], 9: [0, 4, 7, 10, 14],
  13: [0, 4, 10, 14, 21], "7b9": [0, 4, 7, 10, 13], 6: [0, 4, 7, 9], 69: [0, 4, 9, 14], m6: [0, 3, 7, 9],
  madd9: [0, 3, 7, 14], add9: [0, 4, 7, 14], sus4: [0, 5, 7], "7sus4": [0, 5, 10, 14], m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9], mmaj7: [0, 3, 7, 11],
};
export function chord(sym) {
  const [main, slash] = sym.split("/");
  const m = /^([A-G][b#]?)(.*)$/.exec(main);
  const root = pc(m[1]);
  const iv = QUAL[m[2]] ?? QUAL[""];
  return { sym, root, bass: slash ? pc(slash) : root, iv, tones: [...new Set(iv.map((i) => mod12(root + i)))] };
}
const MODES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11], pent: [0, 2, 4, 7, 9], mpent: [0, 3, 5, 7, 10],
};
const scaleOf = (s) => { const [k, mode] = s.split(" "); return MODES[mode].map((i) => mod12(pc(k) + i)); };

/* notes a melody can use over a chord: the chord, plus scale notes that don't rub a semitone against it */
function avail(scale, ch) {
  const t = new Set(ch.tones), out = [];
  for (let p = 0; p < 12; p++) {
    if (t.has(p)) out.push(p);
    else if (scale.includes(p) && !t.has(mod12(p + 1)) && !t.has(mod12(p - 1))) out.push(p);
  }
  return out;
}
/* the upper notes of a chord for the keys: drop the root (and the 5th) from big chords */
function upper(c) {
  let iv = c.iv;
  if (iv.length >= 5) { iv = iv.slice(1); if (iv.length > 4) iv = iv.filter((x) => x !== 7).slice(0, 4); }
  return [...new Set(iv.map((x) => mod12(c.root + x)))];
}
/* choose octaves for pcs inside [lo, hi], moving as little as possible from the previous voicing */
function voice(pcs, prev, lo, hi) {
  const opts = pcs.map((p) => { const a = []; for (let m = lo; m <= hi; m++) if (mod12(m) === p) a.push(m); return a; });
  const mid = (lo + hi) / 2;
  let best = null, bestScore = Infinity;
  const walk = (k, acc) => {
    if (k === opts.length) {
      const v = [...acc].sort((a, b) => a - b);
      let sc = 0;
      for (let j = 1; j < v.length; j++) {
        const d = v[j] - v[j - 1];
        if (!d || (d < 3 && v[j - 1] < 57)) return;   // no unisons, no muddy low seconds
        if (d === 1) sc += v[j - 1] < 64 ? 14 : 9;    // semitone rubs only when nothing else voice-leads
      }
      const span = v[v.length - 1] - v[0];
      if (span > 17) return;
      if (prev) for (const m of v) sc += Math.min(...prev.map((q) => Math.abs(q - m)));
      sc += Math.abs(v.reduce((a, b) => a + b, 0) / v.length - mid) * 0.35 + (span < 5 ? 3 : 0);
      if (sc < bestScore) { bestScore = sc; best = v; }
      return;
    }
    for (const m of opts[k]) { acc.push(m); walk(k + 1, acc); acc.pop(); }
  };
  walk(0, []);
  return best || pcs.map((p) => lo + mod12(p - lo)).sort((a, b) => a - b);
}
/* nearest note to m whose pitch class is in pcs, inside [lo, hi] */
function nearestIn(m, pcs, lo, hi) {
  let best = null;
  for (let x = lo; x <= hi; x++) if (pcs.includes(mod12(x)) && (best === null || Math.abs(x - m) < Math.abs(best - m))) best = x;
  return best ?? m;
}
/* nearest note in pcs, looking first in the direction the melody is moving */
function snapDir(m, pcs, dir, lo, hi) {
  for (let d = 0; d < 7; d++) for (const x of [m + dir * d, m - dir * d]) if (x >= lo && x <= hi && pcs.includes(mod12(x))) return x;
  return nearestIn(m, pcs, lo, hi);
}
/* move n scale steps along the allowed notes; bounce off the edges of the range */
function walkScale(m, n, av, lo, hi) {
  const go = (dir, k) => { let x = m; for (let i = 0; i < k; i++) { do x += dir; while (!av.includes(mod12(x))); } return x; };
  if (!n) return av.includes(mod12(m)) ? m : nearestIn(m, av, lo, hi);
  let x = go(Math.sign(n), Math.abs(n));
  if (x < lo || x > hi) x = go(-Math.sign(n), Math.abs(n));
  return Math.min(hi, Math.max(lo, x));
}

/* ---------------- shared sounds, made once per audio context ---------------- */
const made = new WeakMap();
function loopable(ctx, secs, chans, fill) {
  /* generated a little long, then the extra is crossfaded into the start so the loop has no seam */
  const sr = ctx.sampleRate, L = Math.floor(secs * sr), X = Math.floor(0.25 * sr);
  const buf = ctx.createBuffer(chans, L, sr);
  for (let c = 0; c < chans; c++) {
    const raw = new Float32Array(L + X);
    fill(raw, sr, c);
    const d = buf.getChannelData(c);
    for (let i = 0; i < L; i++) d[i] = i < X ? raw[i] * (i / X) + raw[L + i] * (1 - i / X) : raw[i];
  }
  return buf;
}
function pinkFill(r, amp) {
  let b0 = 0, b1 = 0, b2 = 0;
  return () => {
    const w = r() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
    return (b0 + b1 + b2 + w * 0.1848) * 0.11 * amp;
  };
}
function sounds(ctx) {
  if (made.has(ctx)) return made.get(ctx);
  const sr = ctx.sampleRate, r = rng(1234);
  const noise = ctx.createBuffer(1, sr * 2, sr);
  noise.getChannelData(0).forEach((_, i, d) => { d[i] = r() * 2 - 1; });

  /* a soft sawtooth (harmonics fall off faster than a real saw) for pads */
  const n = 28, re = new Float32Array(n), im = new Float32Array(n);
  for (let k = 1; k < n; k++) im[k] = 1 / k ** 1.35;
  const soft = ctx.createPeriodicWave(re, im);

  /* record crackle: faint hiss plus random ticks and the odd pop */
  const vinyl = loopable(ctx, 7, 2, (d, sr2, c) => {
    const p = pinkFill(rng(50 + c), 0.15);
    let y = 0;
    for (let i = 0; i < d.length; i++) { y += (p() - y) * 0.5; d[i] = y; }
    const rr = rng(70 + c);
    for (let t = 0; t < d.length; t += Math.floor(sr2 * (0.02 + rr() * 0.22))) {
      const a = rr() ** 3 * (rr() < 0.04 ? 1 : 0.55), len = 8 + Math.floor(rr() * 50);
      for (let k = 0; k < len && t + k < d.length; k++) d[t + k] += (rr() * 2 - 1) * a * (1 - k / len) ** 2;
    }
  });
  /* rain: soft filtered noise plus lots of tiny drops */
  const rain = loopable(ctx, 8, 2, (d, sr2, c) => {
    const p = pinkFill(rng(90 + c), 0.6);
    let y = 0, y2 = 0;
    for (let i = 0; i < d.length; i++) { y += (p() - y) * 0.35; y2 += (y - y2) * 0.02; d[i] = y - y2; }
    const rr = rng(110 + c);
    for (let t = 0; t < d.length; t += Math.floor(sr2 * rr() * 0.03)) {
      const f = 1800 + rr() * 4200, a = rr() ** 2 * 0.22, len = Math.floor(sr2 * (0.002 + rr() * 0.006));
      for (let k = 0; k < len && t + k < d.length; k++) d[t + k] += Math.sin((k / sr2) * f * 6.283) * a * (1 - k / len) ** 3;
    }
  });
  /* two crickets, one on each side */
  const crickets = loopable(ctx, 6, 2, (d, sr2, c) => {
    const rr = rng(130 + c), f = c ? 4280 : 4560, every = c ? 0.71 : 0.63;
    for (let t0 = rr() * 0.3; t0 < 6.1; t0 += every * (0.95 + rr() * 0.1)) {
      for (let p = 0; p < 3; p++) {
        const s = Math.floor((t0 + p * 0.032) * sr2), len = Math.floor(0.02 * sr2);
        for (let k = 0; k < len && s + k < d.length; k++) d[s + k] += Math.sin(((s + k) / sr2) * f * 6.283) * Math.sin((k / len) * Math.PI) ** 2 * 0.22;
      }
    }
  });
  /* reverb: three seconds of noise that gets darker as it fades */
  const ir = ctx.createBuffer(2, Math.floor(sr * 3), sr);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c), rr = rng(150 + c), pre = Math.floor(sr * 0.018);
    let y = 0;
    for (let i = pre; i < d.length; i++) {
      const t = (i - pre) / sr, a = 0.85 - 0.7 * Math.min(1, t / 2.2);
      y += ((rr() * 2 - 1) - y) * a;
      d[i] = y * Math.exp(-t * 2.6);
    }
    for (const [ms, g] of [[23, 0.5], [41, 0.35], [67, 0.28]]) d[pre + Math.floor((ms + c * 4) * sr / 1000)] += g;
  }
  const s = { noise, soft, vinyl, rain, crickets, ir };
  made.set(ctx, s);
  return s;
}

/* ---------------- output chain (one per audio context) ---------------- */
export function createOutput(ctx) {
  const S = sounds(ctx);
  const g = (v) => { const n = ctx.createGain(); n.gain.value = v; return n; };
  const input = g(1), verbIn = g(1), verb = ctx.createConvolver(), verbOut = g(0.8);
  verb.buffer = S.ir;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 32;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 12000; lp.Q.value = 0.5;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -22; comp.knee.value = 14; comp.ratio.value = 2.5; comp.attack.value = 0.02; comp.release.value = 0.3;
  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
  const trim = g(0.75), vol = g(1);
  const an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.82; an.minDecibels = -85; an.maxDecibels = -15;
  input.connect(hp); verbIn.connect(verb).connect(verbOut).connect(hp);
  hp.connect(lp).connect(comp).connect(trim).connect(lim).connect(vol).connect(ctx.destination);
  lim.connect(an);
  return { ctx, input, verbIn, vol, an };
}

/* ---------------- instruments ----------------
   (song, destination, time, midi note, length in seconds, velocity 0..1, part settings) */
function tines(spec, level) {
  return (s, out, t, m, dur, vel) => {
    const f = mtof(m);
    for (const [ratio, g, tau] of spec) {
      const fr = f * ratio;
      if (fr > 15000) continue;
      const o = s.osc("sine", fr, t, t + tau * 5.5), e = s.gain(0);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g * vel * level, t + 0.002); e.gain.setTargetAtTime(0, t + 0.002, tau);
      o.connect(e).connect(out);
    }
  };
}
const INST = {
  /* electric piano: two-operator FM (bright on the attack, mellow as it rings) plus a short tine ping */
  ep(s, out, t, m, dur, vel) {
    const f = mtof(m), end = t + dur + 1, amp = s.gain(0);
    const c = s.osc("sine", f, t, end), mo = s.osc("sine", f, t, end), mi = s.gain(0);
    const idx = f * (0.5 + 1.5 * vel) * (m > 74 ? 0.6 : 1);
    mi.gain.setValueAtTime(idx, t); mi.gain.setTargetAtTime(idx * 0.12, t, 0.3);
    mo.connect(mi).connect(c.frequency);
    const ti = s.osc("sine", f * 4, t, t + 0.3), tg = s.gain(0);
    tg.gain.setValueAtTime(0, t); tg.gain.linearRampToValueAtTime(0.1 * vel, t + 0.002); tg.gain.setTargetAtTime(0, t + 0.002, 0.03);
    c.connect(amp); ti.connect(tg).connect(amp); amp.connect(out);
    const pk = 0.2 * vel;
    amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(pk, t + 0.005);
    amp.gain.setTargetAtTime(pk * 0.35, t + 0.005, 0.9); amp.gain.setTargetAtTime(0, t + dur, 0.14);
  },
  /* warm pad (a whole chord at once): two soft saws a note, slightly detuned, through one slowly opening low-pass */
  pad(s, out, t, ms, dur, vel, o) {
    const a = o.attack ?? Math.min(1.2, s.bar * 0.3), r = o.release ?? 1.4, cut = o.cut ?? 1100, end = t + dur + r * 2.5;
    const lp = s.filt("lowpass", cut * 0.45, 0.6), amp = s.gain(0);
    for (const m of ms) for (const det of [-7, 7]) { const v = s.osc("sawtooth", mtof(m), t, end); v.setPeriodicWave(s.S.soft); v.detune.value = det; v.connect(lp); }
    lp.frequency.setValueAtTime(cut * 0.45, t); lp.frequency.linearRampToValueAtTime(cut, t + a);
    lp.connect(amp).connect(out);
    const pk = 0.048 * vel;
    amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(pk, t + a); amp.gain.setTargetAtTime(0, t + dur, r / 3);
  },
  /* "ooh" choir (a whole chord at once): two saws a note with a shared vibrato, through one set of vowel filters */
  choir(s, out, t, ms, dur, vel, o) {
    const a = o.attack ?? 1.4, r = 1.8, end = t + dur + r * 2.5;
    const sum = s.gain(1), amp = s.gain(0);
    for (const [ff, q, g] of [[380, 5, 1], [820, 7, 0.5], [2700, 12, 0.12]]) sum.connect(s.filt("bandpass", ff, q)).connect(s.gain(g * 3.5)).connect(amp);
    const vg = s.gain(10);
    s.osc("sine", 4.4 + s.rnd() * 0.8, t, end).connect(vg);
    for (const m of ms) for (const det of [-10, 10]) { const v = s.osc("sawtooth", mtof(m), t, end); v.detune.value = det; vg.connect(v.detune); v.connect(sum); }
    amp.connect(out);
    const pk = 0.1 * vel;
    amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(pk, t + a); amp.gain.setTargetAtTime(0, t + dur, r / 3);
  },
  /* round bass: sine plus a filtered triangle so small speakers still hear it */
  bass(s, out, t, m, dur, vel, o) {
    const f = mtof(m), end = t + dur + 0.6, amp = s.gain(0), lp = s.filt("lowpass", o.cut ?? 700, 0.7);
    s.osc("sine", f, t, end).connect(amp);
    s.osc("triangle", f, t, end).connect(lp).connect(s.gain(0.5)).connect(amp);
    amp.connect(out);
    const pk = 0.135 * vel, a = o.attack ?? 0.012;
    amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(pk, t + a);
    amp.gain.setTargetAtTime(pk * (o.pizz ? 0 : 0.6), t + a, o.pizz ? 0.22 : 0.3); amp.gain.setTargetAtTime(0, t + dur, 0.06);
  },
  /* plucked string (harp / nylon guitar): a bright buzz that dies fast over a softer body that rings */
  pluck(s, out, t, m, dur, vel, o) {
    const f = mtof(m), dec = o.decay ?? 0.8, end = t + Math.min(dur + 0.5, dec * 4), body = s.gain(0), bright = s.gain(0);
    s.osc("triangle", f, t, end).connect(body);
    s.osc("sawtooth", f * 1.003, t, t + 0.6).connect(bright);
    body.connect(out); bright.connect(out);
    const pk = 0.39 * vel;
    body.gain.setValueAtTime(0, t); body.gain.linearRampToValueAtTime(pk, t + 0.003);
    body.gain.setTargetAtTime(0, t + 0.003, dec / 2.5); body.gain.setTargetAtTime(0, t + dur, 0.07);
    bright.gain.setValueAtTime(0, t); bright.gain.linearRampToValueAtTime(pk * 0.45, t + 0.002); bright.gain.setTargetAtTime(0, t + 0.002, 0.045);
  },
  kalimba: tines([[1, 1, 0.5], [5.9, 0.3, 0.045]], 0.4),
  musicbox: tines([[1, 1, 1.1], [6.27, 0.17, 0.11]], 0.32),
  celesta: tines([[1, 1, 0.9], [4, 0.1, 0.14]], 0.35),
  /* church bell (after Risset's bell): inharmonic partials, each with its own fade */
  bell(s, out, t, m, dur, vel) {
    const f = mtof(m), D = dur || 7, amp = s.gain(vel * 0.05);
    for (const [r, a, d, hz = 0] of [[0.56, 1, 1], [0.56, 0.67, 0.9, 1], [0.92, 1, 0.65], [0.92, 1.8, 0.55, 1.7], [1.19, 2.67, 0.325],
      [1.7, 1.67, 0.35], [2, 1.46, 0.25], [2.74, 1.33, 0.2], [3, 1.33, 0.15], [3.76, 1, 0.1], [4.07, 1.33, 0.075]]) {
      const o = s.osc("sine", f * r + hz, t, t + D * d), e = s.gain(0);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(a, t + 0.004); e.gain.exponentialRampToValueAtTime(0.0001, t + D * d);
      o.connect(e).connect(amp);
    }
    amp.connect(out);
  },
};
/* theremin: one voice gliding between the notes of a whole phrase */
function theremin(s, out, notes) {
  const t0 = notes[0].t, last = notes[notes.length - 1], t1 = last.t + last.dur, end = t1 + 1.2;
  const o = s.osc("triangle", mtof(notes[0].m), t0, end), lp = s.filt("lowpass", 1700, 0.6), amp = s.gain(0);
  const vib = s.osc("sine", 5.6, t0, end), vg = s.gain(0);
  vib.connect(vg).connect(o.detune);
  vg.gain.setValueAtTime(0, t0); vg.gain.linearRampToValueAtTime(28, t0 + 0.5);
  for (const n of notes) o.frequency.setTargetAtTime(mtof(n.m), n.t, 0.05);
  o.connect(lp).connect(amp).connect(out);
  amp.gain.setValueAtTime(0, t0); amp.gain.linearRampToValueAtTime(0.2, t0 + 0.15);
  amp.gain.setTargetAtTime(0, t1, 0.25);
}

/* ---------------- drums ---------------- */
const DRUM = {
  k(s, out, t, v) {              // kick
    const o = s.osc("sine", 150, t, t + 0.6), g = s.gain(0);
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.09);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.95 * v, t + 0.004); g.gain.setTargetAtTime(0, t + 0.012, 0.11);
    o.connect(g).connect(out);
    s.duckAt(t, v);
  },
  s(s, out, t, v) {              // snare
    const g = s.gain(0);
    s.noise(t, 0.5).connect(s.filt("bandpass", 1800, 0.7)).connect(g).connect(out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.55 * v, t + 0.003); g.gain.setTargetAtTime(0, t + 0.004, 0.06);
    const b = s.osc("triangle", 190, t, t + 0.25), bg = s.gain(0);
    b.frequency.setValueAtTime(190, t); b.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.35 * v, t + 0.002); bg.gain.setTargetAtTime(0, t + 0.003, 0.035);
    b.connect(bg).connect(out);
  },
  r(s, out, t, v) {              // rim click
    const o = s.osc("triangle", 820, t, t + 0.12), g = s.gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.32 * v, t + 0.001); g.gain.setTargetAtTime(0, t + 0.002, 0.016);
    o.connect(g).connect(out);
    const n = s.gain(0);
    s.noise(t, 0.08).connect(s.filt("bandpass", 3300, 3)).connect(n).connect(out);
    n.gain.setValueAtTime(0, t); n.gain.linearRampToValueAtTime(0.4 * v, t + 0.001); n.gain.setTargetAtTime(0, t + 0.002, 0.01);
  },
  h(s, out, t, v) { s.hiss(out, t, v * 0.16, 7000, 0.022); },   // closed hat
  o(s, out, t, v) { s.hiss(out, t, v * 0.12, 6500, 0.14); },    // open hat
  y(s, out, t, v) {              // ride
    s.hiss(out, t, v * 0.07, 5000, 0.28);
    for (const [f, a] of [[3150, 0.025], [4730, 0.018]]) {
      const o = s.osc("sine", f, t, t + 2.4), g = s.gain(0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * v, t + 0.002); g.gain.setTargetAtTime(0, t + 0.002, 0.35);
      o.connect(g).connect(out);
    }
  },
  a(s, out, t, v) {              // shaker
    const g = s.gain(0);
    s.noise(t, 0.3).connect(s.filt("bandpass", 6000, 1.4)).connect(g).connect(out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14 * v, t + 0.012); g.gain.setTargetAtTime(0, t + 0.014, 0.035);
  },
  j(s, out, t, v) {              // sleigh bells
    [5200, 6350, 7700].forEach((f, i) => {
      const at = t + i * 0.011, o = s.osc("sine", f * (1 + s.rnd() * 0.04), at, at + 0.5), g = s.gain(0);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.035 * v, at + 0.002); g.gain.setTargetAtTime(0, at + 0.002, 0.07);
      o.connect(g).connect(out);
    });
    s.hiss(out, t, v * 0.06, 8000, 0.05);
  },
  w(s, out, t, v) {              // brush swish
    const g = s.gain(0);
    s.noise(t, 0.6).connect(s.filt("bandpass", 2800, 0.6)).connect(g).connect(out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.13 * v, t + 0.05); g.gain.setTargetAtTime(0, t + 0.06, 0.08);
  },
  b(s, out, t, v) {              // heartbeat
    const o = s.osc("sine", 68, t, t + 0.7), g = s.gain(0), lp = s.filt("lowpass", 180, 0.7);
    o.frequency.setValueAtTime(68, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9 * v, t + 0.02); g.gain.setTargetAtTime(0, t + 0.025, 0.1);
    o.connect(lp).connect(g).connect(out);
  },
};
/* patterns, one character per 16th note: x hit, X accent, g ghost */
const KITS = {
  lofi: {
    bars: [
      { k: "x.........x.....", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
      { k: "x..x......x.....", s: "....x.......x..g", h: "x.x.x.x.x.x.x...", o: "..............x." },
      { k: "x.........x..x..", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
      { k: "x..x......x.....", s: "....x.......x...", h: "x.x.x.x.xgx.x.x." },
    ],
    fill: { k: "x.........x.....", s: "....x.......xgxx", h: "x.x.x.x.x.x....." },
  },
  soft: {
    bars: [
      { k: "x.........x.....", r: "....x.......x...", a: "x.x.x.x.x.x.x.x." },
      { k: "x......x..x.....", r: "....x.......x...", a: "x.xgx.x.x.xgx.x." },
    ],
    fill: { k: "x.........x.....", r: "....x.......x.gg", a: "x.x.x.x.x.x.x.x." },
  },
  brush: {
    bars: [
      { k: "x.......x.......", w: "....x.......x...", r: "......g.......g.", a: "x.x.x.x.x.x.x.x." },
      { k: "x.....x.x.......", w: "....x.......x...", r: "..............g.", a: "x.x.x.x.x.x.x.x." },
    ],
    fill: { k: "x.......x.......", w: "....x.......x...", r: "..........g.g.gx", a: "x.x.x.x.x.x....." },
  },
  swing: {
    bars: [
      { k: "x.......x.......", r: "....x.......x...", y: "x...x.x.x...x.x." },
      { k: "x.....x.x.......", r: "....x.......x..g", y: "x...x.x.x...x.x." },
    ],
    fill: { k: "x.......x.......", s: "....x.......xgxg", y: "x...x.x.x......." },
  },
  sleigh: {
    bars: [
      { k: "x.........x.....", r: "....x.......x...", j: "x.x.x.x.x.x.x.x." },
      { k: "x..x......x.....", r: "....x.......x...", j: "x.x.x.x.x.xgx.x." },
    ],
    fill: { k: "x.........x.....", r: "....x.......x.gg", j: "x.x.x.x.x.x.xxxx" },
  },
  heart: { bars: [{ b: "x.g...x.g..." }] },
  waltz: { bars: [{ k: "x...........", r: "....x...x...", a: "x.x.x.x.x.x." }] },
};
const VEL = { x: 0.75, X: 1, g: 0.3 };

/* keys rhythms over a whole bar, as [16th step, length in 16ths, velocity, push]: "push" plays the
   next bar's chord an 8th early, the way lo-fi players anticipate the change */
const COMP = {
  lofi: [[[0, 10, 0.72]], [[0, 6, 0.74], [6, 2, 0.5], [8, 8, 0.66]], [[0, 7, 0.72], [10, 5, 0.55]], [[0, 13, 0.7], [14, 2, 0.55, 1]]],
  stabs: [[[0, 2, 0.7], [6, 2, 0.6]], [[4, 2, 0.6], [12, 2, 0.62]], [[0, 3, 0.7], [6, 2, 0.55], [12, 2, 0.5]]],
  hold: [[[0, 16, 0.62]]],
  sparse: [[[0, 16, 0.55]], [[0, 8, 0.5], [10, 6, 0.45]]],
  waltz: [[[0, 4, 0.66], [4, 3, 0.42], [8, 3, 0.42]], [[0, 4, 0.66], [4, 3, 0.4], [8, 2, 0.38], [10, 2, 0.32]]],
};
/* melody rhythms over two bars, as [8th note, length in 8ths] */
const RH4 = [
  [[0, 2], [2, 1], [3, 3], [8, 2], [10, 2], [12, 4]], [[1, 1], [2, 2], [4, 4], [9, 1], [10, 1], [11, 5]],
  [[0, 3], [3, 1], [4, 4], [12, 4]], [[2, 2], [4, 2], [6, 2], [8, 6]], [[0, 1], [1, 1], [2, 2], [4, 2], [6, 4], [12, 2], [14, 2]],
  [[0, 4], [4, 2], [6, 2], [8, 8]], [[3, 1], [4, 1], [5, 1], [6, 2], [8, 4], [13, 1], [14, 2]],
];
const RH3 = [[[0, 2], [2, 2], [4, 2], [6, 6]], [[0, 3], [3, 1], [4, 2], [6, 4], [10, 2]], [[0, 4], [4, 2], [6, 2], [8, 4]], [[2, 1], [3, 1], [4, 2], [6, 6]]];

/* ---------------- what each part does in a bar ---------------- */
const ROLES = {
  keys(s, i, B, t, cfg, name) {
    const out = s.part(name, cfg, s.mel), inst = cfg.inst || "ep";
    const spread = cfg.strum ?? (cfg.inst === "pluck" ? 0.028 : 0.014);
    const strum = (notes, at, dur, v) => notes.forEach((m, j) =>
      s.note(name, inst, out, at + j * spread + s.jit(), m, Math.max(0.1, dur - j * spread), v * (j === notes.length - 1 ? 1.06 : 0.94) * (0.93 + s.rnd() * 0.14), cfg));
    if (i === s.bars.length - 1) return strum(B.ch[0].keys, t, s.bar + 2.5, 0.6);
    const segs = B.ch.length, segLen = s.n16 / segs, key = `${name}:push`;
    let pushed = false;
    B.ch.forEach((ch, seg) => {
      for (const [st, du, v, push] of pick(s.rnd, COMP[cfg.style || "lofi"])) {
        const step = Math.round(st / segs);
        let notes = ch.keys, len = Math.max(1, Math.round(du / segs));
        if (s.mem[key] && seg === 0 && step === 0) continue;   // last bar already played this chord early
        if (push) {
          const nb = s.bars[i + 1];
          if (seg !== segs - 1 || !nb || !nb.play.has(name) || i + 1 === s.bars.length - 1) continue;
          notes = nb.ch[0].keys; len += 8; pushed = true;
        }
        strum(notes, s.at16(t, seg * segLen + step), len * s.beat / 4, v);
      }
    });
    s.mem[key] = pushed;
  },
  pad(s, i, B, t, cfg, name) {
    const out = s.part(name, cfg, s.mel), inst = cfg.inst || "pad", d = s.bar / B.ch.length;
    const last = i === s.bars.length - 1;
    B.ch.forEach((ch, seg) => s.note(name, inst, out, t + seg * d, ch.pad.map((m) => m + (cfg.oct || 0)), d + (last ? 2.5 : 0.2), cfg.vel ?? 0.7, cfg));
  },
  bass(s, i, B, t, cfg, name) {
    const out = s.part(name, cfg, s.low), style = cfg.style || "lofi", r = s.rnd;
    const play = (step, m, len, v) => s.note(name, "bass", out, s.at16(t, step), m, len * s.beat / 4, v, cfg);
    const nb = s.bars[i + 1], next = nb ? nb.ch[0].bass : B.ch[0].bass, n = s.n16;
    const fifth = (m) => (m + 7 <= 50 ? m + 7 : m - 5);
    if (i === s.bars.length - 1) return play(0, B.ch[0].bass, n + 10, 0.8);
    if (style === "drone") return B.ch.forEach((ch, seg) => play(seg * n / B.ch.length, ch.bass, n / B.ch.length + 1, 0.75));
    if (style === "waltz") { play(0, B.ch[0].bass, 5, 0.8); if (B.b % 2) play(8, fifth(B.ch[0].bass), 3, 0.5); return; }
    if (style === "walk") {
      const q = [];
      if (B.ch.length > 1) q.push(B.ch[0].bass, fifth(B.ch[0].bass), B.ch[1].bass);
      else { const c = B.ch[0]; q.push(c.bass, nearestIn(c.bass + 4, [c.tones[1] ?? c.root], 33, 52), nearestIn(c.bass + 7, [c.tones[2] ?? c.root], 33, 52)); }
      q.push(next + (r() < 0.5 ? -1 : 1));
      q.forEach((m, k) => play(k * 4, m, 3.6, k ? 0.62 : 0.8));
      return;
    }
    /* lofi: long root, a pickup, and a note that leads into the next chord */
    B.ch.forEach((ch, seg) => {
      const L = n / B.ch.length, base = seg * L;
      play(base, ch.bass, L > 8 ? 9 : 6, 0.82);
      if (L > 8 && r() < 0.5) play(base + 10, r() < 0.5 ? fifth(ch.bass) : ch.bass + 12 <= 52 ? ch.bass + 12 : ch.bass, 3, 0.55);
    });
    if (r() < 0.55 && next !== B.ch[B.ch.length - 1].bass) play(14, next + (r() < 0.5 ? -1 : 1), 2, 0.5);
  },
  drums(s, i, B, t, cfg, name) {
    const out = s.part(name, cfg, s.drm), kit = KITS[cfg.kit || "lofi"];
    const last = i === s.bars.length - 1, nb = s.bars[i + 1];
    if (last) return DRUM.k(s, out, t, 0.6);
    let bar = kit.bars[[0, 1, 0, 2][B.b % 4] % kit.bars.length];
    if (kit.fill && B.b === B.n - 1 && B.n >= 4 && nb && nb.play.has(name)) bar = kit.fill;
    else if (s.rnd() < 0.15) bar = pick(s.rnd, kit.bars);
    const hits = [];
    for (const [v, pat] of Object.entries(bar)) for (let st = 0; st < pat.length; st++) if (VEL[pat[st]]) hits.push([st, v, VEL[pat[st]]]);
    hits.sort((a, b) => a[0] - b[0]);
    for (const [st, v, vel] of hits) DRUM[v](s, out, s.at16(t, st) + (v === "k" && !st ? 0 : s.jit()), vel * (0.93 + s.rnd() * 0.14) * (cfg.vel ?? 1));
  },
  lead(s, i, B, t, cfg, name) {
    if (B.b % 2) return;                                  // phrases are two bars and start on even bars
    const p = B.b >> 1;
    if (cfg.every && p % cfg.every) return;
    const [A, Bm] = s.motifs(name, cfg), m = p % 4 === 2 ? Bm : A, answer = p % 2 === 1;
    const [lo, hi] = cfg.range, e8 = s.beat / 2, per = s.meter * 2, out = s.part(name, cfg, s.mel);
    let prev = s.mem[name] ?? cfg.center;
    const notes = [];
    m.rh.forEach(([st, du], k) => {
      const bi = Math.min(i + Math.floor(st / per), s.bars.length - 1), within = st % per, BB = s.bars[bi];
      if (!BB.play.has(name)) return;
      const ch = BB.ch[Math.min(BB.ch.length - 1, Math.floor(within / (per / BB.ch.length)))];
      const av = avail(s.scale, ch);
      const fin = k === m.rh.length - 1, strong = within % (s.meter === 3 ? 6 : 4) === 0;
      const dir = Math.sign(m.dl[k]) || 1;
      let x = k === 0 ? nearestIn(prev * 0.6 + cfg.center * 0.4, ch.tones, lo, hi) : walkScale(prev, m.dl[k], av, lo, hi);
      if (fin) x = snapDir(x, answer ? [ch.root, ch.tones[1], ch.tones[2]] : ch.tones, dir, lo, hi);
      else if (strong && !ch.tones.includes(mod12(x))) x = snapDir(x, ch.tones, dir, lo, hi);
      if (k && x === prev && notes.length > 1 && notes[notes.length - 2].m === x) x = walkScale(x, dir, av, lo, hi);   // no three in a row
      prev = x;
      const tt = s.at16(s.t0 + bi * s.bar, within * 2) + s.jit();
      notes.push({ t: tt, m: x, dur: du * e8 * 0.95, vel: (cfg.vel ?? 0.7) * (strong ? 1 : 0.86) * (0.92 + s.rnd() * 0.16) * (fin ? 0.9 : 1) });
    });
    s.mem[name] = prev;
    if (!notes.length) return;
    if (cfg.inst === "theremin") { if (s.trace) notes.forEach((n) => s.trace(name, n.t, n.m, n.dur, n.vel)); return theremin(s, out, notes); }
    for (const n of notes) s.note(name, cfg.inst, out, n.t, n.m, n.dur, n.vel, cfg);
  },
  arp(s, i, B, t, cfg, name) {
    if (i === s.bars.length - 1) return;
    const out = s.part(name, cfg, s.mel), rate = cfg.rate ?? 2, pat = cfg.pat ?? [0, 1, 2, 3, 2, 1];
    const segLen = s.n16 / B.ch.length;
    let k = 0;
    B.ch.forEach((ch, seg) => {
      const notes = ch.keys.map((m) => m + (cfg.oct ?? 12));
      notes.push(notes[0] + 12);
      for (let st = 0; st < segLen; st += rate, k++) {
        if (cfg.gaps && s.rnd() < cfg.gaps) continue;
        const m = notes[pat[k % pat.length] % notes.length];
        s.note(name, cfg.inst, out, s.at16(t, seg * segLen + st) + s.jit(), m, rate * s.beat / 4 * 1.6, (cfg.vel ?? 0.5) * (st ? 0.85 + s.rnd() * 0.2 : 1.1), cfg);
      }
    });
  },
  bell(s, i, B, t, cfg, name) {
    if (B.b % (cfg.every ?? 4)) return;
    s.note(name, "bell", s.part(name, cfg, s.fx), t + (cfg.at ?? 0) * s.beat, cfg.note ?? 57, cfg.dur ?? 7, cfg.vel ?? 0.7);
  },
  birds(s, i, B, t, cfg, name) {
    if (s.rnd() > (cfg.rate ?? 0.35)) return;
    const out = s.part(name, cfg, s.fx), at = t + s.rnd() * s.bar * 0.7, pan = s.pan((s.rnd() * 2 - 1) * 0.75, out);
    const r = s.rnd, kind = pick(r, ["thrush", "thrush", "varied", "wren", "chick"]);
    if (kind === "thrush") {           // Swainson's thrush: a rising spiral of flute notes
      const base = 1500 + r() * 400, n = 5 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) s.chirp(pan, at + k * 0.105, base * 1.12 ** k, base * 1.12 ** k * 1.22, 0.085, 0.09 * (1 - k * 0.06));
    } else if (kind === "varied") {    // varied thrush: one long buzzy whistle, then another
      s.chirp(pan, at, 2900 + r() * 900, 2850 + r() * 900, 1.1, 0.05, 48);
      s.chirp(pan, at + 2.2 + r(), 2400 + r() * 1300, 2400 + r() * 1300, 1.0, 0.04, 52);
    } else if (kind === "wren") {      // wren: a fast run of chips
      const n = 9 + Math.floor(r() * 7), f = 4300 + r() * 1300;
      for (let k = 0; k < n; k++) s.chirp(pan, at + k * (0.06 - k * 0.0015), f, f * 0.78, 0.04, 0.05 * (0.6 + 0.4 * Math.sin((k / n) * Math.PI)));
    } else {                           // chickadee: two clear whistles, high then low
      s.chirp(pan, at, 3950, 3880, 0.32, 0.06);
      s.chirp(pan, at + 0.45, 3350, 3280, 0.3, 0.055);
    }
  },
  owl(s, i, B, t, cfg, name) {
    if (s.rnd() > (cfg.rate ?? 0.12)) return;
    const out = s.part(name, cfg, s.fx), at = t + s.rnd() * s.bar * 0.5, f = 300 + s.rnd() * 40, pan = s.pan(s.rnd() * 1.2 - 0.6, out);
    [[0, 0.32], [0.48, 0.14], [0.66, 0.3], [1.3, 0.42], [1.82, 0.36]].forEach(([d, len]) => {
      const tt = at + d, o = s.osc("sine", f * 1.03, tt, tt + len + 0.4), g = s.gain(0);
      o.frequency.setValueAtTime(f * 1.03, tt); o.frequency.linearRampToValueAtTime(f * 0.96, tt + len);
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.07, tt + 0.06); g.gain.setTargetAtTime(0, tt + len, 0.06);
      o.connect(g).connect(pan);
    });
  },
};
const TEXTURES = new Set(["vinyl", "rain", "crickets", "wind"]);

/* ---------------- a song: one play-through of a piece ---------------- */
export function layout(def) {
  const bars = [];
  def.form.forEach(([n, prog, play], si) => {
    const set = new Set(play.split(/\s+/)), list = def.prog[prog];
    for (let b = 0; b < n; b++) bars.push({ si, b, n, play: set, syms: list[b % list.length].split(/\s+/) });
  });
  let kv = null, pv = null, bn = 40;
  const [klo, khi] = def.keysRange ?? [53, 77];
  for (const B of bars) {
    B.ch = B.syms.map((sym) => {
      const c = chord(sym);
      kv = voice(upper(c), kv, klo, khi);
      pv = voice(c.tones.slice(0, 4), pv, 46, 72);
      bn = nearestIn(bn, [c.bass], 33, 47);
      return { ...c, keys: kv, pad: pv, bass: bn };
    });
  }
  return bars;
}
export const songLength = (def) => {
  const bars = def.form.reduce((a, [n]) => a + n, 0);
  return bars * (def.meter || 4) * 60 / def.bpm;
};
const TAIL = 3;

export class Song {
  constructor(out, def, t0) {
    const ctx = out.ctx;
    Object.assign(this, { ctx, out, def, t0, S: sounds(ctx) });
    this.meter = def.meter || 4;
    this.beat = 60 / def.bpm;
    this.bar = this.beat * this.meter;
    this.n16 = this.meter * 4;
    this.sw = def.swing ?? 0.5;
    this.scale = scaleOf(def.scale);
    this.rnd = rng(def.seed || 1);
    this.bars = layout(def);
    this.barsEnd = t0 + this.bars.length * this.bar;
    this.end = this.barsEnd + TAIL;
    this.at = 0; this.mem = {}; this.mot = {}; this.parts = {}; this.tex = {}; this.srcs = [];

    const fx = def.fx || {};
    /* bus → fader → output; the fader is only used to cut a song off (skip, playlist change) */
    this.fader = this.gain(1); this.fader.connect(out.input);
    this.bus = this.gain(0); this.bus.connect(this.fader);
    const lvl = def.gain ?? 1;
    this.bus.gain.setValueAtTime(lvl, t0);
    this.bus.gain.setValueAtTime(lvl, this.barsEnd - this.bar);
    this.bus.gain.linearRampToValueAtTime(lvl * 0.55, this.barsEnd);
    this.bus.gain.linearRampToValueAtTime(0, this.end);

    /* melodic parts: a touch of tape wobble, ducking under the kick, reverb and echo sends */
    this.mel = this.gain(1);
    const tone = this.filt("lowpass", fx.tone ?? 5200, 0.5), hp = this.filt("highpass", 110, 0.5);
    const wob = ctx.createDelay(0.05); wob.delayTime.value = 0.012;
    this.osc("sine", 0.45, t0, this.end).connect(this.gain(fx.wow ?? 0.0006)).connect(wob.delayTime);
    this.osc("sine", 5.3, t0, this.end).connect(this.gain(0.00006)).connect(wob.delayTime);
    this.duck = this.gain(1);
    this.mel.connect(tone).connect(hp).connect(wob).connect(this.duck).connect(this.bus);
    this.duck.connect(this.gain(fx.verb ?? 0.3)).connect(out.verbIn);
    this.echo = this.gain(1);
    const dl = ctx.createDelay(2); dl.delayTime.value = Math.min(1.9, this.beat * 0.75);
    const fb = this.gain(fx.feedback ?? 0.33), elp = this.filt("lowpass", 2600, 0.5), ehp = this.filt("highpass", 350, 0.5);
    this.echo.connect(dl).connect(elp).connect(ehp).connect(fb).connect(dl);
    ehp.connect(this.bus); ehp.connect(this.gain(0.4)).connect(out.verbIn);
    /* bass, drums, ambience */
    this.low = this.gain(1); this.low.connect(this.filt("lowpass", 900, 0.5)).connect(this.bus);
    this.drm = this.gain(1);
    const sh = ctx.createWaveShaper();
    sh.curve = Float32Array.from({ length: 257 }, (_, k) => Math.tanh((k / 128 - 1) * 1.6) / Math.tanh(1.6));
    this.drm.connect(this.filt("lowpass", fx.drumTone ?? 6500, 0.5)).connect(sh).connect(this.gain(0.56)).connect(this.bus);
    this.drm.connect(this.gain(0.06)).connect(out.verbIn);
    this.fx = this.gain(1); this.fx.connect(this.bus); this.fx.connect(this.gain(0.5)).connect(out.verbIn);
    this.bed = this.gain(1); this.bed.connect(this.bus);

    /* looping ambience for the textures this song uses; each bar fades them in or out */
    const used = new Set(this.bars.flatMap((B) => [...B.play]));
    for (const name of used) {
      const cfg = def.parts[name];
      if (!cfg || !TEXTURES.has(cfg.role || name)) continue;
      const g = this.gain(0);
      g.connect((cfg.role || name) === "wind" ? this.fx : this.bed);
      this.tex[name] = { g, lvl: cfg.level ?? 1 };
      const kind = cfg.role || name;
      if (kind === "wind") {
        const n = this.noise(t0, this.end - t0), bp = this.filt("bandpass", 450, 1.4), wg = this.gain(0.5);
        this.osc("sine", 0.07, t0, this.end).connect(this.gain(260)).connect(bp.frequency);
        this.osc("sine", 0.11, t0, this.end).connect(this.gain(0.35)).connect(wg.gain);
        n.connect(bp).connect(wg).connect(g);
      } else {
        const src = ctx.createBufferSource();
        src.buffer = this.S[kind]; src.loop = true;
        this.src(src, t0, this.end, this.rnd() * src.buffer.duration);
        src.connect(g);
      }
    }
  }

  /* --- small helpers instruments use --- */
  gain(v) { const n = this.ctx.createGain(); n.gain.value = v; return n; }
  filt(type, f, q) {
    const n = this.ctx.createBiquadFilter();
    n.type = type; n.frequency.value = f; n.Q.value = q;
    /* sweeps are updated once per 128 samples instead of every sample: same sound, far less work */
    try { n.frequency.automationRate = "k-rate"; } catch { /* older browsers: a-rate */ }
    return n;
  }
  src(node, start, stop, offset) {
    node.start(start, offset); node.stop(stop);
    this.srcs.push([node, stop]);
    return node;
  }
  osc(type, f, start, stop) { const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f; return this.src(o, start, stop); }
  noise(start, len) {
    const n = this.ctx.createBufferSource();
    n.buffer = this.S.noise; n.loop = true;
    return this.src(n, start, start + len, this.rnd() * 1.9);
  }
  hiss(out, t, peak, hp, tau) {
    const g = this.gain(0);
    this.noise(t, tau * 8 + 0.02).connect(this.filt("highpass", hp, 0.7)).connect(g).connect(out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.002); g.gain.setTargetAtTime(0, t + 0.003, tau);
  }
  pan(x, out) { const p = this.ctx.createStereoPanner(); p.pan.value = x; p.connect(out); return p; }
  chirp(out, t, f0, f1, d, v, buzz) {
    const stop = t + d * 1.6 + 0.2, o = this.osc("sine", f0, t, stop), g = this.gain(0);
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(0.012, d / 3)); g.gain.setTargetAtTime(0, t + d * 0.7, d * 0.15);
    if (buzz) { const am = this.gain(0.5); this.osc("sine", buzz, t, stop).connect(this.gain(0.5)).connect(am.gain); o.connect(am).connect(g); }
    else o.connect(g);
    g.connect(out);
  }
  jit() { return (this.rnd() - 0.5) * 0.012; }
  /* every pitched note goes through here (trace is only set by the offline checks) */
  note(name, inst, out, t, m, dur, vel, cfg) {
    if (this.trace) [].concat(m).forEach((x) => this.trace(name, t, x, dur, vel));
    INST[inst](this, out, t, m, dur, vel, cfg);
  }
  /* swung position of a 16th step inside the bar starting at t */
  at16(t, st) {
    st = Math.round(st);
    const b = this.beat, sw = this.sw, beat = Math.floor(st / 4), sub = st - beat * 4;
    return t + beat * b + [0, sw * b / 2, sw * b, sw * b + (1 - sw) * b / 2][sub];
  }
  duckAt(t, v) {
    const depth = (this.def.fx?.duck ?? 0.22) * v;
    if (!depth) return;
    this.duck.gain.setTargetAtTime(1 - depth, t, 0.004);
    this.duck.gain.setTargetAtTime(1, t + 0.05, 0.14);
  }
  /* each part gets its own level and stereo position */
  part(name, cfg, group) {
    if (this.parts[name]) return this.parts[name];
    const g = this.gain(cfg.level ?? 1);
    if (cfg.pan) { g.connect(this.pan(cfg.pan, group)); } else g.connect(group);
    if (cfg.echo) g.connect(this.gain(cfg.echo)).connect(this.echo);
    return (this.parts[name] = g);
  }
  motifs(name, cfg) {
    if (this.mot[name]) return this.mot[name];
    const r = rng((this.def.seed || 1) * 31 + hash(cfg.motif ?? name));
    const mk = (flip) => {
      const rh = pick(r, this.meter === 3 ? RH3 : RH4);
      /* an arch: up through the first half of the phrase, down through the second (or the reverse) */
      const dl = rh.map((_, k) => (k ? pick(r, [1, 1, 2, 2, 1, 3]) * (k < rh.length / 2 ? 1 : -1) * (flip ? -1 : 1) * (r() < 0.2 ? -1 : 1) : 0));
      return { rh, dl };
    };
    const a = mk(false);
    let b = mk(true);
    if (b.rh === a.rh) b = mk(true);
    return (this.mot[name] = [a, b]);
  }

  /* write every bar that starts before `until` */
  schedule(until) {
    while (this.at < this.bars.length && this.t0 + this.at * this.bar < until) this.playBar(this.at++);
    if (this.srcs.length > 600) { const now = this.ctx.currentTime; this.srcs = this.srcs.filter(([, end]) => end > now); }
  }
  playBar(i) {
    const B = this.bars[i], t = this.t0 + i * this.bar;
    for (const [name, x] of Object.entries(this.tex)) x.g.gain.setTargetAtTime(B.play.has(name) ? x.lvl : 0, t, 1.4);
    for (const name of B.play) {
      const cfg = this.def.parts[name], fn = cfg && ROLES[cfg.role || name];
      if (fn) fn(this, i, B, t, cfg, name);
    }
  }
  /* cut the song off: fade out, then stop everything still waiting to play */
  stop(at, fade = 1) {
    const g = this.fader.gain;
    g.setValueAtTime(1, at); g.linearRampToValueAtTime(0, at + fade);
    for (const [n] of this.srcs) { try { n.stop(at + fade + 0.05); } catch { /* already stopped */ } }
    this.end = Math.min(this.end, at + fade + 0.1);
    this.at = this.bars.length;
  }
  disconnect() { try { this.fader.disconnect(); } catch { /* gone */ } }
}

/* ---------------- offline render (used to check levels; not used by the page) ---------------- */
export async function render(def, sampleRate = 44100) {
  const secs = songLength(def) + TAIL + 0.5;
  const ctx = new OfflineAudioContext(2, Math.ceil(secs * sampleRate), sampleRate);
  const out = createOutput(ctx);
  const s = new Song(out, def, 0.05);
  /* written a little at a time, like the live player, so the render costs what playback costs */
  const step = (t) => ctx.suspend(t).then(() => { s.schedule(t + 1.5); if (t + 0.5 < secs) step(t + 0.5); ctx.resume(); });
  s.schedule(1.5);
  step(0.5);
  return ctx.startRendering();
}

/* ---------------- the player: one audio context, a queue of songs, a scheduler ---------------- */
export class Player {
  constructor(songs, onChange = () => {}) {
    this.songs = songs; this.onChange = onChange;
    this.queue = []; this.i = 0; this.vol = 0.55; this.on = false;
    this.ctx = null; this.song = null; this.after = null; this.old = []; this.timer = 0;
  }
  get current() { return this.songs[this.queue[this.i]]; }
  ensure() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { this.ctx = new AC({ latencyHint: "playback" }); } catch { return false; }
    this.out = createOutput(this.ctx);
    this.out.vol.gain.value = 0;
    this.ctx.onstatechange = () => this.onChange("state");
    return true;
  }
  /* call from a click / tap / key press: browsers only let sound start from one */
  async play(fade = 0.8) {
    if (!this.ensure()) return false;
    const resumed = this.ctx.resume();
    const ok = await Promise.race([resumed.then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), 1500))]);
    if (!ok || this.ctx.state !== "running") return false;
    const now = this.ctx.currentTime;
    if (!this.song) this.song = new Song(this.out, this.current, now + 0.08);
    const g = this.out.vol.gain;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(this.level(), now + fade);
    this.on = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 200);
    this.tick();
    this.onChange("play");
    return true;
  }
  pause() {
    if (!this.on) return;
    this.on = false;
    clearInterval(this.timer); this.timer = 0;
    const ctx = this.ctx, now = ctx.currentTime, g = this.out.vol.gain;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + 0.25);
    setTimeout(() => { if (!this.on) ctx.suspend().catch(() => {}); }, 320);
    this.onChange("pause");
  }
  level() { return this.vol * this.vol; }
  setVolume(v) {
    this.vol = Math.min(1, Math.max(0, v));
    if (this.ctx && this.on) this.out.vol.gain.setTargetAtTime(this.level(), this.ctx.currentTime, 0.03);
  }
  setQueue(ids, start = 0) {
    const same = ids.length === this.queue.length && ids.every((id, k) => id === this.queue[k]);
    if (same) return false;
    this.queue = ids; this.i = Math.max(0, Math.min(ids.length - 1, start));
    if (this.song) this.jump(this.i);
    this.onChange("song");
    return true;
  }
  /* switch to queue[i] now, fading the current song out */
  jump(i) {
    this.i = ((i % this.queue.length) + this.queue.length) % this.queue.length;
    if (!this.ctx) { this.onChange("song"); return; }
    const now = this.ctx.currentTime;
    for (const s of [this.song, this.after]) if (s) { s.stop(now, 0.9); this.old.push(s); }
    this.after = null;
    this.song = this.on || this.song ? new Song(this.out, this.current, now + (this.on ? 0.25 : 0.05)) : null;
    if (this.on) this.tick();
    this.onChange("song");
  }
  next() { this.jump(this.i + 1); }
  prev() {
    if (this.song && this.ctx.currentTime - this.song.t0 > 5) this.jump(this.i);
    else this.jump(this.i - 1);
  }
  position() {
    if (!this.song || !this.ctx) return { t: 0, dur: this.current ? songLength(this.current) : 0 };
    const t = Math.max(0, this.ctx.currentTime - this.song.t0);
    return { t, dur: this.song.barsEnd - this.song.t0 };
  }
  tick() {
    if (!this.song) return;
    const now = this.ctx.currentTime, ahead = now + (document.hidden ? 4 : 1.5);
    /* line up the next song to start as this one's last chord rings out */
    if (!this.after && ahead > this.song.barsEnd - 0.5) {
      const j = (this.i + 1) % this.queue.length;
      this.after = new Song(this.out, this.songs[this.queue[j]], this.song.barsEnd + 1.2);
      this.after.qi = j;
    }
    this.song.schedule(ahead);
    if (this.after) {
      this.after.schedule(ahead);
      if (now >= this.after.t0) { this.old.push(this.song); this.song = this.after; this.after = null; this.i = this.song.qi; this.onChange("song"); }
    }
    this.old = this.old.filter((s) => (now > s.end ? (s.disconnect(), false) : true));
  }
  /* phones suspend audio when the screen locks; pick back up when the page is shown again */
  wake() { if (this.on && this.ctx && this.ctx.state !== "running") this.ctx.resume().catch(() => {}); }
  levels(n) {
    if (!this.ctx || !this.on) return null;
    const a = this.out.an, d = new Uint8Array(a.frequencyBinCount);
    a.getByteFrequencyData(d);
    const out = [];
    for (let k = 0; k < n; k++) {
      const lo = Math.floor(2 * (48 / 2) ** (k / n)), hi = Math.max(lo + 1, Math.floor(2 * (48 / 2) ** ((k + 1) / n)));
      let m = 0;
      for (let j = lo; j < hi; j++) m = Math.max(m, d[j]);
      out.push(m / 255);
    }
    return out;
  }
}

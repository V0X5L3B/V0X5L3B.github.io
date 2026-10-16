/*
 * The music player: the ♪ button in the header and the now-playing panel in the footer.
 * Songs come from songs.js and are played by music.js. The playlist follows the look of the site
 * (forest, Halloween, winter). Remembers the volume (v0x-volume), the last song (v0x-song) and
 * whether the visitor switched the music off (v0x-music).
 * Browsers only allow sound after a tap, click or key press, so unless the visitor switched the
 * music off before, it fades in on their first one.
 */
import { Player } from "./music.js";
import { SONGS, PLAYLISTS, playlistFor } from "./songs.js";

const ICON = {
  play: '<path d="M8.5 5.8v12.4L18.2 12z" fill="currentColor"/>',
  pause: '<path d="M7.5 5.5h3.2v13H7.5zM13.3 5.5h3.2v13h-3.2z" fill="currentColor"/>',
  prev: '<path d="M6.8 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 6.4v11.2L9.4 12z" fill="currentColor"/>',
  next: '<path d="M17.2 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 6.4v11.2l8.6-5.6z" fill="currentColor"/>',
  vol: '<path d="M4 9.6h3.4L12 6v12l-4.6-3.6H4z" fill="currentColor"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M17.8 6.8a7.4 7.4 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
};
const svg = (name, size = 18) => {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size); s.setAttribute("height", size); s.setAttribute("aria-hidden", "true");
  s.innerHTML = ICON[name];   // static markup from ICON above
  return s;
};
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
const eq = (n) => { const e = el("span", "eq"); e.setAttribute("aria-hidden", "true"); for (let k = 0; k < n; k++) e.append(el("i")); return e; };
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** store: { get(k), set(k, v) } (localStorage that never throws) */
export function initMusic({ store }) {
  const root = document.documentElement;
  const wrap = document.getElementById("player"), btn = document.getElementById("musicBtn");
  if (!wrap || !window.AudioContext || !("createStereoPanner" in AudioContext.prototype)) return null;
  const still = () => root.classList.contains("calm") || matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* which song a playlist starts on: the one after the last song this visitor heard, or (first visit,
     dark theme) a night song */
  const startAt = (ids) => {
    const k = ids.indexOf(store.get("v0x-song"));
    if (k >= 0) return (k + 1) % ids.length;
    const night = root.dataset.theme !== "light" ? ids.findIndex((id) => SONGS[id].night) : -1;
    return Math.max(0, night);
  };

  let list = playlistFor(root.dataset.holiday), ready = false;
  const player = new Player(SONGS, (why) => ready && paint(why));
  /* the old mp3 player kept its volume in v0x-vol (a straight gain; this one squares the slider) */
  const old = parseFloat(store.get("v0x-vol"));
  if (store.get("v0x-volume") === null && Number.isFinite(old)) {
    if (old <= 0) store.set("v0x-music", "off");          // they had muted it: keep it quiet
    else store.set("v0x-volume", String(Math.sqrt(Math.min(1, old))));
  }
  try { localStorage.removeItem("v0x-vol"); } catch { /* storage unavailable */ }
  const v0 = parseFloat(store.get("v0x-volume"));
  player.setVolume(Number.isFinite(v0) ? v0 : 0.55);
  player.setQueue(PLAYLISTS[list].songs, startAt(PLAYLISTS[list].songs));

  /* ---- the footer panel ---- */
  const title = el("span", "player__title"), sub = el("span", "player__sub"), time = el("span", "player__time");
  const meta = el("div", "player__meta");
  meta.append(title, sub);
  const button = (icon, label, cls = "") => { const b = el("button", `icon-btn ${cls}`.trim()); b.type = "button"; b.setAttribute("aria-label", label); b.title = label; b.append(svg(icon)); return b; };
  const prevB = button("prev", "Previous song"), playB = button("play", "Play music", "player__pp"), nextB = button("next", "Next song");
  const ctl = el("div", "player__ctl");
  ctl.append(prevB, playB, nextB);
  const prog = el("div", "player__prog"), bar = el("i");
  prog.setAttribute("aria-hidden", "true");
  prog.append(bar);
  const vol = el("input");
  Object.assign(vol, { type: "range", min: "0", max: "1", step: "0.05", value: String(player.vol) });
  vol.setAttribute("aria-label", "Music volume");
  const volL = el("label", "player__vol");
  volL.append(svg("vol", 16), vol);
  const songsL = el("ul", "player__list");
  songsL.setAttribute("aria-label", "Songs");
  const row = el("div", "player__row");
  row.append(volL, time);
  const live = el("span", "sr-only");
  live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
  const top = el("div", "panel__bar");
  top.append(el("span", "panel__file", "now-playing"), el("span", "panel__tag", "played live by your browser"));
  const body = el("div", "player__in");
  const eqBig = eq(5);
  body.append(eqBig, meta, ctl, prog, row, songsL);
  wrap.replaceChildren(top, body, live);
  wrap.classList.add("panel");
  wrap.hidden = false;

  /* ---- the header button ---- */
  const eqSmall = eq(3);
  if (btn) { btn.append(eqSmall); btn.setAttribute("aria-label", "Music"); btn.hidden = false; }
  const sb = document.getElementById("sbMusic");

  const fillList = () => {
    songsL.replaceChildren(...player.queue.map((id, k) => {
      const li = el("li"), b = el("button", "chip", SONGS[id].title);
      b.type = "button";
      b.addEventListener("click", () => { player.jump(k); if (!player.playing) start(); });
      li.append(b);
      return li;
    }));
  };

  let said = "";
  function paint(why) {
    const s = player.current, on = player.playing, n = player.queue.length;   // not "on" while the phone has the sound interrupted
    title.textContent = s.title;
    sub.textContent = `${PLAYLISTS[list].name} · ${player.i + 1} of ${n}`;
    playB.replaceChildren(svg(on ? "pause" : "play"));
    playB.setAttribute("aria-label", on ? "Pause music" : "Play music");
    playB.title = on ? "Pause" : "Play";
    if (btn) {                                   // a toggle: the name stays "Music", aria-pressed says whether it's on
      btn.setAttribute("aria-pressed", String(on));
      btn.title = on ? `Music on: ${s.title}` : "Music off";
    }
    btn?.classList.toggle("is-on", on);
    wrap.classList.toggle("is-on", on);
    songsL.querySelectorAll(".chip").forEach((c, k) => c.setAttribute("aria-current", String(k === player.i)));
    if (sb) sb.textContent = on ? `♪ ${s.title}` : "";
    if (on && (why === "song" || why === "play")) store.set("v0x-song", player.queue[player.i]);
    const msg = on ? `Playing ${s.title}` : why === "pause" ? "Music paused" : "";
    if (msg && msg !== said && why !== "state") { live.textContent = msg; said = msg; }
    tickUI();
    if (on) loop();
  }

  /* level bars and the progress line, drawn while music plays and the page is visible */
  let raf = 0, lastDraw = 0;
  const bars = [...eqBig.children, ...eqSmall.children];
  function tickUI() {
    const { t, dur } = player.position();
    bar.style.setProperty("--p", dur ? Math.min(1, t / dur).toFixed(4) : 0);
    time.textContent = `${clock(Math.min(t, dur))} / ${clock(dur)}`;
  }
  function loop() {
    if (raf) return;
    const frame = (ts) => {
      raf = 0;
      if (!player.playing || document.hidden) { bars.forEach((b) => b.style.removeProperty("--l")); return; }
      if (ts - lastDraw > 40) {
        lastDraw = ts;
        tickUI();
        if (!still()) {
          const lv = player.levels(5);
          if (lv) {
            eqBig.childNodes.forEach((b, k) => b.style.setProperty("--l", (0.15 + lv[k] * 0.85).toFixed(3)));
            eqSmall.childNodes.forEach((b, k) => b.style.setProperty("--l", (0.2 + lv[k + 1] * 0.8).toFixed(3)));
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  /* ---- actions ---- */
  let chose = false;   // the visitor pressed play or pause themselves (kept here too, in case storage is blocked)
  async function start(fade = 0.8) {
    chose = true;
    removeGestures();
    /* pressing play means "play it like music": on iPhone that also plays with the silent switch on */
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch { /* not supported */ }
    const ok = await player.play(fade);
    if (ok) store.set("v0x-music", "on");
    else if (fade < 2) { live.textContent = "This browser didn't let the music start. Try again."; said = ""; }
    return ok;
  }
  function stop() { chose = true; removeGestures(); player.pause(); store.set("v0x-music", "off"); }
  const toggle = () => (player.playing ? stop() : start());
  const skip = (d) => { d > 0 ? player.next() : player.prev(); if (!player.playing) start(); };
  playB.addEventListener("click", toggle);
  btn?.addEventListener("click", toggle);
  prevB.addEventListener("click", () => skip(-1));
  nextB.addEventListener("click", () => skip(1));
  vol.addEventListener("input", () => { player.setVolume(parseFloat(vol.value)); store.set("v0x-volume", vol.value); });

  /* follow the site's look: Halloween music with the Halloween scene, and so on */
  new MutationObserver(() => {
    const next = playlistFor(root.dataset.holiday);
    if (next === list) return;
    list = next;
    player.setQueue(PLAYLISTS[list].songs, startAt(PLAYLISTS[list].songs));
    fillList(); paint("song");
  }).observe(root, { attributes: true, attributeFilter: ["data-holiday", "data-scene"] });

  document.addEventListener("visibilitychange", () => { if (!document.hidden) { player.wake(); if (player.playing) loop(); } });

  /* start on the first tap / click / key press (owner's choice), unless this visitor switched it off */
  const gestures = ["pointerdown", "keydown", "touchend"];
  const removeGestures = () => gestures.forEach((g) => document.removeEventListener(g, onGesture, true));
  async function onGesture(e) {
    if (e.target.closest?.("#player, #musicBtn")) return;   // the music's own controls decide for themselves
    if (chose || player.on || store.get("v0x-music") === "off") return removeGestures();
    if (navigator.userActivation && !navigator.userActivation.isActive) return;   // a touch that became a scroll, a lone Shift: wait for one that counts
    if (await player.play(4)) removeGestures();
  }
  if (store.get("v0x-music") !== "off") {
    if (navigator.getAutoplayPolicy?.("audiocontext") === "allowed") player.play(4);
    else gestures.forEach((g) => document.addEventListener(g, onGesture, true));
  }

  ready = true;
  fillList();
  paint();

  return {
    get on() { return player.playing; },
    get volume() { return player.vol; },
    playlist: () => PLAYLISTS[list].name,
    songs: () => player.queue.map((id, k) => ({ id, title: SONGS[id].title, current: k === player.i })),
    current: () => player.current.title,
    play: () => (player.playing ? Promise.resolve(true) : start()),
    pause: () => player.on && stop(),
    toggle, next: () => skip(1), prev: () => skip(-1),
    playAt: (k) => { player.jump(k); if (!player.playing) start(); },
    setVolume: (v) => { player.setVolume(v); vol.value = String(player.vol); store.set("v0x-volume", String(player.vol)); },
  };
}

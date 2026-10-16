import {
  PROFILE, LINKS, SHOUTOUTS, PROJECTS, FILTERS, SKILLS, DIRECTION, TRACKS,
  SERVICES, PROCESS, HIRE, NOW, PROMOS, NOTES,
} from "./data.js";
import { initHoliday, preview as previewHoliday, setEnabled as setHolidayEnabled, HOLIDAYS, current as currentHoliday } from "./holiday.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
/* motion is on by default (owner's choice); visitors can turn it off with the footer switch */
const reduced = (() => { try { return localStorage.getItem("v0x-motion") === "off"; } catch { return false; } })();

/** Tiny DOM builder. Text is always set via textContent (never innerHTML). */
function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return n;
}
const ext = (href, text, cls) =>
  h("a", { href, class: cls, target: "_blank", rel: "noopener noreferrer" }, text);

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* ---------------- theme ---------------- */
const root = document.documentElement;
if (reduced) root.classList.add("calm");
const themeBtn = $("#themeBtn");
function setTheme(t, persist = true) {
  root.setAttribute("data-theme", t);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "light" ? "#f0f6ee" : "#121c16");
  themeBtn.setAttribute("aria-pressed", String(t === "light"));
  themeBtn.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
  if (persist) store.set("v0x-theme", t);
}
const currentTheme = () => (root.getAttribute("data-theme") === "light" ? "light" : "dark");
setTheme(currentTheme(), false);
themeBtn.addEventListener("click", () => setTheme(currentTheme() === "light" ? "dark" : "light"));

/* ---------------- mobile nav ---------------- */
const nav = $("#nav");
const menuBtn = $("#menuBtn");
function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
});

/* ---------------- profile content from data ---------------- */
$("#statusText").textContent = PROFILE.status;
$("#heroLede").textContent = PROFILE.intro;
const gh = $("#heroGithub");
if (LINKS.github) gh.href = LINKS.github.url; else gh.remove();
const hd = $("#heroDiscord");
if (LINKS.discordServer) hd.href = LINKS.discordServer.url; else hd.remove();
$("#direction").append(...DIRECTION.map((d) => h("li", { text: d })));

/* ---------------- now + promo spots ---------------- */
const termNow = $("#termNow");
if (NOW && termNow) termNow.textContent = NOW;
else $$(".term__now").forEach((n) => n.remove());

const isLocal = (href) => href.startsWith("#");
$("#promoRow")?.append(...PROMOS.map((p) =>
  h("li", { class: `promo__c reveal`, "data-kind": p.kind },
    h("span", { class: "promo__k", text: p.kind }),
    h("strong", { class: "promo__t", text: p.title }),
    h("span", { class: "promo__s", text: p.text }),
    isLocal(p.href) ? h("a", { class: "promo__a", href: p.href }, `${p.cta} \u2192`) : ext(p.href, `${p.cta} \u2197`, "promo__a"))));

/* ---------------- projects: a small file explorer ---------------- */
const tree = $("#projectTree");
const view = $("#projectView");
let activeProject = PROJECTS[0]?.id;

function projectView(p) {
  const links = [];
  if (p.links?.github) links.push(ext(p.links.github, "Source \u2197", "btn"));
  if (p.links?.live) links.push(ext(p.links.live, "Live \u2197", "btn"));
  view.setAttribute("data-accent", p.accent);
  view.setAttribute("aria-labelledby", `tab-${p.id}`);
  view.replaceChildren(
    h("div", { class: "card__kicker" }, h("span", { text: p.kicker }), h("span", { class: "badge", text: p.status })),
    h("h3", { class: "card__title", text: p.name }),
    h("p", { class: "card__sum", text: p.summary }),
    h("h4", { class: "mini", text: "How it's built" }),
    h("ul", { class: "det" }, p.details.map((d) => h("li", { text: d }))),
    h("ul", { class: "tags", "aria-label": "Technologies" }, p.tags.map((t) => h("li", { text: t }))),
    h("div", { class: "card__actions" }, links, !links.length && h("span", { class: "nolink", text: "No public source or demo yet." })),
  );
}

function selectProject(id, focus = false) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return false;
  activeProject = id;
  $$("[role=tab]", tree).forEach((t) => {
    const on = t.dataset.id === id;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  projectView(p);
  return true;
}

function openProject(id) {
  if (!selectProject(id)) return false;
  if (window.v0xLenis) window.v0xLenis.scrollTo("#projects"); else $("#projects").scrollIntoView();
  return true;
}

tree.append(
  ...PROJECTS.map((p) => h("button", {
    type: "button", role: "tab", class: "tree__i", id: `tab-${p.id}`, "data-id": p.id, "data-accent": p.accent,
    "data-cats": p.categories.join(" "), "aria-controls": "projectView",
    onclick: () => selectProject(p.id),
  }, h("span", { class: "tree__n", text: p.name }), h("span", { class: "tree__s", text: p.status }))),
  h("a", { class: "tree__i tree__you", href: "#hire" },
    h("span", { class: "tree__n", text: "+ Your project" }), h("span", { class: "tree__s", text: "Tell me what you want to make" })),
);
tree.addEventListener("keydown", (e) => {
  if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
  const tabs = $$("[role=tab]:not([hidden])", tree);
  const i = tabs.findIndex((t) => t.dataset.id === activeProject);
  const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
  const next = tabs[(i + step + tabs.length) % tabs.length];
  if (next) { e.preventDefault(); selectProject(next.dataset.id, true); }
});
selectProject(activeProject);

/* filters */
const filterBar = $("#filters");
const filterStatus = $("#filterStatus");
let activeFilter = "all";
function renderFilters() {
  filterBar.replaceChildren(...FILTERS.map((f) =>
    h("button", {
      type: "button", class: "chip", "aria-pressed": String(f.id === activeFilter),
      onclick: () => applyFilter(f.id),
    }, f.label)));
}
function applyFilter(id) {
  activeFilter = id;
  const shown = $$("[role=tab]", tree).filter((t) => {
    const ok = id === "all" || t.dataset.cats.split(" ").includes(id);
    t.hidden = !ok;
    return ok;
  });
  if (shown.length && !shown.some((t) => t.dataset.id === activeProject)) selectProject(shown[0].dataset.id);
  const label = FILTERS.find((f) => f.id === id)?.label ?? id;
  filterStatus.textContent = `${shown.length} project${shown.length === 1 ? "" : "s"} shown: ${label}`;
  renderFilters();
}
renderFilters();

/* ---------------- services / hire me ---------------- */
$("#hirePitch").textContent = HIRE.pitch;
$("#svcGrid").append(...SERVICES.map((s) =>
  h("article", { class: "svc__c reveal", id: `s-${s.id}` },
    h("span", { class: "svc__i", "aria-hidden": "true", text: s.icon }),
    h("h3", { class: "svc__t", text: s.name }),
    h("p", { class: "svc__s", text: s.summary }),
    h("ul", { class: "svc__l" }, s.includes.map((i) => h("li", { text: i }))),
    h("ul", { class: "tags", "aria-label": "Technologies" }, s.tags.map((t) => h("li", { text: t }))))));
$("#steps").append(...PROCESS.map((p) =>
  h("li", {}, h("strong", { text: p.step }), h("span", { text: p.note }))));
$("#hirePrice").textContent = HIRE.price;
(function hireCta() {
  const cta = $("#hireCta");
  const talk = LINKS.discordServer?.url;
  cta.append(talk
    ? ext(talk, "Start a project ↗", "btn btn--primary")
    : h("a", { class: "btn btn--primary", href: "#contact" }, "Start a project ↓"));
  if (HIRE.pay?.url) cta.append(ext(HIRE.pay.url, `${HIRE.pay.label} ↗`, "btn"));
  if (LINKS.discord?.copy) cta.append(h("p", { class: "hire__dm", text: `or message ${LINKS.discord.copy} on Discord` }));
})();

/* ---------------- skills ---------------- */
$("#skillGrid").append(...SKILLS.map((g) =>
  h("div", { class: "skills__g reveal" },
    h("h3", { text: g.group }),
    h("ul", {}, g.items.map((i) =>
      h("li", {}, h("span", { class: "skills__n", text: i.name }), h("span", { class: "skills__s", text: i.stance })))))));

/* ---------------- notes ---------------- */
const fmtDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
$("#notesList").append(...NOTES.map((n) =>
  h("li", { class: "note-i reveal", id: `note-${n.id}` },
    h("details", {},
      h("summary", {},
        h("time", { class: "note-i__d", datetime: n.date, text: fmtDate(n.date) }),
        h("span", { class: "note-i__t", text: n.title }),
        h("span", { class: "note-i__s", text: n.summary })),
      h("div", { class: "note-i__b" },
        n.body.map((para) => h("p", { text: para })),
        h("ul", { class: "tags", "aria-label": "Topics" }, n.tags.map((t) => h("li", { text: t }))))))));

/* ---------------- contact ---------------- */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const t = h("textarea", { style: "position:fixed;opacity:0", "aria-hidden": "true" });
    t.value = text; document.body.append(t); t.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* ignored */ }
    t.remove(); return ok;
  }
}
function linkCard(l) {
  const status = h("span", { class: "sr-only", role: "status", "aria-live": "polite" });
  const actions = h("div", { class: "lk__a" });
  if (l.copy) {
    const btn = h("button", { type: "button", class: "link-btn" }, "Copy");
    btn.addEventListener("click", async () => {
      const ok = await copyText(l.copy);
      btn.textContent = ok ? "Copied ✓" : "Copy failed";
      status.textContent = ok ? `${l.label} handle copied` : "Copy failed";
      setTimeout(() => { btn.textContent = "Copy"; status.textContent = ""; }, 1800);
    });
    actions.append(btn);
  }
  if (l.url) actions.append(ext(l.url, "Open ↗", "link-btn"));
  return h("li", {}, h("div", { class: "lk reveal" },
    h("span", { class: "lk__k", text: l.label }), h("span", { class: "lk__v", text: l.handle }), actions, status));
}
$("#linkList").append(...Object.values(LINKS).filter(Boolean).map(linkCard));

const shout = $("#shout");
if (SHOUTOUTS.length) {
  shout.append("Shoutout: ");
  SHOUTOUTS.forEach((s, i) => {
    if (i) shout.append(" · ");
    shout.append(ext(s.url, s.name), ` — ${s.note}`);
  });
} else shout.remove();

/* ---------------- console (fixed command set; no eval, no network) ---------------- */
const out = $("#consoleOut");
const form = $("#consoleForm");
const input = $("#consoleIn");
const history = [];
let hIdx = 0;

function print(...nodes) {
  out.append(h("div", {}, nodes));
  out.scrollTop = out.scrollHeight;
}
const COMMANDS = {
  help() {
    print("commands:");
    print("  whoami            who this is");
    print("  about             a short description");
    print("  projects          list projects");
    print("  hire              what I can make for you");
    print("  open <id>         open a project's details");
    print("  skills            how I use what I use");
    print("  notes             write-ups from building this site");
    print("  links             public links");
    print("  theme [dark|light] switch or toggle theme");
    print("  holiday [id|on|off] preview or toggle seasonal themes");
    print("  clear             clear this screen");
  },
  whoami() { print(`${PROFILE.handle} (${PROFILE.tag}) — developer, open for projects`); },
  about() { print(PROFILE.intro); },
  projects() {
    PROJECTS.forEach((p) => {
      const b = h("button", { type: "button", class: "inline", onclick: () => openProject(p.id) }, p.id);
      print(b, `  — ${p.name} [${p.status.toLowerCase()}]`);
    });
    print("tip: `open <id>` shows details.");
  },
  open(arg) {
    if (!arg) return print(h("span", { class: "err", text: "usage: open <project-id>" }));
    const hit = PROJECTS.find((p) => p.id === arg || p.id.startsWith(arg));
    if (!hit) return print(h("span", { class: "err", text: `no project "${arg}". try: projects` }));
    print(`showing ${hit.name}`);
    openProject(hit.id);
  },
  hire() {
    print(HIRE.pitch);
    SERVICES.forEach((s) => print(`  ${s.icon} ${s.name}`));
    print(HIRE.price);
    const go = h("button", { type: "button", class: "inline", onclick: () => (window.v0xLenis ? window.v0xLenis.scrollTo("#hire") : $("#hire").scrollIntoView()) }, "see the hire me section");
    print("next: ", go);
  },
  notes() {
    NOTES.forEach((n) => {
      const b = h("button", { type: "button", class: "inline", onclick: () => { const d = $(`#note-${n.id} details`); d.open = true; d.scrollIntoView({ block: "center" }); } }, n.title);
      print(`${n.date}  `, b);
    });
  },
  skills() {
    SKILLS.forEach((g) => print(`${g.group}: ${g.items.map((i) => `${i.name} (${i.stance.toLowerCase()})`).join(", ")}`));
  },
  links() {
    Object.values(LINKS).filter(Boolean).forEach((l) => print(`${l.label.padEnd(8)} `, l.url ? ext(l.url, l.handle) : l.handle));
  },
  theme(arg) {
    const t = arg === "light" || arg === "dark" ? arg : currentTheme() === "light" ? "dark" : "light";
    setTheme(t); print(`theme: ${t}`);
  },
  holiday(arg) {
    const ids = Object.keys(HOLIDAYS);
    if (!arg || arg === "list") return print(`current: ${currentHoliday() ?? "none"} · usage: holiday <${ids.join("|")}|none|on|off>`);
    if (arg === "on" || arg === "off") { setHolidayEnabled(arg === "on"); return print(`seasonal theme: ${arg}`); }
    if (arg === "none") { previewHoliday(null); return print("holiday decor cleared (preview only)"); }
    if (previewHoliday(arg)) print(`previewing ${arg} (not saved)`);
    else print(h("span", { class: "err", text: `unknown holiday "${arg}". try: holiday list` }));
  },
  boo() {
    if (currentHoliday() !== "halloween") return print("…nothing here. (try again in October, or `holiday halloween`)");
    print("   .-.");
    print("  (o o)  boo!");
    print("  | O |");
    print("  '~~~'");
  },
  clear() { out.replaceChildren(); },
};
function run(raw) {
  const line = raw.trim();
  if (!line) return;
  history.push(line); hIdx = history.length;
  print(h("span", { class: "cmd", text: line }));
  const [name, ...rest] = line.split(/\s+/);
  const fn = Object.hasOwn(COMMANDS, name.toLowerCase()) ? COMMANDS[name.toLowerCase()] : null;
  if (fn) fn(rest.join(" ").toLowerCase());
  else print(h("span", { class: "err", text: `command not found: ${name}. try \`help\`` }));
}
form.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && history.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx] ?? ""; }
  if (e.key === "ArrowDown" && history.length) { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] ?? ""; }
});
$$(".console__chips .chip").forEach((c) => c.addEventListener("click", () => run(c.dataset.cmd)));
print("v0x lab console — type `help` or tap a command below.");

initHoliday();

/* ---------------- ambient audio (autoplays; falls back to first interaction) ---------------- */
(function player() {
  if (!TRACKS.length) return;
  const wrap = $("#player");
  const audio = new Audio();
  audio.preload = "auto";
  audio.loop = false;
  let idx = 0, ready = false;
  const label = $("#playerLabel");
  const play = $("#playBtn");
  const vol = $("#vol");
  const saved = parseFloat(store.get("v0x-vol"));
  audio.volume = Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.3;
  vol.value = String(audio.volume);

  const load = () => { audio.src = TRACKS[idx].src; ready = true; };
  const paint = (playing) => {
    play.textContent = playing ? "Pause" : "Play";
    play.setAttribute("aria-pressed", String(playing));
    label.textContent = playing ? `ambient · ${TRACKS[idx].name}` : "ambient · off";
  };
  play.addEventListener("click", async () => {
    if (!ready) load();
    if (audio.paused) {
      try { await audio.play(); paint(true); } catch { label.textContent = "ambient · couldn't play"; }
    } else { audio.pause(); paint(false); }
  });
  $("#nextBtn").addEventListener("click", async () => {
    idx = (idx + 1) % TRACKS.length; load();
    try { await audio.play(); paint(true); } catch { paint(false); }
  });
  audio.addEventListener("ended", () => $("#nextBtn").click());
  audio.addEventListener("error", () => { label.textContent = "ambient · track missing"; });
  vol.addEventListener("input", () => { audio.volume = parseFloat(vol.value); store.set("v0x-vol", vol.value); });
  paint(false);
  wrap.hidden = false;

  /* Autoplay: try immediately. Browsers usually block sound until the first
     user gesture, so if that happens, start on the first click/tap/keypress. */
  const start = async () => {
    if (!audio.paused) return true;
    if (!ready) load();
    try { await audio.play(); paint(true); return true; } catch { return false; }
  };
  const onGesture = async (e) => {
    if (e.target.closest && e.target.closest("#player")) return; // let the player's own controls decide
    if (await start()) removeGestures();
  };
  const gestures = ["pointerdown", "keydown", "touchend"];
  const removeGestures = () => gestures.forEach((g) => document.removeEventListener(g, onGesture, true));
  start().then((ok) => { if (!ok) gestures.forEach((g) => document.addEventListener(g, onGesture, true)); });
})();

/* ---------------- scroll: active nav + reveal ---------------- */
// the hero has no nav link, so reaching it again clears the highlight
const sections = [$(".hero"), ...["about", "projects", "hire", "skills", "lab", "contact"].map((id) => $(`#${id}`))].filter(Boolean);
const navLinks = new Map($$("a", nav).map((a) => [a.getAttribute("href").slice(1), a]));
if ("IntersectionObserver" in window) {
  const so = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
      const a = navLinks.get(en.target.id);
      if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((s) => so.observe(s));

  const ro = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => ro.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}

/* ---------------- footer: animations switch + status bar ---------------- */
const motionBtn = $("#motionBtn");
if (motionBtn) {
  motionBtn.textContent = reduced ? "Off" : "On";
  motionBtn.setAttribute("aria-pressed", String(!reduced));
  motionBtn.setAttribute("aria-label", reduced ? "Turn animations on" : "Turn animations off");
  motionBtn.addEventListener("click", () => {
    store.set("v0x-motion", reduced ? "on" : "off");
    location.reload();                              // the animation layers read the setting once, at load
  });
}
function paintStatus() {
  const t = $("#sbTheme"), s = $("#sbSeason");
  if (t) t.textContent = `theme: ${currentTheme()}`;
  if (s) s.textContent = `season: ${root.dataset.holiday ?? root.dataset.scene ?? "none"}`;
}
paintStatus();
new MutationObserver(paintStatus).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-holiday", "data-scene"] });

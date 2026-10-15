import {
  PROFILE, LINKS, SHOUTOUTS, PROJECTS, FILTERS, LAB, SKILLS, DIRECTION, TRACKS,
  SERVICES, PROCESS, HIRE,
} from "./data.js";
import { initHoliday, preview as previewHoliday, setEnabled as setHolidayEnabled, HOLIDAYS, current as currentHoliday } from "./holiday.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = false; /* motion is always on (owner's choice) */

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
const themeBtn = $("#themeBtn");
function setTheme(t, persist = true) {
  root.setAttribute("data-theme", t);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "light" ? "#fff5f7" : "#1f1720");
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

/* ---------------- projects ---------------- */
const grid = $("#projectGrid");
const dlg = $("#dlg");
let lastTrigger = null;

/* Small syntax colouring for the sketches: comments, strings, keywords, numbers, calls. Builds text nodes, no innerHTML. */
const KW = new Set(["const", "let", "export", "import", "from", "return", "if", "else", "while", "for", "in", "not", "and", "or", "def", "class", "null", "true", "false", "None", "True", "False"]);
const TOKEN = /(\/\/.*|#.*)|("[^"\n]*"|'[^'\n]*'|`[^`\n]*`)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)(?=\s*\()|\b([A-Za-z_]\w*)\b/g;
function highlight(src) {
  const out = []; let last = 0;
  for (const m of src.matchAll(TOKEN)) {
    const [t, com, str, num, call, word] = m;
    const cls = com ? "c" : str ? "s" : num ? "n" : call ? (KW.has(call) ? "k" : "f") : KW.has(word) ? "k" : null;
    if (!cls) continue;
    if (m.index > last) out.push(src.slice(last, m.index));
    out.push(h("span", { class: cls, text: t }));
    last = m.index + t.length;
  }
  out.push(src.slice(last));
  return out;
}

function sketchBlock(s, cls = "") {
  return h("pre", { class: `code ${cls}`, tabindex: "0" }, h("code", {}, highlight(s.code)));
}

function projectCard(p) {
  const links = [];
  if (p.links?.github) links.push(ext(p.links.github, "Source ↗", "link-btn"));
  if (p.links?.live) links.push(ext(p.links.live, "Live ↗", "link-btn"));
  const more = h("button", {
    type: "button", class: "link-btn",
    "aria-haspopup": "dialog",
    "aria-label": `Details: ${p.name}`,
    onclick: (e) => openProject(p.id, e.currentTarget),
  }, "Details");

  return h("article", { class: "card reveal", "data-accent": p.accent, "data-cats": p.categories.join(" "), id: `p-${p.id}` },
    h("div", { class: "card__top" },
      h("div", { class: "card__kicker" }, h("span", { text: p.kicker }), h("span", { class: "badge", text: p.status })),
      h("h3", { class: "card__title", text: p.name }),
      h("p", { class: "card__sum", text: p.summary }),
      h("ul", { class: "tags", "aria-label": "Technologies" }, p.tags.map((t) => h("li", { text: t }))),
    ),
    h("div", { class: "card__sketch" },
      h("div", { class: "panel__bar" }, h("span", { class: "panel__file", text: p.sketch.file }), h("span", { class: "panel__tag", text: "sketch · illustrative" })),
      sketchBlock(p.sketch, "code--card"),
    ),
    h("div", { class: "card__actions" }, more, links,
      !links.length && h("span", { class: "nolink", text: "no public source yet" })),
  );
}

grid.append(...PROJECTS.map(projectCard));

/* a friendly last tile: "your project could go here" (not a .card, so filters leave it alone) */
grid.append(h("a", { class: "card-you reveal", href: "#hire" },
  h("span", { class: "card-you__plus", "aria-hidden": "true", text: "+" }),
  h("span", { class: "card-you__t", text: "Your project could go here" }),
  h("span", { class: "card-you__s", text: "Tell me what you want to make →" })));

function openProject(id, trigger) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return false;
  lastTrigger = trigger || document.activeElement;
  const links = [];
  if (p.links?.github) links.push(ext(p.links.github, "Source ↗", "link-btn"));
  if (p.links?.live) links.push(ext(p.links.live, "Live ↗", "link-btn"));
  const body = $("#dlgBody");
  body.replaceChildren(
    h("div", { class: "card__kicker" }, h("span", { text: p.kicker }), h("span", { class: "badge", style: "margin-right:44px", text: p.status })),
    h("h3", { id: "dlgTitle", text: p.name }),
    h("p", { class: "muted", text: p.summary }),
    h("ul", { class: "det" }, p.details.map((d) => h("li", { text: d }))),
    h("ul", { class: "tags" }, p.tags.map((t) => h("li", { text: t }))),
    h("p", { class: "code-cap", text: `${p.sketch.file} — an illustrative sketch of the idea, not the real source.` }),
    sketchBlock(p.sketch),
    links.length ? h("div", { class: "card__actions", style: "padding:18px 0 0;border:0" }, links)
                 : h("p", { class: "code-cap", style: "margin-top:18px", text: "No public repository or demo yet." }),
  );
  $("#dlg").setAttribute("data-accent", p.accent);
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "");
  return true;
}
$("#dlgClose").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click
dlg.addEventListener("close", () => { if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus(); });

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
  let shown = 0;
  $$(".card", grid).forEach((c) => {
    const ok = id === "all" || c.dataset.cats.split(" ").includes(id);
    c.hidden = !ok;
    if (ok) { shown++; c.classList.add("in"); }
  });
  $(".empty", grid)?.remove();
  if (!shown) {
    grid.append(h("div", { class: "empty" },
      h("p", { text: "Nothing under that filter yet." }),
      h("button", { type: "button", class: "chip", onclick: () => applyFilter("all") }, "Show all projects")));
  }
  const label = FILTERS.find((f) => f.id === id)?.label ?? id;
  filterStatus.textContent = `${shown} project${shown === 1 ? "" : "s"} shown: ${label}`;
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

/* ---------------- lab ---------------- */
if (!LAB.length) {
  $("#labGrid").append(h("div", { class: "empty" }, h("p", { text: "Nothing in the lab right now. New experiments will show up here." })));
}
$("#labGrid").append(...LAB.map((e) =>
  h("article", { class: "exp reveal" },
    h("div", { class: "exp__row" }, h("h3", { text: e.name }), h("span", { class: "exp__st", text: e.status })),
    h("p", { text: e.note }),
    h("ul", { class: "tags" }, e.tags.map((t) => h("li", { text: t }))),
    e.url && ext(e.url, "Code ↗", "link-btn"))));

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
    print("  links             public links");
    print("  theme [dark|light] switch or toggle theme");
    print("  holiday [id|on|off] preview or toggle seasonal themes");
    print("  clear             clear this screen");
  },
  whoami() { print(`${PROFILE.handle} (${PROFILE.tag}) — developer, open for projects`); },
  about() { print(PROFILE.intro); },
  projects() {
    PROJECTS.forEach((p) => {
      const b = h("button", { type: "button", class: "inline", onclick: (e) => openProject(p.id, e.currentTarget) }, p.id);
      print(b, `  — ${p.name} [${p.status.toLowerCase()}]`);
    });
    print("tip: `open <id>` shows details.");
  },
  open(arg) {
    if (!arg) return print(h("span", { class: "err", text: "usage: open <project-id>" }));
    const hit = PROJECTS.find((p) => p.id === arg || p.id.startsWith(arg));
    if (!hit) return print(h("span", { class: "err", text: `no project "${arg}". try: projects` }));
    print(`opening ${hit.name}…`);
    openProject(hit.id, input);
  },
  hire() {
    print(HIRE.pitch);
    SERVICES.forEach((s) => print(`  ${s.icon} ${s.name}`));
    print(HIRE.price);
    const go = h("button", { type: "button", class: "inline", onclick: () => (window.v0xLenis ? window.v0xLenis.scrollTo("#hire") : $("#hire").scrollIntoView()) }, "see the hire me section");
    print("next: ", go);
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

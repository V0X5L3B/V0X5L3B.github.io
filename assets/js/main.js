import {
  PROFILE, LINKS, SHOUTOUTS, PROJECTS, FILTERS, SKILLS, DIRECTION,
  SERVICES, PROCESS, HIRE, NOW, PROMOS, NOTES,
} from "./data.js";
import { initHoliday, preview as previewHoliday, setEnabled as setHolidayEnabled, HOLIDAYS, current as currentHoliday } from "./holiday.js";
import { initPalette } from "./palette.js";
import { initBrief } from "./brief.js";
import { petCounts } from "./alive.js";
import { initMusic } from "./player.js";

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

/* scroll to a section or element (Lenis when it's running, so the smooth scroll isn't fought) */
function goTo(target, block = "start") {
  const node = typeof target === "string" ? $(target) : target;
  if (!node) return;
  if (window.v0xLenis) window.v0xLenis.scrollTo(node, block === "center" ? { offset: -innerHeight / 3 } : {});
  else node.scrollIntoView({ block, behavior: reduced ? "auto" : "smooth" });
}

/* a "Copy link" button for a project or note; the link opens the site right at it */
function shareBtn(hash, name) {
  const url = `${PROFILE.site}#${hash}`;
  const status = h("span", { class: "sr-only", role: "status", "aria-live": "polite" });
  const btn = h("button", { type: "button", class: "link-btn share", title: url }, "Copy link");
  btn.addEventListener("click", async () => {
    const ok = await copyText(url);
    btn.textContent = ok ? "Link copied \u2713" : "Copy failed";
    status.textContent = ok ? `Link to ${name} copied` : "Copy failed";
    setTimeout(() => { btn.textContent = "Copy link"; status.textContent = ""; }, 1800);
  });
  return h("span", { class: "share__w" }, btn, status);
}

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
    h("div", { class: "card__actions" }, links, !links.length && h("span", { class: "nolink", text: "No public source or demo yet." }),
      shareBtn(`project-${p.id}`, p.name)),
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
  h("a", { class: "tree__i tree__you", href: "#brief" },
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
  cta.append(h("a", { class: "hire__brief", href: "#brief" }, "Not sure what to say? Write a quick brief \u2193"));
})();
const brief = initBrief({
  mount: $("#brief"), services: SERVICES, handle: PROFILE.handle,
  dm: LINKS.discord?.copy ?? null, server: LINKS.discordServer?.url ?? null, copy: copyText,
});

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
        h("ul", { class: "tags", "aria-label": "Topics" }, n.tags.map((t) => h("li", { text: t }))),
        shareBtn(`note-${n.id}`, n.title))))));
function openNote(id, scroll = true) {
  const li = $(`#note-${id}`);
  if (!li) return false;
  li.querySelector("details").open = true;
  if (scroll) goTo(li, "center");
  return true;
}

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
    print("  motion [on|off]   turn animations on or off");
    print("  brief             write a project brief");
    print("  pets              how many animals you've petted");
    print("  music [on|off|next|prev|list|<song>] the background music");
    print("  menu              open the quick menu (ctrl k)");
    print("  keys              keyboard shortcuts");
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
  motion(arg) {
    const on = !reduced;
    if (arg === "on" && on) return print("animations are already on");
    if (arg === "off" && !on) return print("animations are already off");
    print(`animations ${on ? "off" : "on"}, reloading…`);
    setTimeout(toggleMotion, 400);
  },
  brief() {
    print("opening the brief builder: answer a few questions and copy the message to Discord.");
    goBrief();
  },
  pets() {
    const all = Object.entries(petCounts());
    if (!all.length) return print(reduced ? "turn animations on (`motion on`), then come up slowly to an animal and tap it." : "no pets yet. come up slowly to an animal and tap it.");
    all.sort((a, b) => b[1] - a[1]).forEach(([k, n]) => print(`  ${k.padEnd(9)} ${"\u2665".repeat(Math.min(n, 12))}${n > 12 ? ` ${n}` : ""}`));
    print("counted in this browser only.");
  },
  music(arg) {
    if (!music) return print("music needs a browser with Web Audio.");
    const say = () => print(music.on ? `playing ${music.current()} (${music.playlist()}) \u00b7 volume ${Math.round(music.volume * 100)}%` : "music is off. try `music on`");
    if (!arg) return say();
    if (arg === "on" || arg === "play") return music.play().then((ok) => (ok ? say() : print(h("span", { class: "err", text: "this browser didn't let the music start" }))));
    if (arg === "off" || arg === "pause" || arg === "stop") { music.pause(); return print("music off"); }
    if (arg === "next" || arg === "skip") { music.next(); return setTimeout(say, 300); }
    if (arg === "prev" || arg === "back") { music.prev(); return setTimeout(say, 300); }
    const songs = music.songs();
    if (arg === "list" || arg === "ls") {
      print(`${music.playlist()}:`);
      songs.forEach((m) => print(`  ${m.current ? "\u25b6" : " "} `, h("button", { type: "button", class: "inline", onclick: () => {
        const k = music.songs().findIndex((x) => x.id === m.id);   // the mix may have changed since this list was printed
        if (k < 0) print(`${m.title} isn't in the ${music.playlist()} right now`); else music.playAt(k);
      } }, m.title)));
      return print("original pieces, played live by your browser.");
    }
    const k = songs.findIndex((m) => m.title.startsWith(arg) || m.id.startsWith(arg));
    if (k < 0) return print(h("span", { class: "err", text: `no song "${arg}". try: music list` }));
    music.playAt(k);
    setTimeout(say, 300);
  },
  menu() { pal.open(); },
  keys() { pal.showKeys(); },
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

/* ---------------- music (player.js: original songs played live in the browser) ---------------- */
const music = initMusic({ store });

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
  motionBtn.addEventListener("click", toggleMotion);
}
function toggleMotion() {
  store.set("v0x-motion", reduced ? "on" : "off");
  location.reload();                                // the animation layers read the setting once, at load
}
function paintStatus() {
  const t = $("#sbTheme"), s = $("#sbSeason");
  if (t) t.textContent = `theme: ${currentTheme()}`;
  if (s) s.textContent = `season: ${root.dataset.holiday ?? root.dataset.scene ?? "none"}`;
}
paintStatus();
new MutationObserver(paintStatus).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-holiday", "data-scene"] });

/* ---------------- a short message at the bottom of the screen ---------------- */
const toastEl = h("p", { class: "toast", role: "status", "aria-live": "polite" });
document.body.append(toastEl);
let toastT = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
}
async function copyWithToast(text, what) { toast(await copyText(text) ? `${what} copied` : "Copy failed"); }

/* ---------------- links straight to a project or a note (#project-<id>, #note-<id>) ---------------- */
function openHash() {
  const m = location.hash.match(/^#(project|note)-([\w-]+)$/);
  if (!m) return;
  if (m[1] === "project") { if (selectProject(m[2])) goTo("#projects"); }
  else openNote(m[2]);
}
addEventListener("hashchange", openHash);
if (document.readyState === "complete") setTimeout(openHash, 150);
else addEventListener("load", () => setTimeout(openHash, 150), { once: true });

/* ---------------- print / save as PDF: every project and every note, opened up ---------------- */
$(".explorer")?.after(h("div", { class: "print-only print-projects" }, PROJECTS.map((p) =>
  h("article", { class: "print-projects__i" },
    h("h3", { text: p.name }),
    h("p", { class: "print-projects__k", text: `${p.kicker} \u00b7 ${p.status}` }),
    h("p", { text: p.summary }),
    h("ul", {}, p.details.map((d) => h("li", { text: d }))),
    h("p", { class: "print-projects__l", text: [p.links?.github && `Source: ${p.links.github}`, p.links?.live && `Live: ${p.links.live}`].filter(Boolean).join("  \u00b7  ") || "No public source or demo yet." })))));
let notesOpen = [];
addEventListener("beforeprint", () => { const ds = $$("#notesList details"); notesOpen = ds.map((d) => d.open); ds.forEach((d) => { d.open = true; }); });
addEventListener("afterprint", () => $$("#notesList details").forEach((d, i) => { d.open = notesOpen[i] ?? false; }));

/* ---------------- quick menu + keyboard shortcuts ---------------- */
function goBrief() {
  goTo("#brief");
  setTimeout(() => brief?.focus(), reduced ? 50 : 700);
}
const order = [".hero", "#about", "#projects", "#hire", "#notes", "#contact"].map((q) => $(q)).filter(Boolean);
function stepSection(d) {
  const tops = order.map((n) => n.getBoundingClientRect().top - 80);
  let i = d > 0 ? tops.findIndex((t) => t > 4) : tops.findLastIndex((t) => t < -4);
  if (i < 0) i = d > 0 ? order.length - 1 : 0;
  goTo(order[i]);
}
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const menuKey = isMac ? "\u2318 K" : "Ctrl K";
const toggleTheme = () => setTheme(currentTheme() === "light" ? "dark" : "light");
const SECTIONS = [
  ["Top", ".hero", "home start hero", "g t"], ["About", "#about", "readme me", "g a"], ["Skills", "#skills", "what I work with stack languages"],
  ["Projects", "#projects", "work made things", "g p"], ["Hire me", "#hire", "services work with me price", "g h"],
  ["Notes", "#notes", "write-ups bugs fixes blog", "g n"], ["Console", "#console", "terminal commands"], ["Contact", "#contact", "links discord github hello", "g c"],
];
const pal = initPalette({
  items: () => {
    const hol = root.dataset.holiday, month = currentHoliday();
    return [
      ...SECTIONS.map(([label, q, keys, hint]) => ({ group: "Go to", label, keys, hint, run: () => goTo(q) })),
      { group: "Do", label: "Write a project brief", keys: "hire message discord start project", hint: "g b", run: goBrief },
      { group: "Do", label: `Switch to ${currentTheme() === "light" ? "dark" : "light"} theme`, keys: "theme dark light mode", hint: "t", run: toggleTheme },
      { group: "Do", label: `Turn animations ${reduced ? "on" : "off"}`, keys: "motion animals calm", hint: "m", run: toggleMotion },
      month && HOLIDAYS[month] && { group: "Do", label: hol ? `Turn off the ${HOLIDAYS[month].name} look` : `Turn on the ${HOLIDAYS[month].name} look`, keys: "seasonal holiday theme", run: () => setHolidayEnabled(!hol) },
      music && { group: "Do", label: music.on ? "Pause the music" : "Play the music", keys: "music sound audio song", run: () => music.toggle() },
      music?.on && { group: "Do", label: "Next song", keys: "music skip track", run: () => music.next() },
      LINKS.discord?.copy && { group: "Do", label: "Copy my Discord name", keys: "discord handle", run: () => copyWithToast(LINKS.discord.copy, "Discord name") },
      { group: "Do", label: "Copy the link to this site", keys: "share url", run: () => copyWithToast(PROFILE.site, "Link") },
      { group: "Do", label: "Print or save as PDF", keys: "print pdf resume", run: () => window.print() },
      { group: "Do", label: "Keyboard shortcuts", keys: "keys help", hint: "?", run: () => pal.showKeys() },
      ...PROJECTS.map((p) => ({ group: "Projects", label: p.name, keys: `${p.id} ${p.tags.join(" ")} project`, run: () => openProject(p.id) })),
      ...NOTES.map((n) => ({ group: "Notes", label: n.title, keys: `${n.tags.join(" ")} note`, run: () => openNote(n.id) })),
      ...(music ? music.songs().map((m, k) => ({ group: "Music", label: m.current && music.on ? `${m.title} (playing)` : m.title, keys: `music song ${music.playlist()}`, run: () => music.playAt(k) })) : []),
      ...Object.values(LINKS).filter((l) => l?.url && l.url !== PROFILE.site).map((l) => ({ group: "Links", label: `${l.label} \u2197`, keys: "open link", run: () => window.open(l.url, "_blank", "noopener") })),
    ].filter(Boolean);
  },
  keys: { t: toggleTheme, m: toggleMotion, j: () => stepSection(1), k: () => stepSection(-1) },
  goto: { t: () => goTo(".hero"), a: () => goTo("#about"), s: () => goTo("#skills"), p: () => goTo("#projects"), h: () => goTo("#hire"), b: goBrief, n: () => goTo("#notes"), c: () => goTo("#contact") },
  help: [
    [menuKey, "Open the quick menu"], ["/", "Open the quick menu"], ["?", "Show these shortcuts"],
    ["t", "Switch light / dark"], ["m", "Turn animations on / off"], ["j", "Next section"], ["k", "Previous section"],
    ["g a", "Go to about"], ["g p", "Go to projects"], ["g h", "Go to hire me"], ["g b", "Write a project brief"],
    ["g n", "Go to notes"], ["g c", "Go to contact"], ["g t", "Back to the top"],
  ],
});
$("#palBtn")?.addEventListener("click", () => pal.open());
$("#palBtn")?.setAttribute("title", `Quick menu (${menuKey})`);
const sbKeys = $("#sbKeys");
if (sbKeys) sbKeys.textContent = `${menuKey.toLowerCase()} menu \u00b7 ? keys`;

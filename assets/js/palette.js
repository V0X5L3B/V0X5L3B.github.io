/*
 * Quick menu and keyboard shortcuts.
 *   Ctrl+K / Cmd+K or /   open the quick menu: type to find a section, project, note or action
 *   ?                     list the keyboard shortcuts
 * The menu's entries and the actions behind the single-key shortcuts come from main.js, so this file
 * only knows how to show, filter and run them. Nothing here talks to the network.
 */

const $ = (s, r = document) => r.querySelector(s);

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/* how well an entry matches what was typed: 0 = not at all */
function score(item, q) {
  if (!q) return 1;
  const hay = `${item.label} ${item.keys || ""}`.toLowerCase();
  const label = item.label.toLowerCase();
  if (label.startsWith(q)) return 4;
  if (hay.split(/[\s/·-]+/).some((w) => w.startsWith(q))) return 3;
  if (hay.includes(q)) return 2;
  let i = 0;
  for (const ch of hay) if (ch === q[i]) i++;
  return i === q.length ? 1 : 0;
}

const typing = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * items():   returns [{ group, label, keys?, hint?, run() }] — read fresh each time the menu opens,
 *            so labels like "Switch to dark theme" stay correct
 * keys:      { t: fn, m: fn, ... } single-key shortcuts
 * goto:      { a: fn, p: fn, ... } "g" then a letter
 * help:      [[keys, what], ...] rows for the shortcuts list
 */
export function initPalette({ items, keys = {}, goto = {}, help = [] }) {
  /* ---- the quick menu ---- */
  const dlg = el("dialog", "pal");
  dlg.setAttribute("aria-label", "Quick menu");
  const box = el("div", "pal__box panel");
  const bar = el("div", "panel__bar");
  bar.append(el("span", "panel__file", "go to"), el("kbd", "pal__esc", "esc"));
  const field = el("label", "pal__in");
  const input = el("input");
  Object.assign(input, { type: "text", placeholder: "Search or type a command", spellcheck: false, autocomplete: "off" });
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-expanded", "true");
  input.setAttribute("aria-controls", "palList");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-label", "Search the site");
  field.append(el("span", "pal__ps", "›"), input);
  const list = el("ul", "pal__list");
  list.id = "palList";
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Results");
  const foot = el("p", "pal__foot", "↑↓ move · enter open · esc close · ? shortcuts");
  box.append(bar, field, list, foot);
  dlg.append(box);
  document.body.append(dlg);

  let shown = [], active = 0;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    const all = items();
    const groups = [...new Set(all.map((i) => i.group))];
    shown = [];
    list.replaceChildren();
    /* groups with the best match come first, so typing a song or project name puts it on top */
    const ranked = groups.map((g) => {
      const hits = all.filter((i) => i.group === g).map((i) => [i, score(i, q)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
      return [g, hits.map(([i]) => i), hits[0]?.[1] ?? 0];
    }).sort((a, b) => b[2] - a[2]);
    for (const [g, hits] of ranked) {
      if (!hits.length) continue;
      const head = el("li", "pal__g", g);
      head.setAttribute("role", "presentation");
      list.append(head);
      for (const it of hits) {
        const li = el("li", "pal__o");
        li.id = `pal-o-${shown.length}`;
        li.setAttribute("role", "option");
        li.dataset.i = shown.length;
        li.append(el("span", "pal__l", it.label));
        if (it.hint) li.append(el("kbd", "pal__k", it.hint));
        list.append(li);
        shown.push(it);
      }
    }
    if (!shown.length) list.append(el("li", "pal__none", `Nothing called “${input.value.trim()}”. Try a section name, a project or “theme”.`));
    setActive(0);
  };
  const setActive = (i) => {
    active = shown.length ? (i + shown.length) % shown.length : 0;
    list.querySelectorAll(".pal__o").forEach((o) => o.setAttribute("aria-selected", String(+o.dataset.i === active)));
    const cur = list.querySelector(`#pal-o-${active}`);
    if (cur) { input.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
  };
  const runAt = (i) => {
    const it = shown[i];
    if (!it) return;
    close();
    requestAnimationFrame(() => it.run());
  };
  const open = () => {
    if (dlg.open) return;
    keysDlg.open && keysDlg.close();
    input.value = "";
    render();
    dlg.showModal();
    input.focus();
  };
  const close = () => { if (dlg.open) dlg.close(); };

  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Home" && !input.value) { e.preventDefault(); setActive(0); }
    else if (e.key === "End" && !input.value) { e.preventDefault(); setActive(shown.length - 1); }
    else if (e.key === "Enter") { e.preventDefault(); runAt(active); }
  });
  list.addEventListener("pointermove", (e) => { const o = e.target.closest(".pal__o"); if (o && +o.dataset.i !== active) setActive(+o.dataset.i); });
  list.addEventListener("click", (e) => { const o = e.target.closest(".pal__o"); if (o) runAt(+o.dataset.i); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });   // a click on the dimmed backdrop

  /* ---- the shortcuts list ---- */
  const keysDlg = el("dialog", "pal pal--keys");
  keysDlg.setAttribute("aria-label", "Keyboard shortcuts");
  const kbox = el("div", "pal__box panel");
  const kbar = el("div", "panel__bar");
  kbar.append(el("span", "panel__file", "keyboard shortcuts"), el("kbd", "pal__esc", "esc"));
  const table = el("dl", "pal__keys");
  for (const [k, what] of help) {
    const dt = el("dt");
    k.split(" ").forEach((part, i) => { if (i) dt.append(" "); dt.append(el("kbd", "", part)); });
    table.append(dt, el("dd", "", what));
  }
  const kclose = el("button", "chip pal__close", "Close");
  kclose.type = "button";
  kclose.addEventListener("click", () => keysDlg.close());
  kbox.append(kbar, table, kclose);
  keysDlg.append(kbox);
  document.body.append(keysDlg);
  keysDlg.addEventListener("click", (e) => { if (e.target === keysDlg) keysDlg.close(); });
  const showKeys = () => { close(); if (!keysDlg.open) keysDlg.showModal(); kclose.focus(); };

  /* ---- the keys themselves ---- */
  let gAt = 0;
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      dlg.open ? close() : open();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || typing(e.target) || dlg.open || keysDlg.open) return;
    const k = e.key;
    if (k === "/") { e.preventDefault(); open(); return; }
    if (k === "?") { e.preventDefault(); showKeys(); return; }
    if (performance.now() - gAt < 1200 && goto[k.toLowerCase()]) { e.preventDefault(); gAt = 0; goto[k.toLowerCase()](); return; }
    if (k === "g") { gAt = performance.now(); return; }
    if (keys[k]) { e.preventDefault(); keys[k](); }
  });

  return { open, close, showKeys };
}

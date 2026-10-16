/*
 * Project brief builder (in the Hire me section).
 * A few quick questions turn into a message that is ready to paste on Discord. Nothing is sent from
 * this page: the visitor copies the message and sends it themselves. The draft is kept in their
 * browser (localStorage v0x-brief) so it survives a reload.
 */

const KEY = "v0x-brief";
const WHEN = [{ id: "no-rush", label: "No rush" }, { id: "weeks", label: "In a few weeks" }, { id: "soon", label: "As soon as possible" }];

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v === true ? "" : v);
  }
  n.append(...kids.flat().filter((k) => k != null && k !== false));
  return n;
}

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable */ } };

/**
 * mount:     element to build into
 * services:  SERVICES from data.js ({ id, name })
 * handle:    the site's handle, used in the greeting
 * dm:        Discord handle to mention, or null
 * server:    Discord server invite URL, or null
 * copy(t):   copies text, resolves true/false
 */
export function initBrief({ mount, services, handle, dm, server, copy }) {
  if (!mount) return null;
  const d = Object.assign({ what: "", idea: "", refs: "", when: "", name: "" }, load());
  const kinds = [...services.map((s) => ({ id: s.id, label: s.name })), { id: "unsure", label: "Not sure yet" }];

  const chips = (name, opts, legend) => {
    const fs = el("fieldset", { class: "brief__q" }, el("legend", { text: legend }));
    const row = el("div", { class: "brief__chips" });
    for (const o of opts) {
      const id = `brief-${name}-${o.id}`;
      const input = el("input", { type: "radio", name: `brief-${name}`, id, value: o.id, class: "brief__radio" });
      if (d[name] === o.id) input.checked = true;
      row.append(input, el("label", { for: id, class: "chip", text: o.label }));
    }
    fs.append(row);
    return fs;
  };

  const idea = el("textarea", { id: "brief-idea", rows: "4", maxlength: "1200", placeholder: "What should it do, and who is it for? A sentence is enough to start." });
  idea.value = d.idea;
  const refs = el("input", { id: "brief-refs", type: "text", maxlength: "300", placeholder: "Sites you like, a sketch, your repo...", autocomplete: "off" });
  refs.value = d.refs;
  const name = el("input", { id: "brief-name", type: "text", maxlength: "60", placeholder: "Optional", autocomplete: "nickname" });
  name.value = d.name;

  const out = el("pre", { class: "brief__out", "aria-live": "polite", "aria-label": "Your message" });
  const status = el("span", { class: "sr-only", role: "status", "aria-live": "polite" });
  const copyBtn = el("button", { type: "button", class: "btn btn--primary" }, "Copy message");
  const clearBtn = el("button", { type: "button", class: "btn" }, "Start over");
  const actions = el("div", { class: "brief__a" }, copyBtn,
    server && el("a", { class: "btn", href: server, target: "_blank", rel: "noopener noreferrer" }, "Open Discord ↗"),
    clearBtn);

  const form = el("form", { class: "brief__form", autocomplete: "off", "aria-label": "Project brief" },
    chips("what", kinds, "What do you need?"),
    el("div", { class: "brief__q" }, el("label", { for: "brief-idea", text: "Tell me about it" }), idea),
    el("div", { class: "brief__q" }, el("label", { for: "brief-refs", text: "Links or examples" }), refs),
    chips("when", WHEN, "When would you like it?"),
    el("div", { class: "brief__q" }, el("label", { for: "brief-name", text: "What should I call you?" }), name));
  form.addEventListener("submit", (e) => e.preventDefault());

  const preview = el("div", { class: "brief__preview" },
    el("p", { class: "mini", text: "Your message" }), out, actions,
    el("p", { class: "brief__note", text: `Paste it in the Discord server${dm ? ` or send it to ${dm}` : ""}. Nothing is sent from this page, and your draft stays in this browser.` }),
    status);

  mount.append(
    el("div", { class: "panel__bar" }, el("span", { class: "panel__file", text: "brief.txt" }), el("span", { class: "panel__tag", text: "write it here, send it on Discord" })),
    el("div", { class: "brief__in" }, form, preview));

  const text = () => {
    const kind = kinds.find((k) => k.id === d.what);
    const lines = [`Hi ${handle}!`];
    if (kind && kind.id !== "unsure") lines.push(`I'd like help with: ${kind.label}.`);
    else if (kind) lines.push("I have an idea and I'm not sure yet what it needs.");
    lines.push("", d.idea.trim() || "(tell me about it)");
    const extra = [];
    if (d.refs.trim()) extra.push(`Examples: ${d.refs.trim()}`);
    const when = WHEN.find((w) => w.id === d.when);
    if (when) extra.push(`Timing: ${when.label}.`);
    if (extra.length) lines.push("", ...extra);
    if (d.name.trim()) lines.push("", `- ${d.name.trim()}`);
    return lines.join("\n");
  };
  const paint = () => {
    out.textContent = text();
    out.classList.toggle("is-empty", !d.idea.trim());
    copyBtn.disabled = !d.idea.trim();
    copyBtn.title = copyBtn.disabled ? "Write a little about your idea first" : "";
  };
  const read = () => {
    d.what = form.querySelector("input[name=brief-what]:checked")?.value || "";
    d.when = form.querySelector("input[name=brief-when]:checked")?.value || "";
    d.idea = idea.value; d.refs = refs.value; d.name = name.value;
    save(d); paint();
  };
  form.addEventListener("input", read);
  form.addEventListener("change", read);

  copyBtn.addEventListener("click", async () => {
    const ok = await copy(text());
    copyBtn.textContent = ok ? "Copied ✓" : "Copy failed";
    status.textContent = ok ? "Message copied. Paste it on Discord." : "Copy failed. Select the message and copy it yourself.";
    setTimeout(() => { copyBtn.textContent = "Copy message"; status.textContent = ""; }, 2200);
  });
  clearBtn.addEventListener("click", () => {
    form.reset();
    idea.value = refs.value = name.value = "";
    read();
    idea.focus();
  });
  paint();
  return { focus: () => idea.focus({ preventScroll: true }) };
}

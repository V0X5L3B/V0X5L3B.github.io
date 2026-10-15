/* Motion & polish layer. Pure DOM, no network, no storage. Safe to delete along with motion.css. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = "http://www.w3.org/2000/svg";
const svg = (tag, attrs = {}, kids = []) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  kids.forEach((c) => n.appendChild(c));
  return n;
};
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
};

/* ---- opening animation: mark as seen, allow skipping ---- */
const intro = $("#intro");
if (intro) {
  const done = () => { root.classList.remove("intro-on"); };
  try { sessionStorage.setItem("v0x-intro", "1"); } catch (e) {}
  const skip = () => { intro.classList.add("skip"); setTimeout(done, 500); removeEventListener("keydown", skip); intro.removeEventListener("pointerdown", skip); };
  intro.addEventListener("pointerdown", skip);
  addEventListener("keydown", skip);
  setTimeout(() => { done(); intro.remove(); }, 3000);
}

/* ---- logo letters get an index for the hover wave ---- */
$$(".bar .mark span").forEach((s, i) => s.style.setProperty("--i", i));

/* ---- hero: split the headline into words, and the code into lines ---- */
function splitTitle() {
  const t = $(".hero__title");
  if (!t || reduce) return;
  let i = 0;
  const wrap = (node) => { const w = el("span", "w"); w.style.setProperty("--i", i++); w.appendChild(node); return w; };
  Array.from(t.childNodes).forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(" "));
        else frag.appendChild(wrap(document.createTextNode(p)));
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName === "EM") {
      n.replaceWith(wrap(n.cloneNode(true)));
    }
  });
}
function splitCode() {
  const code = $(".hero__panel .code code");
  if (!code || reduce) return;
  const lines = [document.createDocumentFragment()];
  Array.from(code.childNodes).forEach((n) => {
    if (n.nodeType === 3) {
      n.textContent.split("\n").forEach((part, idx) => {
        if (idx > 0) lines.push(document.createDocumentFragment());
        if (part) lines[lines.length - 1].appendChild(document.createTextNode(part));
      });
    } else lines[lines.length - 1].appendChild(n.cloneNode(true));
  });
  code.textContent = "";
  lines.forEach((f, i) => {
    const l = el("span", "ln");
    l.style.setProperty("--i", i);
    l.appendChild(f);
    if (i === lines.length - 1) l.appendChild(el("span", "tc"));
    code.appendChild(l);
  });
}
splitTitle();
splitCode();

/* ---- scroll reveal for headings, copy, labels, highlights ---- */
const targets = [
  ...$$(".label"), ...$$(".h2"), ...$$(".section__note"), ...$$(".filters"),
  ...$$(".about__body p"), ...$$(".about__aside"), ...$$(".console"), ...$$(".hl"),
];
targets.forEach((n) => { if (!n.classList.contains("hl")) n.classList.add("rv"); });
// stagger siblings inside grids that main.js builds
function stagger() {
  ["#projectGrid", "#skillGrid", "#labGrid", "#linkList"].forEach((sel) => {
    const g = $(sel);
    if (g) Array.from(g.children).forEach((c, i) => c.style.setProperty("--d", i));
  });
  $$(".about__body p").forEach((p, i) => p.style.setProperty("--d", i));
}
stagger();
if ("IntersectionObserver" in window && !reduce) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  targets.forEach((n) => io.observe(n));
  setTimeout(() => targets.forEach((n) => n.classList.add("in")), 6000); // safety net
} else targets.forEach((n) => n.classList.add("in"));

/* ---- progress bar + back-to-top ---- */
const bar = el("div", "progress");
bar.setAttribute("aria-hidden", "true");
document.body.prepend(bar);
const top = el("button", "totop");
top.type = "button";
top.setAttribute("aria-label", "Back to top");
top.append(svg("svg", { viewBox: "0 0 46 46", "aria-hidden": "true" }, [svg("circle", { cx: 23, cy: 23, r: 20 })]), el("span", "", "↑"));
top.firstChild.firstChild.setAttribute("pathLength", "126");
top.addEventListener("click", () => { if (window.v0xLenis) window.v0xLenis.scrollTo(0); else scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
document.body.appendChild(top);
let tick = false;
function onScroll() {
  if (tick) return;
  tick = true;
  requestAnimationFrame(() => {
    const max = root.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.setProperty("--p", p.toFixed(4));
    top.style.setProperty("--p", p.toFixed(4));
    top.classList.toggle("show", scrollY > 600);
    tick = false;
  });
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ---- theme button spin + smooth colour crossfade ---- */
const themeBtn = $("#themeBtn");
if (themeBtn) themeBtn.addEventListener("click", () => {
  root.classList.add("theme-fade");
  themeBtn.classList.remove("spin"); void themeBtn.offsetWidth; themeBtn.classList.add("spin");
  setTimeout(() => root.classList.remove("theme-fade"), 600);
});

/* ---- button ripple ---- */
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest && e.target.closest(".btn, .chip");
  if (!b || reduce) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
  const s = el("span", "ripple");
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
});

if (!reduce) {
  /* ---- ambient aurora + hand-drawn doodles ---- */
  const au = el("div", "aurora");
  au.setAttribute("aria-hidden", "true");
  au.append(el("i"), el("i"), el("i"));
  document.body.prepend(au);

  const hero = $(".hero");
  if (hero) {
    hero.append(
      svg("svg", { class: "doodle doodle--spark", viewBox: "0 0 40 40", "aria-hidden": "true" }, [svg("path", { d: "M20 3C21 14 26 19 37 20 26 21 21 26 20 37 19 26 14 21 3 20 14 19 19 14 20 3Z" })]),
      svg("svg", { class: "doodle doodle--squig", viewBox: "0 0 110 24", "aria-hidden": "true" }, [svg("path", { d: "M3 14C12 2 20 22 30 12S46 2 55 13s17 8 26-2 17 3 26 1" })]),
      svg("svg", { class: "doodle doodle--ring", viewBox: "0 0 40 40", "aria-hidden": "true" }, [svg("path", { d: "M20 35C7 25 3 15 9 9c5-5 11-2 11 3 0-5 6-8 11-3 6 6 2 16-11 26Z" })]),
      svg("svg", { class: "doodle doodle--flower", viewBox: "0 0 40 40", "aria-hidden": "true" }, [...[0, 72, 144, 216, 288].map((a) => svg("circle", { cx: 20 + 9 * Math.sin(a * Math.PI / 180), cy: 20 - 9 * Math.cos(a * Math.PI / 180), r: 6 })), svg("circle", { cx: 20, cy: 20, r: 3.2 })]),
    );
  }

  if (fine) {
    /* ---- a little trail of sparkles and hearts ---- */
    const bits = ["✦", "♡", "✧", "✿"];
    let lastT = 0, lx = 0, ly = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastT < 70 || Math.hypot(e.clientX - lx, e.clientY - ly) < 22) return;
      lastT = now; lx = e.clientX; ly = e.clientY;
      const b = el("span", "trail", bits[(Math.random() * bits.length) | 0]);
      b.setAttribute("aria-hidden", "true");
      b.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${(Math.random() * 40 - 20) | 0}px;--s:${(0.7 + Math.random() * 0.7).toFixed(2)}`;
      document.body.appendChild(b);
      b.addEventListener("animationend", () => b.remove());
    }, { passive: true });

    /* ---- cursor glow (eased) ---- */
    const g = el("div", "glow");
    g.setAttribute("aria-hidden", "true");
    document.body.prepend(g);
    let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty, run = false;
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      g.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) requestAnimationFrame(loop); else run = false;
    };
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY; g.classList.add("on");
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener("pointerleave", () => g.classList.remove("on"));

    /* ---- card spotlight, panel tilt, magnetic buttons ---- */
    document.addEventListener("pointermove", (e) => {
      const c = e.target.closest && e.target.closest(".card, .lk, .exp, .skills__g");
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--px", e.clientX - r.left + "px");
        c.style.setProperty("--py", e.clientY - r.top + "px");
      }
    }, { passive: true });

    const panel = $(".hero__panel");
    if (panel) {
      panel.addEventListener("pointermove", (e) => {
        const r = panel.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        panel.style.setProperty("--ry", (nx * 7).toFixed(2) + "deg");
        panel.style.setProperty("--rx", (-ny * 7).toFixed(2) + "deg");
      });
      panel.addEventListener("pointerleave", () => { panel.style.setProperty("--rx", "0deg"); panel.style.setProperty("--ry", "0deg"); });
    }

    $$(".hero__cta .btn").forEach((b) => {
      b.style.transition = "translate .25s cubic-bezier(.2,.8,.2,1), border-color .15s, background .15s, scale .15s";
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18, dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        b.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      });
      b.addEventListener("pointerleave", () => { b.style.translate = ""; });
    });
  }
}

/* ---- Halloween: a bat flies across now and then ---- */
(function () {
  if (reduce) return;
  const bat = () => svg("svg", { viewBox: "0 0 40 20", "aria-hidden": "true" }, [svg("path", { d: "M20 6C16 0 8 0 0 4c6 2 8 6 12 4 2 4 6 4 8 10 2-6 6-6 8-10 4 2 6-2 12-4-8-4-16-4-20 2Z" })]);
  let timer = null;
  const fly = () => {
    if (root.getAttribute("data-holiday") !== "halloween") { timer = null; return; }
    if (!document.hidden) {
      const w = el("div", "batfly"), inner = el("div", "bw");
      w.style.setProperty("--y", 8 + Math.random() * 40 + "vh");
      w.style.setProperty("--dur", 7 + Math.random() * 5 + "s");
      w.style.setProperty("--w", 30 + Math.random() * 28 + "px");
      inner.appendChild(bat()); w.appendChild(inner);
      document.body.appendChild(w);
      w.addEventListener("animationend", (e) => { if (e.target === w) w.remove(); });
    }
    timer = setTimeout(fly, 7000 + Math.random() * 9000);
  };
  const start = () => { if (!timer && root.getAttribute("data-holiday") === "halloween") timer = setTimeout(fly, 2500); };
  new MutationObserver(start).observe(root, { attributes: true, attributeFilter: ["data-holiday"] });
  start();
})();

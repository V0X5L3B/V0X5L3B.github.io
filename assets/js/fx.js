/*
 * GSAP + Lenis layer: smooth scrolling, scroll-driven motion, split-text headings, click sparks.
 * Everything is optional: if the vendor files fail to load, or the visitor prefers reduced
 * motion, this file does nothing and the page works exactly as before.
 */
import Lenis from "../vendor/lenis/index.js";

/* motion is on by default (owner's choice); visitors can turn it off with the footer switch */
const reduce = (() => { try { return localStorage.getItem("v0x-motion") === "off"; } catch { return false; } })();
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const g = window.gsap;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

if (!reduce && g && window.ScrollTrigger) {
  g.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) g.registerPlugin(window.SplitText);

  /* ---- Lenis smooth scroll, driven by GSAP's ticker ---- */
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -76 }, respectReducedMotion: false });
  window.v0xLenis = lenis;
  lenis.on("scroll", window.ScrollTrigger.update);
  g.ticker.add((t) => lenis.raf(t * 1000));
  g.ticker.lagSmoothing(0);

  // pause smooth scrolling while the project dialog is open
  const dlg = $("#dlg");
  if (dlg) new MutationObserver(() => (dlg.open ? lenis.stop() : lenis.start())).observe(dlg, { attributes: true, attributeFilter: ["open"] });
  ["#consoleOut", "#dlg"].forEach((s) => $(s)?.setAttribute("data-lenis-prevent", ""));

  /* ---- scroll-driven parallax ---- */
  const scrub = { ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.6 } };
  const panel = $(".hero__panel");
  if (panel) g.to(panel, { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
  $$(".doodle").forEach((d, i) => g.to(d, { y: (i % 2 ? -1 : 1) * (60 + i * 25), ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 } }));
  $$(".aurora i").forEach((b, i) => g.to(b, { y: (i + 1) * -120, ...scrub }));

  /* ---- headings: words rise in as they scroll into view ---- */
  const headings = $$(".h2");
  const doHeadings = () => {
    if (!window.SplitText) return;
    headings.forEach((h) => {
      h.classList.remove("rv");                       // hand over from the CSS reveal
      h.style.opacity = 1; h.style.translate = "none";
      SplitText.create(h, {
        type: "words",
        autoSplit: true,
        onSplit(self) {
          return g.from(self.words, { yPercent: 70, opacity: 0, rotate: 4, duration: 0.9, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
        },
      });
    });
  };
  (document.fonts?.ready || Promise.resolve()).then(doHeadings);

  /* ---- click sparks (inspired by React Bits' ClickSpark, re-made in plain JS) ---- */
  if (fine) {
    const bits = ["✦", "♡", "✧", "✿"];
    document.addEventListener("click", (e) => {
      for (let i = 0; i < 9; i++) {
        const s = document.createElement("span");
        s.textContent = bits[(Math.random() * bits.length) | 0];
        s.setAttribute("aria-hidden", "true");
        s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:90;pointer-events:none;color:var(--crimson-t);font-size:${12 + Math.random() * 10}px;line-height:1;translate:-50% -50%`;
        document.body.appendChild(s);
        const a = (Math.PI * 2 * i) / 9 + Math.random() * 0.5, d = 28 + Math.random() * 34;
        g.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, rotate: Math.random() * 200 - 100, opacity: 0, scale: 0.4, duration: 0.7 + Math.random() * 0.3, ease: "power2.out", onComplete: () => s.remove() });
      }
    });
  }

  addEventListener("load", () => window.ScrollTrigger.refresh());
}

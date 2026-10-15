/*
 * Opening animation. Plays once per browser session (add ?intro to the address to replay).
 * Letters bounce in, a hand-drawn line and heart draw themselves, a greeting types out,
 * petals drift down, then the screen closes like an iris onto the logo in the header.
 * It cannot be skipped. If GSAP is missing, the overlay simply fades away.
 */
const root = document.documentElement;
const intro = document.getElementById("intro");

function finish() {
  root.classList.add("intro-done");
  intro?.remove();
}

let calm = false;
try { calm = localStorage.getItem("v0x-motion") === "off"; } catch (e) {}

if (intro && calm) {
  finish();                                         // the visitor turned animations off in the footer
} else if (intro && root.classList.contains("intro-on")) {
  try { sessionStorage.setItem("v0x-intro", "1"); } catch (e) {}
  const g = window.gsap;

  if (!g) {
    // no animation library: show the logo briefly, then go
    intro.querySelectorAll(".intro__mark span").forEach((s) => (s.style.opacity = 1));
    setTimeout(finish, 1200);
  } else {
    const letters = intro.querySelectorAll(".intro__mark span");
    const hi = document.getElementById("introHi");
    const text = hi.textContent;
    hi.textContent = "";
    hi.setAttribute("aria-label", text);
    const chars = [...text].map((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      hi.appendChild(s);
      return s;
    });
    const line = intro.querySelector(".intro__art path:not(.heart)");
    const heart = intro.querySelector(".intro__art .heart");
    g.set(heart, { scale: 0, transformOrigin: "50% 50%", svgOrigin: "318 18" });

    // petals and sparkles drifting down
    const bits = ["✿", "✦", "♡", "✧", "❀"];
    const W = innerWidth, H = innerHeight;
    const petals = Array.from({ length: 22 }, () => {
      const s = document.createElement("span");
      s.className = "intro__bit";
      s.textContent = bits[(Math.random() * bits.length) | 0];
      s.style.left = Math.random() * 100 + "%";
      s.style.fontSize = 12 + Math.random() * 20 + "px";
      intro.appendChild(s);
      return s;
    });

    const tl = g.timeline({ defaults: { ease: "power3.out" } });

    tl.from(intro, { opacity: 0, duration: 0.25 }, 0);
    tl.fromTo(letters, { y: -140, rotate: () => g.utils.random(-35, 35), scale: 0.4, opacity: 0 },
      { y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.9, ease: "back.out(2.2)", stagger: 0.08 }, 0.2);
    tl.to(line, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 1.0);
    tl.to(heart, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" }, 1.75);
    tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.05 }, 1.35);
    tl.to(petals, { opacity: 0.9, duration: 0.25, stagger: { each: 0.07, from: "random" } }, 0.4);
    tl.to(petals, {
      y: () => H * g.utils.random(0.55, 1.05),
      x: () => g.utils.random(-60, 60),
      rotate: () => g.utils.random(-220, 220),
      duration: () => g.utils.random(1.6, 2.6),
      ease: "sine.inOut",
      stagger: { each: 0.07, from: "random" },
    }, 0.4);
    tl.to(petals, { opacity: 0, duration: 0.5, stagger: { each: 0.03, from: "random" } }, 2.2);
    tl.to(letters, { y: -14, duration: 0.28, ease: "power2.out", stagger: { each: 0.05, yoyo: true, repeat: 1 } }, 2.15);

    // exit: iris closes onto the header logo
    tl.addLabel("exit", 2.75);
    tl.add(exit, "exit");
    tl.call(() => g.delayedCall(0.85, finish), null, "exit");

    function exit() {
      const mark = document.querySelector(".bar .mark");
      const r = mark ? mark.getBoundingClientRect() : { left: W / 2, top: 40, width: 0, height: 0 };
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 20;
      g.fromTo(intro, { clipPath: `circle(${R}px at ${x}px ${y}px)` },
        { clipPath: `circle(0px at ${x}px ${y}px)`, duration: 0.75, ease: "power3.inOut" });
      g.to(intro.querySelectorAll(".intro__mark, .intro__art, .intro__hi"), { scale: 0.85, opacity: 0, duration: 0.45, ease: "power2.in" });
    }
  }
}

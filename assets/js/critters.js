/*
 * Redwood forest animals for the default look (all drawn here as small SVGs).
 *   on screen   a Steller's jay flying past and a Douglas squirrel running up the big trunk (by day),
 *               a rough-skinned newt and a banana slug crawling across the bottom of the window
 *   floor       a black-tailed deer walking through, and a spotted owl on the log
 *               (asleep by day, awake at night)
 * Colours: the --cr-* and --ff-* variables in forest.css. Motion: forest.css.
 */
import { seeded } from "./scene.js";

const JAY_WING = `
  <path d="M56 25C49 18 37 13 22 13C28 17 34 21 40 24.5C34 24.5 28 26.5 23 29C36 31.5 48 31 57 29Z"/>
  <path class="cr-jay-bar" d="M30 15.5l-.8 5.5M36 17.2l-.8 5.6M42 19.4l-.7 5.2M48 21.6l-.6 4.6M30 27l1.5 3M37 26.8l1.3 3.2M44 26.8l1 3"/>`;

const JAY = `<svg viewBox="0 0 96 56" aria-hidden="true">
  <g class="cr-jay-wing cr-jay-wing--far">${JAY_WING}</g>
  <path class="cr-jay-tail" d="M5 31C14 28 26 26 36 26L37 33C26 34 14 36 5 37.5Z"/>
  <path class="cr-jay-bar" d="M11 29.6v6.8M16.5 28.6v7M22 27.8v6.9M27.5 27.1v6.6"/>
  <path class="cr-jay-body" d="M32 28C40 20 56 17 66 21C72 24 74 31 69 35C61 41 42 40 32 34Z"/>
  <path class="cr-jay-belly" d="M37 35C47 39 60 39 68.5 34C66 37.5 60 40.5 50 40.5C44 40.5 40 38.5 37 35Z"/>
  <path class="cr-jay-head" d="M63 17C60 9 55 3 49 .5C57 1.5 65 6 71 13ZM60 22C61 14 68 11 74 13C79 15 81 20 79 25C77 29 70 30 65 28Z"/>
  <path class="cr-jay-brow" d="M69.5 15.6l3-1.5M72.4 15.9l2.8-.9M75.2 16.6l2.4-.3"/>
  <path class="cr-jay-beak" d="M78 19.4L89.5 22L78 24.6Z"/>
  <circle class="cr-eye" cx="73" cy="19.2" r="1.8"/><circle class="cr-glint" cx="73.6" cy="18.6" r=".55"/>
  <path class="cr-jay-feet" d="M50 39.5l-3 4M54 39.5l-1.8 4.6"/>
  <g class="cr-jay-wing cr-jay-wing--near">${JAY_WING}</g>
</svg>`;

/* climbing head-up, belly toward the trunk on its left */
const SQUIRREL = `<svg viewBox="0 0 48 76" aria-hidden="true">
  <g class="cr-sq-tail">
    <path class="cr-sq-fur" d="M23 56C36 62 45 51 41 39C38 30 42 22 46 17C51 30 51 51 42 63C35 71 24 69 21 61Z"/>
    <path class="cr-sq-rim" d="M46 17C51 30 51 51 42 63C35 71 24 69 21 61"/>
    <path class="cr-sq-tail-mid" d="M43 24C44 36 45 50 37 60"/>
  </g>
  <path class="cr-sq-far cr-sq-leg cr-sq-leg--h2" d="M15 50C9 51 6 57 7.5 62L11.5 62C11 58 13 55 17 54Z"/>
  <path class="cr-sq-far cr-sq-leg cr-sq-leg--f2" d="M13 30C9 30 6.5 31.5 5 34L8 35.5C9.5 34 11 33 14 33Z"/>
  <path class="cr-sq-body" d="M19 20C27 20 29 32 28 44C27 54 23 60 17 60C11 60 9 52 10 42C11 30 12 21 19 20Z"/>
  <path class="cr-sq-belly" d="M12 26C10 34 10 46 11.5 55C13.5 50 14 40 14 30Z"/>
  <path class="cr-sq-stripe" d="M14.2 27C13.4 37 13.6 47 14.6 54"/>
  <path class="cr-sq-shine" d="M22 25C25 30 26 38 25.5 46"/>
  <path class="cr-sq-body" d="M18 4C23 4 25 10 25 15C25 20 22 24 18 24C14 24 11 20 11 15C11 9 13 4 18 4Z"/>
  <path class="cr-sq-body" d="M21.5 9L26 1.5L27.5 10Z"/><path class="cr-sq-tuft" d="M26 1.5l1-1.4M26 1.5l2 .2"/>
  <path class="cr-sq-belly" d="M12 13C11.5 17 13 21 16 23C14.5 19 13.5 16 12 13Z"/>
  <circle class="cr-sq-ring" cx="20.3" cy="12" r="2.9"/><circle class="cr-eye" cx="20.3" cy="12" r="1.8"/><circle class="cr-glint" cx="20.9" cy="11.4" r=".55"/>
  <circle class="cr-nose" cx="17.5" cy="4.4" r="1.25"/>
  <path class="cr-whisk" d="M16 6l-7-1.5M16 7l-7 1.5M19 6l6-2.5"/>
  <path class="cr-sq-leg cr-sq-leg--f" d="M13 25.5C9 25.5 6.5 27.5 5 30L8 31.5C9.5 30 11 29 14 29Z"/>
  <path class="cr-sq-leg cr-sq-leg--h" d="M15 45C9 46 6.5 52 7.5 57.5L11.5 57.5C11 53 13 50 17 49Z"/>
  <path class="cr-claw" d="M5 30l-1.6-.6M5.6 31l-1.6.3M7.5 57.5l-1.6.4M8.6 57.6l-1 1.2"/>
</svg>`;

/* seen from above, walking left */
function newt() {
  const r = seeded(19);
  let dots = "";
  for (let i = 0; i < 46; i++) {
    const x = 8 + r() * 66, half = x < 20 ? 6 : x < 50 ? 4.8 : 4 - (x - 50) * 0.05;
    dots += `<circle class="${r() < 0.5 ? "cr-nw-dot" : "cr-nw-dot2"}" cx="${x.toFixed(1)}" cy="${(22 + (r() - 0.5) * 2 * half).toFixed(1)}" r="${(0.5 + r() * 0.7).toFixed(1)}"/>`;
  }
  const leg = (cls, x, y, ex, ey, flip) => `<g class="cr-nw-leg ${cls}"><path class="cr-nw-limb" d="M${x} ${y}Q${(x + ex) / 2 + flip * 1.5} ${(y + ey) / 2} ${ex} ${ey}"/>
    <path class="cr-nw-toes" d="M${ex} ${ey}l-2.6 ${flip * 1.6}M${ex} ${ey}l-1.2 ${flip * 2.8}M${ex} ${ey}l1 ${flip * 2.9}M${ex} ${ey}l2.4 ${flip * 1.9}"/></g>`;
  const body = "M4 22C4 16 9 13 15 14C19 15 21 17 24 17C32 16 42 16 50 17.5C62 19 78 20 108 22C78 24 62 25 50 26.5C42 28 32 28 24 27C21 27 19 29 15 30C9 31 4 28 4 22Z";
  return `<svg viewBox="0 0 110 44" aria-hidden="true">
    ${leg("cr-nw-leg--a", 22, 17.5, 14, 6, -1)}${leg("cr-nw-leg--b", 22, 26.5, 14, 38, 1)}
    ${leg("cr-nw-leg--b", 47, 18, 56, 7, -1)}${leg("cr-nw-leg--a", 47, 26, 56, 37, 1)}
    <path class="cr-nw-belly" d="${body}"/>
    <path class="cr-nw-back" d="${body}"/>
    <g>${dots}</g>
    <path class="cr-nw-ridge" d="M14 22C30 21.6 50 21.7 92 22"/>
    <circle class="cr-nw-eye" cx="9.6" cy="17.2" r="2"/><circle class="cr-nw-eye" cx="9.6" cy="26.8" r="2"/>
    <circle class="cr-glint" cx="9" cy="16.6" r=".6"/><circle class="cr-glint" cx="9" cy="26.2" r=".6"/>
  </svg>`;
}

/* banana slug seen from above, crawling right */
function slugTop() {
  const r = seeded(23);
  let grooves = "";
  for (let x = 8; x < 74; x += 3.2 + r() * 1.5) {
    const half = 3 + (x / 74) * 3.5;
    grooves += `M${x.toFixed(1)} ${(18 - half).toFixed(1)}l2 ${(half * 0.55).toFixed(1)}M${x.toFixed(1)} ${(18 + half).toFixed(1)}l2 ${(-half * 0.55).toFixed(1)}`;
  }
  const body = "M2 18C10 15 30 12 50 11.5C70 11 88 10 100 11C110 12 116 15 117 18C116 21 110 24 100 25C88 26 70 25 50 24.5C30 24 10 21 2 18Z";
  return `<svg viewBox="0 0 132 36" aria-hidden="true">
    <path class="cr-sl-edge" d="${body}"/>
    <path class="cr-sl-body" d="${body}"/>
    <path class="cr-sl-groove" d="${grooves}"/>
    <path class="cr-sl-keel" d="M4 18C20 18 44 18 74 18"/>
    <path class="cr-sl-mantle" d="M76 11.2C86 9.5 98 9.5 106 12C110 14 110 22 106 24C98 26.5 86 26.5 76 24.8C73 21 73 15 76 11.2Z"/>
    <path class="cr-sl-ring" d="M80 13.5C88 12 98 12.3 103.5 14.2M80 22.5C88 24 98 23.7 103.5 21.8M84 16C90 15.3 96 15.4 100 16.3M84 20C90 20.7 96 20.6 100 19.7"/>
    <circle class="cr-sl-hole" cx="93" cy="23.6" r="1.4"/>
    <path class="cr-sl-spot" d="M30 15c1.5-.6 3 0 2.6.9-.4.8-2.3.9-2.9.3-.2-.4 0-.9.3-1.2ZM46 20c1.2-.4 2.4.1 2.1.8-.3.7-1.8.7-2.3.2-.2-.3-.1-.8.2-1ZM60 14.4c1-.3 2 .1 1.7.7-.3.6-1.4.6-1.8.2-.2-.3 0-.7.1-.9Z"/>
    <path class="cr-sl-head" d="M108 13C114 13 120 15 121 18C120 21 114 23 108 23Z"/>
    <g class="cr-sl-tents">
      <path class="cr-sl-tent" d="M116 15.2Q124 11 128 5.6M116 20.8Q124 25 128 30.4"/>
      <circle class="cr-sl-eye" cx="128.3" cy="5.3" r="1.8"/><circle class="cr-sl-eye" cx="128.3" cy="30.7" r="1.8"/>
      <path class="cr-sl-tent cr-sl-tent--s" d="M120 16.4l5.4-1.8M120 19.6l5.4 1.8"/>
    </g>
    <path class="cr-sl-shine" d="M18 15.6C38 14 58 13.4 74 13.4"/><path class="cr-sl-shine" d="M84 11.8C92 11.2 99 11.6 104 13"/>
    <circle class="cr-glint" cx="66" cy="13.6" r=".9"/>
  </svg>`;
}

/** The animals that wander over the window. */
export function screenCritters() {
  const out = [];
  const add = (cls, svg) => {
    const s = document.createElement("span");
    s.className = `critter ${cls}`;
    s.innerHTML = svg;                             // static markup from this file
    out.push(s);
  };
  add("critter--jay", JAY);
  add("critter--squirrel", SQUIRREL);
  add("critter--newt", newt());
  add("critter--slug", slugTop());
  return out;
}

/* ---------------- floor animals (inside the floor SVG) ---------------- */
const DEER_FRONT = `<path d="M24.5-62C24-50 25-40 25.2-32L26.2-6H22L21.2-32C20.5-40 19.6-50 18.8-61Z"/><path class="cr-hoof" d="M21.8-6.5H26.4L27.2 0H21.2Z"/>`;
const DEER_HIND = `<path d="M74-66C86-66 88.5-52 84.5-40C83.4-36 82.6-32 82.6-28L83.4-6H79.2L78.6-28C78.6-33 79-37 79.4-41C80-48 74.5-54 71.5-62Z"/><path class="cr-hoof" d="M79-6.5H83.6L84.6 0H78.4Z"/>`;

export const DEER = `
  <g class="deer"><g class="deer__walk"><g class="deer__bob">
    <g class="deer-leg deer-leg--a cr-far">${DEER_FRONT}</g>
    <g class="deer-leg deer-leg--b cr-far">${DEER_HIND}</g>
    <g class="deer__tail"><path class="cr-dr-white" d="M88-83C94-81 96-73 93-66C90-70 88-77 88-83Z"/><path class="cr-dr-dark" d="M88.5-83C92-82.5 93.5-79 93.4-75C91-77 89.5-80 88.5-83Z"/></g>
    <path class="cr-dr-coat" d="M22-78C30-92 72-94 88-84C95-78 95-64 87-58C72-52 36-52 26-60C20-64 18-72 22-78Z"/>
    <path class="cr-dr-belly" d="M29-58.5C41-53 70-53 86.5-58.5C81-55 70-53.5 58-53.5C46-53.5 36-55 29-58.5Z"/>
    <path class="cr-dr-back" d="M30-86C46-91 70-91 86-84"/>
    <path class="cr-dr-shade" d="M70-88C80-86 90-80 90-70C90-64 87-60 84-58C88-66 86-78 70-88Z"/>
    <g class="deer__head">
      <path class="cr-dr-coat" d="M20-80C16-90 12-98 10-106L22-110C24-100 30-90 34-82Z"/>
      <path class="cr-dr-white" d="M13.5-97C15.5-92 18-88 21.5-84C18-87.5 15-92 13.5-97Z"/>
      <g class="deer__ear deer__ear--far"><path class="cr-dr-dark" d="M15-114C13-123 16-130 21-131C22-124 20-118 17-113Z"/></g>
      <path class="cr-dr-coat" d="M6-114C10-120 20-120 24-113C26-107 22-103 16-102C10-101 2-102-3-104C-6-106-4-110 6-114Z"/>
      <path class="cr-dr-muzzle" d="M-3.5-104C-1.5-101 4-100 8.5-101C4-103.5 0-104.5-3.5-104Z"/>
      <path class="cr-dr-lip" d="M-1-102.6C2-101.3 5-101 7.5-101.4"/>
      <ellipse class="cr-nose" cx="-3.4" cy="-105.6" rx="2.1" ry="1.7"/>
      <ellipse class="cr-dr-ring" cx="10.2" cy="-111" rx="2.6" ry="2.2"/><ellipse class="cr-eye" cx="10.2" cy="-111" rx="1.8" ry="1.5"/><circle class="cr-glint" cx="9.6" cy="-111.6" r=".5"/>
      <g class="deer__ear"><path class="cr-dr-coat" d="M17-115C17-125 24-131 30-130C29-123 25-117 20-113Z"/><path class="cr-dr-ear" d="M19.5-116C20-122 24-127 28-128C27-123 24-119 21-115Z"/></g>
    </g>
    <g class="deer-leg deer-leg--b">${DEER_FRONT}</g>
    <g class="deer-leg deer-leg--a">${DEER_HIND}</g>
  </g></g></g>`;

/* spotted owl, front view, feet at 0,0 */
export const OWL = `
  <g class="owl">
    <path class="cr-ow-body" d="M0-35C10-35 14-25 13-15C12-6 7 0 0 0C-7 0-12-6-13-15C-14-25-10-35 0-35Z"/>
    <path class="cr-ow-wing" d="M-12.5-20C-15-12-13-4-7-1C-10-7-11-14-10-21ZM12.5-20C15-12 13-4 7-1C10-7 11-14 10-21Z"/>
    <path class="cr-ow-bar" d="M-12-15l2.6.6M-12-10.5l2.8.4M-10.8-6l2.4.2M12-15l-2.6.6M12-10.5l-2.8.4M10.8-6l-2.4.2"/>
    <g class="cr-ow-spot"><path d="M-5-14l1.4 1.2 1.4-1.2M1-14l1.4 1.2 1.4-1.2M-7-9.5l1.4 1.2 1.4-1.2M-2-9l1.4 1.2 1.4-1.2M3.5-9.5l1.4 1.2 1.4-1.2M-4.5-5l1.4 1.2 1.4-1.2M1.5-5l1.4 1.2 1.4-1.2"/></g>
    <g class="owl__head">
      <circle class="cr-ow-disc" cx="-4.6" cy="-25" r="5.6"/><circle class="cr-ow-disc" cx="4.6" cy="-25" r="5.6"/>
      <path class="cr-ow-rim" d="M-10-27C-10-31-7-33-4.6-33C-2-33 0-31 0-29C0-31 2-33 4.6-33C7-33 10-31 10-27"/>
      <g class="owl__open"><circle class="cr-eye" cx="-4.4" cy="-25.2" r="2.6"/><circle class="cr-eye" cx="4.4" cy="-25.2" r="2.6"/><circle class="cr-glint" cx="-3.6" cy="-26" r=".8"/><circle class="cr-glint" cx="5.2" cy="-26" r=".8"/></g>
      <path class="owl__shut" d="M-7-25Q-4.4-23.2-1.8-25M1.8-25Q4.4-23.2 7-25"/>
      <path class="cr-ow-beak" d="M-1.3-22.6L1.3-22.6L0-19.4Z"/>
    </g>
    <path class="cr-ow-feet" d="M-4.5 0l-1.6 1.6M-4.5 0l0 2M-4.5 0l1.6 1.6M4.5 0l-1.6 1.6M4.5 0l0 2M4.5 0l1.6 1.6"/>
  </g>`;

/*
 * The pieces the music player plays (music.js is the band). All original, written for this site.
 *
 * Each song:
 *   bpm, meter (beats per bar, default 4), swing (0.5 = straight), scale (for melodies), seed
 *   prog    chord loops; one chord per bar, or two separated by a space
 *   parts   which instruments exist and how they play (see ROLES in music.js)
 *   form    [bars, chord loop, parts playing] for each section, in order
 *   gain    level trim so every song sits at the same loudness (measured offline)
 *   night   true for songs that suit the dark theme
 */
export const SONGS = {
  "redwood-morning": {
    title: "redwood morning", bpm: 74, swing: 0.6, seed: 11, scale: "C pent", gain: 0.93,
    prog: { A: ["Fmaj9", "Em7", "Dm9", "Cmaj9"], B: ["Am9", "Em7", "Fmaj9", "G6"] },
    parts: {
      keys: { inst: "ep", style: "lofi" },
      pad: { level: 0.6 },
      bass: { style: "lofi" },
      drums: { kit: "lofi" },
      lead: { inst: "kalimba", center: 74, range: [64, 84], echo: 0.25, pan: 0.2 },
      vinyl: { level: 0.5 },
      birds: { rate: 0.4, level: 0.65 },
    },
    form: [
      [4, "A", "keys vinyl birds"],
      [8, "A", "keys pad bass drums vinyl"],
      [8, "B", "keys bass drums lead vinyl"],
      [8, "A", "keys bass drums lead vinyl birds"],
      [4, "B", "keys pad vinyl birds"],
      [8, "B", "keys pad bass drums lead vinyl"],
      [4, "A", "keys vinyl birds"],
    ],
  },
  "fern-shade": {
    title: "fern shade", bpm: 84, swing: 0.62, seed: 23, scale: "F major", gain: 0.965,
    prog: { A: ["Gm9", "C13", "Fmaj9", "D7b9"], B: ["Bbmaj9", "A7", "Dm9", "Gm9 C13"], O: ["Gm9", "C13", "Fmaj9", "Fmaj9"] },
    parts: {
      keys: { inst: "ep", style: "lofi", level: 0.9 },
      bass: { style: "walk", level: 0.9 },
      drums: { kit: "brush" },
      lead: { inst: "pluck", center: 69, range: [60, 79], echo: 0.2, pan: -0.15, decay: 1.1 },
      arp: { inst: "kalimba", rate: 4, pat: [0, 2, 1, 3], level: 0.7, pan: 0.3 },
      vinyl: { level: 0.45 },
      birds: { rate: 0.2, level: 0.6 },
    },
    form: [
      [4, "A", "keys vinyl"],
      [8, "A", "keys bass drums vinyl birds"],
      [8, "B", "keys bass drums lead vinyl"],
      [8, "A", "keys bass drums lead arp vinyl"],
      [4, "B", "keys arp vinyl birds"],
      [8, "A", "keys bass drums lead vinyl"],
      [4, "O", "keys vinyl"],
    ],
  },
  "moss-and-rain": {
    title: "moss & rain", bpm: 70, swing: 0.56, seed: 37, scale: "Eb pent", gain: 0.98,
    prog: { A: ["Abmaj9", "Gm7", "Fm9", "Bb13"], B: ["Cm9", "Abmaj9", "Ebmaj9", "Bb7sus4"], O: ["Abmaj9", "Gm7", "Fm9", "Ebmaj9"] },
    parts: {
      keys: { inst: "ep", style: "lofi", level: 0.85 },
      pad: { level: 0.7, cut: 900 },
      bass: { style: "lofi" },
      drums: { kit: "soft", vel: 0.9 },
      lead: { inst: "musicbox", center: 79, range: [70, 89], level: 0.75, echo: 0.3, pan: 0.15 },
      arp: { inst: "pluck", rate: 2, pat: [0, 1, 2, 3, 4, 3, 2, 1], oct: 0, level: 0.8, pan: -0.25, decay: 0.6 },
      rain: { level: 0.45 },
      vinyl: { level: 0.3 },
    },
    form: [
      [4, "A", "keys pad rain"],
      [8, "A", "keys pad bass drums rain"],
      [8, "B", "keys bass drums lead rain vinyl"],
      [8, "A", "keys bass drums arp lead rain"],
      [4, "B", "pad arp rain"],
      [8, "B", "keys pad bass drums lead rain vinyl"],
      [4, "O", "keys pad rain"],
    ],
  },
  fireflies: {
    title: "fireflies", bpm: 66, swing: 0.55, seed: 41, scale: "C pent", gain: 1.08, night: true,
    prog: { A: ["Am9", "Fmaj9", "Cmaj9", "G6"], B: ["Dm9", "Am9", "Fmaj9", "Esus4 E7"], O: ["Am9", "Fmaj9", "G6", "Am9"] },
    parts: {
      arp: { inst: "celesta", rate: 2, pat: [0, 2, 1, 3, 2, 4, 3, 1], level: 0.6, echo: 0.3, pan: 0.2 },
      keys: { inst: "ep", style: "hold", level: 0.6 },
      pad: { level: 0.75, cut: 800 },
      bass: { style: "lofi", level: 0.85 },
      drums: { kit: "soft", vel: 0.8 },
      lead: { inst: "musicbox", center: 81, range: [72, 91], level: 0.8, every: 2, echo: 0.35, pan: -0.2 },
      crickets: { level: 0.4 },
      owl: { rate: 0.1, level: 0.7 },
    },
    form: [
      [4, "A", "arp pad crickets"],
      [8, "A", "arp keys pad bass crickets owl"],
      [8, "B", "arp keys bass drums lead crickets"],
      [8, "A", "arp keys pad bass drums lead crickets owl"],
      [4, "B", "pad lead crickets owl"],
      [8, "A", "arp keys pad bass drums crickets"],
      [4, "O", "arp pad crickets"],
    ],
  },
  "moonlit-graves": {
    title: "moonlit graves", bpm: 96, meter: 3, seed: 53, scale: "A harmonic", gain: 1.08, night: true, keysRange: [55, 76],
    prog: {
      A: ["Am", "E7/G#", "Am/G", "D/F#", "Fmaj7", "E7", "Am", "E7"],
      B: ["Dm", "G7", "Cmaj7", "Fmaj7", "Bm7b5", "E7", "Am", "Am"],
      O: ["Am", "E7/G#", "Am/G", "D/F#", "Fmaj7", "E7", "Am", "Am"],
    },
    parts: {
      lead: { inst: "musicbox", center: 81, range: [72, 93], level: 0.8, echo: 0.25, pan: 0.15 },
      keys: { inst: "pluck", style: "waltz", level: 0.65, decay: 0.9, pan: -0.15 },
      choir: { role: "pad", inst: "choir", level: 0.65 },
      bass: { style: "waltz", pizz: true, cut: 900, level: 1.5 },
      drums: { kit: "heart", vel: 0.8 },
      bell: { note: 57, every: 8, vel: 0.8 },
      wind: { level: 0.45 },
      owl: { rate: 0.12 },
    },
    form: [
      [8, "A", "lead wind"],
      [8, "A", "lead keys bass wind bell"],
      [8, "B", "lead keys bass choir drums wind"],
      [8, "A", "lead keys bass choir drums wind owl"],
      [8, "B", "choir bell wind owl"],
      [8, "A", "lead keys bass choir drums wind"],
      [8, "O", "lead keys wind"],
    ],
  },
  "pumpkin-patch": {
    title: "pumpkin patch", bpm: 112, swing: 0.64, seed: 67, scale: "D harmonic", gain: 1.02,
    prog: { A: ["Dm", "Dm/C", "Bb7", "A7"], B: ["Gm", "Dm/F", "Em7b5", "A7"], O: ["Gm", "A7", "Dm", "Dm"] },
    parts: {
      keys: { inst: "ep", style: "stabs", level: 0.85 },
      bass: { style: "walk", pizz: true, cut: 1000, level: 1.4 },
      drums: { kit: "swing" },
      lead: { inst: "celesta", center: 77, range: [69, 88], level: 0.85, pan: 0.2 },
      ghost: { role: "lead", inst: "theremin", center: 72, range: [64, 81], level: 0.55, echo: 0.2 },
      vinyl: { level: 0.4 },
    },
    form: [
      [4, "A", "keys bass vinyl"],
      [8, "A", "keys bass drums lead vinyl"],
      [8, "B", "keys bass drums ghost vinyl"],
      [8, "A", "keys bass drums lead vinyl"],
      [4, "A", "bass drums ghost"],
      [8, "B", "keys bass drums lead vinyl"],
      [8, "A", "keys bass drums ghost vinyl"],
      [4, "O", "keys bass vinyl"],
    ],
  },
  "fog-bell": {
    title: "fog bell", bpm: 54, seed: 79, scale: "C minor", gain: 1.06, night: true,
    prog: { A: ["Cmadd9", "Abmaj7", "Fm6", "G7b9"], O: ["Cmadd9", "Abmaj7", "Fm6", "Cmadd9"] },
    parts: {
      choir: { role: "pad", inst: "choir", level: 0.6 },
      keys: { inst: "ep", style: "sparse", level: 0.6 },
      bass: { style: "drone", attack: 0.5, level: 0.8 },
      lead: { inst: "musicbox", center: 79, range: [70, 89], level: 0.7, every: 2, echo: 0.4 },
      arp: { inst: "celesta", rate: 2, pat: [3, 2, 1, 0], gaps: 0.5, level: 0.35, echo: 0.4 },
      bell: { note: 55, every: 4, vel: 0.8 },
      wind: { level: 0.45 },
      owl: { rate: 0.15 },
    },
    form: [
      [4, "A", "choir wind bell"],
      [8, "A", "choir keys bass wind bell lead"],
      [8, "A", "choir keys bass wind arp lead owl"],
      [4, "A", "keys wind bell owl"],
      [8, "A", "choir keys bass wind bell lead"],
      [4, "O", "choir wind"],
    ],
  },
  "first-snow": {
    title: "first snow", bpm: 72, swing: 0.58, seed: 89, scale: "F pent", gain: 0.92,
    prog: { A: ["Fmaj9", "Dm9", "Bbmaj9", "C69"], B: ["Gm9", "Am7", "Bbmaj9", "C13"], O: ["Fmaj9", "Dm9", "Bbmaj9", "Fmaj9"] },
    parts: {
      keys: { inst: "ep", style: "lofi" },
      pad: { level: 0.6 },
      bass: { style: "lofi" },
      drums: { kit: "sleigh", vel: 0.85 },
      lead: { inst: "celesta", center: 79, range: [69, 89], level: 0.85, echo: 0.25, pan: 0.15 },
      arp: { inst: "musicbox", rate: 4, pat: [0, 1, 2, 3], level: 0.65, pan: -0.25, gaps: 0.2 },
      vinyl: { level: 0.5 },
    },
    form: [
      [4, "A", "keys vinyl arp"],
      [8, "A", "keys pad bass drums vinyl"],
      [8, "B", "keys bass drums lead vinyl"],
      [8, "A", "keys bass drums lead arp vinyl"],
      [4, "B", "keys pad arp vinyl"],
      [8, "B", "keys pad bass drums lead vinyl"],
      [4, "O", "keys arp vinyl"],
    ],
  },
};

/* which songs go with which look */
export const PLAYLISTS = {
  forest: { name: "forest mix", songs: ["redwood-morning", "fern-shade", "moss-and-rain", "fireflies"] },
  halloween: { name: "halloween mix", songs: ["moonlit-graves", "pumpkin-patch", "fog-bell"] },
  winter: { name: "winter mix", songs: ["first-snow", "redwood-morning", "moss-and-rain", "fireflies", "fern-shade"] },
};
export const playlistFor = (holiday) =>
  holiday === "halloween" ? "halloween" : holiday === "december" || holiday === "january" ? "winter" : "forest";

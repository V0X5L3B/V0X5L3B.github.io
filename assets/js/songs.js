/*
 * The pieces the music player plays (music.js is the band). All original jazz, written for this site.
 *
 * Each song:
 *   bpm, meter (beats per bar, default 4), swing (0.5 = straight), scale (for melodies), seed
 *   prog    chord loops; one chord per bar, or two separated by a space
 *   parts   which instruments exist and how they play (see ROLES in music.js)
 *   form    [bars, chord loop, parts playing] for each section, in order
 *   gain    level trim so every song sits at the same loudness (measured offline)
 *   fx      mix settings: tone (low-pass on the melodic parts), verb, duck, wow, drumTone
 *   night   true for songs that suit the dark theme
 */
export const SONGS = {
  /* ---- the normal forest look: café jazz ---- */
  "redwood-cafe": {
    title: "redwood café", bpm: 116, swing: 0.64, seed: 211, scale: "F major", gain: 1.15, keysRange: [52, 72],
    fx: { tone: 6000, verb: 0.25, duck: 0 },
    prog: { A: ["Gm9", "C13", "Fmaj9", "D7b9"], B: ["Bbmaj9", "Eb9", "Am7", "D7b9"], O: ["Gm9", "C13", "Fmaj9", "Fmaj9"] },
    parts: {
      keys: { inst: "piano", style: "jazz", level: 0.9 },
      bass: { style: "walk", pizz: true, cut: 1100, level: 1.4 },
      drums: { kit: "jazz" },
      lead: { inst: "vibes", center: 77, range: [67, 86], level: 0.9, echo: 0.12, pan: 0.2 },
      solo: { role: "lead", inst: "piano", center: 74, range: [65, 84], level: 0.85, pan: -0.1, motif: "solo" },
    },
    form: [
      [4, "A", "keys bass"],
      [8, "A", "keys bass drums lead"],
      [8, "B", "keys bass drums lead"],
      [8, "A", "keys bass drums solo"],
      [8, "B", "keys bass drums solo"],
      [8, "A", "keys bass drums lead"],
      [8, "B", "keys bass drums solo"],
      [8, "A", "keys bass drums lead"],
      [4, "O", "keys bass drums"],
    ],
  },
  "fern-ballad": {
    title: "fern ballad", bpm: 66, swing: 0.6, seed: 223, scale: "Eb major", gain: 1.58, night: true, keysRange: [51, 72],
    fx: { tone: 5200, verb: 0.35, duck: 0 },
    prog: { A: ["Fm9", "Bb13", "Ebmaj9", "Cm9"], B: ["Abmaj9", "Db9", "Gm7", "C7b9"], O: ["Fm9", "Bb13", "Ebmaj9", "Ebmaj9"] },
    parts: {
      keys: { inst: "piano", style: "ballad", level: 0.85 },
      bass: { style: "lofi", pizz: true, cut: 1000, level: 1.3 },
      drums: { kit: "brush", vel: 0.8 },
      lead: { inst: "piano", center: 75, range: [67, 86], level: 0.9, echo: 0.1, pan: 0.1 },
    },
    form: [
      [4, "A", "keys"],
      [8, "A", "keys bass lead"],
      [8, "B", "keys bass drums lead"],
      [8, "A", "keys bass drums lead"],
      [4, "B", "keys bass"],
      [8, "A", "keys bass drums lead"],
      [4, "O", "keys"],
    ],
  },
  "moss-bossa": {
    title: "moss bossa", bpm: 132, swing: 0.5, seed: 227, scale: "C major", gain: 0.891, keysRange: [52, 72],
    fx: { tone: 6000, verb: 0.25, duck: 0 },
    prog: { A: ["Dm9", "G13", "Cmaj9", "A7b9"], B: ["Fmaj9", "Bb9", "Em7", "A7b9"], O: ["Dm9", "G13", "Cmaj9", "Cmaj9"] },
    parts: {
      keys: { inst: "pluck", style: "bossa", level: 0.75, decay: 0.7, strum: 0.012 },
      bass: { style: "bossa", pizz: true, cut: 1000, level: 1.35 },
      drums: { kit: "bossa", vel: 0.9 },
      lead: { inst: "vibes", center: 76, range: [67, 86], level: 0.9, echo: 0.15, pan: 0.2 },
      solo: { role: "lead", inst: "piano", center: 74, range: [65, 84], level: 0.85, pan: -0.15, motif: "solo" },
    },
    form: [
      [4, "A", "keys bass drums"],
      [8, "A", "keys bass drums lead"],
      [8, "B", "keys bass drums lead"],
      [8, "A", "keys bass drums solo"],
      [8, "B", "keys bass drums solo"],
      [8, "A", "keys bass drums lead"],
      [8, "B", "keys bass drums solo"],
      [8, "A", "keys bass drums lead"],
      [8, "B", "keys bass drums solo"],
      [8, "A", "keys bass drums lead"],
      [4, "O", "keys bass"],
    ],
  },
  /* ---- Halloween ---- */
  "moonlit-graves": {
    title: "moonlit graves", bpm: 96, meter: 3, seed: 53, scale: "A harmonic", gain: 1.12, night: true, keysRange: [55, 76],
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
    title: "pumpkin patch", bpm: 112, swing: 0.64, seed: 67, scale: "D harmonic", gain: 1.03,
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
    title: "fog bell", bpm: 54, seed: 79, scale: "C minor", gain: 1.08, night: true,
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
  /* ---- winter holidays ---- */
  "jingle-bells": {
    title: "jingle bells", bpm: 120, swing: 0.55, seed: 307, scale: "C major", gain: 0.891, keysRange: [52, 72],
    fx: { tone: 6500, verb: 0.3, duck: 0 },
    prog: {
      I: ["C", "C", "G7", "G7"],
      J: ["C", "C", "C", "C", "F", "C", "D7", "G7", "C", "C", "C", "C", "F", "C", "G7", "C"],
      O: ["F", "G7", "C", "C"],
    },
    parts: {
      keys: { inst: "piano", style: "stabs", level: 0.85 },
      bass: { style: "lofi", pizz: true, cut: 1000, level: 1.3 },
      drums: { kit: "sleigh" },
      tune: { inst: "celesta", level: 1, echo: 0.12, pan: 0.1,   // the chorus of the 1857 song (public domain)
        notes: "E5:1 E5:1 E5:2 | E5:1 E5:1 E5:2 | E5:1 G5:1 C5:1.5 D5:0.5 | E5:4 | F5:1 F5:1 F5:1.5 F5:0.5 | F5:1 E5:1 E5:1 E5:0.5 E5:0.5 | E5:1 D5:1 D5:1 E5:1 | D5:2 G5:2 | E5:1 E5:1 E5:2 | E5:1 E5:1 E5:2 | E5:1 G5:1 C5:1.5 D5:0.5 | E5:4 | F5:1 F5:1 F5:1.5 F5:0.5 | F5:1 E5:1 E5:1 E5:0.5 E5:0.5 | G5:1 G5:1 F5:1 D5:1 | C5:4" },
      tune2: { role: "tune", inst: "vibes", level: 0.8, pan: -0.2, shift: -12, legato: 0.8, notes: "E5:1 E5:1 E5:2 | E5:1 E5:1 E5:2 | E5:1 G5:1 C5:1.5 D5:0.5 | E5:4 | F5:1 F5:1 F5:1.5 F5:0.5 | F5:1 E5:1 E5:1 E5:0.5 E5:0.5 | E5:1 D5:1 D5:1 E5:1 | D5:2 G5:2 | E5:1 E5:1 E5:2 | E5:1 E5:1 E5:2 | E5:1 G5:1 C5:1.5 D5:0.5 | E5:4 | F5:1 F5:1 F5:1.5 F5:0.5 | F5:1 E5:1 E5:1 E5:0.5 E5:0.5 | G5:1 G5:1 F5:1 D5:1 | C5:4" },
      lead: { inst: "musicbox", center: 79, range: [72, 91], level: 0.8, echo: 0.2, pan: 0.2 },
      bell: { note: 60, every: 4, vel: 0.5 },
    },
    form: [
      [4, "I", "keys bass drums bell"],
      [16, "J", "keys bass drums tune"],
      [16, "J", "keys bass drums lead"],
      [16, "J", "keys bass drums tune tune2"],
      [4, "O", "keys bass drums bell"],
    ],
  },
  "first-snow": {
    title: "first snow", bpm: 72, swing: 0.58, seed: 89, scale: "F pent", gain: 0.889,
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
  /* ---- New Year ---- */
  "midnight-chimes": {
    title: "midnight chimes", bpm: 84, meter: 3, seed: 311, scale: "F major", gain: 1.15, keysRange: [55, 74],
    prog: {
      A: ["F", "C/E", "Dm", "Bb", "F", "Gm7", "C7", "C7"],
      B: ["Bb", "F/A", "Gm7", "C7", "F", "Dm", "Gm7", "C7"],
      O: ["Bb", "C7", "F", "F", "Bb", "C7", "F", "F"],
    },
    parts: {
      lead: { inst: "musicbox", center: 77, range: [69, 88], level: 0.85, echo: 0.25, pan: 0.15 },
      keys: { inst: "pluck", style: "waltz", level: 0.65, decay: 0.9, pan: -0.15 },
      pad: { level: 0.55, cut: 1000 },
      bass: { style: "waltz", pizz: true, cut: 900, level: 1.4 },
      drums: { kit: "waltz", vel: 0.7 },
      bell: { note: 65, every: 8, vel: 0.7 },
    },
    form: [
      [8, "A", "keys bell drums"],
      [8, "A", "lead keys bass pad"],
      [8, "B", "lead keys bass drums"],
      [8, "A", "lead keys bass pad drums bell"],
      [8, "B", "lead keys bass pad drums"],
      [8, "O", "lead keys pad bell"],
    ],
  },
  /* ---- Valentine's ---- */
  "sweetheart-waltz": {
    title: "sweetheart waltz", bpm: 88, meter: 3, seed: 313, scale: "Ab major", gain: 1.05, keysRange: [55, 74],
    prog: {
      A: ["Abmaj7", "Fm7", "Dbmaj7", "Eb7", "Abmaj7", "Cm7", "Dbmaj7", "Eb7"],
      B: ["Dbmaj7", "Eb", "Cm7", "Fm7", "Bbm7", "Eb7", "Abmaj7", "Eb7"],
      O: ["Dbmaj7", "Eb7", "Abmaj7", "Abmaj7", "Dbmaj7", "Eb7", "Abmaj7", "Abmaj7"],
    },
    parts: {
      lead: { inst: "musicbox", center: 80, range: [72, 91], level: 0.85, echo: 0.25, pan: 0.15 },
      keys: { inst: "pluck", style: "waltz", level: 0.7, decay: 1.1, pan: -0.15 },
      pad: { level: 0.6, cut: 950 },
      bass: { style: "waltz", pizz: true, cut: 900, level: 1.4 },
      drums: { kit: "heart", vel: 0.7 },
    },
    form: [
      [8, "A", "keys pad"],
      [8, "A", "lead keys bass drums"],
      [8, "B", "lead keys bass pad drums"],
      [8, "A", "lead keys bass pad"],
      [8, "B", "lead keys bass drums"],
      [8, "O", "lead keys pad"],
    ],
  },
  /* ---- St. Patrick's ---- */
  "clover-jig": {
    title: "clover jig", bpm: 176, meter: 3, swing: 0.5, seed: 317, scale: "G major", gain: 0.944, keysRange: [55, 72],
    prog: {
      A: ["G", "G", "C", "D", "G", "Em", "C", "D"],
      B: ["Em", "Em", "G", "D", "C", "G", "Am", "D"],
      O: ["C", "D", "G", "G", "C", "D", "G", "G"],
    },
    parts: {
      lead: { inst: "whistle", center: 79, range: [71, 88], level: 0.9, echo: 0.1, pan: 0.1 },
      keys: { inst: "pluck", style: "jig", level: 0.7, decay: 0.6, pan: -0.2 },
      bass: { style: "waltz", pizz: true, cut: 1000, level: 1.3 },
      drums: { kit: "bodhran" },
    },
    form: [
      [8, "A", "keys bass drums"],
      [8, "A", "lead keys bass drums"],
      [8, "B", "lead keys bass drums"],
      [8, "A", "lead keys bass drums"],
      [8, "B", "lead keys bass drums"],
      [8, "A", "keys bass drums"],
      [8, "A", "lead keys bass drums"],
      [8, "B", "lead keys bass drums"],
      [8, "O", "lead keys bass drums"],
    ],
  },
  /* ---- 4th of July ---- */
  "fife-and-drum": {
    title: "fife and drum", bpm: 112, swing: 0.5, seed: 331, scale: "D major", gain: 1.08, keysRange: [55, 72],
    prog: { A: ["D", "G", "A7", "D"], B: ["G", "D", "E7", "A7"], O: ["G", "A7", "D", "D"] },
    parts: {
      lead: { inst: "whistle", center: 81, range: [74, 91], level: 0.9, echo: 0.08 },
      keys: { inst: "piano", style: "stabs", level: 0.7 },
      bass: { style: "lofi", pizz: true, cut: 1000, level: 1.2 },
      drums: { kit: "march" },
    },
    form: [
      [4, "A", "drums"],
      [8, "A", "lead drums bass"],
      [8, "B", "lead keys bass drums"],
      [8, "A", "lead keys bass drums"],
      [4, "A", "drums bass"],
      [8, "B", "lead keys bass drums"],
      [8, "A", "lead keys bass drums"],
      [8, "B", "lead keys bass drums"],
      [4, "O", "lead keys bass drums"],
    ],
  },
  /* ---- Thanksgiving ---- */
  "harvest-home": {
    title: "harvest home", bpm: 96, swing: 0.55, seed: 337, scale: "D major", gain: 1.02, keysRange: [52, 72],
    prog: { A: ["D", "Gmaj7", "Bm7", "A"], B: ["G", "D/F#", "Em7", "A7sus4"], O: ["G", "A7sus4", "D", "D"] },
    parts: {
      keys: { inst: "pluck", style: "folk", level: 0.75, decay: 0.8, strum: 0.022 },
      bass: { style: "lofi", pizz: true, cut: 1000, level: 1.25 },
      drums: { kit: "brush", vel: 0.75 },
      lead: { inst: "piano", center: 74, range: [66, 84], level: 0.85, echo: 0.12, pan: 0.15 },
      solo: { role: "lead", inst: "whistle", center: 79, range: [71, 88], level: 0.75, pan: -0.15, motif: "solo" },
      vinyl: { level: 0.45 },   // a crackling fire
    },
    form: [
      [4, "A", "keys vinyl"],
      [8, "A", "keys bass lead vinyl"],
      [8, "B", "keys bass drums lead vinyl"],
      [8, "A", "keys bass drums solo vinyl"],
      [8, "B", "keys bass drums solo vinyl"],
      [8, "A", "keys bass drums lead vinyl"],
      [4, "O", "keys vinyl"],
    ],
  },
};

/* which songs go with which look (the holiday ids are the ones in holiday.js) */
export const PLAYLISTS = {
  forest: { name: "forest jazz", songs: ["redwood-cafe", "fern-ballad", "moss-bossa"] },
  halloween: { name: "halloween mix", songs: ["moonlit-graves", "pumpkin-patch", "fog-bell"] },
  december: { name: "holiday mix", songs: ["jingle-bells", "first-snow"] },
  january: { name: "new year mix", songs: ["midnight-chimes"] },
  february: { name: "valentine's mix", songs: ["sweetheart-waltz"] },
  march: { name: "st. patrick's mix", songs: ["clover-jig"] },
  july: { name: "4th of july mix", songs: ["fife-and-drum"] },
  november: { name: "thanksgiving mix", songs: ["harvest-home"] },
};
export const playlistFor = (holiday) => (holiday && PLAYLISTS[holiday] ? holiday : "forest");

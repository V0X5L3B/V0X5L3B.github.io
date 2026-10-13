/*
 * V0X5L3B — central content file.
 * Edit this file to change links, projects, lab entries and skills.
 * Nothing here is rendered unless it has a real value:
 *   - a link set to null simply doesn't render a button
 *   - no stats, percentages or dates are shown anywhere
 */

export const PROFILE = {
  handle: "V0X5L3B",
  tag: "@V0X5L3B",
  site: "https://v0x5l3b.is-a.dev/",
  headline: "I build things to find out how they work.",
  intro:
    "Self-directed developer working in Python and the web. I take projects apart, rebuild them, break them again, and write down what the error was actually saying.",
  status: "experiments in progress",
};

/* Public destinations. Set to null to hide. */
export const LINKS = {
  github: { label: "GitHub", handle: "V0X5L3B", url: "https://github.com/V0X5L3B" },
  discord: {
    label: "Discord",
    handle: "v0x5l.3b",
    url: null, // deliberately no discord.com/users/<numeric-id> link: the ID is a permanent account identifier
    copy: "v0x5l.3b",
  },
  discordServer: {
    label: "Discord Server",
    handle: "Join the server",
    url: "https://discord.gg/y9vfNpFgN",
  },
  email: null, // e.g. { label: "Email", handle: "you@example.com", url: "mailto:you@example.com", copy: "you@example.com" }
  site: { label: "Site", handle: "v0x5l3b.is-a.dev", url: "https://v0x5l3b.is-a.dev/" },
};

export const SHOUTOUTS = [
  {
    name: "Clanker",
    note: "Entertainment Discord bot — economy, memes, games.",
    url: "https://clanker.pxsl.dev/",
  },
];

/*
 * Projects.
 * accent: "crimson" | "green" | "lime"  — per-project identity colour
 * status: honest, plain-language state of the work
 * links:  { github, live } — null when no public destination exists
 * sketch: code-inspired preview. These are ILLUSTRATIVE sketches of the idea,
 *         not excerpts of the real source, and are labelled that way in the UI.
 */
export const PROJECTS = [
  {
    id: "personal-site",
    name: "This Website",
    kicker: "Web · ongoing",
    summary:
      "My personal developer hub, rebuilt as a plain static site: no framework, no build step, no trackers. Content lives in one data file.",
    details: [
      "Hand-written HTML, CSS and JavaScript — hosted as static files on GitHub Pages.",
      "Custom wordmark, dark crimson palette, light theme, keyboard-accessible controls, reduced-motion support.",
      "Projects, links and skills are edited in a single data file.",
    ],
    status: "Ongoing",
    tags: ["HTML", "CSS", "JavaScript", "Static site"],
    categories: ["web"],
    accent: "crimson",
    links: {
      github: "https://github.com/V0X5L3B/v0x5l3b.github.io",
      live: "https://v0x5l3b.is-a.dev/",
    },
    sketch: {
      file: "data.js",
      lang: "javascript",
      code: `// one file, whole site
export const PROJECTS = [
  { id: "...", name: "...", status: "Evolving",
    links: { github: null, live: null } },
];
// null link = no button. Nothing invented.`,
    },
  },
];

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
];

/* Lab: small experiments, prototypes, unfinished ideas. Add entries freely. */
export const LAB = [
  // Add experiments here, e.g.
  // { name: "...", note: "...", status: "in progress", tags: ["..."], url: null },
];

/* Skills: labelled by stance, never by percentage. */
export const SKILLS = [
  {
    group: "Languages",
    items: [
      { name: "Python", stance: "Building with" },
      { name: "HTML & CSS", stance: "Building with" },
      { name: "JavaScript", stance: "Experimenting with" },
    ],
  },
  {
    group: "AI & experiments",
    items: [
      { name: "Reinforcement-learning concepts", stance: "Learning" },
      { name: "Stable-Baselines3", stance: "Experimenting with" },
      { name: "Agent tool environments", stance: "Building with" },
      { name: "Training loops & checkpoints", stance: "Experimenting with" },
    ],
  },
  {
    group: "Tools & workflow",
    items: [
      { name: "Git & GitHub", stance: "Using" },
      { name: "Command line & PowerShell", stance: "Using" },
      { name: "AI coding assistants", stance: "Using" },
      { name: "Rainmeter & Windhawk", stance: "Experimenting with" },
    ],
  },
];

/* Where I'd like to take things. These are interests, not shipped features. */
export const DIRECTION = [
  "Agents that talk to each other",
  "Agent support for more programming languages",
  "More JavaScript, more of the web, built the hard way",
];

export const TRACKS = [
  { name: "track 01", src: "audio/track1.mp3" },
  { name: "track 02", src: "audio/track2.mp3" },
  { name: "track 03", src: "audio/track3.mp3" },
];

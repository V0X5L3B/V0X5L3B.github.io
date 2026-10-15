/*
 * V0X5L3B — central content file.
 * Edit this file to change links, projects, services, lab entries and skills.
 * Nothing here is rendered unless it has a real value:
 *   - a link set to null simply doesn't render a button
 *   - no stats, percentages or dates are shown anywhere
 */

export const PROFILE = {
  handle: "V0X5L3B",
  tag: "@V0X5L3B",
  site: "https://v0x5l3b.is-a.dev/",
  headline: "I build things, and I help you make yours.",
  intro:
    "Self-directed developer working in Python and the web. I make websites, small tools and experiments, and I'd love to help you build the thing you've been picturing, from a first idea to something that actually works.",
  status: "open for projects",
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
      "Custom wordmark, soft blush palette, light theme, keyboard-accessible controls.",
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
  {
    id: "agent-experiment",
    name: "Experimental AI Agent",
    kicker: "Python · experiment",
    summary:
      "A task-oriented agent that works inside a controlled environment through tools: it can look around, read and write files, run code and tests, and read its own errors.",
    details: [
      "Tools: list directories, create and read files, write files, create directories, run code, run tests, inspect errors.",
      "Exploring training loops, checkpoints, exploration and task difficulty.",
      "Learning reinforcement-learning ideas with Stable-Baselines3 and related tooling.",
      "Future interest: agents that communicate with each other, and support for more programming languages. Neither exists yet.",
      "This is experimental work, not a production coding agent.",
    ],
    status: "Experimental",
    tags: ["Python", "Reinforcement learning", "Stable-Baselines3", "Tool use"],
    categories: ["python"],
    accent: "lime",
    links: { github: null, live: null },
    sketch: {
      file: "loop.py",
      lang: "python",
      code: `# sketch: the loop I keep rebuilding
while not task.done:
    obs = env.observe()
    action = policy(obs)          # a tool call
    result = env.step(action)     # list_dir, read_file, run_tests ...
    if result.error:
        notes.add(inspect(result.error))`,
    },
  },
];

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "python", label: "Python" },
];

/*
 * Services: what people can hire me for.
 * No prices are invented here: every job is quoted after we talk.
 */
export const SERVICES = [
  {
    id: "website",
    icon: "✿",
    name: "A website of your own",
    summary:
      "A personal page, portfolio or small project site, hand-built like this one: quick to load, no trackers, and yours to keep.",
    includes: [
      "A look that fits you, with light and dark themes",
      "Set up and published on GitHub Pages",
      "One simple content file, so you can edit it yourself later",
    ],
    tags: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: "tools",
    icon: "✦",
    name: "Python scripts & small tools",
    summary:
      "Something that does a boring job for you: a script, a little command-line tool, a helper for your project or your files.",
    includes: [
      "Plain, readable Python you can open and understand",
      "Notes on how to run it and how to change it",
      "Small and focused: one job, done well",
    ],
    tags: ["Python", "Automation"],
  },
  {
    id: "help",
    icon: "♡",
    name: "Help making your thing",
    summary:
      "Stuck on a bug or an idea you can't get started on? I'll read the error with you, explain what it's actually saying, and help you get it working.",
    includes: [
      "Debugging and fixing what's broken",
      "Explaining what went wrong in plain words",
      "Working on your own project with you, step by step",
    ],
    tags: ["Debugging", "Web", "Python"],
  },
];

/* How working together goes, in order. */
export const PROCESS = [
  { step: "Tell me what you want to make", note: "A sentence is enough to start. Sketches and links help too." },
  { step: "Get a plan and a price", note: "I reply with what I'd build and what it costs, before any work starts." },
  { step: "I build it with you", note: "You see it as it grows and can change your mind along the way." },
  { step: "It's yours", note: "You get the finished files and everything you need to keep it running." },
];

/*
 * Hiring + payment.
 * pay.url: set this to your payment link (Ko-fi, Stripe payment link, PayPal.me, ...).
 * While it is null, the site shows a "payment link coming soon" note instead of a button.
 */
export const HIRE = {
  pitch: "Got something you want to make? I'd love to help you build it.",
  price: "Every project is quoted after we talk, so you only pay for what you need.",
  pay: { label: "Pay for a project", url: null },
};

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

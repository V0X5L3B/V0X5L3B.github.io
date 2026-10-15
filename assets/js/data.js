/*
 * V0X5L3B — central content file.
 * Edit this file to change links, projects, services, promos, notes and skills.
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
 * Payment is Discord first: people message me, we agree on the job, then I send a payment link.
 * pay.url: optional. Set it to a public payment page (Ko-fi, Stripe link, PayPal.me, ...) to add
 * a pay button; while it is null, no button is shown.
 */
export const HIRE = {
  pitch: "Got something you want to make? I'd love to help you build it.",
  price: "Message me on Discord and tell me your idea. Every project is quoted after we talk, and once we agree I send you a payment link, so you only pay for what you need.",
  pay: { label: "Pay for a project", url: null },
};

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

/* What I'm working on right now. One short line, shown in the hero terminal. Set to null to hide. */
export const NOW = "a pastel terminal remodel of this site";

/*
 * Promo spots: the "featured" strip under the hero. These are my own ads:
 * my services, my server and things I recommend. No ad networks, no tracking.
 * href: a section on this page ("#hire") or a full https link.
 */
export const PROMOS = [
  { kind: "service", title: "Need a website?", text: "I build personal sites and small project pages, like this one.", cta: "Hire me", href: "#hire" },
  { kind: "service", title: "Stuck on a bug?", text: "Send me the error. I'll help you find what's wrong and fix it.", cta: "Get help", href: "#hire" },
  { kind: "community", title: "My Discord server", text: "Come hang out, ask questions and see what I'm building.", cta: "Join", href: "https://discord.gg/y9vfNpFgN" },
  { kind: "recommended", title: "Clanker", text: "An entertainment Discord bot with economy, memes and games.", cta: "Visit", href: "https://clanker.pxsl.dev/" },
];

/*
 * Notes: short write-ups about real things I built or fixed on this site.
 * date: when it happened (YYYY-MM-DD). body: paragraphs, plain text.
 */
export const NOTES = [
  {
    id: "contrast",
    date: "2026-10-15",
    title: "Making button text readable in dark mode",
    tags: ["CSS", "Accessibility"],
    summary: "My pink buttons looked nice but the white text on them was too faint to read comfortably.",
    body: [
      "In dark mode the main button was white text on a light rose. It looked soft, but the contrast was only 3.0 to 1. The usual minimum for normal text (WCAG AA) is 4.5 to 1.",
      "I darkened that rose a little, from #e0709a to #c24a78. The button still reads as pink, and the contrast is now 4.6 to 1.",
      "The holiday themes each set their own button colour, so I checked those too, in light and dark.",
    ],
  },
  {
    id: "cobweb",
    date: "2026-10-14",
    title: "The cobweb that made my page scroll sideways",
    tags: ["CSS", "Halloween theme"],
    summary: "A swaying Halloween cobweb in the corner gave the whole page a sideways scrollbar.",
    body: [
      "The Halloween theme hangs a cobweb in the top corner and gently rotates it back and forth. While it rotated, part of it poked past the right edge of the screen, so the browser added a sideways scrollbar and the page wobbled on phones.",
      "Two small CSS changes fixed it. The cobweb now rotates around its top edge, so it swings down instead of out. And the hero section clips anything that goes past its sides (overflow-x: clip), so decorations can never widen the page.",
      "Since then I check every theme for sideways scrolling on a phone-sized screen before I ship.",
    ],
  },
  {
    id: "csp",
    date: "2026-10-12",
    title: "Why this site loads nothing from other websites",
    tags: ["Security", "HTML"],
    summary: "The site has a strict security policy, so every library and font lives in the repo.",
    body: [
      "The page has a Content Security Policy. It tells the browser to only run scripts and load fonts from this site itself, and to block everything else.",
      "That means no CDNs: the animation libraries and fonts are copied into the repo. It also means the one small inline script in the page is allowed by its exact fingerprint (a sha256 hash). If I change even one character of that script, I have to update the hash, or the browser refuses to run it.",
      "It's a bit more work, but nobody else's server can change what runs on my site, and there are no trackers.",
    ],
  },
];

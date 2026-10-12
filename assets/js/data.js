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
    "Self-directed developer working in Python, Luau and the web. I take projects apart, rebuild them, break them again, and write down what the error was actually saying.",
  status: "experiments in progress",
};

/* Public destinations. Set to null to hide. */
export const LINKS = {
  github: { label: "GitHub", handle: "V0X5L3B", url: "https://github.com/V0X5L3B" },
  discord: {
    label: "Discord",
    handle: "v0x5l.3b",
    url: "https://discord.com/users/REMOVED_DISCORD_ID",
    copy: "v0x5l.3b",
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
    id: "sleepless-simulator",
    name: "Sleepless Simulator",
    kicker: "Roblox · evolving",
    summary:
      "A Roblox simulation about sleeping and the strange places dreams go — sleep and wake interactions, dream mechanics, and astral-projection experiments.",
    details: [
      "Aims to work with both R6 and R15 characters.",
      "Sleep and wake interactions, side-sleep poses, snoring, and the transitions between states.",
      "Dream mechanics and astral-projection experiments, including character clones and how they move.",
      "Still an evolving concept I keep iterating on — not a finished or published game.",
    ],
    status: "Evolving",
    tags: ["Luau", "Roblox Studio", "R6 / R15", "Character systems"],
    categories: ["roblox"],
    accent: "crimson",
    links: { github: null, live: null },
    sketch: {
      file: "SleepState.luau",
      lang: "luau",
      code: `-- sketch: sleep as a small state machine
local transitions = {
  awake    = { "lyingDown" },
  lyingDown = { "asleep", "awake" },
  asleep   = { "dreaming", "awake" },
  dreaming = { "astral", "awake" },
  astral   = { "dreaming", "awake" },
}

function canGo(from, to)
  return table.find(transitions[from], to) ~= nil
end`,
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
      "This is experimental work — not a production coding agent.",
    ],
    status: "Experimental",
    tags: ["Python", "Reinforcement learning", "Stable-Baselines3", "Tool use"],
    categories: ["python", "ai"],
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
        notes.add(inspect(result.error))
    checkpoints.maybe_save()`,
    },
  },
  {
    id: "roblox-diagnostics",
    name: "Character Diagnostics & UI",
    kicker: "Roblox · local tools",
    summary:
      "Local Roblox utilities for poking at characters: root-part diagnostics, floor alignment tests, size and movement controls, and reset-and-recovery tools in a dark custom UI.",
    details: [
      "Checks character and root-part state, and tests floor alignment and position.",
      "Controls for character size and movement.",
      "Reset and recovery tools for when a character ends up somewhere it shouldn't.",
      "Dark, custom-built interfaces for all of it. These are testing utilities I use while developing, not published products.",
    ],
    status: "Local utilities",
    tags: ["Luau", "UI", "Diagnostics", "Physics"],
    categories: ["roblox"],
    accent: "crimson",
    links: { github: null, live: null },
    sketch: {
      file: "Diagnose.client.luau",
      lang: "luau",
      code: `-- sketch: what a root-part check looks like
local root = character:FindFirstChild("HumanoidRootPart")
if not root then
  return report("no HumanoidRootPart", character)
end
local hit = workspace:Raycast(root.Position, Vector3.new(0, -50, 0))
report("floor offset", hit and (root.Position.Y - hit.Position.Y))`,
    },
  },
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
  { id: "roblox", label: "Roblox" },
  { id: "python", label: "Python" },
  { id: "ai", label: "AI" },
  { id: "web", label: "Web" },
];

/* Lab: small experiments, prototypes, unfinished ideas. Add entries freely. */
export const LAB = [
  {
    name: "Stable-Baselines3 runs",
    note: "Trying training configurations and watching how behaviour changes with experience.",
    status: "experimenting",
    tags: ["Python", "RL"],
    url: null,
  },
  {
    name: "Task difficulty ladder",
    note: "Sorting agent tasks from trivial to annoying so training has somewhere to climb.",
    status: "in progress",
    tags: ["Python", "Agents"],
    url: null,
  },
  {
    name: "Astral clone movement",
    note: "How a detached character clone should follow, drift or ignore its sleeping body.",
    status: "in progress",
    tags: ["Luau", "Roblox"],
    url: null,
  },
  {
    name: "Character reset tools",
    note: "Getting a stuck or mis-sized character back to a sane state without rejoining.",
    status: "usable",
    tags: ["Luau", "UI"],
    url: null,
  },
  {
    name: "Rainmeter & Windhawk tweaks",
    note: "Windows customization: skins, mods, and the odd system-config rabbit hole.",
    status: "tinkering",
    tags: ["Windows", "Customization"],
    url: null,
  },
  {
    name: "Browser identity sketches",
    note: "Hand-drawn logo and dark-palette ideas that keep turning into CSS.",
    status: "sketching",
    tags: ["Design", "CSS"],
    url: null,
  },
];

/* Skills: labelled by stance, never by percentage. */
export const SKILLS = [
  {
    group: "Languages",
    items: [
      { name: "Python", stance: "Building with" },
      { name: "Lua / Luau", stance: "Building with" },
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
    group: "Game dev",
    items: [
      { name: "Roblox Studio", stance: "Building with" },
      { name: "Character systems", stance: "Building with" },
      { name: "Gameplay scripting & UI", stance: "Building with" },
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
  "Sleepless Simulator: deeper dream and astral mechanics",
  "More JavaScript, more of the web, built the hard way",
];

export const TRACKS = [
  { name: "track 01", src: "audio/track1.mp3" },
  { name: "track 02", src: "audio/track2.mp3" },
  { name: "track 03", src: "audio/track3.mp3" },
];

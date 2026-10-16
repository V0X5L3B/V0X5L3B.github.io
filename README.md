# V0X5L3B — personal site

Hand-written static site for <https://v0x5l3b.is-a.dev/>. No framework, no build step, no trackers, no external requests.

## Run locally

ES modules need a web server (opening `index.html` directly won't work):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Edit content

Everything lives in **`assets/js/data.js`**: profile text, links, projects, promo spots, notes, skills and the "now" line.

- A link set to `null` renders no button (nothing is faked).
- Add a project: copy an object in `PROJECTS`; `categories` must match an id in `FILTERS`.
- Add a note (write-up): append to `NOTES`.
- Change the featured strip: edit `PROMOS` (your own promos only, no ad networks).
- Change what you are building right now: edit `NOW` (null hides it).
- Services (the "hire me" section): edit `SERVICES`, `PROCESS` and `HIRE`.
- Payment is Discord first: visitors message you, you agree on the job, then you send them a payment link. To add a pay button later, set `HIRE.pay.url` (it's a normal outbound link, so the CSP doesn't need changing); while it's `null`, no button shows.
- Add an email: set `LINKS.email` (see the commented example).
- Background music: see [Music](#music) below.

## Seasonal themes

`assets/js/holiday.js` + `assets/css/holidays.css` switch the look automatically by month (visitor's local time):
Jan New Year · Feb Valentine's · Mar St. Patrick's · Jul Independence Day · Oct Halloween · Nov Thanksgiving season · Dec Winter holidays. Other months (and `?holiday=none`, or a visitor turning the seasonal theme off) use the default pastel redwood forest look: a painted background (`assets/js/forest.js`, drawn on canvas by `assets/js/scene.js`) with giant redwoods, buttress roots, burls, moss carpets, lichen, climbing and hanging vines, a fallen moss-covered giant and sword ferns, and a forest floor above the footer. Colours live in `assets/css/forest.css`.

- Preview any theme: `?holiday=halloween` (ids: halloween, november, december, january, february, march, july) or `?holiday=none`.
- Visitors can turn it off in the footer (remembered in their browser). The `holiday` console command previews too.
- Halloween has the most detail: a painted night sky with a moon and a haunted house on the hill (`assets/js/graveyard.js`), a little graveyard above the footer with a ghost, pumpkins, a cauldron, a cat and a crow, plus spiders, a witch, glowing eyes and `boo` in the console.
- Motion is on by default and ignores the visitor's reduced-motion setting (owner's choice). Visitors can turn animations off with the footer switch (stored in localStorage as `v0x-motion`).
- Animal behaviour (the Halloween cat, crow and ghosts) lives in `assets/js/alive.js`. Each animal runs its own loop of moves, pauses and habits (looking around, blinking, tail flicks) with new random timing each round, and reacts when the pointer comes close. Moves are Web Animations on the animal's transform; legs, wings and tails are CSS animations named `g-*`; habits are `is-*` classes styled in `forest.css` / `holidays.css`. Nothing runs while animations are switched off.
- To add or move a holiday: edit `HOLIDAYS` in `holiday.js` and add a colour block in `holidays.css`.

## Visitor tools

- **Quick menu**: `Ctrl K` / `Cmd K`, `/` or the search button in the header. Type to jump to a section, project or note, switch theme or animations, copy the Discord name, print. Entries are built in `main.js`; the menu itself is `assets/js/palette.js`.
- **Keyboard shortcuts** (`?` lists them): `t` theme, `m` animations, `j`/`k` next/previous section, `g` then `a`/`p`/`h`/`b`/`n`/`c`/`t` to jump.
- **Project brief** (Hire me section, `assets/js/brief.js`): a few questions become a message ready to paste on Discord. Nothing is sent from the page; the draft stays in the visitor's browser (`v0x-brief`).
- **Pet the animals** (Halloween look): quick pointer moves startle them, a slow approach and a tap pets them (a heart pops up). The `pets` console command shows the count, kept in the browser only (`v0x-pets`).
- **Links to a project or note**: `#project-<id>` and `#note-<id>` open it; each one has a Copy link button.
- **Print / save as PDF**: `assets/css/print.css` prints a plain light page with every project, service and note.

## Music

The background music is original, written for this site, and played live by the visitor's browser with the Web Audio API. There are no recordings, samples or downloads: every note is made in the browser, so there is nothing to credit and no third-party licence to track, and the CSP needs no change.

- **Songs**: `assets/js/songs.js`. Each song is a few lines of chords, a form (which instruments play in each section), tempo, swing and a seed, so it plays the same way every time. Playlists follow the look of the site: the forest mix by default, the Halloween mix in October, a winter mix in December and January. On a first visit with the dark theme, a night song plays first; after that each visit starts on the song after the last one heard.
- **The band**: `assets/js/music.js` has the instruments (electric piano, pads, choir, bass, kalimba, music box, celesta, harp, theremin, a Risset-style bell), soft drums, and vinyl / rain / wind / bird / cricket sounds, plus the scheduler that writes a few seconds of notes ahead. `render(song)` plays a song into an `OfflineAudioContext`, which is how levels were checked (each song sits at about -14 LUFS at full volume).
- **The player**: `assets/js/player.js` builds the now-playing panel in the footer (previous / play / next, volume, progress, song list) and the music button in the header. It remembers the volume (`v0x-volume`), the last song (`v0x-song`) and whether the visitor switched the music off (`v0x-music`).
- **Starting**: browsers block sound until the first click, tap or key press, so the music fades in on that first interaction (owner's choice). A visitor who pauses it stays paused on later visits until they press play again. On iPhones, music started by that first tap follows the silent switch and mixes with other apps' audio; pressing play makes it play like a media player (sound even in silent mode).
- Also in the quick menu (play/pause, next, pick a song) and the console: `music`, `music list`, `music next`, `music off`, `music <song>`.
- **Add a song**: copy an entry in `SONGS`, give it a new id, title and seed, write its chords and form, then add the id to a playlist in `PLAYLISTS`.

## Look & fonts

Warm paper/terracotta palette (follows the visitor's system light/dark setting until they use the toggle), a serif for headings, and hand-drawn details (uneven corners, wobbly ink lines, highlighter, sticky note, margin scribbles). Fonts are self-hosted subsets in `assets/fonts/`: Newsreader (headings) and Caveat (handwriting), both SIL Open Font License (see the `OFL-*.txt` files).

## Security notes

- `index.html` ships a Content-Security-Policy `<meta>` (no third-party origins, no `connect-src`). The tiny inline theme script in `<head>` is allowed by its SHA-256 hash: **if you edit that inline script, recompute the hash** or the browser will block it (Pages can't set real headers, so `frame-ancestors`/clickjacking protection isn't possible here).
- Don't put keys, tokens or webhooks in this repo — it's public. Don't add `discord.com/users/<id>` links (permanent account ID).
- Add any new third-party host to the CSP deliberately, not by loosening it.

## Layout

```
index.html            page structure + metadata
404.html              GitHub Pages not-found page
assets/css/main.css   design system (dark default, light theme)
assets/css/holidays.css seasonal palettes + decor
assets/css/hire.css   services / hire me section
assets/js/holiday.js  month → holiday logic, SVG decor
assets/js/scene.js    painted canvas backgrounds (redrawn on resize and light/dark, a few layers per frame)
assets/js/forest.js   default forest scene + floor
assets/js/alive.js    animal behaviour (moves, pauses, habits, pointer reactions, petting)
assets/js/palette.js  quick menu + keyboard shortcuts
assets/js/brief.js    project brief builder
assets/js/music.js    music engine: instruments, drums, ambience, scheduler
assets/js/songs.js    the songs and playlists
assets/js/player.js   music player (footer panel + header button)
assets/css/extras.css quick menu, brief, copy-link buttons, music player, toast
assets/css/print.css  print / PDF layout
assets/js/graveyard.js Halloween scene + floor
assets/js/data.js     all editable content
assets/js/main.js     rendering + interactions
assets/img/           favicon, social preview (og.png), avatar
CNAME                 custom domain — don't delete
```

## Deploy (GitHub Pages)

This repo is a user site (`V0X5L3B/v0x5l3b.github.io`) with a `CNAME`. Pushing to the Pages branch publishes it:

```sh
git push origin main   # or whichever branch Pages is set to
```

Check Settings → Pages: source = "Deploy from a branch", branch matches the one you push, custom domain `v0x5l3b.is-a.dev`. DNS is untouched.

## Motion
`assets/css/motion.css` + `assets/js/motion.js` add the entrance, scroll-reveal, hover and cursor effects. Delete both (and their two tags in index.html) to turn them off.
The opening animation plays once per browser session; add `?intro` to the URL to replay it. It cannot be skipped.

## Libraries
GSAP 3.15 (free "no charge" license) and Lenis 1.3.27 (MIT) are self-hosted in `assets/vendor/` (see its README). `assets/js/fx.js` uses them for smooth scrolling, parallax, split-text headings and click sparks, and does nothing when animations are switched off. React Bits is React-only, so a few effects are re-made in plain JS instead.

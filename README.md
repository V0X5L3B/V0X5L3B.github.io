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
- Ambient music (`audio/`) tries to autoplay on load. Browsers block sound until the first click/tap/keypress, so it then starts on that first interaction. Pause/skip/volume are in the footer; list tracks in `TRACKS`.

## Seasonal themes

`assets/js/holiday.js` + `assets/css/holidays.css` switch the look automatically by month (visitor's local time):
Jan New Year · Feb Valentine's · Mar St. Patrick's · Jul Independence Day · Oct Halloween · Nov Thanksgiving season · Dec Winter holidays. Other months (and `?holiday=none`, or a visitor turning the seasonal theme off) use the default pastel redwood forest look: colours and scene in `assets/css/forest.css`, built by `buildForest()` in `holiday.js`.

- Preview any theme: `?holiday=halloween` (ids: halloween, november, december, january, february, march, july) or `?holiday=none`.
- Visitors can turn it off in the footer (remembered in their browser). The `holiday` console command previews too.
- Halloween has the most detail (moon, spiders, graveyard row, witch, fog, glowing eyes, `boo` in the console).
- Motion is on by default and ignores the visitor's reduced-motion setting (owner's choice). Visitors can turn animations off with the footer switch (stored in localStorage as `v0x-motion`).
- To add or move a holiday: edit `HOLIDAYS` in `holiday.js` and add a colour block in `holidays.css`.

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

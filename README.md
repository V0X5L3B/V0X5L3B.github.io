# V0X5L3B — personal site

Hand-written static site for <https://v0x5l3b.is-a.dev/>. No framework, no build step, no trackers, no external requests.

## Run locally

ES modules need a web server (opening `index.html` directly won't work):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Edit content

Everything lives in **`assets/js/data.js`**: profile text, links, projects, lab experiments, skills.

- A link set to `null` renders no button (nothing is faked).
- Add a project: copy an object in `PROJECTS`; `categories` must match an id in `FILTERS`.
- Add a lab entry: append to `LAB`.
- Add an email: set `LINKS.email` (see the commented example).
- Code previews on project cards are *illustrative sketches*, labelled as such. Replace with real excerpts if you prefer.
- Ambient music (`audio/`) tries to autoplay on load. Browsers block sound until the first click/tap/keypress, so it then starts on that first interaction. Pause/skip/volume are in the footer; list tracks in `TRACKS`.

## Seasonal themes

`assets/js/holiday.js` + `assets/css/holidays.css` switch the look automatically by month (visitor's local time):
Jan New Year · Feb Valentine's · Mar St. Patrick's · Jul Independence Day · Oct Halloween · Nov Thanksgiving season · Dec Winter holidays. Other months use the default crimson look.

- Preview any theme: `?holiday=halloween` (ids: halloween, november, december, january, february, march, july) or `?holiday=none`.
- Visitors can turn it off in the footer (remembered in their browser). The `holiday` console command previews too.
- Halloween has the most detail (moon, spiders, graveyard row, witch, fog, glowing eyes, `boo` in the console).
- Floating particles are hidden when the visitor prefers reduced motion; static decor stays.
- To add or move a holiday: edit `HOLIDAYS` in `holiday.js` and add a colour block in `holidays.css`.

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

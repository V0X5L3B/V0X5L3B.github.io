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
- Ambient music (`audio/`) is opt-in from the footer and never autoplays; list tracks in `TRACKS`.

## Layout

```
index.html            page structure + metadata
404.html              GitHub Pages not-found page
assets/css/main.css   design system (dark default, light theme)
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

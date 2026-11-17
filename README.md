# Neon Nights — Club Entry System

A polished, deploy-ready web app version of the original `1- Night Club Entry.js` learning
project. The original file is **untouched** — this is a separate, standalone folder.

The app takes three inputs (age, ticket, VIP status) and returns the same four door-policy
verdicts as the original script, but with a neon glassmorphic interface, animated ticket
"pass", quick demo presets, and persistent door statistics.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `styles.css` | Theme, layout, animations, responsive styles |
| `script.js` | Door policy logic, interactions, local stats |
| `favicon.svg` | Custom neon "N" icon |
| `README.md` | This file |

## Run locally

No build step, no dependencies, no framework.

**Option 1 — open the file**

Double-click `index.html`. It works straight from the filesystem.

**Option 2 — local server (recommended)**

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

## Deploy

This is a static site, so it works on any host:

- **Netlify / Vercel / Cloudflare Pages**: drag & drop this folder, or connect a Git repo
  with build command left blank and publish directory set to `.` (the repo root).
- **GitHub Pages**: push the folder contents to a repo, then enable Pages from the
  `main` branch / root folder.
- **Any shared hosting**: upload all files via FTP.

## What's included

- Responsive layout (desktop, tablet, mobile)
- Animated neon background with floating gradient orbs
- Accessible toggles, labelled inputs, keyboard-friendly controls, `aria-live` result
- Four distinct verdict themes with matching colors and icons
- Four one-click demo presets for quick testing / portfolio demos
- Guest stats saved in `localStorage` (safe fallback if storage is blocked)
- `prefers-reduced-motion` support

## Door policy (unchanged logic)

1. `age < 18` → not allowed to enter
2. no ticket → please bring your ticket
3. not VIP → allowed in the regular lounge
4. otherwise → VIP lounge with premium facilities

---

Built with HTML, CSS and vanilla JavaScript.

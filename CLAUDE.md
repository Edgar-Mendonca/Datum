# DATUM (family hub): notes for Claude

Read `MEMORY.md` first. It is the family memory: decisions for every app, the apps list, the site, and a log of every session.
At the end of every session that changes anything, update `MEMORY.md` (session log, decisions, next steps).

What this repo is:
- The family "brain": `FAMILY.md` (the design guide, source of truth for every app), `MEMORY.md`, `apps.json`, `brand/`.
- The website in `site/` (Astro, static, GitHub Pages at https://edgar-mendonca.github.io/Datum/), deployed by `.github/workflows/pages.yml`.
- The app repos (`Edgar-Mendonca/Datum-Plan`, `Datum-Plot`, `Datum-Atlas`) are read-only from here. Changes to an app happen in that app's own chat; give the user text to paste there.

Rules:
- Public text never names or compares with commercial products, and never says an app copies or replaces one (FAMILY §13).
- Same look as the apps: tokens from FAMILY §3–4, cards with 1 px lines and 8 px radius, Plex Mono uppercase labels. No UI kit; no client JavaScript except the theme toggle.
- Never fail the build because of one app: show "Coming soon" instead.

Checks before pushing:
- `cd site && npm ci && npm run build` (works without a token).
- Playwright screenshots at 1280 and 375 px (`npm run preview`, then check every page for horizontal overflow).

# Datum: family memory

> **Read this at the start of every session** (`CLAUDE.md` says so). It records what is common to every Datum app, the hub site, and what comes next. Each app keeps its own `docs/MEMORY.md`; this file keeps what applies to all of them. Update it at the end of every session.

| | |
| --- | --- |
| **What** | DATUM: the home of the Datum family. The shared design guide ([FAMILY.md](FAMILY.md)), this memory, the app registry ([apps.json](apps.json)), the brand ([brand/](brand)) and the website ([site/](site)). |
| **Positioning** | Free, open-source desktop tools for engineers, scientists, researchers and analysts. Never name or compare with commercial products (FAMILY §13). |
| **Repo** | `Edgar-Mendonca/Datum` · working branch `claude/datum-hub-site-uyjhxh` (the first branch pushed, so also the default branch) |
| **Website** | https://edgar-mendonca.github.io/Datum/ (Astro 7, static, GitHub Pages via `.github/workflows/pages.yml`) |
| **Brief** | [Datum-Plan/docs/briefs/DATUM-HUB.md](https://github.com/Edgar-Mendonca/Datum-Plan/blob/HEAD/docs/briefs/DATUM-HUB.md) |

---

## 1. The apps

| App | Repo (default branch) | Accent | Version (2026-10-25) | `docs/site.json` |
| --- | --- | --- | --- | --- |
| Datum Plan | `Edgar-Mendonca/Datum-Plan` (`claude/fervent-keller-ddas5s`) | Blue `#0B5CAD` | 0.3.10 | ✅ |
| Datum Plot | `Edgar-Mendonca/Datum-Plot` (`claude/epic-mayer-6faugf`) | Teal `#0E8C7F` | 0.2.1 | ⬜ (snippet given to the user, session 1) |
| Datum Atlas | `Edgar-Mendonca/Datum-Atlas` (`claude/bold-volta-90lu2c`) | Violet `#6C4AB6` | 0.1.1 | ⬜ (snippet given to the user, session 1) |

`apps.json` uses `"branch": "HEAD"`, so the site follows whatever each repo's default branch is.

## 2. The site

```
site/
  astro.config.mjs        site https://edgar-mendonca.github.io, base /Datum; a build:done hook writes screenshots into dist/apps/<id>/
  src/lib/github.ts       build-time data: site.json, CHANGELOG.md, logo, releases; fallbacks; the product-name filter
  src/styles/tokens.css   the family tokens + accent sets per app (data-app on <html>), light/dark
  src/layouts/Base.astro  head, Google Fonts (display=swap), the theme script (Auto/Light/Dark, the only JS)
  src/components/         Header, Footer, AppCard, ReleaseBadge, Roadmap, Feature, Shot
  src/pages/              index, [app] (plan, plot, atlas), family (rendered from FAMILY.md), about, 404
```

Data flow, per app in `apps.json`:
- `raw.githubusercontent.com/<repo>/HEAD/docs/site.json` → tagline, for, highlights, screenshots, roadmap. Missing → the `apps.json` fields, and "Coming soon" for the roadmap.
- `CHANGELOG.md` → split on `## X.Y.Z — date`; the last 5 sections on the app page; the summary is the first plain paragraph, else the first bullet.
- `api.github.com/repos/<repo>/releases` (with `GITHUB_TOKEN` in Actions) → latest version, date, installer URL and size; the home page's 6 newest releases. If the API fails, the newest CHANGELOG section is used and Download links to `releases/latest`.
- Logo SVG from the repo (inlined as a data URI); fallback `brand/`.
- Screenshots are downloaded at build and written into `dist/apps/<id>/` (no hotlinking); one that fails is left out.

Deploy: on push to the default branch, daily at 05:17 UTC, `workflow_dispatch`, and `repository_dispatch` type `app-released`. Settings › Pages › Source must be **GitHub Actions**.

## 3. Decisions

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-25 | FAMILY.md moves to DATUM and becomes the source of truth; section numbers 1–12 are kept so "FAMILY §3" means the same everywhere; §13 "Principles and public words" added | The brief. App repos keep a short `docs/FAMILY.md` that links here. |
| 2026-10-25 | Commercial product names removed from FAMILY.md ("What it replaces" column → "What it is for"; ribbon, sidebar, chart style and grid wording made neutral) | The user's rule: never name, compare with, or say we copy any commercial product. |
| 2026-10-25 | The site leaves out any CHANGELOG, highlight or roadmap line that names another product (`NAMES` in `github.ts`) and lists it in the build log | The apps' older CHANGELOG sections still compare with other tools; the public site must not, whatever the app repos say. File formats and interoperability words (Excel, Word, CSV) are not filtered. |
| 2026-10-25 | Base path `/Datum` (the repo's real name), not `/DATUM` as in the brief | Pages URLs follow the repository name. |
| 2026-10-25 | Astro 7.3.8 (Node ≥ 22.12) and marked 18.1.1; Node 22 in Actions | Current versions; marked 18.0.x has a DoS advisory. |
| 2026-10-25 | `apps.json` branch `HEAD` (default branch) instead of naming branches | The app repos' default branches are `claude/*` working branches that may change. |
| 2026-10-25 | Pages workflow runs on every push but deploys only from the default branch (`if:` on the job) | The repo has no `main`; this keeps working if the default branch changes. |
| 2026-10-25 | Text and filled buttons use an `--ink` token: the accent, or a darker shade where white on it is below 4.5:1 (Plot's teal → `#0B7468`) | WCAG AA contrast. |
| 2026-10-25 | Family mark `brand/datum-icon.svg`: grey-tint tile, navy "D" with blue, teal and violet dots, amber diamond | The brief (§1). |
| 2026-10-25 | Datum Plot's bundled Python is recorded in FAMILY §2 as the one exception to "no Python" | Plot's own decision (its MEMORY, session 1); the guide must not contradict a shipped app. |

## 4. Roadmap (hub)

✅ done · 🔜 next · ⬜ later

| Item | Status |
| --- | --- |
| README, FAMILY, MEMORY, apps.json, brand, LICENSE, CLAUDE.md | ✅ |
| Astro site: home, app pages, family, about, 404; data layer with fallbacks; light/dark/auto | ✅ |
| Pages workflow | ✅ (needs Settings › Pages › Source = GitHub Actions) |
| Plot and Atlas publish `docs/site.json` | 🔜 (in their chats) |
| App repos reword CHANGELOG lines that name other products; Plan restores its lost 0.3.3–0.3.7 headings | 🔜 (in their chats) |
| App repos replace `docs/FAMILY.md` with a link to DATUM's FAMILY.md | 🔜 |
| Each app's `release.yml` sends `repository_dispatch` (`app-released`) to DATUM (fine-grained token secret) so the site updates within minutes | ⬜ |
| Lighthouse run on the live site (target 95+) | ⬜ |

## 5. Session log

### 2026-10-25: Session 1 (the hub)
- Read the brief, FAMILY.md, and each app's README and MEMORY (read-only clones of Plan, Plot, Atlas).
- Wrote README, FAMILY.md (neutral wording, §13 principles, site.json spec in §10, step 7 of the new-app checklist), MEMORY.md, apps.json, CLAUDE.md, LICENSE; copied the three app icons into `brand/` and drew `datum-icon.svg`.
- Built the Astro site and `pages.yml`. Checked locally (no token: the release API is unavailable in the build sandbox, so the CHANGELOG fallback was used) with Playwright at 1280 and 375 px, light and dark: no horizontal overflow; fixed the family page's overflow at 375 px and the theme button label.
- Found: Plan's CHANGELOG lost its `## 0.3.7` … `## 0.3.3` headings (they read ` 2026-10-24`), so the site jumps from 0.3.8 to 0.3.2. Plan's 0.3.6 and Plot's 0.1.0 sections name other products (left out by the filter).
- Plot and Atlas have no `docs/site.json` yet: gave the user a snippet for each.

## 6. Known limits

- Without `GITHUB_TOKEN` (local builds) the release API may be rate-limited; versions then come from the CHANGELOG and Download goes to `releases/latest`.
- The site updates once a day after an app release until the `repository_dispatch` step is added to the apps.
- Fonts come from Google Fonts (display=swap), not self-hosted.

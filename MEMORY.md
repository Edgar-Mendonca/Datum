# Datum: family memory

> **Read this at the start of every session** (`CLAUDE.md` says so). It records what is common to every Datum app, the hub site, and what comes next. Each app keeps its own `docs/MEMORY.md`; this file keeps what applies to all of them. Update it at the end of every session.

| | |
| --- | --- |
| **What** | DATUM: the home of the Datum family. The shared design guide ([FAMILY.md](FAMILY.md)), this memory, the app registry ([apps.json](apps.json)), the brand ([brand/](brand)) and the website ([site/](site)). |
| **Positioning** | Free, open-source desktop tools for engineers, scientists, researchers and analysts. Never name or compare with commercial products (FAMILY §13). |
| **Repo** | `Edgar-Mendonca/Datum` · working branch `claude/datum-hub-site-uyjhxh` (the first branch pushed, so also the default branch) |
| **Website** | https://edgar-mendonca.github.io/Datum/ and /network (Astro 7, static, GitHub Pages via `.github/workflows/pages.yml`) |
| **Brain** | [brain/graph.json](brain/graph.json): the whole family as one graph; read it before starting any new app ([BRAIN.md](brain/BRAIN.md)) |
| **Brief** | [Datum-Plan/docs/briefs/DATUM-HUB.md](https://github.com/Edgar-Mendonca/Datum-Plan/blob/HEAD/docs/briefs/DATUM-HUB.md) |

---

## 1. The apps

| App | Repo (default branch) | Accent | Version (2026-10-25) | `docs/site.json` |
| --- | --- | --- | --- | --- |
| Datum Plan | `Edgar-Mendonca/Datum-Plan` (`claude/fervent-keller-ddas5s`) | Blue `#0B5CAD` | 0.3.10 | ✅ |
| Datum Plot | `Edgar-Mendonca/Datum-Plot` (`claude/epic-mayer-6faugf`) | Teal `#0E8C7F` | 0.2.1 | ⬜ (snippet given to the user, session 1) |
| Datum Atlas | `Edgar-Mendonca/Datum-Atlas` (`claude/bold-volta-90lu2c`) | Violet `#6C4AB6` | 0.1.1 | ⬜ (snippet given to the user, session 1) |

`apps.json` uses `"branch": "HEAD"`, so the site follows whatever each repo's default branch is.

## 2. The site and the brain

```
brain/
  brain.mjs               the brain generator (no dependencies): FAMILY, MEMORY, apps.json + each app's MEMORY, CHANGELOG, site.json → nodes and edges
  graph.json              its output, committed (node brain/brain.mjs); schema in BRAIN.md
site/
  astro.config.mjs        site https://edgar-mendonca.github.io, base /Datum; a build:done hook writes the screenshots into dist/apps/<id>/
  src/lib/github.ts       app data: site.json, CHANGELOG.md, logo, releases, first screenshot (→ 1440 px WebP); fallbacks; the product-name filter (NAMES)
  src/lib/brain.ts        the brain for the site: public scrub (NAMES), degrees, a d3-force layout computed at build time
  src/styles/site.css     tokens (paper and ink, app accents, light/dark), type (Archivo wdth, IBM Plex, Instrument Serif), frame, bars, buttons, header, footer
  src/layouts/Base.astro  head, the theme script (Auto/Light/Dark), header, footer
  src/components/         Mark (the datum symbol, currentColor), Header, Footer
  src/pages/index.astro   the one landing page: hero drawing + app plates, figures, 01 apps (download), 02 how they are built, 03 latest releases, 04 network teaser, get started
  src/pages/network.astro the Datum network: canvas stage, search, filters, Network/Flow layouts, details panel, the graph as a list
  src/scripts/network.ts  the network client (d3-force, canvas, pointer/pinch/wheel, pulses along links)
```

Data flow, per app in `apps.json`:
- `raw.githubusercontent.com/<repo>/HEAD/docs/site.json` → tagline, for, highlights, screenshots, roadmap. Missing → the `apps.json` fields (name, accent, tagline, for, shot).
- `CHANGELOG.md` → versions and summaries; the figures and the latest-releases list.
- `api.github.com/repos/<repo>/releases` (with `GITHUB_TOKEN` in Actions) → latest version, date, installer URL and size. If the API fails, the newest CHANGELOG section is used and Download links to `releases/latest`.
- `docs/MEMORY.md` → the brain (Files, Decisions, Roadmap, Session log, How we work, the product table's Stack).

Deploy: on push to the default branch, daily at 05:17 UTC, `workflow_dispatch`, and `repository_dispatch` type `app-released`. **Settings › Pages › Source must be GitHub Actions**; with "Deploy from a branch" GitHub runs Jekyll on the raw repo and fails on the `.astro` files (`.nojekyll` at the root now stops that, but the site only deploys through Actions).

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
| 2026-10-25 (s2) | The site is **one landing page** plus the **Datum network**; the app, family and about pages are gone | The user: the site is only for people to see the apps and download them; memory, roadmap and design stay in the repo. |
| 2026-10-25 (s2) | Look taken from the user's zhuojia site (paper-and-ink grid, framed column, numbered bars, wide display type, serif italic accent, mono labels), but its own quiet header (mark, word, three links, theme) and a datum drawing instead of the orbit | The user asked for that layout and style, not a copy, and did not like the reference headers. Artcraft could not be opened from the build sandbox. |
| 2026-10-25 (s4) | **The logo is the user's own design, "Continuum"**: two concentric D's as one line, amber datum square where it starts, with a geometric DATUM wordmark. Refined only in geometry (one centre, true arcs, even 16 gap, optical letter spacing); guide in `brand/BRAND.md`, generator in `brand/source/build-logo.py` | The user designed it and asked us to improve on it, not replace it; no app colours in the brand. |
| 2026-10-25 (s4) | **The site is simple and technical**: IBM Plex Sans and Mono only (Archivo and Instrument Serif removed), no giant display words, no floating tiles or orbit rings, no repeated "free · open source · Windows" slogans | The user: the site looked artistic and too close to the reference sites; it must look professional and attract engineers and scientists. |
| 2026-10-26 (s8) | `pages.yml` waits for GitHub's branch-based Pages build of the same commit, then deploys | While the Pages source is "Deploy from a branch", that build publishes the raw repo and caused a 404 whenever it finished last. |
| 2026-10-26 (s6) | Bench tiles are **real capabilities** of the apps (Plan: schedule, progress; Plot: curve fit, statistics; Atlas: property chart, ranking; reports; more to come), not disciplines; the left side gets app chips from apps.json | The user: the hero did not define our work; never say "3 apps". |
| 2026-10-26 (s6) | The changing blue words use **Instrument Serif italic** (`.it`), everything else stays IBM Plex | The user preferred that font for the changing text (session 3). |
| 2026-10-26 (s6) | Artcraft-like scrolling: glass sticky section bars, an index by the ruler with a scroll %, heading words coming into focus and cards rising (CSS scroll timelines, no library) | The user's Artcraft screenshots and answer 5. |
| 2026-10-26 (s6) | Theme: three visible buttons (Auto, Light, Dark) instead of a cycling button | The user wanted all three; a cycle looked broken (Auto → Light changes nothing on a light system). |
| 2026-10-26 (s6) | Status badges (Stable / Beta / Alpha) from apps.json `status` or the version; figures strip, "Get started" and the network teaser removed; latest releases = one per app; the network page has no visible title | The user's answers and list. |
| 2026-10-25 (s5) | **The workbench hero** (`HeroWorkbench.astro`, replaces `HeroPanel.astro`): left "Datum" + "Tools to <blue phrase>"; right a 3×3 bench of small SVG instruments (Plan, Engineering, Plot, Analysis, Science, Atlas, Research, More to come) around the datum origin (amber square, dial, needle). The active tile animates, the needle turns to it and the phrase changes; hover/focus/tap takes over, app tiles open their app, idle it cycles every 3.2 s; a pointer-following inspection light; a small script (the rule now allows JS for the hero) | The user: the instrument panel was slow, could not be clicked and looked empty mid-fade; they liked the rotating "Tools to …" line and the small animated icons of session 3, but not floating around the title as on the reference sites. |
| 2026-10-25 (s4, replaced in s5) | **Two-panel hero** (`HeroPanel.astro`): "Datum" with the amber square, one lead line, and a write-up that cycles Plan → Plot → Atlas → More to come, beside an instrument panel with one animated technical scene per item (schedule with critical path, fitted curve with band and readout, property chart with selection line, a drawing being drafted); one CSS clock keeps text and scene in step; hover pauses | The user's layout: writing on the left, animated icons on the right, the text changing with what is shown. |
| 2026-10-25 (s3, replaced in s4) | **Family mark replaced** by a "D" that is a protractor (ruler stem, graduated bowl, needle from the amber datum origin), navy ink only | The user: no app colours in the logo (more apps will come); a generalized, unique, vector-style symbolic D. |
| 2026-10-25 (s3) | The hero is a field of animated SVG tiles around the wordmark: one per app (links to it), five for the kinds of work (engineering, computation, analysis, science, research) and two "more to come"; orbit rings with moving dots; a rotating "Tools to …" line; CSS/SMIL only, a scrolling strip on phones, still under reduced motion | The user asked for illustrations placed around the header like the reference site, small animations, room for more apps, and not the same as before. |
| 2026-10-25 (s2, replaced in s3) | New family mark: the GD&T datum feature symbol (framed "D", leader, datum triangle) on a reference line of the three app accents, amber diamond beside the frame | The user was not satisfied with the "D with dots"; a datum symbol says what the name means. |
| 2026-10-25 (s2) | **The brain**: `brain/brain.mjs` builds one graph (nodes: hub, apps, FAMILY sections, technologies, workflow, decisions, files, releases, plans, sessions) from the repos; `brain/graph.json` is committed; the site draws it | The user wants a complete, interactive map of the whole portfolio, and one file Claude reads in every new project so nothing is lost. |
| 2026-10-25 (s2) | The public network removes sentences that name other products and leaves out nodes whose title does; graph.json keeps everything | FAMILY §13 for the site; the memory itself must stay complete. |
| 2026-10-25 (s2) | Fonts self-hosted with @fontsource (Archivo with the width axis, IBM Plex Sans and Mono, Instrument Serif); screenshots converted to 1440 px WebP at build with sharp | No third-party requests; smaller pages. |
| 2026-10-25 | Datum Plot's bundled Python is recorded in FAMILY §2 as the one exception to "no Python" | Plot's own decision (its MEMORY, session 1); the guide must not contradict a shipped app. |

## 4. Roadmap (hub)

✅ done · 🔜 next · ⬜ later

| Item | Status |
| --- | --- |
| README, FAMILY, MEMORY, apps.json, brand, LICENSE, CLAUDE.md | ✅ |
| Astro site: home, app pages, family, about, 404; data layer with fallbacks; light/dark/auto | ✅ (session 1; replaced in session 2) |
| One landing page + the Datum network; new logo; the brain (`brain/`) | ✅ (session 2) |
| The user's "Continuum" logo and BRAND.md; simple two-panel hero; Plex-only type | ✅ (session 4) |
| More brand guidance from the user (to add to BRAND.md) | 🔜 |
| Pages workflow | ✅ (needs Settings › Pages › Source = GitHub Actions) |
| Plot and Atlas publish `docs/site.json` | 🔜 (in their chats) |
| App repos reword CHANGELOG lines that name other products; Plan restores its lost 0.3.3–0.3.7 headings | 🔜 (in their chats) |
| App repos replace `docs/FAMILY.md` with a link to DATUM's FAMILY.md | 🔜 |
| Each app's `release.yml` sends `repository_dispatch` (`app-released`) to DATUM (fine-grained token secret) so the site updates within minutes | ⬜ |
| Lighthouse run on the live site (target 95+) | ⬜ |
| Brain: regenerate `graph.json` in the daily build and commit it (needs `contents: write`), or have each app's release ping DATUM | ⬜ |
| Brain: richer links (decisions ↔ FAMILY sections by topic, plans ↔ the decisions behind them) | ⬜ |

## 5. Session log

### 2026-10-25: Session 1 (the hub)
- Read the brief, FAMILY.md, and each app's README and MEMORY (read-only clones of Plan, Plot, Atlas).
- Wrote README, FAMILY.md (neutral wording, §13 principles, site.json spec in §10, step 7 of the new-app checklist), MEMORY.md, apps.json, CLAUDE.md, LICENSE; copied the three app icons into `brand/` and drew `datum-icon.svg`.
- Built the Astro site and `pages.yml`. Checked locally (no token: the release API is unavailable in the build sandbox, so the CHANGELOG fallback was used) with Playwright at 1280 and 375 px, light and dark: no horizontal overflow; fixed the family page's overflow at 375 px and the theme button label.
- Found: Plan's CHANGELOG lost its `## 0.3.7` … `## 0.3.3` headings (they read ` 2026-10-24`), so the site jumps from 0.3.8 to 0.3.2. Plan's 0.3.6 and Plot's 0.1.0 sections name other products (left out by the filter).
- Plot and Atlas have no `docs/site.json` yet: gave the user a snippet for each.

### 2026-10-25: Session 2 (landing page, network, logo)
- User: the Pages build failed with Jekyll YAML errors (the Pages source was "Deploy from a branch", so GitHub ran Jekyll over the `.astro` files; our own Actions build had passed but could not deploy because Pages was not set to GitHub Actions). Added `.nojekyll`; the fix is Settings › Pages › Source = GitHub Actions.
- User: not happy with the design or the logo; wants the zhuojia look (not a copy, not its header), a one-page landing site with downloads, everything else kept in the repo as the brain, and an interactive "neural network" map of the whole portfolio that Claude can use in every project.
- Built: `brain/brain.mjs` + `graph.json` + `BRAIN.md` (336 nodes, 575 edges); the landing page; the network page (Network and Flow layouts, search, filters, details, pulses); the datum-symbol logo (`brand/datum-icon.svg`, `brand/datum-mark.svg`). Removed the app, family and about pages.
- Checked: build without a token; Playwright at 1280 and 375 px, light and dark, no overflow, no console errors; every image loads; network search (help.tsx), selection panel, Flow layout and mobile checked by screenshot.

### 2026-10-25: Session 3 (logo and hero)
- User: the logo's three app colours do not scale to more apps; wants a generalized, unique, vector-style symbolic D, used everywhere. And a new page header: illustrations placed around it as on the reference site, some text, small animations, not the same as before.
- Built: the protractor D (`brand/datum-icon.svg`, `brand/datum-mark.svg`, `Mark.astro`, favicon); `site/src/components/HeroField.astro` (10 tiles: Plan Gantt with growing bars, caliper with a sliding jaw, scrolling signal, Plot curve drawing itself, gears, Atlas bubbles with a marching selection line, flask with rising bubbles, turning molecule, two dashed "more to come"); rotating headline; the header strip now says "3 apps · more to come".
- Checked: build; Playwright at 1280, 1440 (dark) and 375 px: no overflow, no console errors, tiles clear of the wordmark; the phone strip scrolls.

### 2026-10-25: Session 4 (the user's logo, a simple technical hero)
- User: sent their own logo ("Continuum", `brand/source/datum-continuum-original.svg`) and asked to improve on it and use it everywhere; more branding guidance to follow. The hero must be simple: two panels, writing on the left (big "Datum", a write-up that changes with the animation), animated icons on the right; no "free · open source · Windows" line; professional and techy, not artistic, not like the reference sites. Reminded that this repo is the hub memory every new app plugs into.
- Built: `brand/` (logo, light logo, mark, light mark, icon, BRAND.md, generator); `Mark.astro` and `Logo.astro`; header and footer use the logo; `HeroPanel.astro` replaces `HeroField.astro`; site type is IBM Plex only; figures strip under the hero; app names, releases and the closing section in plain headings; screenshots flat.
- Checked: build; Playwright at 1280 (light), 1440 (dark) and 375 px at several points of the cycle (Plan, Plot, Atlas, Next): no overflow, no console errors.

### 2026-10-25: Session 5 (the workbench hero)
- User: the instrument panel loaded slowly, could not be clicked, and looked empty while fading; bring back the rotating blue "Tools to …" line and the small animated icons, but in the right pane, playable, not like the reference sites. Logo and the rest unchanged. Asked to look at other sites for ideas: a web search turned up hover-reactive grids, cursor spotlights and tiles linked to text (Framer / 21st.dev components), used as ideas only.
- Built: `HeroWorkbench.astro` (tiles reuse the session 3 drawings; animations run only on the active tile; the origin dial's needle points at it; the phrase swaps with a short slide); `HeroPanel.astro` removed; CLAUDE.md hero rule updated.
- Checked: build; Playwright: the bench cycles idle, hover on Science takes over ("run experiments."), holds while hovered, resumes after; 1280, 1440 (dark), 375 px: no overflow, no console errors.

### 2026-10-26: Session 8 (live site 404)
- User: the live site showed a 404. Cause: Pages › Source is still "Deploy from a branch", so every push runs two deploys, ours (the built site) and GitHub's branch build (the raw repo, no index.html at the root). Since `.nojekyll` (session 2) the branch build succeeds, and whichever finishes last wins; on the merge push it finished 5 s after ours.
- Fixed: re-ran our workflow by hand (restores the site), and `pages.yml` now waits for the branch build of the same commit before deploying (needs `actions: read`), as the user's zhuojia site does. The real fix is still Settings › Pages › Source = GitHub Actions.

### 2026-10-26: Session 7 (bucket list)
- Brainstorm of future free, open-source apps (§7). The user asked how Calc and Tolerance relate to a commercial maths worksheet and to Plot: Calc is that category (formulas and units → design values and a calc sheet), Plot analyses measured data, Tolerance is a separate small tool. Decided: **Datum Calc is next**. FEA: worth it as a long-term flagship grown in steps from Datum Frame, using open solvers for the heavy work; not next.
- The brain now reads §7 as "idea" nodes.

### 2026-10-26: Session 6 (capability bench, scroll features, theme)
- User (screenshots of the live site): the Analysis wave and the Atlas bubbles misbehaved; the hero did not define our work; no app counts; changing text in the session 3 italic; light/dark not working; smaller app cards with light animations and changing text; remove "Download an app…", the network teaser and the network page title; only the latest release per app; look at Artcraft. Asked to brainstorm first; agreed: capability tiles, all three theme options, no figures strip, status badges, Artcraft-style scroll and glass.
- Causes: the wave's CSS clip used the wrong box; the bubbles' pop animation replaced their SVG rotation. The theme script worked, but the cycling button looked dead.
- Built: new tiles and fixes in `HeroWorkbench.astro`; three-button theme control (Header, Base script); `.it`, glass bars, `.reveal`, `.words`, rail and scroll marker (site.css, index.astro); compact app cards with status badges; `statusOf`, `latestPerApp` (github.ts).
- Checked: build; Playwright: theme auto/dark/light/auto, hover Statistics → "compare groups.", rail and scroll % follow the sections; 1280/375 light and dark, home and network: no overflow, no errors.

## 6. Known limits

- Without `GITHUB_TOKEN` (local builds) the release API may be rate-limited; versions then come from the CHANGELOG and Download goes to `releases/latest`.
- The site updates once a day after an app release until the `repository_dispatch` step is added to the apps.
- `brain/graph.json` in the repo is as fresh as the last `node brain/brain.mjs`; the website rebuilds the graph itself every day.
- The network page carries the whole graph (about 300 kB of HTML before compression).

## 7. Bucket list (future apps)

Brainstormed with the user on 2026-10-26 (session 7). Ideas only until the user starts one; a new app follows FAMILY §12. Each must reuse the family (Rust engine, grid, formulas, units, print, updater) and connect to the other apps.

| Name | What it does | For | Reuses / connects | Size | Status |
| --- | --- | --- | --- | --- | --- |
| Datum Calc | Engineering calculation sheets with real units, shown as readable maths, with references, pass/fail checks and a printable calc sheet. Plot analyses measured data; Calc designs what you build | Every engineer | GridCraft formulas, units (Atlas), print, Plot for charts | Medium (the hard part is natural equation editing; 0.1 = units-aware lines, variables, checks, PDF) | **Next** (the user's choice) |
| Datum Tolerance | Tolerance stack-ups: worst case, RSS, Monte Carlo, datum chain, contributor ranking, GD&T helpers | Design and manufacturing engineers | Monte Carlo (Plan 0.4), charts, print; maybe a module of Calc | Small | Later |
| Datum Hub (app) | One launcher that installs and updates every Datum app, recent files across apps, "open with" | Everyone with more than one app | update.rs, apps.json, the brain | Small | Later (when there are more apps) |
| Datum Lab | Local lab notebook: test plans, specimens, instrument data import, send results to Plot | R&D labs, materials testing | Plot, Atlas, grid | Medium | Later |
| Datum Inspect | Quality: inspection and test plans, measurement reports, non-conformances, control charts, Cp/Cpk, certificates as PDF | QA/QC, suppliers, manufacturing | Plot statistics, print | Medium | Later |
| Datum Frame | 2D beam, frame and truss analysis: loads, supports, shear/moment, deflection, section properties, materials from Atlas | Structural and mechanical engineers, students | Own Rust FEM solver, Atlas | Medium | Later (first step of Datum Sim) |
| Datum Flow | Pipe pressure drop, pump and compressor sizing, performance curves, open fluid property data | Process and mechanical engineers | Units, charts | Medium | Later |
| Datum Estimate | Cost estimating: quantities, rates, contingency, cost curves, feeding costs into Plan | Estimators, contractors, PMs | Grid, formulas, Plan | Medium | Later |
| Datum Sim (FEA) | Simulation grown in steps: 1 Frame (beams, own solver) → 2 2D plane stress/axisymmetric/heat (own solver) → 3 3D linear static and modal with STEP import (OpenCascade, Gmsh, own solver or CalculiX) → 4 nonlinear, contact, coupled physics (Code_Aster/Elmer as external solvers). Datum builds set-up, results and reports; mature open solvers do the heavy solving as separate processes (clean licensing). A built-in verification report (benchmarks passed) is a headline feature | Mechanical, structural and thermal engineers | Atlas materials, Plot results, print | Very large (steps 1–2 fit our way of building; 3–4 are a multi-year journey) | Long-term flagship |
| Datum Draft | 2D technical drawings: parametric sketches, dimensions, title blocks, DXF | Engineers, drafters | Print | Large | Long-term |
| Datum Phase | Phase diagrams, kinetics, heat-treatment curves | Materials scientists | Plot (Arrhenius), Atlas | Large | Long-term |
| Datum Signal | Vibration and sound: FFT, filters, spectrograms, order analysis (may graduate out of Plot) | Test engineers | Plot | Medium | Long-term |
| Datum Report | Technical reports: numbered equations, live figures from Plot/Atlas/Calc, references, PDF | Engineers, researchers | Calc, Plot, print | Medium | Long-term |
| Datum Risk | Risk registers, FMEA, bow-ties, shared Monte Carlo | PMs, safety and reliability engineers | Plan, Tolerance | Medium | Long-term |

Family-level ideas: shared crates (`datum-units`, `datum-print`, `datum-grid`, `datum-montecarlo`) so a new app gets them with one line; cross-app files (an Atlas material into Frame, Lab data into Plot, an Estimate into Plan); worked-example packs for students and lecturers.

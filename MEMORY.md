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

| App | Repo (default branch) | Accent | Version (2026-10-29) | `docs/site.json` |
| --- | --- | --- | --- | --- |
| Datum Plan | `Edgar-Mendonca/Datum-Plan` (`claude/fervent-keller-ddas5s`) | Blue `#0B5CAD` | 0.4.2 | ✅ |
| Datum Plot | `Edgar-Mendonca/Datum-Plot` (`claude/epic-mayer-6faugf`) | Teal `#0E8C7F` | 0.2.23 | ✅ |
| Datum Atlas | `Edgar-Mendonca/Datum-Atlas` (`claude/bold-volta-90lu2c`) | Violet `#6C4AB6` | 0.2.0 | ✅ |
| Datum Sim | `Edgar-Mendonca/Datum-Sim` (`claude/dreamy-babbage-dyf9nr`) | Orange `#C2410C` | 0.1.2 | ✅ |
| Datum Calc | `Edgar-Mendonca/Datum-Calc` | Amber `#A8650F` | 0.1.6 | ✅ |
| Datum Mesh | `Edgar-Mendonca/Datum-Mesh` | Crimson `#B83250` | 0.1.3 | ✅ |
| Datum Pipe | `Edgar-Mendonca/Datum-Pipe` | Moss `#4D7C0F` | 0.1.4 (2026-10-28) | ✅ |

`apps.json` uses `"branch": "HEAD"`, so the site follows whatever each repo's default branch is.

**Datum Home** (`home/` in this repo, accent: the family navy and logo) installs, updates, opens and removes the apps. **0.1.0 released 2026-10-28** (`home-v0.1.0`: `DatumHome-0.1.0-setup.exe`, 2.1 MB, + SHA256SUMS.txt); **0.1.1** (session 14) adds Calc and Mesh to its built-in list and icons; **0.1.2** (session 18) adds Pipe; **0.1.3** (session 20) reads every release from the site's home.json, so opening it asks GitHub nothing; **0.1.4** (session 21) publishes as "Datum" and accepts both publisher names.

## 2. The site and the brain

```
home/                     Datum Home (README.md there): crates/core (rules, tested), src-tauri (main.rs commands and downloads, sys.rs registry/processes), ui (SolidJS)
  release: tags home-vX.Y.Z → .github/workflows/home-release.yml (installer + SHA256SUMS.txt, then rebuilds the site); home-ci.yml checks it
brain/
  brain.mjs               the brain generator (no dependencies): FAMILY, MEMORY, apps.json + each app's MEMORY, CHANGELOG, site.json → nodes and edges
  graph.json              its output, committed (node brain/brain.mjs); schema in BRAIN.md
site/
  astro.config.mjs        site https://edgar-mendonca.github.io, base /Datum; a build:done hook writes the screenshots into dist/apps/<id>/
  src/lib/github.ts       app data: site.json, CHANGELOG.md, logo, releases, up to four screenshots (→ 1440 px WebP), about and steps (site.json, else apps.json); fallbacks; the product-name filter (NAMES)
  src/lib/brain.ts        the brain for the site: public scrub (NAMES), degrees, a d3-force layout computed at build time
  src/styles/site.css     tokens (paper and ink, app accents, light/dark), type (Archivo wdth, IBM Plex, Instrument Serif), frame, bars, buttons, header, footer
  src/layouts/Base.astro  head, the theme script (Auto/Light/Dark), header, footer
  src/components/         Mark, Logo, Header, Footer, Hero (four app tiles + the changing phrase), AppGlyph (one animated drawing per app), Rail (index by the ruler + scroll marker)
  src/pages/index.astro   the landing page: hero, 01 apps (cards → app pages), 02 the method, 03 the newest release of each app
  dist/home.json          written after the build (copyShots): every app with name, repo, accent, tagline, logo and newest release; Datum Home reads it
  src/pages/apps/[id].astro  one page per app: hero with its drawing and download, Overview (about + 3 steps), What it does, Screens, Roadmap, Releases, Get it, previous/next
  src/pages/network.astro the Datum network: canvas stage, search, filters, Network/Flow layouts, details panel, the graph as a list
  src/scripts/network.ts  the network client (d3-force, canvas, pointer/pinch/wheel, pulses along links)
```

Data flow, per app in `apps.json`:
- `raw.githubusercontent.com/<repo>/HEAD/docs/site.json` → tagline, for, highlights, screenshots, roadmap. Missing → the `apps.json` fields (name, accent, tagline, for, shot).
- `CHANGELOG.md` → versions and summaries; the figures and the latest-releases list.
- `api.github.com/repos/<repo>/releases` (with `GITHUB_TOKEN` in Actions) → latest version, date, installer URL and size. If the API fails, the newest CHANGELOG section is used and Download links to `releases/latest`.
- `docs/MEMORY.md` → the brain (Files, Decisions, Roadmap, Session log, How we work, the product table's Stack).

Deploy: on push to the default branch, hourly at :17 (was daily until session 12), `workflow_dispatch`, and `repository_dispatch` type `app-released`. **Settings › Pages › Source must be GitHub Actions**; with "Deploy from a branch" GitHub runs Jekyll on the raw repo and fails on the `.astro` files (`.nojekyll` at the root now stops that, but the site only deploys through Actions).

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
| 2026-10-28 (s10) | **Datum Sim joins the family**: in `apps.json`, icon in `brand/`, orange `#C2410C` added to FAMILY §1 and §3; the hero's "Reports" tile becomes Sim's "Control loop"; the network places any number of apps round the hub (anchors and lanes from apps.json) | Requested from the Datum Sim chat after its 0.1.0 release (the user pasted it here). |
| 2026-10-27 (s9) | **Datum Sim is the next app** (system simulation and control design), ahead of Datum Calc; **Datum Field** is the name for the future FEA/CFD/multiphysics app, parked | The user: two big apps in the long run; Sim first. "Sim" now means system simulation; FEA is Field. |
| 2026-10-27 (s9) | Briefs for new apps live in the hub's `briefs/` (DATUM-SIM.md, DATUM-FIELD.md) and are pasted into the new app's chat | The hub is the memory every new app starts from. |
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
| 2026-10-29 (s17) | **Safety rules for every app's shell** and **hostile values** join the hardening standard (FAMILY §11): unwind + guard + crash.log, atomic saves and read limits, an updater that requires checksums, the CSP baseline, CSV formula guard, npm audit; a battery that runs every engine function on impossible values | Datum Plan 0.4.2's audit found real faults with these: release builds aborted on any panic, the updater installed unverified when a release had no checksum file, calendar arithmetic panicked on huge spans, century-long plans froze the S-curve, and the CSP silently blocked progress-report photos. |
| 2026-10-29 (s17) | Apps may ship a command line and an MCP server for AI assistants, changing documents only through the engine's named operations and saving only when asked (Datum Plan's `datum-cli`) | One way to change a document; safe for scripts and assistants. |
| 2026-10-28 (s15) | In SolidJS, a `<select>` whose options load later marks `<option selected>` rather than setting `value` on the select (it showed the first option) | Found in Datum Plan 0.4.1; applies to every app's window (FAMILY §7). |
| 2026-10-28 (s14) | **Every import is a parity check**: an app that opens files carrying their own results (dates, values) recomputes them and lists the differences in an import report, alongside what it changed or left out | Datum Plan 0.4.0; it reuses the parity-test code, so users see the same check the tests run. |
| 2026-10-28 (s13) | **Trust in the results** joins the hardening standard (FAMILY §11): hand-worked cases for the engine's core rules (expected values worked out before running), parity files that carry their own results (drop in real exports from other tools), and random-input checks of the rules themselves, not only "no panic" | Datum Plan 0.3.12: the hand-worked cases and the random link check found two real scheduling mistakes (ALAP used total float; late dates of work under way used the whole duration). |
| 2026-10-27 (s9) | **Hardening standard for every app** (FAMILY §11): hardening tests (failed edits change nothing, random documents, damaged files, speed gate), `cargo deny`, CI on Windows + macOS, poisoned-lock recovery, SECURITY.md and CONTRIBUTING.md. First shipped in Datum Plan 0.3.11; rustfmt is not enforced | A quick look at another open-source scheduler showed our apps lead on features but trail on rigour (tests, CI gates). In Plan the new tests found two real crashes on damaged P6 files on their first run. |
| 2026-10-25 | Datum Plot's bundled Python is recorded in FAMILY §2 as the one exception to "no Python" | Plot's own decision (its MEMORY, session 1); the guide must not contradict a shipped app. |
| 2026-10-28 (s11) | **Hero = four app tiles** (`Hero.astro` + `AppGlyph.astro`: Gantt, curve fit, property chart, control loop, looping gently) around the amber datum square, replacing the 3×3 workbench; the italic phrase cycles by itself (two phrases per app), hover holds, leaving resumes. **One page per app** (`/apps/<id>`); `about` and `steps` added to the site.json spec (FAMILY §10), with fallbacks in apps.json | The user: the bench was too much; four animated icons for the current apps are enough; each app needs a page that explains the software. |
| 2026-10-28 (s12) | **Datum Home**, a desktop app in this repo (`home/`) that installs, updates, opens and removes every Datum app; checks only when opened; the site offers it and each app on its own. List from the site's `home.json`, versions from each app's GitHub releases, installed apps from HKCU Uninstall; installs only installers from the app's own releases that match `SHA256SUMS.txt`; uninstall keeps the user's files; updates itself from `home-v*` releases | The user: one place to install and update all the apps, without forcing it on people who want one app. Kept in the hub so the family's own tools live together; the release shape it relies on is in FAMILY §9. |
| 2026-10-28 (s13) | **Datum Calc and Datum Mesh are built this week** for a large engineering convention. "Datum Field" is renamed **Datum Mesh** (clear to every engineer; covers stress, heat and later flow). Accents: Calc = Amber `#A8650F`, Mesh = Crimson `#B83250` (the two spares). Mesh 0.1 is 2D only (frames, trusses, plane stress/strain, heat) with an own solver and a verification report; 3D/CFD later with open solvers as separate programs. Briefs pre-answer every question so the app chats build at once | The user: Calc and Mesh fit their work best (process, rotating equipment, mechanical, project controls, inferred from the apps' worked examples); the convention needs both this week. |
| 2026-10-28 (s16) | **Datum Pipe** (pipe stress analysis) is the next app, built in one overnight run from `briefs/DATUM-PIPE.md`; accent **Moss** `#4D7C0F` (new, FAMILY §3). Codes: implement published equations only, allowables are user inputs pre-filled with typical values; never claim certification. Commercial piping software is never named anywhere (repo, briefs, memory, site), at the user's explicit request | Session 15 research found no open-source pipe stress tool; the user has used the commercial ones for years and finds them expensive and hard to use. |
| 2026-10-29 (s19) | **No shared code kit for now: every app stays self-contained.** Shared pieces (shell, ribbon, File page, updater, printing, styles, icon set, units engine, solver parts) keep being **copied** from the reference app, never linked. When a shared piece is fixed or improved in one app, that app's chat records it in this hub (FAMILY or MEMORY), and the user passes it to the other apps' chats. Reference copies: shell, updater, print, icons → Datum Plan; units → Datum Calc; frame/sparse solver → Datum Mesh; Python runtime → Datum Plot | The user: a shared kit could break every app at once; separate apps are safer. Revisit only if drift becomes a real cost. The graph stays the map of what exists where. |
| 2026-10-29 (s20) | **Datum Home reads releases from the site, not GitHub.** home.json (written by the hourly site build, which has a token) carries each app's newest release with installer, checksum list and notes, and Datum Home's own (`home`). Home calls the GitHub API only for an app the site does not cover, or for its own update if the site has none | Users saw "GitHub is busy (rate limit)": unauthenticated API calls are limited to about 60 an hour per network, and Home made one per app plus one for itself on every open. A release now reaches Home within the hour (or at once: run Pages). |
| 2026-10-29 (s21) | **The Windows publisher of every app is "Datum"** (`bundle.publisher` in `tauri.conf.json`), not the author's name; the copyright line keeps the author ("© 2026 Edgar Mendonca"), who holds it. Datum Home accepts both publisher names, so apps installed earlier are still recognised | The user: Settings › Apps showed their name for every app; it should show the brand. Home went first (0.1.4) so no app is ever missed during the switch. |
| 2026-10-29 (s22) | **Datum Schema** (intelligent P&IDs and process flow diagrams) is the eighth app, for the exhibition; name chosen over "Datum P&ID" (the & breaks file and repo names; "PID" means the controller in Sim; P&ID is narrower than the app) and "Flowsheet"; tagline names P&IDs. Accent **Magenta** `#9C1F84` (FAMILY §3). Bench (DAQ) waits: it depends on hardware and is too risky for a one-day build | Session 15 research: no open-source P&ID tool with proper symbols; an open P&ID data standard (DEXPI) exists with no free desktop app. Schema's edge over a drawing: data, connectivity, checks, lists and hydraulics, plus links to Pipe and Sim. |

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
| Hardening standard (FAMILY §11) in every app: Plan ✅ 0.3.11 + 0.3.12 + 0.4.2 (worked cases, parity files, hostile values, shell safety rules); the other apps 🔜 (in their chats) | 🔜 |
| Plan's next steps (its MEMORY §5 "Hardening plan"): 0.3.12 trust in the dates (more tests, parity sample plans, hostile-file tests), 0.4.2 command line + named commands + MCP | ⬜ (in Plan's chat) |
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

### 2026-10-29: Session 17 (from Datum Plan's chat: 0.4.2, hardening, command line, print)
- Plan 0.4.2: a full security and robustness pass (see decisions), `datum-cli` with an MCP server and a catalogue of named operations, costs exact to the cent, and Schedule Risk / Look-ahead / Manpower printing as themselves (they printed the Dashboard). Its roadmap's next stage is 0.5 (schedule quality and scenarios).
- Recorded here: FAMILY §11 (hostile values, safety rules for every shell), two decisions, Plan at 0.4.2. Other apps should adopt the new safety rules in their own chats. Brain regenerated.

### 2026-10-28: Session 15 (from Datum Plan's chat: 0.4.1, progress history)
- Plan 0.4.1 shipped actual S-curves through the stored periods, earned schedule (SPI(t), finish at this pace), Manpower by trade (planned / done / forecast), rules of credit and installed quantities, and a look-ahead with a constraint log. Its roadmap's next stage is 0.4.2 (command line and automation).
- Recorded here: Plan at 0.4.1, the `<select>` rule (§3 and FAMILY §7). Brain regenerated.

### 2026-10-29: Session 22 (Datum Schema brief)
- User needs an eighth app for next week's exhibition; asked Bench vs P&ID, and what a P&ID app adds over plain CAD. Research: intelligent P&IDs carry data per item (automatic line/equipment/instrument/valve lists, integrity checks) and only expensive plant suites do it; the open DEXPI standard (OPC 30250) has an open Python model (pyDEXPI) but no free desktop app. Recommended the P&ID app (visual, links Pipe, Sim and Calc) over Bench (hardware risk).
- Name: **Datum Schema** (user's choice). Copyright question answered (keep "© Edgar Mendonca": MIT needs an owner; Datum is a brand, not a legal entity).
- Wrote `briefs/DATUM-SCHEMA.md`: decisions up front (magenta accent, `.dschema`, publisher "Datum", layout, own symbols following ISO 10628-2 / ISA-5.1), ~80 symbols, data on everything, 13 live checks, line hydraulics, four lists, PDF/SVG/DXF, three examples + "Find the faults", tests, a 7-step day plan (0.1.0 → 0.1.4), cut order, roadmap (DEXPI, send to Pipe/Sim, PFD stream tables, loop diagrams). FAMILY §3: Magenta. Bucket list: Flowsheet → Schema.
- **Hub tasks when Schema releases:** apps.json (schema #9C1F84; `--schema` #9C1F84 / dark #E07BC9), icon to brand/, AppGlyph "schema" (classes never `g-schema`!), phrases ("draw P&IDs.", "check the plant."), the hero then has eight tiles: the 3×3 bench is full (no "More to come"), FAMILY §1, README, Datum Home built-in list, brain.

### 2026-10-29: Session 21 (publisher "Datum")
- User (screenshot of Windows Settings › Apps): every Datum app lists "Edgar Mendonca" as publisher; wanted "Datum". The value is `bundle.publisher` in each app's `tauri.conf.json`.
- Datum Home 0.1.4: its own publisher "Datum"; `core::PUBLISHERS` = ["Datum", "Edgar Mendonca"] so installs from both eras are found (test added). FAMILY §9 says the publisher is "Datum". Gave the user paste-in text for the seven app chats (change publisher, keep copyright, release).
- Note for code signing later: the signing certificate names its legal owner; Windows then shows that name in security prompts, separately from this field.

### 2026-10-29: Session 20 (Datum Home: no more rate-limit errors)
- User (screenshot): Datum Home showed "GitHub is busy (rate limit)" on every card. Cause: GitHub allows about 60 unauthenticated API calls an hour per network (shared by everyone behind one connection); Home made eight per open, and the apps' own updaters add more. The versions shown were still right (the site's copy).
- Fix (Home 0.1.3): `core::installable`, `core::parse_home`; `catalog` also returns the site's copy of Home's release; `card` skips GitHub when the site's release is installable; `home_update(site)` uses the site's copy first. Site: home.json gains `home` (Home's newest release with SHA256SUMS) and release notes per app (the CHANGELOG section as plain text). New core test `site_copy_of_releases`.
- Not changed: each app's own in-app updater still asks GitHub once at start (one call per app opened; fine in practice). If that ever shows the same message, the apps can read home.json too (paste-in text for their chats).
- Checked: core tests (10), clippy Linux and Windows target, UI check and build, site build with home.json.

### 2026-10-29: Session 19 (brainstorm: the brain, AI and shared code)
- User: is the network a neural network that can be "trained" as Datum's brain, and could an AI assistant use it? Answer: `brain/graph.json` is a knowledge graph (facts and links, rebuilt hourly, exact, explainable), not a neural network; training our own model would be costly, imprecise and stale. The right pattern is retrieval: the graph and docs hold the facts, an existing language model reads and answers with citations. Ideas (not started): an "ask the brain" tool for the app chats; offline help search shared by the apps; later an opt-in assistant (local model or the user's own key), citing sources and never producing engineering numbers itself (results only from the tested engines). Privacy promise (no telemetry) rules out a default cloud assistant.
- User: is code and icon reuse real? Answer: decisions come from the hub, code is copied from the reference apps (not rewritten), the graph is the map. Proposed a shared kit (crates + UI package + one icon library in the hub); **the user declined for now**: separate apps are safer (decision above).

### 2026-10-29: Session 18 (Datum Pipe joins the family)
- Session 17 (brainstorm, no files): a data-acquisition, control and test app (the user used a graphical DAQ tool for control and ADC work). Recommended a **separate app, "Datum Bench"**, not part of Sim: real-time I/O, drivers, logging, alarms and safety are a different engine from simulated time; share Sim's block canvas, scopes and Python; hardware in the loop joins them later. Hardware first: microcontroller boards over serial (with a small Datum firmware), Modbus RTU/TCP, bench instruments over USB/LAN, the sound card; front panel, logging, triggers, calibration, PID with interlocks; vibration analysis (the old "Signal" idea) as a module. After Pipe 0.1 and the 1.0s. Not yet in the bucket list (add it with the user's go-ahead).
- Session 18: Datum Pipe released 0.1.4 overnight from `briefs/DATUM-PIPE.md` (site.json, icon, SHA256SUMS in releases). Hub: apps.json (pipe #4D7C0F), brand icon, `--pipe` (#4D7C0F / dark #A3D65C), AppGlyph "pipe" (a pipe run with an expansion loop between anchors, guides, the deflected shape drawing itself in moss, the loop corners highlighted, "SE/SA 0.74"). Bug found and fixed: a class named `g-pipe` collided with the SVG's own `g-<id>` class and faded the whole drawing; glyph classes must never be `g-<app id>`.
- **Hero for seven apps:** a 3×3 bench: seven app tiles, the Datum mark in the centre cell and "More to come" in the last place (`nine` mode; up to six apps keep the earlier layouts; phones show two columns without the centre cell). Lead mentions pipe stress analysis. FAMILY §1, README (row, issue link, briefs line), CLAUDE.md (repos, hero rule), MEMORY §1 versions refreshed.
- Datum Home 0.1.2: Pipe in its built-in list with its icon; released with the workflow.
- Checked: site build (seven apps), Playwright 1280/375, light and dark (home, Pipe and Calc pages, network): no overflow; Pipe drawing still and animated; Home core tests, clippy, UI build.

### 2026-10-28: Session 16 (Datum Pipe brief)
- Session 15 (brainstorm, no files): researched where engineers, students and researchers lack free tools. Already covered by open source: process simulation, statistics and SPC, chromatography, load flow. Real gaps: pipe stress analysis (none), reliability GUI (Weibull, RBD, FMEA, RCM), P&ID with data, shell-and-tube thermal design, vibration/condition monitoring, DOE with a window, control valve sizing, pressure vessels (copyrighted codes), rotor dynamics GUI. Recommended Pipe, Reliability, Flowsheet, and more Calc packs; maturity (1.0s) before quantity.
- Session 16: the user chose **Datum Pipe** and asked for a brief for an overnight run: a 0.1 with many features that "looks like an app". Wrote `briefs/DATUM-PIPE.md` (no commercial names): element table + 3D view, pipe library, bends/tees/reducers/rigids, linear supports, three operating cases, automatic SUS/OPE/EXP/HYD cases, the process piping code equations, results on the model, support and nozzle loads, automatic isometric drawing, stress report, six examples, eight benchmarks; releases 0.1.0 → 0.1.4 in seven steps; cut order; roadmap 0.2–1.0. FAMILY §3: Moss accent for Pipe. Bucket list: Pipe, Reliability, Flowsheet.
- **Hub tasks when Pipe releases** (as for Calc and Mesh): apps.json (pipe #4D7C0F; site.css `--pipe` #4D7C0F / dark #A3D65C), icon to brand/, an AppGlyph drawing (a pipe run with an expansion loop growing, coloured by stress), phrases ("analyse piping.", "check pipe stresses."); **the hero then has seven tiles**: decide the layout (four columns, or 3×3 with a "more to come" tile and the datum square in the centre); FAMILY §1, README, Datum Home built-in list (next Home release), brain.

### 2026-10-28: Session 14 (from Datum Plan's chat: 0.4.0, risk and resources)
- Plan 0.4.0 shipped Schedule Risk (Monte Carlo: P50/P80/P90 finish and cost, criticality, drivers, risk-register delays, optimistic/pessimistic durations), workload by trade (resource Group) in hours or people, a levelling preview, and an import report that compares every task's dates with the file. Its `docs/site.json` now has a Schedule Risk screenshot third, so the app page shows it.
- Recorded here: decision (§3), FAMILY §7 chart rules (`autoSkip: false` on horizontal bars; `<Index>` for numbers), Plan at 0.4.0. Brain regenerated.

### 2026-10-28: Session 14 (Calc and Mesh join the family)
- Both apps were built in their own chats from the session 13 briefs: Calc 0.1.3 and Mesh 0.1.1, each with docs/site.json (about, steps), icons, and releases with SHA256SUMS.txt.
- Hub: apps.json (calc #A8650F, mesh #B83250; fallback about/steps); icons copied to brand/; `--calc` (#8E550C light text, #F0B450 dark) and `--mesh` (#B83250, #EF7A93) in site.css; AppGlyph drawings (Calc: equation lines typing in, result in the accent, a PASS badge and a 0.82 utilisation bar; Mesh: an L-bracket meshed in triangles, shaded by stress peaking at the inner corner, fixed edge and a load arrow); the hero is six tiles in three columns (two on phones) with phrases "write calculations. / check designs." and "analyse stresses. / mesh parts."; the lead names calculations and finite-element analysis. FAMILY §1 rows, README table and issue links, CLAUDE.md (repos, hero rule), MEMORY §1.
- Datum Home 0.1.1: Calc and Mesh in its built-in list with icons (home.json already listed them); released with the workflow.
- Checked: site build (six apps), Playwright 1280/375 light and dark, home, both app pages and the network: no overflow; Home: core tests, clippy, UI build.

### 2026-10-28: Session 13 (from Datum Plan's chat: 0.3.12, trust in the dates)
- Plan 0.3.12 shipped hand-worked scheduling cases (47), parity files with their own dates (`crates/core/tests/parity`, hand-made XML and XER; real exports can be dropped in), random plans with constraints and calendars (links hold, tight forward pass, row order), random edit sequences and damaged CSV/Excel. They found and fixed two scheduling mistakes (ALAP; late dates of work under way).
- Recorded here: FAMILY §11 gains "trust in the results", decision (§3), roadmap row, Plan at 0.3.12. Brain regenerated.

### 2026-10-27: Session 9 (from Datum Plan's chat: the hardening standard)
- In Plan's chat the user asked for a quick comparison with another open-source scheduler, then for the quick wins and for everything to be recorded here too. Plan 0.3.11 shipped the Dashboard and date-picker fixes and the hardening quick wins; its new tests found two crashes on damaged XER files (cut-off calendar text, a WBS that loops) on their first run.
- Recorded here: the hardening standard (FAMILY §11 and the new-app checklist step 7), the decision (§3), roadmap rows (§4), Plan at 0.3.11 (§1). Regenerated the brain.

### 2026-10-28: Session 13 (brainstorm: Calc and Mesh for the convention)
- User: which new apps fit best, given four apps and their skills? Ranked: Calc (every engineer; calc packs in the user's field), Flow (pumps, pipes, compressors; start as Calc packs), Signal (vibration for rotating equipment), Field/FEA (Frame first). Naming: keep Calc; Field → Mesh (or keep Field) for the mesh-based family.
- User picked **Datum Calc and Datum Mesh**, both this week, for a big convention of engineers and vendors; asked for everything in writing for two new chats and repos.
- Wrote `briefs/DATUM-CALC.md` and `briefs/DATUM-MESH.md` (decisions made up front, scope, architecture, day-by-day week with releases 0.1.0 → 0.1.4, cut order, benchmarks/tests, docs, roadmap). Removed `briefs/DATUM-FIELD.md` (its long road is §8 of the Mesh brief). FAMILY §3: Amber → Calc, Crimson → Mesh. Bucket list and decision updated.
- **Hub tasks when each app releases 0.1.0** (the user will ask here): add it to `apps.json` (calc #A8650F, mesh #B83250; dark accents #F0B450 and #EF7A93 in site.css as `--calc`/`--mesh`) and copy its icon to `brand/`; draw its `AppGlyph` (Calc: an equation building up with units and a PASS badge; Mesh: a bracket meshing then filling with a stress contour); the hero becomes six tiles (3×2) and the cycle gains their phrases ("write calculations.", "check designs."; "analyse stresses.", "mesh parts."); Datum Home's built-in list (next Home release; home.json already covers them); FAMILY §1 rows; README table rows; regenerate the brain.
- Convention extras offered: a QR code to the site, a one-page printed handout, demo files.

### 2026-10-28: Session 12 (Datum Home)
- User: a launcher to install, update and uninstall all the apps; is it possible? Brainstormed first (how it works, trust, SmartScreen, size). Answers: name **Datum Home**; build it **in this repo**, foldered properly; **check when opened** (no tray); the site offers **both** Datum Home and the single apps.
- Built `home/` (0.1.0): `datum-home-core` (catalog, versions incl. `home-v` tags, releases, `download_ok`, `checksum_for`, DisplayIcon/UninstallString parsing, the card's action; 9 tests), `src-tauri` (catalog from home.json or built-in; per-app newest release; install = download to temp + SHA-256 + `/S`, refused while the app runs; uninstall = the app's uninstaller `/S`, then wait until the registry entry is gone; open; open_url limited to Datum pages; self-update like Plan's updater), `ui` (cards in each app's accent, Update all, confirm before uninstall, notes, light/dark from the system). Icons from `brand/datum-icon.svg`.
- Site: `home.json` written after the build; `loadHome()` reads this repo's `home-v*` releases; a Datum Home band above the app cards (Get Datum Home, or "Coming soon" until released). Workflows `home-ci.yml` (ubuntu + windows) and `home-release.yml` (tag `home-v*`; rebuilds the site after).
- Docs: README (Datum Home, home/ folder), FAMILY §9 (the release shape Datum Home relies on), CLAUDE.md (home/ rules and checks).
- Checked: core tests; clippy on Linux and on the Windows target (mingw); UI type check and build; the window in Chromium with mocked data, light and dark; the site build and home.json.
- Released: the first run of home-release.yml failed (`cargo test --workspace` compiled the Tauri shell before `ui/dist` existed); it now tests only `datum-home-core` before `tauri build`. Run 2 published `home-v0.1.0` and rebuilt the site. To release later: Actions › "Datum Home release" › Run workflow (or push a `home-v…` tag).
- Next: try install/update/uninstall on a real PC.
- Later (same day): the user saw old versions in "Latest releases". Not a bug: the apps had released after the last site build, and the site only rebuilt daily or on a hub push. The build log now prints, per app, the version shown, its source (GitHub release or CHANGELOG) and the newest CHANGELOG entry; the Pages schedule is now **hourly** (`17 * * * *`). Make sure every app's release has `SHA256SUMS.txt` (they copied Plan's release.yml).

### 2026-10-28: Session 11 (app pages, simpler hero, README)
- User (screenshot of the hero): the README is out of date; one page per app explaining the software; the hero should be just four animated vector icons for the current apps; the changing text keeps changing by itself; everything in the Datum style.
- Built: `Hero.astro` (four tiles, one per app, linking to its page; the amber datum square where they meet; the phrase cycles every 2.6 s through two phrases per app and lights its tile) and `AppGlyph.astro` (the four drawings, 6 s loops, complete at rest); `HeroWorkbench.astro` removed. `pages/apps/[id].astro` (sections numbered by what the app has). `Rail.astro` shared by both pages. github.ts reads `about`, `steps` and up to four screenshots; apps.json has fallback `about` and `steps` for every app. Home cards link to the app pages ("About Plan →"); the footer's Apps column links them; the header's Apps is current on app pages. The scroll marker no longer shows below 1440 px.
- README: Datum Sim row, names link to the app pages, the dead /about badge link fixed, Sim issues link. FAMILY §10: `about` and `steps`. CLAUDE.md: the new hero and app pages.
- Plot and Atlas have published docs/site.json (their chats did it after session 10's paste-in text).
- Checked: build; Playwright 1280 and 375, light and dark, home, every app page and the network: no horizontal overflow.
- Next: give each app chat the paste-in text to add `about` and `steps` to docs/site.json and to link its README to its page on the site.

### 2026-10-28: Session 10 (Datum Sim joins the family)
- The Datum Sim chat (after its 0.1.0 release) asked, through the user: add Sim to apps.json (id sim, accent #C2410C, tagline "Model and simulate dynamic systems: block diagrams, control and motors."), copy its icon into brand/, add the orange accent to FAMILY §3, regenerate the brain.
- Done, plus: FAMILY §1 row and intro; `--sim` in site.css (dark `#F08A5D`); the bench's "Reports" tile replaced by Sim's "Control loop" (step response, "Tools to simulate control loops."); the lead mentions system simulation; the network's cluster anchors and lanes now come from apps.json (any number of apps), with Sim's dark accent.
- Checked: build; Playwright on home and network.

### 2026-10-27: Session 9 (Datum Sim and Datum Field)
- User: two big apps for the long run: one for all kinds of finite-element analysis, simulation and CFD, and one for system simulation and control design. Names agreed: **Datum Sim** (systems in time: block diagrams, control, physical components) and **Datum Field** (physics on a mesh: FEA, heat, CFD, multiphysics). Sim is built now; Field is parked with its future stack recorded.
- Wrote `briefs/DATUM-SIM.md` (the complete brief for the new chat: read the hub, Plan and Plot; architecture; Rust and Python libraries with licences; release plan 0.1–1.0; quality bar; docs; questions) and `briefs/DATUM-FIELD.md` (scope, steps, open-source stack, risks). Bucket list updated: Sim started, Calc after Sim, Field parked.
- Next: the user creates `Edgar-Mendonca/Datum-Sim`, opens a new chat and pastes `briefs/DATUM-SIM.md`; after Sim's first release, add it to `apps.json` here.

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
- `brain/graph.json` in the repo is as fresh as the last `node brain/brain.mjs`; the website rebuilds the graph itself every hour.
- The network page carries the whole graph (about 300 kB of HTML before compression).

## 7. Bucket list (future apps)

Brainstormed with the user on 2026-10-26 (session 7); updated in session 9 (Datum Sim started, Datum Field named and parked) and session 13 (Calc and Mesh, formerly Field, built this week; ranking: Calc, Flow as Calc packs then its own app, Signal, Mesh). Ideas only until the user starts one; a new app follows FAMILY §12. Each must reuse the family (Rust engine, grid, formulas, units, print, updater) and connect to the other apps.

| Name | What it does | For | Reuses / connects | Size | Status |
| --- | --- | --- | --- | --- | --- |
| Datum Calc | (Released, in `apps.json` since session 14.) Engineering calculation sheets with real units, shown as readable maths, with checks (pass/fail), solve and plot regions, calc packs in the user's field (pumps, pipes, compressors, heat exchangers, vessels, beams, bolts, motors) and a printable calc sheet. Plot analyses measured data; Calc designs what you build. Brief: [briefs/DATUM-CALC.md](briefs/DATUM-CALC.md) | Every engineer | Plan's formula engine, units, print, Chart.js; Atlas materials (0.2) | Medium | **Being built (session 13)**: 0.1.x this week, amber accent |
| Datum Pipe | (Released 0.1.4, in `apps.json` since session 18.) Pipe stress analysis: 3D routing (element table + 3D view), pipe library, supports, operating cases, automatic load cases, the process piping code equations (hoop, minimum wall, sustained, expansion range), support and nozzle loads, an automatic isometric drawing, a stress report and a verification report. Own 3D pipe-beam solver (from Mesh). Brief: [briefs/DATUM-PIPE.md](briefs/DATUM-PIPE.md) | Piping, stress, mechanical, process and plant engineers, consultants, students | Mesh solver, Calc units, Atlas materials, Plan shell | Large overall; 0.1 = one overnight run | **Released** (session 18), moss accent |
| Datum Reliability | Weibull and life data, reliability block diagrams, FMEA, RCM (session 15 research: no free GUI tool exists) | Reliability, maintenance and quality engineers | Plot statistics, Plan Monte Carlo | Medium | Idea (session 15) |
| Datum Schema (was "Flowsheet") | Intelligent P&IDs and process flow diagrams: our own symbols (ISO 10628-2 / ISA-5.1 conventions), data on every item and line, connectivity, live checks (13 rules), line hydraulics (velocity, ΔP, limits), line list, equipment list, instrument index, valve list, PDF/SVG/DXF, CSV/Excel. Brief: [briefs/DATUM-SCHEMA.md](briefs/DATUM-SCHEMA.md) | Process, chemical, mechanical, piping and instrument engineers, students | Sim's canvas, Calc's units and pipe ΔP, Pipe's size library, Plan's shell and Excel export | Medium; 0.1 = one unattended run | **Being built (session 22)**, magenta accent |
| Datum Tolerance | Tolerance stack-ups: worst case, RSS, Monte Carlo, datum chain, contributor ranking, GD&T helpers | Design and manufacturing engineers | Monte Carlo (Plan 0.4), charts, print; maybe a module of Calc | Small | Later |
| Datum Hub (app) | One launcher that installs and updates every Datum app, recent files across apps, "open with" | Everyone with more than one app | update.rs, apps.json, the brain | Small | Later (when there are more apps) |
| Datum Lab | Local lab notebook: test plans, specimens, instrument data import, send results to Plot | R&D labs, materials testing | Plot, Atlas, grid | Medium | Later |
| Datum Inspect | Quality: inspection and test plans, measurement reports, non-conformances, control charts, Cp/Cpk, certificates as PDF | QA/QC, suppliers, manufacturing | Plot statistics, print | Medium | Later |
| Datum Flow | Pipe pressure drop, pump and compressor sizing, performance curves, open fluid property data | Process and mechanical engineers | Units, charts | Medium | Later |
| Datum Estimate | Cost estimating: quantities, rates, contingency, cost curves, feeding costs into Plan | Estimators, contractors, PMs | Grid, formulas, Plan | Medium | Later |
| Datum Sim | Model and simulate dynamic systems: block diagrams (signals), control design (linearise, Bode, root locus, PID tuning), physical components (mechanical, electrical, hydraulic, thermal), sweeps, Monte Carlo, fitting to measured data, FMU exchange. Rust engine and solvers; bundled Python (python-control, sympy, CasADi, FMPy, …) for analysis. Brief: [briefs/DATUM-SIM.md](briefs/DATUM-SIM.md) | Control, mechanical, electrical, process and mechatronics engineers, researchers, students | Plan's network canvas, Plot's Python runtime and graphs, Atlas materials, units, print | Large (0.1 within weeks) | **Released 0.1.0** (2026-10-28) and in `apps.json` (session 10) |
| Datum Mesh (was Datum Field) | (Released, in `apps.json` since session 14.) Finite-element analysis on the desktop, grown in steps: 0.1 2D frames, trusses, plane stress/strain and heat conduction with an own Rust solver (T6 triangles, spade meshing, faer) and a built-in verification report → axisymmetric, modal, buckling → 3D with STEP → nonlinear and contact → CFD → multiphysics (open solvers as separate programs). Brief: [briefs/DATUM-MESH.md](briefs/DATUM-MESH.md) | Mechanical, structural, process and aerospace engineers, students | Plan's canvas, Sim's solver and verification layout, Atlas materials, Calc hand checks, Plot CSV | Very large overall; 0.1 = medium | **Being built (session 13)**: 0.1.x this week, crimson accent |
| Datum Draft | 2D technical drawings: parametric sketches, dimensions, title blocks, DXF | Engineers, drafters | Print | Large | Long-term |
| Datum Phase | Phase diagrams, kinetics, heat-treatment curves | Materials scientists | Plot (Arrhenius), Atlas | Large | Long-term |
| Datum Signal | Vibration and sound: FFT, filters, spectrograms, order analysis (may graduate out of Plot) | Test engineers | Plot | Medium | Long-term |
| Datum Report | Technical reports: numbered equations, live figures from Plot/Atlas/Calc, references, PDF | Engineers, researchers | Calc, Plot, print | Medium | Long-term |
| Datum Risk | Risk registers, FMEA, bow-ties, shared Monte Carlo | PMs, safety and reliability engineers | Plan, Tolerance | Medium | Long-term |

Family-level ideas: shared crates (`datum-units`, `datum-print`, `datum-grid`, `datum-montecarlo`) so a new app gets them with one line; cross-app files (an Atlas material into Frame, Lab data into Plot, an Estimate into Plan); worked-example packs for students and lecturers.

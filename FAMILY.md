# The Datum family: one design and one way of working

The Datum apps are free, open-source desktop tools for engineers, scientists, researchers and analysts: small, fast Windows apps that do serious technical work. **Datum Plan** (project scheduling) is the first, **Datum Plot** (data analysis and graphs) the second, **Datum Atlas** (materials selection and property charts) the third, and **Datum Sim** (system simulation and control design) the fourth. Every app looks, feels and ships the same way; only the accent colour and the logo glyph change.

This file is the single source for that. It lives in the DATUM repo (`Edgar-Mendonca/Datum`); each app keeps a short `docs/FAMILY.md` that links here. Datum Plan's code is the reference implementation: copy from it rather than reinventing anything. Section numbers are stable, so "FAMILY §3" means the same thing everywhere.

## 1. The apps

| App | What it is for | Accent | Logo glyph | Files | Identifier | Repo |
| --- | --- | --- | --- | --- | --- | --- |
| Datum Plan | Plan, schedule, track and report projects | Blue `#0B5CAD` (glyph `#2F6FCF`) | Calendar with bars + amber diamond | `.dplan` | `com.edgarmendonca.datumplan` | Edgar-Mendonca/Datum-Plan |
| Datum Plot | Analyse data and make publication-ready graphs | Teal `#0E8C7F` | Axes, points, fitted curve + amber diamond | `.dplot` | `com.edgarmendonca.datumplot` | Edgar-Mendonca/Datum-Plot |
| Datum Atlas | Choose materials with property charts and selection indices | Violet `#6C4AB6` | Log–log axes, family bubbles, index line + amber diamond | `.datlas` | `com.edgarmendonca.datumatlas` | Edgar-Mendonca/Datum-Atlas |
| Datum Sim | Model and simulate dynamic systems: block diagrams, control and motors | Orange `#C2410C` | A feedback loop: summing node, tinted block with a settling step response, feedback path + amber diamond | `.dsim` | `com.edgarmendonca.datumsim` | Edgar-Mendonca/Datum-Sim |
| Datum Calc | Engineering calculations with real units, readable maths, checks and a printable calc sheet | Amber `#A8650F` | See `brand/datum-calc-icon.svg` + amber diamond | `.dcalc` | `com.edgarmendonca.datumcalc` | Edgar-Mendonca/Datum-Calc |
| Datum Mesh | Finite-element analysis: stresses, deflections and temperatures in parts and frames | Crimson `#B83250` | A meshed L-bracket with its stressed corner + amber diamond | `.dmesh` | `com.edgarmendonca.datummesh` | Edgar-Mendonca/Datum-Mesh |
| Datum Pipe | Pipe stress analysis: displacements, support and nozzle loads, code stresses, automatic isometric | Moss `#4D7C0F` | A pipe run with an expansion loop and an anchor + amber diamond | `.dpipe` | `com.edgarmendonca.datumpipe` | Edgar-Mendonca/Datum-Pipe |
| Datum Schema | Intelligent P&IDs and process flow diagrams: objects with data, connectivity, checks, lists, line hydraulics | Magenta `#9C1F84` | A vessel, a line with a valve and an instrument bubble, a pump + amber diamond | `.dschema` | `com.edgarmendonca.datumschema` | Edgar-Mendonca/Datum-Schema |
| DATUM (hub) | The family site, memory and brain | Navy `#0C1A2B` | "Continuum": two concentric D's drawn as one line, with the amber datum square where it starts ([brand/BRAND.md](brand/BRAND.md)) | — | — | Edgar-Mendonca/Datum |
| Next apps | — | pick from §3 | — | `.d<name>` | `com.edgarmendonca.datum<name>` | Edgar-Mendonca/Datum-<Name> |

The registry the site builds from is [`apps.json`](apps.json).

## 2. Stack (the same in every app)

- **Rust + Tauri 2** desktop shell (`src-tauri`), Windows first (NSIS per-user installer, WebView2).
- **Engine in a pure-Rust crate** (`crates/core`): all calculation lives there, with unit tests. The window only shows what the engine computes.
- **UI: SolidJS + Vite + strict TypeScript** in `ui/src/*.tsx`, built to `ui/dist` (embedded at compile time). State in `ui/src/store.ts`. Plain CSS with tokens (no CSS framework).
- **Charts:** Chart.js in the family chart style (see §7). An app may add its own SVG plot engine for publication graphs, but must keep this look.
- **Spreadsheet formulas:** the GridCraft crates (pinned git dependency, attribution in NOTICE) where the app needs them.
- **Sheets inside an app** (from Datum Plan 0.5.0) behave like a spreadsheet through GridCraft (references by clicking, suggestions, fill and paste that move references, insert and delete rows) and read the app's data by name: GridCraft tables and workbook names, not copied values. Countries show as flags from bundled SVGs (flag-icons, MIT), never emoji. Dashboards of the user's own (from Datum Plan 0.5.3) are tiles on a 12-column grid whose figures are formulas over the same names.
- **Several documents at once** (from Datum Plan 0.5.5): one tab per open document above the ribbon (a dot for unsaved changes, Ctrl+Tab, Ctrl+W, Save All on close, recovery for each). Links between documents keep the other file and the last known values, and change only when the user updates them.
- **No Python** inside the apps (size and second runtime). The one exception is **Datum Plot**, which bundles its own Python (numpy, SciPy, matplotlib) for statistics and graphs; the decision is recorded in Plot's `docs/MEMORY.md`.
- Small, compact code that matches the surrounding style.

## 3. Colour

### Base tokens (all apps, from `ui/src/styles.css`)
Light:

```
--bg #F2F3EF  --bg2 #FFFFFF  --panel #F8F8F5  --panel2 #ECEDE8  --side #F3F4F0
--line #D3D7D6  --line2 #E6E8E5  --line3 #B9BFC2
--text #0C1A2B  --text2 #3B4859  --muted #5B6878  --navy #0C1A2B
--amber #B7791F  --crit #C0392B  --green #1F7A4D
--ok-bg #DDF2E5 --ok-fg #1F7A4D  --warn-bg #FBEFD5 --warn-fg #8A5A00  --err-bg #FBE3E0 --err-fg #9B2C2C
```

Dark (`:root[data-theme="dark"]`): `--bg #0B1119 --bg2 #101823 --panel #0D141E --panel2 #16212E --line #223041 --text #E6EDF5 --muted #8D9AAB` (copy the full block from Plan).

### The accent set (the only tokens that change per app)
`--blue` (accent), `--blue2` (hover/dark), `--bar`, `--sky` (light tint), `--pale` (very light), `--sel`, `--sel2` (selection), and the File sidebar colour.

| Accent | `--blue` | `--blue2` | `--sky` | `--pale` | `--sel` | `--sel2` | dark `--blue` | File sidebar (dark) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Plan · Blue** | #0B5CAD | #0A4F96 | #9CC2F7 | #E8F0FA | #DCE8F7 | #B9D2F0 | #4C9BEA | #0A3D73 |
| **Plot · Teal** | #0E8C7F | #0B7468 | #8FD3C9 | #E3F5F2 | #D3EFEA | #A9DDD4 | #3FC2B2 | #0A4A44 |
| **Atlas · Violet** | #6C4AB6 | #5A3C9C | #C9B8EE | #F0EBFA | #E5DCF6 | #CDBDEE | #A58BEA | #3A2766 |
| **Sim · Orange** | #C2410C | #A3360A | #F6C3A5 | #FCEEE6 | #F9E0D1 | #F0C2A6 | #F08A5D | #5C220A |
| **Calc · Amber** (Datum Calc, from session 13) | #A8650F | #8E550C | #F2CF8E | #FBF2E2 | #F6E7CB | #EBD09E | #F0B450 | #5A3A0C |
| **Mesh · Crimson** (Datum Mesh, from session 13) | #B83250 | #9C2944 | #F1B3C1 | #FBEBEF | #F6DCE3 | #EDBAC7 | #EF7A93 | #5E1A2A |
| **Pipe · Moss** (Datum Pipe, from session 16) | #4D7C0F | #3F6212 | #BEDC8F | #F1F7E6 | #E4F0CF | #CBE2A4 | #A3D65C | #2A420A |
| **Schema · Magenta** (Datum Schema, from session 22) | #9C1F84 | #801A6C | #EAB6DD | #FAEBF6 | #F4DCEE | #E7B9DB | #E07BC9 | #4E1043 |

Keep `--crit` red, `--green` and `--amber` for meaning (critical/error, done/ok, warning/highlight) in every app, whatever the accent.

Teal text on the light background is below 4.5:1, so text and filled buttons on Plot's light theme use `--blue2` (`#0B7468`). The hub site does this with an `--ink` token.

## 4. Type

- **IBM Plex Sans** for text, **IBM Plex Mono** for uppercase spaced labels, tabs, buttons, numbers and IDs (`@fontsource`, Latin subsets only, about 200 kB).
- Group captions, card headings and buttons: Plex Mono, 9.5–11 px, `letter-spacing: .1em`, uppercase.
- Body 12–13 px; page titles 23 px, 600–700 weight.
- Tables and grids: 12–13 px; numbers right-aligned.

## 5. Logo and branding

- **Tile:** 256×256 viewBox, a rounded square (`x=8 y=8 w=240 h=240 rx=56`), a white→accent-tint diagonal gradient, and a 4 px border in a light accent tint.
- **Glyph:** drawn in the accent with **11 px strokes**, round caps. It may use one light tint fill (the `--sky` colour). It always has **one amber `#F2B233` diamond** (the family mark).
- Files: `ui/public/logo.svg` (in the app) and `docs/brand/datum-<app>-icon.svg` (README). Windows icons are generated from it (`npx tauri icon`). Copies of every icon, and the family mark, are in this repo's [`brand/`](brand).
- **The family mark** ("Continuum", designed by the user): two concentric D's drawn as one continuous line, with the amber `#F2B233` datum square where the line starts. Navy `#0C1A2B` (or light `#E6EDF5`) ink only, never an app colour, so it stays right however many apps the family has. Files, construction and rules: [brand/BRAND.md](brand/BRAND.md) (`datum-logo.svg`, `datum-mark.svg`, `datum-icon.svg` and light versions).
- **Name:** "Datum <App>" in Plex Sans 600. Tagline in the README.
- **README:** the logo, the name, a one-line tagline, shields.io badges (release, CI, downloads, license MIT, platform Windows 10/11, Rust, Tauri 2, SolidJS), then for-the-badge buttons (Download for Windows · What's new · Memory & roadmap), then a screenshot.

## 6. Window layout

- **Title bar:** quick access (save, undo, redo, print), document name, "Tell me what you want to do" (Ctrl+K), a Theme button (Auto/Light/Dark).
- **Ribbon:** a FILE button in the accent, then tabs. Groups have a mono uppercase caption. Big buttons have an icon above the label; split buttons have the command on top and the menu on the bottom ▾. Contextual tabs carry a small label above them. The ribbon never scrolls sideways: it tightens, then folds groups from the right (icons only).
- **Left sidebar:** icon + mono label per view, with **Setup** first. Groups are separated by rules.
- **File page (backstage):** a sidebar in the accent colour (Home, New, Open, Import, Save, Save As, Export, Print; Options and Updates at the bottom).
  - Home: template tiles, recent files, a Roadmap tile, and the updates card. The card has Check again with a spinner and the time it checked, and the GitHub, Releases and Report an Issue buttons.
- **Status bar:** Ready, key facts, view switches, zoom.
- **Options page:** sections (General, Start-up and saving, New <documents>, Printing and branding, Updates). Each option has a name plus a one-line hint on the left and the control on the right.
- **Help tab:**
  - Getting Started: written for people coming from other tools, in plain words;
  - Glossary: plain-language terms, searchable;
  - Shortcuts, Tell Me, What Is This Tool?;
  - the GitHub links.
- **? help beside the tools:** a small ? beside each ribbon group, page, panel and main dialog opens a card (what it is for, how to use it) from one `HELP` table in `ui/src/help.tsx`.

## 7. Components

- **Controls:** square corners, 1 px lines, no heavy shadows. Buttons are Plex Mono uppercase (`.btn`, `.btn.pri` filled accent, `.btn.sm`).
- **Menus:** icons in the tick column, keyboard hints on the right, submenus to any depth, close on an outside click.
- **Dialogs:** a title bar with ×; OK/Cancel at the bottom right; Enter = OK, Esc = Cancel.
- **Grids (spreadsheet-like):**
  - one scroller with a sticky header and frozen key columns;
  - range selection (drag, Shift, Ctrl, whole rows and columns, Ctrl+A);
  - Sum/Average/Count in the formula bar;
  - TSV clipboard that pastes into any spreadsheet;
  - a fill handle with series (Ctrl copies);
  - Paste Special (Ctrl+Alt+V);
  - Font/Alignment formatting (Ctrl+B/I/U);
  - a date picker on date cells.

  Reuse Plan's `selection.ts`, `cells.ts` and `fmt.ts`.
- **Toasts:** bottom left; green for success.
- **Empty states:** say what the view is for and offer the first action.

### Icons
24×24 viewBox, in one SVG sprite in `ui/index.html` (`<use href="#i-name">`).
- Line style: `stroke="currentColor"`, `stroke-width 1.6–1.8`, round caps and joins.
- At most one light accent fill (`#9CC2F7` in Plan; use the app's `--sky`).
- Red `#C0392B` only for delete or critical; green `#2E9D57` for done or ok; amber for highlight.
- One icon per meaning (no duplicates).

### Charts (the family chart style)
Chart.js:
- white plot area, thin axes, no heavy gridlines;
- Okabe-Ito colour-blind-safe series colours (`#0072B2 #E69F00 #009E73 #D55E00 #CC79A7 #56B4E9 #F0E442 #000000`);
- a crosshair tooltip;
- a PNG button on every chart; charts printable;
- horizontal bar charts name every bar (`autoSkip: false`);
- a `<select>` whose options load later marks the chosen `<option selected>` instead of setting `value` on the select (found in Datum Plan 0.4.1);
- hand-drawn SVG charts over plain numbers use SolidJS `<Index>`, not `<For>` (`<For>` reuses nodes by value, so equal values keep stale positions; found in Datum Plan 0.4.0).

## 8. Printing

- File › Print (Ctrl+P) shows settings on the left and a live page preview on the right, for **every view**.
- The settings: paper, orientation, scaling or fit-to-pages, margins, page ranges, header and footer (left/centre/right) with codes and logos, legend, and view options.
- Pages are drawn as SVG at real size and printed with the WebView dialog ("Save as PDF").
- Report-type pages print as flowing documents with the header and footer on every page and page numbers.
- Reuse Plan's `print.tsx` (`Frame`, `Slot`, codes).

## 9. Updates and releases

- **Updater:** `src-tauri/src/update.rs`.
  - Set `REPO` to the app's repo. It checks GitHub releases at start, and beta versions when turned on.
  - It downloads the installer, checks SHA256SUMS and installs.
  - The CHANGELOG section becomes the in-app "What's new".
- **Versions:** small numbered releases (0.1.0, 0.1.1, …), always three numbers (the updater compares three), consecutive with no jumped numbers.
- **Release workflow** (`.github/workflows/release.yml`, `windows-latest`):
  - builds the UI and the app and creates the tag;
  - publishes `Datum<App>-x.y.z-setup.exe` + `SHA256SUMS.txt`.
  - Run it with workflow_dispatch when tag pushes are blocked.
- **CI** (`ci.yml`, ubuntu): clippy `-D warnings`, `cargo test --workspace`, `npm run check:ui`, the Playwright UI tests.
- Options and recovery files in the app's data folder (`com.edgarmendonca.datum<app>`).
- **Datum Home** (`home/` in DATUM) installs and updates every app from one window. It relies on this release shape: a per-user NSIS installer named `Datum<App>-x.y.z-setup.exe` that accepts `/S`, a `SHA256SUMS.txt` beside it, the Windows display name equal to the app's name in `apps.json` ("Datum Plan") and the publisher **"Datum"** (`bundle.publisher` in `tauri.conf.json`; apps released before 2026-10-29 used "Edgar Mendonca", which Datum Home still accepts). A release without `SHA256SUMS.txt` is never installed by Datum Home.
- **The family site** rebuilds every hour and on every push to DATUM, so a release appears there within the hour (or at once: run the "Pages" workflow in DATUM).

## 10. Docs in every repo

- `CLAUDE.md`: read MEMORY first; update it at the end of every session; the user's preferences; the checks; the release steps.
- `docs/MEMORY.md`: product table, architecture (files), decisions (version | decision | why), roadmap (✅ 🔜 ⬜), session log, known limits, and the "How we work" workflow.
- `CHANGELOG.md`: `## x.y.z — date`, a one-line summary, then bold sections in plain language for users. The site shows the last five sections.
- `docs/site.json`: the app's public summary, read by the family site at build time and by File › Roadmap in the app:

  ```json
  {
    "id": "plan", "name": "Datum Plan", "accent": "#0B5CAD",
    "logo": "docs/brand/datum-plan-icon.svg",
    "tagline": "…", "for": "…",
    "about": ["One or two plain paragraphs: what the app is and how it helps."],
    "steps": [{ "title": "Enter the tasks", "text": "…" }, { "title": "…", "text": "…" }, { "title": "…", "text": "…" }],
    "highlights": ["…"],
    "screenshots": ["docs/images/gantt.png"],
    "roadmap": [{ "v": "0.3.11", "title": "Fixes", "when": "Next", "items": ["…"] }]
  }
  ```

  `when` is one of **Next**, **Soon**, **Later**, **Goal**. Screenshots are 1440×900 PNGs in `docs/images/`; the app's page on the site shows the first four. `about` and `steps` (three steps: how the app is used) fill the Overview of the app's page (`/apps/<id>`); until an app sets them, the hub's `apps.json` supplies them.
- **The brain:** DATUM's `brain/graph.json` is generated from these files (`node brain/brain.mjs`); keep the MEMORY tables (Files, Decisions, Roadmap, Session log, How we work) in the same shape so it can read them.
- `docs/PLAN-x.y.md`: feedback → diagnosis → proposal → size → questions, written before any big release.
- `NOTICE` for third-party code and fonts; MIT license.

- **The guide** (from Datum Plan 0.4.4): `docs/guide/<lang>.md` (English, and other languages users need; Datum Plan has Simplified Chinese) with screenshots in `docs/guide/img/` (numbered orange markers, made by a script from the real window), built to PDF by `scripts/guide.cjs` (cover, contents, figures, page numbers; Noto Sans SC for Chinese), attached to every release as `Datum<App>-Guide-<lang>.pdf` and listed in `SHA256SUMS.txt`. In the app, **Help › Guide** and a File-page tile download the version's guide, verify it against the checksums, save it in Downloads and open it; nothing is bundled in the installer. Translations keep the English UI names in bold with the meaning in brackets.

## 11. How we work (from Datum Plan)

1. The user reviews a release and sends screenshots.
2. Reproduce first.
3. Big asks get a plan file and questions; build after the answers.
4. Engine first (with a test), then the UI.
5. Check every change in the real app (Xvfb screenshots).
6. Add a UI test for every bug.
7. Run all checks: clippy `-D warnings`, `cargo test` (with the hardening tests below), the UI type-check and UI tests, `cargo deny check`.
8. Release.
9. Report in plain language: what changed, what was checked, what is not done.

**Hardening standard (every app, from Datum Plan 0.3.11).** Each app's engine has a `hardening` test module that proves:
- a failed edit leaves the document exactly as it was;
- random documents (a small built-in generator, no extra crate) never panic and keep their invariants;
- damaged files for every reader (cut short, garbled bytes, loops) never panic: they open or give a clear error;
- a speed gate on a large document (a looser limit in debug builds).
- **trust in the results** (from Datum Plan 0.3.12): hand-worked cases for each core rule, with the expected values worked out before running (`cases.rs`); parity files that carry their own results, checked value by value (`tests/parity`, where real exports from other tools can be dropped in); random-input checks of the rules themselves (for Plan: every link holds, no task starts later than its links need, row order does not matter), and random sequences of edits.

- **hostile values** (from Datum Plan 0.4.2): a battery that runs every engine function the window or a script can reach (`exercise`) on documents with deliberately impossible values (huge or negative spans, zero-length units, year 1 and year 9999, non-finite numbers, IDs at their maximum) and on extreme edits. Loading clamps such values (`normalize`), and date and time arithmetic saturates at a horizon instead of unwrapping past the end of the date range.

**Safety rules for every app's shell** (from Datum Plan 0.4.2):
- release builds `panic = "unwind"`; edits, opening, importing and long analyses run inside a `guard()` that turns a panic into an error message, and a panic hook appends to `crash.log` in the app data folder;
- every save (documents, autosave, recovery, settings, exports) is atomic: write a temporary file next to the target, `sync_all`, then rename; every file read has a size limit;
- the updater installs nothing without `SHA256SUMS.txt`, matches the installer's line exactly, accepts only `*-setup.exe` names of safe characters, downloads into a new private folder and caps the size;
- the window's CSP: `default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; frame-ancestors 'none'`, images `'self' data: blob:` (blob: is needed to resize pictures in the window); only Tauri's core permissions;
- links open only to the app's own GitHub pages (an exact prefix plus plain URL characters);
- CSV exports prefix `'` to text starting with `=`, `+`, `-` or `@` (unless a plain number);
- CI also runs `npm audit --omit=dev --audit-level=high`.

Plus: `deny.toml` + `cargo deny check` (advisories, licences, sources) and `license = "MIT"` in every crate; CI runs `cargo test` on Windows and macOS as well as Linux; the shell's state lock recovers from a poisoned mutex; `SECURITY.md` and `CONTRIBUTING.md` in the repo. rustfmt is not enforced (the code keeps its compact hand style).

## 12. Starting a new Datum app (checklist)

1. Create the repo `Edgar-Mendonca/Datum-<Name>` (MIT).
2. Copy the skeleton from Datum Plan:
   - the workspace `Cargo.toml`, `crates/core` (empty engine), `src-tauri` (main, update.rs, tauri.conf);
   - `ui/` (index.html with the icon sprite, styles.css, store.ts, ui.tsx, help.tsx, ribbon/backstage/options/print/roadmap patterns);
   - `package.json`, `.github/workflows`, `tests_ui/run.cjs`, `CLAUDE.md`, NOTICE, LICENSE.
3. Rename: product name, identifier, file extension, `REPO` in update.rs, installer name in release.yml.
4. Apply the accent set from §3 and draw the logo per §5; copy the icon into DATUM `brand/`.
5. Write `docs/MEMORY.md` and `docs/PLAN-0.1.md` (brainstorm and questions) before building features.
6. Release 0.1.0 (shell, updater, Home, one working view) so the updater works from day one.
7. Add the hardening standard (§11): the `hardening` tests, `deny.toml`, the Windows/macOS CI jobs, SECURITY.md and CONTRIBUTING.md.
8. Publish `docs/site.json` (§10) and add one line to DATUM's `apps.json`; the site picks the app up on its next build.

## 13. Principles and public words

**Datum: free, open-source desktop tools for engineers, scientists, researchers and analysts.** Small, fast apps that do serious technical work, written from scratch in Rust, with one look and one way of working. No accounts, no subscriptions, no telemetry: your files stay on your computer.

- **Small and fast.** Quick to install; opens in a moment; smooth with large files.
- **Private.** Files stay on the user's computer. The only network call is the update check.
- **Built for real technical work.** Each app has its own engine in a pure Rust crate, with tests.
- **One design.** The same window, ribbon, help, printing and updater in every app (§5–9).
- **Small releases.** One release is one small numbered version, shown in the in-app updater.
- **Written down.** Docs and memory are kept in every repo (§10).
- **Free forever.** MIT licence.

Rules for all public text (README, site, release notes, CHANGELOG):
- Describe what each app does and who it helps. **Never name or compare with commercial products**, and never say an app copies, clones or replaces one. Every Datum app has its own engine and its own design. (The family site leaves out any CHANGELOG or `site.json` line that names one, and lists it in the build log.)
- Say "free and open source (MIT)", "Windows first", "installs in seconds", "updates itself".
- Write plainly: short sentences, active verbs, no marketing filler. A visitor should know in ten seconds what each app is for.

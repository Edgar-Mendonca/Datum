# Datum Calc: brief (paste this into the new chat)

You are starting **Datum Calc**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Calc` (MIT licence). The user creates it and gives this session access.
- **What it is:** engineering calculation sheets. You type equations with real units; Datum Calc shows them as readable maths, works out the answers with units, checks them against limits (pass/fail), and prints a clean, referenced calc sheet.
- **Decided with the user (DATUM hub, session 13, 2026-10-28):** Calc and Datum Mesh are built **this week**, for a large engineering convention. The decisions below are made; **do not wait for answers before building**. Write the plan quickly, then build.

---

## 0. First hour: read, plan, then build

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read, in this order:
   - `CLAUDE.md`, `MEMORY.md` (decisions for every app; §7 is the bucket list)
   - `FAMILY.md`, the design guide every app follows: stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9, docs §10, how we work and the hardening standard §11, new-app checklist §12, public words §13
   - `brand/BRAND.md`; `brain/graph.json` with `brain/BRAIN.md` (how things were done before)
2. **The reference code.** Add `Edgar-Mendonca/Datum-Plan` read-only. It is the reference implementation: **copy, don't reinvent**. Take the ribbon, backstage (File page), Options, print (`print.tsx`), the updater (`src-tauri/src/update.rs`), `help.tsx` (the ? beside every tool), `roadmap.tsx` (reads `docs/site.json`), the workflows (`ci.yml`, `release.yml`), the UI tests and the hardening tests. **Plan's formula engine** (formula columns) is the starting point for Calc's parser and evaluator; read it first.
3. **Write** `CLAUDE.md`, `docs/MEMORY.md` (same shape as the other apps: product table, Files, Decisions, Roadmap, Session log, How we work) and a short `docs/PLAN-0.1.md` (the scope below, the day plan, risks). Then build.

---

## 1. Decisions already made

| Item | Decision |
| --- | --- |
| Name | Datum Calc |
| Accent | **Amber**, the spare accent in FAMILY §3: `#A8650F`, hover `#8E550C`, sky `#F2CF8E`, pale `#FBF2E2`, sel `#F6E7CB`, sel2 `#EBD09E`, dark `#F0B450`, File sidebar `#5A3A0C`. Keep `--amber` (warning) distinct: warnings in Calc use the warning colours with an icon, never the accent alone |
| Identifier, file, installer | `com.edgarmendonca.datumcalc`, `.dcalc` (JSON, versioned), `DatumCalc-x.y.z-setup.exe` + `SHA256SUMS.txt` (Datum Home needs both; FAMILY §9) |
| Stack | Tauri 2, SolidJS, strict TypeScript; engine in Rust `crates/core`. **No Python in 0.1** (smaller, faster to ship) |
| Maths rendering | KaTeX (MIT) in the window; the engine produces the LaTeX from its own expression tree, so what is shown is exactly what is computed |
| Ribbon tabs | Home · Insert · Math · Units · Check · View · Help (Format as a contextual tab on a selected region) |
| Logo | FAMILY §5 tile in amber; glyph: a square-root sign over an "x", with an "=" below, the amber diamond as the family mark. Copy to the hub's `brand/datum-calc-icon.svg` |

---

## 2. What Datum Calc does

**The worksheet:** a page (A4 or Letter, with margins) of regions placed top to bottom, evaluated in order, like reading a calc on paper.
- **Math region:** `Q = 120 m^3/h`, `H = 45 m`, `P = ρ*g*Q*H/η` → shown as maths; the result line `P = 18.4 kW`.
- **Text region:** headings, paragraphs, references ("Ref: Darcy–Weisbach, any fluid mechanics textbook").
- **Check region:** `check σ ≤ σ_allow` → a green PASS or red FAIL badge with both values, and a utilisation ratio (`0.82`).
- **Table region:** a small grid of inputs or results (reuse Plan's grid), with units per column.
- **Plot region:** a function or a vector against a range (Chart.js in the family chart style), e.g. a pump curve against the system curve.
- **Solve region:** find the x that makes f(x) = 0 within a range (Brent's method), e.g. the Colebrook friction factor or a pump operating point.
- **Image region:** a sketch or photo (paste or insert), for the free-body diagram.

**Units (the heart of it):**
- Every value carries dimensions (length, mass, time, temperature, current, amount, luminosity; plus angle as a dimensionless tag). Adding metres to seconds is an error shown in red on that line.
- SI with prefixes, and US/imperial: m, mm, in, ft; kg, lb; N, kN, lbf; Pa, kPa, MPa, bar, psi; J, kWh, BTU; W, kW, hp; °C, K, °F (absolute temperatures and differences handled correctly); m³/h, gpm, L/s; rpm, rad/s; and so on. About 200 units in 0.1.
- The result is shown in a chosen unit (`P = 18.4 kW`, click to change to hp); a sheet-wide unit system (SI, US) sets defaults.

**Maths:** + − × ÷, powers, roots, parentheses; sin/cos/tan with degrees or radians; ln, log, exp; min, max, abs, round; if(cond, a, b); vectors and ranges (`x = 0, 0.1 .. 10`); sum, mean; constants (g, π, e, R, σ); user functions (`f(x) = 3*x^2 + 2`); Greek letters and subscripts typed simply (`sigma_allow` → σ_allow).

**Calc packs (the convention demo):** a library of ready, checked sheets (File › New from pack), each citing its textbook or open standard, written in the user's field (process, rotating equipment, mechanical):
1. Pump power, efficiency and motor size
2. NPSH available against NPSH required
3. Pipe pressure drop (Darcy–Weisbach, Colebrook solved for the friction factor)
4. Pump curve against system curve: the operating point (plot + solve)
5. Compressor polytropic head and power (ideal gas)
6. Heat exchanger duty and LMTD
7. Thin-walled pressure vessel: hoop and longitudinal stress, required thickness check
8. Simply supported and cantilever beam: deflection and bending stress check
9. Bolt preload and tightening torque
10. Electric motor: current, power factor and starting current

Each pack has inputs at the top (highlighted), results and checks below, and a reference block. Every pack is also a test (§5).

**Printing:** the calc sheet as PDF (FAMILY §8): title block (project, calc number, title, by, checked, date, revision), page numbers "Page x of y", references at the end. This is what engineers hand in, so it must look professional.

**Exchange:** copy a result into Excel or another sheet; export the inputs and results table as CSV; read a material's properties from Datum Atlas (0.2).

**Who it's for:** every engineer who writes calculations: mechanical, process, structural, electrical, students and lecturers.

**Public words (FAMILY §13):** describe what Calc does ("engineering calculations with real units, as readable maths, with checks and a printable calc sheet"). Never name, compare with, or say it copies or replaces a commercial product, in any file, commit, release note or the site.

---

## 3. Architecture

**`crates/core` (pure Rust, unit-tested):**
- `units`: a dimension vector (7 SI base exponents + angle tag), a value = f64 × scale × dimensions, the unit table (name, symbols, factor, offset for °C/°F), parsing `kN*m`, `m^3/h`, `W/(m^2*K)`; conversion and simplification for display (pick the best named unit: N·m, kW, MPa).
- `parse`: the expression grammar (assignments, function definitions, ranges, units attached to numbers, comparison for checks), with precise error positions. Start from Plan's formula parser.
- `eval`: top-to-bottom evaluation with a symbol table; vectors; errors per region (never stop the whole sheet); `if`; user functions; built-ins.
- `solve`: Brent's root finding within a range; reports "no root in range" clearly.
- `latex`: the expression tree → LaTeX (fractions for `/`, roots, subscripts, Greek, units in roman type).
- `sheet`: the document (regions with positions, styles, the title block), `.dcalc` read/write with a format version and migrations, undo/redo as operations (like Plan's `doc.rs`).
- `packs`: the 10 calc packs as `.dcalc` files embedded in the binary.

**`src-tauri`:** commands (open, save, evaluate, export), the updater (`update.rs` with `REPO = "Edgar-Mendonca/Datum-Calc"`), print to PDF, recovery of unsaved work.

**`ui/`:** the family window (FAMILY §6–8): ribbon, File page, the page canvas with regions (click to edit as text, blur to render with KaTeX), a Variables panel (every name, value and unit), the ? help cards, Options (unit system, decimal places, number format), light/dark/auto.

---

## 4. The week (two releases before the convention)

| Day | Work | Release |
| --- | --- | --- |
| 1 | Read, plan, skeleton copied from Plan (renamed, amber accent, logo, updater, CI, release workflow) | **0.1.0**: shell, updater, Home, File page, an empty worksheet that saves and opens |
| 2 | Engine: units, parser, evaluation, LaTeX; 100+ unit tests | — |
| 3 | Worksheet UI: math, text and check regions; Variables panel; errors on the line | 0.1.1 |
| 4 | Solve and plot regions; table region; tables of units; print to PDF with title block | 0.1.2 |
| 5 | The 10 calc packs, each with its test; File › New from pack; screenshots, README, `docs/site.json` | **0.1.3** (convention build) |
| 6–7 | Fixes from trying every pack on a clean Windows PC; a "Getting started" sheet; polish | 0.1.4 |

Small consecutive releases through the in-app updater (FAMILY §9). If time runs short, cut in this order: image region, table region, plot region. **Never cut units, checks, packs or printing.**

---

## 5. Quality bar

- **Units:** a test for every unit's factor (against NIST's published values), every temperature conversion, dimension errors caught, and display choice.
- **Every calc pack is a test:** its results are compared with a hand calculation or a worked textbook example, written in the test with the source.
- **Parser:** fuzz-style hardening tests (FAMILY §11): random input never panics; damaged `.dcalc` files open as far as possible.
- **FAMILY §11 workflow:** engine first with a test; check in the real app (Xvfb screenshots); a UI test for every bug; all checks before every push: clippy `-D warnings`, `cargo test --workspace`, `npm run check:ui`, the Playwright UI tests, `cargo deny`.

---

## 6. Docs to keep (FAMILY §10)

- `CLAUDE.md`; `docs/MEMORY.md`; `CHANGELOG.md` (`## x.y.z — date`, plain language); `docs/PLAN-0.1.md`; `NOTICE` (KaTeX, fonts, crates); `LICENSE`; `SECURITY.md`, `CONTRIBUTING.md`.
- `docs/site.json` with `tagline`, `for`, `about`, `steps` (three: write the equations · check the results · print the calc sheet), `highlights`, `screenshots` (1440×900 PNGs in `docs/images/`: a pack open, the printed PDF, the units in action), `roadmap`.
- README per FAMILY §5, with a link to the app's page on the family site: `https://edgar-mendonca.github.io/Datum/apps/calc`.

**After 0.1.0 is released**, tell the user to tell the hub chat: "add Datum Calc to apps.json (id calc, accent #A8650F) and copy its icon". The hub then adds it to the site, the hero, the network and Datum Home's list.

## 7. Roadmap after the convention (for `docs/site.json`)

- 0.2 Materials from Atlas, more packs, inline unit conversion menus, symbolic simplify
- 0.3 Matrices and linear systems, ODE solve, tables from CSV
- 0.4 Programs (loops, conditions) inside a region, sheet templates, a company title block
- 1.0 Validation report (every pack against its reference), user guide, signed installer

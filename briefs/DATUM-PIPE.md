# Datum Pipe: brief (paste this into the new chat)

You are starting **Datum Pipe**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Pipe` (MIT licence). The user creates it and gives this session access.
- **What it is:** pipe stress analysis on the desktop. Route a piping system in 3D, put on its supports, temperatures and pressures, and Datum Pipe works out the displacements, support loads, equipment nozzle loads and code stresses, shows them on the 3D model and on an isometric drawing, and prints a stress report.
- **Decided with the user (DATUM hub, session 16, 2026-10-28):** the user is a piping and rotating-equipment engineer who has used the existing commercial tools for years and found them expensive and hard to use. Datum Pipe is the modern, clear, free alternative, built the Datum way from scratch.
- **This chat runs overnight, unattended.** Every decision below is made; **do not stop to ask questions**. Work through the plan in §5, release as you go, and leave a clear summary at the end. If something is unclear, choose the simplest sensible option, write it in `docs/MEMORY.md` (Decisions) and carry on.

---

## 0. First: read, plan, then build

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read:
   - `CLAUDE.md`, `MEMORY.md` (decisions for every app)
   - `FAMILY.md`, the design guide every app follows: stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9, docs §10, how we work and the hardening standard §11, new-app checklist §12, public words §13
   - `brand/BRAND.md`; `brain/graph.json` with `brain/BRAIN.md`
2. **The reference code** (read-only):
   - `Edgar-Mendonca/Datum-Plan`: **copy, don't reinvent**: ribbon, backstage (File page), Options, print, updater (`src-tauri/src/update.rs`), `help.tsx`, `roadmap.tsx`, the workflows (`ci.yml`, `release.yml` with `SHA256SUMS.txt`), UI and hardening tests.
   - `Edgar-Mendonca/Datum-Mesh`: its frame solver (beam stiffness, sparse assembly, `faer` solve, equilibrium check), its verification-report pattern and its model/undo layout. Datum Pipe's solver is the 3D version of it.
   - `Edgar-Mendonca/Datum-Calc`: its units engine (copy it; Pipe needs SI and US units everywhere).
   - `Edgar-Mendonca/Datum-Atlas`: materials data and how every value names its source.
3. **Write** `CLAUDE.md`, `docs/MEMORY.md` (same shape as the other apps: product table, Files, Decisions, Roadmap, Session log, How we work) and a short `docs/PLAN-0.1.md`. Then build.

---

## 1. Decisions already made

| Item | Decision |
| --- | --- |
| Name | Datum Pipe |
| Accent | **Moss** (new; add it to the hub's FAMILY §3 later): `#4D7C0F`, hover `#3F6212`, sky `#BEDC8F`, pale `#F1F7E6`, sel `#E4F0CF`, sel2 `#CBE2A4`, dark `#A3D65C`, File sidebar `#2A420A`. PASS/FAIL badges keep `--green`/`--crit` and always carry words, so they are never confused with the accent |
| Identifier, file, installer | `com.edgarmendonca.datumpipe`, `.dpipe` (JSON, versioned), `DatumPipe-x.y.z-setup.exe` + `SHA256SUMS.txt` (Datum Home needs both; FAMILY §9) |
| Stack | Tauri 2, SolidJS, strict TypeScript; **own solver in Rust** (`crates/core`); 3D view with three.js (MIT). No Python in 0.1 |
| Units | US (in, ft, psi, °F, lb, lbf·ft) and SI (mm, m, kPa/MPa/bar, °C, N, N·m); chosen per model, switchable at any time; every input and result carries its unit |
| Ribbon tabs | Home · Model · Loads · Supports · Analyze · Results · Isometric · View · Help |
| Logo | FAMILY §5 tile in moss; glyph: a pipe run with an expansion loop and one anchor symbol, drawn in 11 px strokes, the amber diamond as the family mark. Copy to the hub's `brand/datum-pipe-icon.svg` |
| Codes | Implement the published **equations** of the process piping code (ASME B31.3) for 0.1: hoop stress and minimum wall, sustained longitudinal stress, displacement stress range and its allowable. Never reproduce copyrighted tables or text. Allowable stresses are **user inputs** per material and temperature, pre-filled with typical values from public sources and marked "check against your code edition" |
| Public words | FAMILY §13: describe what Datum Pipe does. **Never name, compare with, or say it copies or replaces any commercial piping software**, in any file, commit, release note, help text or on the site. Standards may be named by number. Say "calculates using the equations of"; never "certified" or "compliant" |

---

## 2. What Datum Pipe 0.1 does

**Model the piping (the way piping engineers think):**
- An **element table** like a spreadsheet: From node, To node, DX, DY, DZ, pipe size, schedule, material, temperature and pressure case, plus the component on that element. Typing a row draws it in 3D at once. Node numbers step by 10 automatically (renumber command).
- A **3D view** (three.js): pipes as shaded cylinders at true diameter, insulation as a translucent sleeve, bends, tees, reducers, valves and flanges as recognisable shapes, support symbols, node labels; orbit, pan, zoom, fit, standard views (iso, plan, elevations); click to select, and the table follows.
- **Components:**
  - straight pipe;
  - bends: long (1.5D) and short (1D) radius, or custom, with mid-points;
  - welding tees and fabricated tees (reinforced or not);
  - concentric reducers;
  - valves and flanged joints as rigid elements with weight;
  - equipment nozzle points.
- **Pipe data library:** NPS ½" to 24" outside diameters and schedules (dimension tables are public facts), plus your own sizes. Corrosion allowance, mill tolerance, insulation thickness and density, fluid density, cladding.
- **Materials:** carbon steel, low-alloy, stainless 304/316, duplex. Each has modulus and thermal expansion versus temperature, and density, with sources (from Atlas where it has them). Allowable stresses (cold and hot) are user values, pre-filled with typical values.
- **Edit tools:** copy and mirror a section; insert a node; split an element; break a straight run into a loop (the expansion loop wizard: width and height); undo and redo everything.

**Loads and operating cases:**
- Up to **three operating cases** (T1–T3 temperatures, P1–P3 pressures), plus a hydrotest pressure.
- Weight: pipe, fluid, insulation, plus point and uniform extra loads.
- Imposed displacements at anchors and nozzles (equipment thermal growth), per case.
- **Load cases are built automatically** and can be edited:
  - SUS: weight + pressure;
  - OPE: weight + temperature + pressure + displacements;
  - EXP: the range between operating and installed;
  - HYD: hydrotest, optional.

**Supports (linear in 0.1):**
- Anchor (all six directions).
- Rest (+Y): two-way in 0.1, with a note that it's one-way in 0.2.
- Guide (lateral) and line stop (axial).
- Hold-downs in any direction (X, Y, Z, or skewed).
- Translational and rotational springs with a stiffness.
- Constant-force supports (a given load).

**Analysis:**
- A 3D beam (pipe) element with 12 degrees of freedom.
- **Bends** with the textbook flexibility factor and stress intensification factors from the flexibility characteristic h = t·R/r², and the pressure stiffening correction.
- **Tees** with their textbook intensification factors.
- Sparse assembly, sparse Cholesky solve (from Mesh), one solve per load case.
- An equilibrium check after every solve: the sum of reactions equals the applied loads.

**Code checks (process piping code equations):**
- **Hoop stress** and **required wall thickness** with corrosion allowance and mill tolerance.
- **Sustained longitudinal stress:** pressure plus bending with the intensification factors, against the hot allowable.
- **Displacement stress range:** bending and torsion combined, against the allowable stress range (with the liberal allowable as an option).
- **Occasional loads** structure ready (an empty case in 0.1).
- Per node: stress, allowable, ratio and PASS/FAIL. The worst node per case is reported.

**Results:**
- **On the 3D model:**
  - colour by stress ratio, with a legend;
  - deformed shape with a scale slider, animated between installed and operating;
  - the overstressed nodes listed and clickable (jump to the node).
- **Tables per load case:**
  - displacements;
  - forces and moments in local axes;
  - support loads (the table the civil and structural team needs);
  - code stresses.
- **Equipment nozzle loads:**
  - forces and moments at every point marked as a nozzle, in the nozzle's own axes;
  - compared with user-entered allowable forces and moments, as PASS/FAIL with ratios;
  - the pump and compressor standard checks come in 0.3.

**Isometric drawing (a highlight):**
- An automatic isometric of the model (30° projection) with pipe lines, bends, tees, valves, flanges and support symbols, plus node numbers and dimensions.
- Optional result tags: maximum stress ratio per segment, and support loads.
- A title block; prints and exports to PDF and SVG.
- Large models split across sheets.

**Report:**
- A stress report as a PDF (FAMILY §8) with a title block (project, line number, calc number, by, checked, revision), containing:
  - input echo (pipe data, materials, cases);
  - load cases;
  - a stress summary (PASS/FAIL per case with the worst node);
  - support loads;
  - nozzle loads;
  - the isometric;
  - the equilibrium checks;
  - the solver version.

**Examples (File › Examples):**
1. Pump discharge line with an expansion loop.
2. Compressor suction line to a header, with nozzle loads.
3. Steam line on a pipe rack with guides and line stops.
4. Tank outlet line with a settlement displacement.
5. A simple L-bend.
6. A Z-bend (the benchmarks the user can check by hand).

**Who it's for:** piping, stress, mechanical, process and plant engineers, consultants and students.

---

## 3. Architecture

**`crates/core` (pure Rust, unit-tested):**
- `units`: copied from Calc.
- `model`:
  - nodes, elements, components, sections, materials, insulation, fluid, supports, cases, nozzles;
  - `.dpipe` read/write with a version and migrations;
  - undo/redo as operations (like Plan's `doc.rs`).
- `library`: pipe sizes and schedules; materials with temperature tables and sources.
- `elements`:
  - 3D pipe beam stiffness (with shear deformation);
  - bend flexibility and intensification factors;
  - tee intensification factors;
  - rigid elements;
  - weight and thermal load vectors.
- `solve`: assembly, supports (including skewed restraints and springs), imposed displacements, the sparse solve, reactions, the equilibrium check.
- `cases`: the automatic load cases and the expansion range combination.
- `code`: the process-piping equations (hoop, minimum wall, sustained, expansion range, allowable range); each function cites its equation in a doc comment.
- `iso`: the isometric projection, dimension placement and sheet splitting (the window draws it).
- `report`: the data for the report pages.
- `bench`: verification problems (§4) as data and tests.

**`src-tauri`:** commands, the updater (`REPO = "Edgar-Mendonca/Datum-Pipe"`), print to PDF, recovery of unsaved work. Solving runs on a background thread.

**`ui/`:** the family window (FAMILY §6–8). The layout:
- the element table at the bottom;
- the 3D view in the centre;
- an inspector on the right (the selected node, element or support, with units);
- the results panel with load-case tabs;
- the isometric view as its own tab;
- the ? help cards, Options (units, colours, deformation scale), and light/dark/auto.

---

## 4. Verified from day one

Each benchmark is a test and a line in **Help › Verification** (generated from the tests, so it is always true for the version you run):

| # | Benchmark | Reference |
| --- | --- | --- |
| 1 | Cantilever pipe with an end load: tip deflection and root moment | Beam theory |
| 2 | Pipe under its own weight between two anchors: mid-span deflection and end moments | Beam theory |
| 3 | L-bend between two anchors, heated: end forces and moments | Guided-cantilever / textbook hand calculation |
| 4 | Z-bend between two anchors, heated | Textbook hand calculation |
| 5 | A bend's flexibility: end rotation against the textbook flexibility factor | Flexibility characteristic formula |
| 6 | Hoop stress and minimum wall for given pressure and pipe | The code's published equation |
| 7 | Expansion loop: anchor forces against the hand method | Textbook expansion-loop method |
| 8 | Equilibrium on every example model (reactions = loads) | Statics |

Plus the public piping benchmark problems published by nuclear regulators (US NRC reports) in 0.2. Hardening (FAMILY §11): random models never panic, and damaged `.dpipe` files open as far as possible. Checks before every push:
- clippy `-D warnings`;
- `cargo test --workspace`;
- `npm run check:ui`;
- the Playwright UI tests;
- `cargo deny`.

---

## 5. Tonight's plan (work through it in order, releasing as you go)

| Step | Work | Release |
| --- | --- | --- |
| 1 | Read; skeleton copied from Plan, renamed, moss accent, logo, updater, CI, release workflow; empty model saves and opens | **0.1.0** (so the updater works from the first install) |
| 2 | Engine: units, pipe library, materials, 3D pipe element, supports, solve, equilibrium; benchmarks 1, 2, 8 | — |
| 3 | Element table + 3D view + inspector; supports and nozzle points; undo; examples 5 and 6 | 0.1.1 |
| 4 | Bends, tees, reducers, rigid elements; thermal and pressure cases; automatic load cases; benchmarks 3–5, 7 | — |
| 5 | Code checks (hoop, minimum wall, sustained, expansion range), results colouring, deformed shape, tables, support and nozzle loads; benchmark 6 | 0.1.2 |
| 6 | Isometric drawing (view, print, SVG/PDF); stress report PDF; the remaining examples; Help › Verification | 0.1.3 |
| 7 | Polish: expansion loop wizard, copy/mirror, renumber, keyboard, empty states, ? help cards; screenshots, README, `docs/site.json`; a final check that every example solves and prints | **0.1.4** (the build the user wakes up to) |

If time runs short, cut in this order: mirror, the loop wizard, multi-sheet isometrics, skewed restraints. **Never cut the benchmarks, the equilibrium check, the code checks or the report.**

**At the end, write a summary** in `docs/MEMORY.md` (Session log) and in the chat:
- what was released;
- what works;
- what was cut;
- what to try first.

---

## 6. Docs to keep (FAMILY §10)

- `CLAUDE.md`
- `docs/MEMORY.md`
- `CHANGELOG.md` (plain language)
- `docs/PLAN-0.1.md`
- `NOTICE` (three.js, fonts, crates)
- `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`
- `docs/site.json`:
  - `tagline`, `for`, `about`;
  - `steps` (three: route the piping · support and load it · check and report);
  - `highlights`;
  - `screenshots` (1440×900: the 3D model coloured by stress, the isometric, the results tables, the report);
  - `roadmap`.
- README per FAMILY §5, with a link to `https://edgar-mendonca.github.io/Datum/apps/pipe` and a plain statement that results must be checked by a qualified engineer.

**After 0.1.0 is released**, tell the user to tell the hub chat: "add Datum Pipe to apps.json (id pipe, accent #4D7C0F) and copy its icon".

## 7. Roadmap after 0.1 (for `docs/site.json`)

| Version | Scope |
| --- | --- |
| 0.2 | Nonlinear supports: one-way rests, gaps, friction (iterative solve); spring hanger selection (variable and constant); import of plain-text piping component files from design tools; wind and static seismic loads; the public regulator benchmark problems |
| 0.3 | Equipment nozzle checks to the published pump, compressor and steam turbine standards; flange leakage check; local stresses at vessel nozzles; relief valve thrust |
| 0.4 | Dynamics: natural frequencies and mode shapes, harmonic response, response spectrum |
| 0.5 | Power piping and European piping code equations; buried pipe; cold spring |
| 1.0 | Validation report covering every analysis type, user guide, signed installer |

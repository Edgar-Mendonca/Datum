# Datum Layout: brief (paste this into the new chat)

You are starting **Datum Layout**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Layout` (MIT licence). The user creates it and gives this session access.
- **What it is:** spec-driven 3D plant layout and piping design.
  - Place equipment from its datasheet values, then route pipes between nozzles.
  - Elbows, tees, flanges and valves appear and size themselves from the line's size and pipe class.
  - Drag and drop fittings that snap onto the pipe.
  - Check clashes, list every line, and send each line to **Datum Pipe** for its isometric and stress analysis.
- **Decided with the user (DATUM hub, session 31, 2026-11-03):**
  - **The family's plant workflow is four separate apps that hand data to each other:**
    - **Datum Schema:** P&ID and PFD; it exports a "plant package";
    - **Datum Layout:** the 3D layout of one plant;
    - **Datum Pipe:** isometrics, stress, vessels;
    - **Datum Sim:** dynamic simulation.
  - Datum Layout models geometry; it never simulates the process.
  - Start small: a 0.1 that already feels like the real thing, and grow it release by release.
- **This chat runs unattended.** Every decision below is made; **do not stop to ask questions**. If something is unclear, choose the simplest sensible option, write it in `docs/MEMORY.md` (Decisions) and carry on. Release as you go (§6) and finish with the summary in §6.

---

## 0. First: read, plan, then build

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read:
   - `CLAUDE.md`, `MEMORY.md` (§3 Decisions; especially "every app is self-contained: copy shared pieces from the reference app, never link them" and "validate before adding");
   - the latest report in `status/`;
   - `FAMILY.md` (the design guide: stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9: publisher "Datum", `SHA256SUMS.txt`; docs §10, how we work and the hardening standard §11, new-app checklist §12, public words §13);
   - `brand/BRAND.md`;
   - `brain/graph.json` with `brain/BRAIN.md`.
2. **The reference code** (read-only; **copy, don't reinvent**; every copy becomes Layout's own code):
   - **`Edgar-Mendonca/Datum-Plan`: the shell.** Ribbon, backstage (File page), Options, print, updater (`src-tauri/src/update.rs`), `help.tsx`, `roadmap.tsx`, styles, the workflows (`ci.yml`, `release.yml`), UI and hardening tests.
   - **`Edgar-Mendonca/Datum-Pipe`: the closest relative.**
     - Its three.js 3D view: pipes at true diameter, components, supports, orbit, selection.
     - Its pipe size and schedule library and its materials.
     - Its **PCF reader and writer**. Layout's export must open in Pipe unchanged; test it with Pipe's reader.
     - Its units handling.
   - **`Edgar-Mendonca/Datum-Mesh`:** its 3D view techniques (large models, picking, lighting) and its verification-report pattern.
   - **`Edgar-Mendonca/Datum-Schema`:** its object model (objects are the master; plant › unit › area hierarchy; class library as data; names after DEXPI), and the **plant package** it will export (its MEMORY and roadmap 0.8). Layout's import must fit it.
   - **`Edgar-Mendonca/Datum-Calc`:** the units engine, if Pipe's is not complete.
3. **Write** `CLAUDE.md`, `docs/MEMORY.md` (same shape as the other apps: product table, Files, Decisions, Roadmap, Session log, How we work) and a short `docs/PLAN-0.1.md`. Then build.

---

## 1. Decisions already made

| Item | Decision |
| --- | --- |
| Name, tagline | **Datum Layout**: "3D plant layout and piping: place equipment, route lines, check and hand over." |
| Accent | **Steel** (new; the hub adds it to FAMILY §3): `#3A5A78`, hover `#2E4861`, sky `#B9CCDF`, pale `#EEF3F8`, sel `#DFE8F1`, sel2 `#C2D3E4`, dark `#8FB3D9`, File sidebar `#1F3247`. Clash and check results keep `--green`/`--amber`/`--crit` with icons and words |
| Identifier, file, installer | `com.edgarmendonca.datumlayout`, `.dlayout` (versioned JSON for 0.1; Schema's object model ideas so a database file can follow), `DatumLayout-x.y.z-setup.exe` + `SHA256SUMS.txt`; publisher **"Datum"**, copyright "© 2026 Edgar Mendonca" |
| Stack | Tauri 2, SolidJS, strict TypeScript, three.js (MIT) for the 3D view; **all geometry and rules in the Rust engine** (`crates/core`): part generation from tables, ports, routing, snapping, clash checks (`parry3d`, Apache-2.0), exports. **No Python in 0.1.** Python arrives in 0.5 for CAD exchange (STEP), as an **optional download on first use**, not in the installer |
| Parts | **Generated, never downloaded or bundled.** Each part is a shape rule (in code) + a dimension table (data) + ports (connection points with size, rating and end type). Dimensions come from free public sources (manufacturers' public catalogues, open references), each row naming its source, as Datum Pipe does. Never copy a standard's tables or text, or a commercial tool's library |
| Catalogue | Lives **inside this repo** in `catalogue/` (plain CSV/JSON, small). **Plug-in packs:** a pack is a folder or zip file (a company's pipe classes as CSV; extra parts; vendor equipment models the user downloaded) that the user drops in, and it appears in the library. No separate parts repository |
| Equipment | **Parametric**, from datasheet values: vertical vessel, horizontal drum, storage tank, column, centrifugal pump with motor and baseplate, shell-and-tube exchanger. Each with nozzles (size, rating, position, direction) |
| Ribbon tabs | Home · Equipment · Piping · Fittings · Check · Lists · View · Help (contextual Format tab) |
| Window layout | Catalogue panel on the left (search, categories, drag source); 3D view in the centre (orbit, pan, walk, standard views, grid and plot-plan north arrow); inspector on the right; bottom panel tabs: **Lines** · **Equipment** · **Clashes** · **Checks** |
| Logo | FAMILY §5 tile in steel; glyph: an isometric cube outline (the plot), a pipe entering it, turning once with an elbow and ending at a small vertical vessel; 11 px strokes; the amber diamond. Copy to the hub's `brand/datum-layout-icon.svg` |
| Units | SI and US, per project, switchable; every value with its unit |
| Public words (FAMILY §13) | Describe what Layout does. **Never name, compare with, or say it copies or replaces any commercial plant-design, CAD or 3D product**, in any file, comment, commit, release note, help text or on the site. Standards and file formats may be named by number or name (PCF, glTF, IFC, STEP). Add the family's line to README and NOTICE: "Product and file-format names are trademarks of their owners and are used only to describe file compatibility." |

---

## 2. What Datum Layout 0.1 does (keep it small, make it feel real)

**The plot:** a site grid with north, coordinates (E, N, elevation), areas as boxes, and a ground plane. Snap to grid; type coordinates.

**Equipment:**
- Place the six parametric types from the catalogue; set their sizes in the inspector.
- Nozzles are listed with tag (N1, N2…), size, rating, facing, position and direction, and can be added, moved or removed.
- Equipment carries a tag (P-101A, V-201, …) and a few datasheet values.

**Piping (the heart of 0.1):**
- **Lines** carry a line number, size, pipe class, fluid code and insulation. One **pipe class** ships in 0.1 (carbon steel, class 150 and 300 flanges, butt-weld fittings), defined in `catalogue/classes/`.
- **Route** a line from a nozzle (or a point) to a nozzle (or a point):
  - click the path, with orthogonal guides and elevation input;
  - the engine places **spec elbows** at every turn (long radius by default; short radius by choice);
  - a **reducer** where sizes change;
  - **flanges** where the line meets a flanged nozzle.
- **Drag and drop** from the catalogue: a valve, tee, reducer, flange pair or blind dropped on a pipe **snaps by its ports**, takes the line's size and class, and **splits the pipe and rejoins it**. Dropping a tee starts a branch.
- **Edit:**
  - drag a straight run along its axis and the connected elbows follow;
  - change a line's size and every component re-sizes;
  - undo and redo everything.

**Catalogue 0.1 (generated parts):**
- Pipe ½"–24" (outside diameters, wall thicknesses from Pipe's library).
- 90° and 45° elbows (LR, SR).
- Equal and reducing tees.
- Concentric and eccentric reducers.
- Caps.
- Weld-neck and blind flanges (classes 150, 300).
- Gaskets and bolt sets (as data for the list).
- Gate, globe, check and ball valves as simplified bodies (face-to-face length, flanged ends, a handwheel or lever).

**Checks (bottom panel, each issue clickable):**
- **Clashes:** pipe–pipe, pipe–equipment, pipe–ground, with a clearance (default 25 mm).
- **Open ends** (except at a nozzle, a cap or a blind).
- **Size or class mismatch at a connection.**
- **A component not allowed by the line's class.**
- **A line without a number.**

**Lists:**
- **Line list:** from/to, size, class, length, number of components.
- **Equipment list with nozzles.**
- **Material take-off per line:** pipe length, fittings, flanges, valves, gaskets, bolts.

All export to CSV.

**Exports:**
- **PCF per line or for the whole project:** Datum Pipe's import reads it unchanged (proved by a test).
- **glTF 2.0** of the model (opens in any 3D viewer).
- CSV lists.
- Print to PDF of the current view and the lists (FAMILY §8).

**Examples (File › Examples), each opening with 0 clashes and 0 errors:**
1. **Pump suction and discharge:** a tank, a duty/standby pump pair, suction strainers, discharge check and gate valves, to a header.
2. **Exchanger hook-up:** a shell-and-tube exchanger with inlet and outlet lines, isolation valves and a bypass.
3. **Small pipe rack run:** two lines on a rack between two vessels, with elevation changes and a tee branch.

Also a **"Find the clashes"** copy of example 3 with three planted problems, for demonstrations.

**Who it's for:** piping and layout designers, mechanical and process engineers, students learning plant design.

---

## 3. Architecture

**`crates/core` (pure Rust, unit-tested):**
- `units`: copied from Pipe or Calc.
- `catalogue`: loading tables and classes (CSV/JSON) from `catalogue/` and from plug-in packs; validating them; every row's source kept.
- `parts`: shape rules → triangle meshes (tube, torus segment, cone frustum, disc, ellipsoidal and hemispherical heads, boxes) at a level of detail; **ports** (position, direction, size, rating, end type).
- `equipment`: the six parametric types → shapes + nozzles.
- `model`:
  - project, plot, areas, equipment, lines, components (each an object with a stable id, after Schema's model);
  - `.dlayout` read/write with a version and migrations;
  - undo/redo as operations.
- `routing`: polyline → straights + elbows (with exact cut-backs from the elbow tables), reducers, end flanges; port snapping; splitting and rejoining a pipe at a dropped component; branch tees.
- `checks`: clashes (`parry3d` with bounding-volume trees), open ends, mismatches, class rules.
- `lists`: line list, equipment and nozzle list, material take-off.
- `pcf`: writer (and reader for tests), matching Datum Pipe's.
- `gltf`: writer.

**`src-tauri`:** commands, the updater (`REPO = "Edgar-Mendonca/Datum-Layout"`), print to PDF, recovery.

**`ui/`:**
- the family window (FAMILY §6–8);
- the 3D view from Pipe's: instanced meshes for large models, picking, selection outline, gizmos to move along axes, port markers while dragging;
- the catalogue panel with drag and drop;
- the inspector, checks and lists panel;
- ? help cards;
- Options (units, clearance, level of detail);
- light, dark and auto themes.

---

## 4. Quality bar (FAMILY §11)

- **Geometry tests:**
  - every generated part matches its table (outside diameter, centre-to-end, face-to-face);
  - ports of connected parts coincide (position and opposite direction) to 0.01 mm;
  - a routed line has no gaps or overlaps;
  - pipe length plus fitting lengths equals the routed path length.
- **Routing tests:** turns of 90° and 45°; a turn too tight for an elbow is reported, not drawn; resizing a line re-sizes every component.
- **Exchange tests:** each example's PCF opens in Datum Pipe's reader (copied into the tests) with the same nodes, sizes and components; the glTF validates.
- **Checks:** each check has a passing and a failing case; "Find the clashes" finds exactly its three problems.
- **Hardening:** random models never panic; damaged `.dlayout` files and bad plug-in packs open as far as possible and explain the rest; a model with 2,000 components stays smooth to orbit (measured).
- **Checks before every push:**
  - clippy `-D warnings`;
  - `cargo test --workspace`;
  - `npm run check:ui`;
  - the Playwright UI tests;
  - `cargo deny`;
  - an automatic test that fails if a commercial product name appears in the window's text.

---

## 5. Docs to keep (FAMILY §10)

- `CLAUDE.md`, `docs/MEMORY.md`, `CHANGELOG.md` (plain language), `docs/PLAN-0.1.md`.
- `NOTICE` (three.js, parry3d, fonts, crates; the trademark line), `LICENSE` (MIT, © 2026 Edgar Mendonca), `SECURITY.md`, `CONTRIBUTING.md`.
- `catalogue/SOURCES.md`: where every table comes from.
- `docs/site.json`:
  - `tagline`, `for`, `about`;
  - `steps` (three: **place the equipment · route the lines · check and hand over**);
  - `highlights`;
  - `screenshots` (1440×900: the pump example in 3D, dropping a valve onto a pipe, the clash list on "Find the clashes", the line list);
  - `roadmap` (§7).
- README per FAMILY §5, linking to `https://edgar-mendonca.github.io/Datum/apps/layout`.

---

## 6. Today's plan (work in order, releasing as you go)

| Step | Work | Release |
| --- | --- | --- |
| 1 | Read; skeleton copied from Plan (renamed, steel accent, logo, publisher "Datum", updater, CI, release workflow); an empty plot with grid and north arrow saves and opens; the 3D view from Pipe | **0.1.0** |
| 2 | Engine: units, catalogue loading, part shapes and ports, the six equipment types; tests against the tables | — |
| 3 | Place equipment; route a line nozzle to nozzle with automatic elbows, reducers and end flanges; the inspector | 0.1.1 |
| 4 | Drag and drop valves, tees, reducers and flanges that snap and split; resize a line; branches | 0.1.2 |
| 5 | Checks (clashes, open ends, mismatches, class rules); lists and material take-off; CSV; PCF export proved against Pipe's reader; glTF | 0.1.3 |
| 6 | The three examples and "Find the clashes"; print; ? cards; screenshots, README, `docs/site.json`; a final check that every example opens clean, exports PCF that Pipe reads, and orbits smoothly | **0.1.4** |

If time runs short, cut in this order: eccentric reducers, the walk view, glTF export, 45° elbows. **Never cut port snapping, automatic elbows, the clash check, the PCF export or its test.**

**At the end, write a summary** in `docs/MEMORY.md` (Session log) and in the chat:
- what was released;
- what works;
- what was cut;
- a 2-minute demo: open example 1, drop a valve onto the discharge line, resize the line, run the clash check, export the line to Datum Pipe.

**After 0.1.0 is released**, tell the user to tell the hub chat: "add Datum Layout to apps.json (id layout, accent #3A5A78) and copy its icon".

---

## 7. Roadmap: where Layout is heading and how the family joins up

```
Datum Schema ──plant package──▶ Datum Layout ──PCF per line──▶ Datum Pipe
 (P&ID, PFD)   equipment, nozzles,   (3D layout,   isometric, stress,   (support loads
                lines, specs, order)  piping)       vessels             back, later)
                                         │
                                         └──glTF / IFC / STEP──▶ other 3D and CAD tools
Datum Sim: plant dynamics from Schema's loops (Layout never simulates the process)
```

| Version | Scope |
| --- | --- |
| 0.1 | Spec-driven piping in 3D (this brief) |
| 0.2 **From Schema** | Import Schema's plant package (equipment with datasheet values and nozzles, lines with from/to, size, class and component order, stable ids); place equipment from it; route its lines; **a 3D-against-P&ID check** (missing or extra components, wrong order, wrong size, unconnected lines); more pipe classes as plug-in packs |
| 0.3 **Steel and supports** | Pipe racks, platforms, ladders, stairs (parametric steel shapes); pipe supports (rest, guide, anchor, shoe) placed on lines and **sent to Datum Pipe** with the PCF |
| 0.4 **Drawings and quantities** | Plot plan and general arrangement drawings (plan and elevation views with dimensions); full material take-off; **IFC export** (pipe, fitting, valve, pump and tank objects) |
| 0.5 **CAD exchange** | An optional Python engine, downloaded on first use: build123d or CadQuery (Apache-2.0) on OpenCascade, run as a separate process. **STEP import** of vendor equipment models as catalogue parts, STEP export of the model |
| 0.6 **Big models and teams** | Thousands of lines (level of detail, streaming), areas loaded on demand, a project database with history (as Schema), several users with claimed areas |
| Later | Support loads from Pipe drawn back on the model; walk-through views for reviews; instrument and cable trays; underground piping |
| 1.0 | Validation of the catalogue against its sources, user guide, signed installer |

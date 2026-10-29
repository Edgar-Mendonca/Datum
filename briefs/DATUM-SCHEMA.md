# Datum Schema: brief (paste this into the new chat)

You are starting **Datum Schema**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Schema` (MIT licence). The user creates it and gives this session access.
- **What it is:** intelligent P&IDs and process flow diagrams. You draw the plant with real symbols, and every symbol and line carries its data and knows what it is connected to. So Datum Schema:
  - writes the **line list, equipment list, instrument index and valve list** for you, always in step with the drawing;
  - **checks the drawing as you work** (duplicate tags, open ends, size changes without a reducer, and more);
  - **sizes every line**: velocity and pressure drop against limits.

  A drawing that only looks like a P&ID can do none of this.
- **Decided with the user (DATUM hub, session 22, 2026-10-29):** the user, a piping and rotating-equipment engineer, needs it for a large exhibition next week as the family's eighth app. Name: **Datum Schema**; tagline: *"Intelligent P&IDs and process flow diagrams: draw, check and list."*
- **This chat runs unattended.** Every decision below is made; **do not stop to ask questions**. If something is unclear, choose the simplest sensible option, write it in `docs/MEMORY.md` (Decisions) and carry on. Release as you go (§6), and finish with the summary in §6.

---

## 0. First: read, plan, then build

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read, in this order:
   - `CLAUDE.md` and `MEMORY.md`. MEMORY's §3 Decisions holds the rules every app follows, including "every app is self-contained: copy shared pieces from the reference app, never link them".
   - `FAMILY.md`, the design guide every app follows: stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9 (publisher "Datum", `SHA256SUMS.txt`), docs §10, how we work and the hardening standard §11, new-app checklist §12, public words §13.
   - `brand/BRAND.md`; `brain/graph.json` with `brain/BRAIN.md` (search it for how a piece was done before).
2. **The reference code** (read-only; **copy, don't reinvent**; every copy becomes Schema's own code):
   - `Edgar-Mendonca/Datum-Plan`: the whole shell. Ribbon, backstage (File page), Options, print (`print.tsx`), updater (`src-tauri/src/update.rs`), `help.tsx` (the ? card beside every tool), `roadmap.tsx` (reads `docs/site.json`), the icon sprite in `ui/index.html`, `styles.css` tokens, Excel export, the workflows (`ci.yml`, `release.yml`), UI and hardening tests.
   - `Edgar-Mendonca/Datum-Sim`: the **block canvas** (whiteboard grid, pan and zoom, snap, ports, orthogonal wires that route around blocks, mini-map, multi-select, align). Schema's drawing canvas starts from it.
   - `Edgar-Mendonca/Datum-Calc`: the **units engine** (SI and US) and its pipe pressure-drop pack (Darcy–Weisbach with Colebrook), the base of Schema's line hydraulics.
   - `Edgar-Mendonca/Datum-Pipe`: the **pipe size and schedule library** (inside diameters for the hydraulics) and its line-number conventions.
3. **Write** `CLAUDE.md`, `docs/MEMORY.md` (same shape as the other apps: product table, Files, Decisions, Roadmap, Session log, How we work) and a short `docs/PLAN-0.1.md` (this scope, the day plan, risks). Then build.

---

## 1. Decisions already made

| Item | Decision |
| --- | --- |
| Name, tagline | **Datum Schema**: "Intelligent P&IDs and process flow diagrams: draw, check and list." |
| Accent | **Magenta** (new; the hub adds it to FAMILY §3): `#9C1F84`, hover `#801A6C`, sky `#EAB6DD`, pale `#FAEBF6`, sel `#F4DCEE`, sel2 `#E7B9DB`, dark `#E07BC9`, File sidebar `#4E1043`. Check results keep `--green`/`--amber`/`--crit` with icons and words, never the accent alone |
| Identifier, file, installer | `com.edgarmendonca.datumschema`, `.dschema` (JSON, versioned, migrations), `DatumSchema-x.y.z-setup.exe` + `SHA256SUMS.txt`; publisher **"Datum"**, copyright "© 2026 Edgar Mendonca" (FAMILY §9) |
| Stack | Tauri 2, SolidJS, strict TypeScript; the engine in Rust `crates/core` (the model, connectivity, checks, lists, hydraulics, DXF, all unit-tested). The window never calculates. No Python |
| Units | SI and US, per project, switchable; from Calc's engine. Every value carries its unit |
| Ribbon tabs | Home · Draw · Symbols · Lines · Instruments · Check · Lists · Sheets · View · Help (contextual Format tab on a selection) |
| Window layout | Symbol palette on the left (searchable, by category); the sheet in the centre; inspector on the right (the selected item's data, with units); a bottom panel with tabs: **Checks** · **Line list** · **Equipment** · **Instruments** · **Valves** |
| Symbols | **Our own vector drawings**, following the conventions of the public symbol standards (ISO 10628-2 for equipment, valves and lines; ISA-5.1 for instrument bubbles and letter codes). Never copy a symbol library from other software. Drawn in the current text colour so both themes work; 0.75 px strokes at 1:1; ports (connection points) are part of each symbol's definition |
| Logo | FAMILY §5 tile in magenta; glyph: a vertical vessel joined by a line with a flow arrow to a pump circle, with a small instrument bubble on the line, in 11 px strokes and the amber diamond. Copy to the hub's `brand/datum-schema-icon.svg` |
| Public words (FAMILY §13) | Describe what Datum Schema does. **Never name, compare with, or say it copies or replaces any commercial drawing, CAD or plant-design product**, in any file, commit, release note, help text or on the site. Standards may be named by number. File formats may be named (DXF, CSV, Excel) |

---

## 2. What Datum Schema 0.1 does

### 2.1 Drawing
- **Sheets:**
  - a project holds several sheets, each with a size (A3, A1, ANSI B, ANSI D), a border with grid zones (A–H across, 1–8 down), a title block (project, drawing number, title, revision, by, checked, approved, date, scale "NTS") and a revision table;
  - sheets are listed in a sheet tab bar;
  - **legend sheet:** automatically generated, showing every symbol used, with its name.
- **Placing symbols:** drag from the palette, or type to search ("ball valve"); snap to grid; rotate in 90° steps, flip, scale per symbol; copy, paste and duplicate with the next free tag.
- **Lines:**
  - drawn port to port with orthogonal routing (Sim's wires), with bends you can drag;
  - line types: major process, minor process, utility, pneumatic signal, electrical signal, software/data link, capillary;
  - a **flow arrow** on every segment, which you can flip;
  - a line crossing another gets a gap (hop) automatically.
- **Connections:**
  - an in-line symbol (valve, reducer, strainer) dropped onto a line **splits it and joins both halves**;
  - an instrument tapping onto a line or vessel creates the connection;
  - **off-page connectors** carry a target sheet and partner, and clicking one jumps to its partner.
- **Text and notes:** free notes, leader notes, and a "Hold" cloud for areas not final.
- **Selection and layers:** select by box, by type and by line number; the selected line number is highlighted across all sheets; layers can be shown or hidden (process, utility, instrument, notes).
- **Undo/redo** for everything (operations, as in Plan's `doc.rs`); **recovery** of unsaved work.

### 2.2 Symbols (about 80 in 0.1)
- **Vessels:** vertical vessel, horizontal drum, tank (cone and flat roof), column (with trays or packing), separator with boot, filter vessel, knock-out drum, silo.
- **Rotating:** centrifugal pump, positive-displacement pump, vertical in-line pump, centrifugal compressor, reciprocating compressor, screw compressor, fan/blower, steam turbine, electric motor, agitator.
- **Heat transfer:** shell-and-tube exchanger (fixed, U-tube, kettle), plate exchanger, air cooler, fired heater, electric heater, cooling tower, jacketed vessel.
- **Valves:**
  - manual: gate, globe, ball, butterfly, plug, needle, diaphragm, check, non-slam check, three-way;
  - control and relief: control valve (pneumatic, motor, solenoid actuators; fail-open/closed/last marks), pressure safety valve, pressure regulator, rupture disc, breather valve.
- **Fittings and specials:** concentric and eccentric reducers, blind flange, spectacle blind, spacer, strainer (Y, basket), steam trap, sight glass, flame arrester, flexible hose, restriction orifice, expansion joint, drain/vent, sample point.
- **Instruments (ISA-5.1 conventions):**
  - bubbles for field-mounted, panel, DCS/shared display, PLC/logic and interlock;
  - the tag letters (PT, FT, TT, LT, PI, TI, FIC, LIC, PIC, TIC, PSH, PSL, LAH, …) and loop numbers;
  - primary elements: orifice plate, magnetic, Coriolis, vortex and ultrasonic meters, thermowell.
- **Line marks:** insulation, heat tracing (steam, electric), jacketing, spec break, battery limit, tie-in point, package boundary.

### 2.3 Data on everything
- **Equipment:** tag (e.g. `P-101A`), name/service, type, design and operating pressure and temperature, material, size/capacity (flow and head for pumps, duty for exchangers, volume for vessels), power, nozzles.
- **Lines:**
  - **line number** (configurable format, default `<size>-<fluid code>-<sequence>-<pipe class>`, e.g. `3"-P-1001-A1A`), fluid code, service, size (NPS), schedule, pipe class (spec);
  - design and operating P/T, insulation type and thickness, tracing, test pressure;
  - flow (mass or volume), density, viscosity, a length for hydraulics, fittings allowance, from/to (filled automatically from connectivity).
- **Instruments:** tag, loop number, function, range, set points (alarms and trips), signal type, location (field/panel/DCS).
- **Valves:** tag, type, size, class, operator, normal position (NO/NC/LO/LC).
- **Automatic numbering** per prefix and sheet, with renumber; tags shown on the drawing update when the data changes, and the other way round.

### 2.4 Live checks (the Checks panel)

Every issue has a level (error, warning, note), a short reason, and a click that zooms to it. Each rule can be switched off in Options › Checks (company practice). The project shows "0 errors · 3 warnings" in the status bar.

| # | Check | Level |
| --- | --- | --- |
| 1 | Duplicate tag or duplicate line number in the project | Error |
| 2 | Line end not connected (open end), unless it ends at a battery limit, a drain/vent or an off-page connector | Error |
| 3 | Off-page connector without a matching partner, or partners that disagree on line number | Error |
| 4 | Size changes along a line without a reducer | Error |
| 5 | Pipe class changes without a spec-break mark | Warning |
| 6 | Line or item with a missing tag, number, size or class | Warning |
| 7 | Flow arrows on one line point against each other | Warning |
| 8 | Pump discharge without a check valve | Warning |
| 9 | Vessel or exchanger shell without a relief path (a safety valve, rupture disc or a note) | Warning |
| 10 | Control valve without isolation valves (bypass optional) | Note |
| 11 | Controller (xIC) without a measurement and a final element in its loop | Warning |
| 12 | Instrument tag letters that do not match its symbol type or loop | Note |
| 13 | Line velocity or pressure drop outside its limits (§2.5) | Warning |

### 2.5 Line hydraulics (the "it calculates" part)
- For every line with a flow, density and viscosity, Schema works out:
  - the inside diameter (from size and schedule, from Pipe's library);
  - velocity and Reynolds number;
  - the friction factor (Colebrook, Calc's method);
  - the pressure drop per 100 m (or 100 ft) and over the line's length plus fittings allowance.
- **Limits:**
  - default typical limits by service, all editable in Options: liquid general, pump suction, pump discharge, gravity drain, gas/vapour, steam, two-phase (velocity and ΔP);
  - results are shown as a small badge on the line (✓, ! or ✗) and in the line list.
- **The source** of each formula is shown in its ? card. Results are a sizing aid; the README and help say they are checked by the engineer.

### 2.6 Lists
- The **line list**, **equipment list**, **instrument index** and **valve list** are always live, generated from the drawing.
- Sort, filter and group them; click a row to find it on the drawing; edit in the list and the drawing follows.
- Export each list to **CSV** and **Excel** (`.xlsx`, Plan's exporter), and print it with the title block.

### 2.7 Print and export
- **Print to PDF:** the sheets at their size, or fitted to A3, plus the lists and the legend (FAMILY §8).
- **SVG** per sheet.
- **DXF** (ASCII, R12-compatible, our own writer):
  - one layer per line type and per symbol category;
  - symbols as blocks with their tag as an attribute;
  - text as text; the border and title block included;
  - so the drawing opens in any CAD program.
- **The project file** `.dschema` holds everything (sheets, items, data, rules).

### 2.8 Examples (File › Examples)
1. **Pump transfer:** tank → duty/standby centrifugal pumps with suction strainers, check valves, discharge isolation → level-controlled vessel, with an LT–LIC–LV loop, a PSV on the vessel, and hydraulics on every line.
2. **Compressor package:** suction knock-out drum with level control, centrifugal compressor with motor, after-cooler (air cooler), discharge check valve, and an **anti-surge loop** (FT, PT, TT → UIC → recycle control valve back to suction).
3. **Exchanger loop:** a shell-and-tube heater on steam, with a TT–TIC–TV loop on the outlet, steam trap and condensate return, and an insulation and tracing example.

Each example opens with **0 errors**. One copy of example 1 has deliberate mistakes, called **"Find the faults"**, for the exhibition demo.

**Who it's for:** process, chemical, mechanical, piping and instrument engineers, operators and students.

---

## 3. Architecture

**`crates/core` (pure Rust, unit-tested):**
- `units`: copied from Calc.
- `pipes`: sizes and schedules, copied from Pipe.
- `model`: project, sheets, symbols (definition: name, category, ports, default data fields), items (an instance of a symbol: position, rotation, flip, tag, data), lines (segments, route points, type, data), connections (port ↔ line end), loops, notes. `.dschema` read/write with a version and migrations; undo/redo as operations.
- `graph`: connectivity:
  - which items a line joins;
  - splitting a line at an in-line item and merging it again;
  - walking a line number across sheets through off-page connectors;
  - from/to for the lists.
- `tags`: formats, automatic numbering, renumbering, duplicate detection.
- `checks`: one function per rule in §2.4, each returning issues with a location; rule settings.
- `hydraulics`: inside diameter, velocity, Reynolds, Colebrook, ΔP, limits by service.
- `lists`: the four lists as rows (for the window, CSV, Excel and print).
- `dxf`: the DXF writer (header, layers, blocks, entities), tested by parsing its own output.

**`src-tauri`:** commands, the updater (`REPO = "Edgar-Mendonca/Datum-Schema"`), print to PDF, Excel export, recovery.

**`ui/`:**
- the family window (FAMILY §6–8);
- the canvas from Sim's (SVG for the sheet, symbols as `<use>` of a symbol sprite, lines as paths);
- the palette, inspector, checks and lists panel;
- the ? help cards and Options (units, tag formats, checks on/off, hydraulic limits);
- light, dark and auto themes.

---

## 4. Quality bar (FAMILY §11)

- **Engine tests:**
  - every check (one passing and one failing case each);
  - tag numbering and duplicates;
  - line split and merge;
  - off-page walking;
  - hydraulics against a hand calculation and Calc's pipe pack (same inputs, same answer);
  - the DXF parses back to the same layers, blocks and entity counts;
  - every example has 0 errors, and "Find the faults" has exactly the planted faults.
- **Hardening:** random projects never panic; damaged `.dschema` files open as far as possible; hostile text in tags and notes is shown as text, never run.
- **UI tests (Playwright):** place, connect, split a line with a valve, see a check appear and clear, export a list.
- **Checks before every push:**
  - clippy `-D warnings`;
  - `cargo test --workspace`;
  - `npm run check:ui`;
  - the Playwright UI tests;
  - `cargo deny`.

---

## 5. Docs to keep (FAMILY §10)

- `CLAUDE.md`, `docs/MEMORY.md`, `CHANGELOG.md` (plain language), `docs/PLAN-0.1.md`.
- `NOTICE` (fonts, crates), `LICENSE` (MIT, © 2026 Edgar Mendonca), `SECURITY.md`, `CONTRIBUTING.md`.
- `docs/site.json` with:
  - `tagline` and `for`;
  - `about` (two plain paragraphs);
  - `steps` (three: **draw the plant · check it as you go · print the drawings and lists**);
  - `highlights`;
  - `screenshots` (1440×900 PNGs in `docs/images/`: the compressor package sheet, the Checks panel on "Find the faults", the line list with hydraulics, a printed sheet);
  - `roadmap` (§7).
- README per FAMILY §5, linking to `https://edgar-mendonca.github.io/Datum/apps/schema`, with a plain note that hydraulic results are a sizing aid checked by the engineer.

---

## 6. Today's plan (work in order, releasing as you go)

| Step | Work | Release |
| --- | --- | --- |
| 1 | Read; skeleton copied from Plan (renamed, magenta accent, logo, publisher "Datum", updater, CI, release workflow); a blank sheet with border and title block saves and opens | **0.1.0** |
| 2 | Engine: model, graph, tags, units, pipe library, undo; tests | — |
| 3 | Canvas from Sim: sheets, placing symbols (first 30), lines with ports, splitting by in-line items, off-page connectors; the inspector | 0.1.1 |
| 4 | All ~80 symbols and line types; data on everything; automatic numbering; legend sheet | — |
| 5 | Checks (all 13) with the Checks panel; hydraulics with badges; the four lists with CSV/Excel | 0.1.2 |
| 6 | Print to PDF, SVG, DXF; the three examples and "Find the faults"; ? cards for every tool | 0.1.3 |
| 7 | Polish (keyboard shortcuts, empty states, performance with 500 items); screenshots, README, `docs/site.json`; a final check that every example opens with 0 errors, prints and exports | **0.1.4** (the exhibition build) |

If time runs short, cut in this order: the "Hold" cloud, the line-hop gaps, ANSI sheet sizes, the less common symbols (silo, cooling tower, breather valve). **Never cut the connectivity, the checks, the lists, the hydraulics, printing or DXF.**

**At the end, write a summary** in `docs/MEMORY.md` (Session log) and in the chat:
- what was released;
- what works;
- what was cut;
- the 2-minute exhibition demo: open "Find the faults", show the checks, fix two, show the line list and a velocity badge, print a sheet, export DXF.

**After 0.1.0 is released**, tell the user to tell the hub chat: "add Datum Schema to apps.json (id schema, accent #9C1F84) and copy its icon".

---

## 7. Roadmap after 0.1 (for `docs/site.json`)

| Version | Scope |
| --- | --- |
| 0.2 | Open P&ID data exchange (the DEXPI XML format) import and export; **send a line to Datum Pipe** as a stress model; **send a loop to Datum Sim** (pump, valve, tank, controller) as a dynamic model; DXF import of an old drawing as a background |
| 0.3 | Process flow diagrams with stream tables (flow, P, T, composition per stream) and heat and mass balance checks; revision clouds and drawing comparison between revisions |
| 0.4 | Instrument loop diagrams and instrument datasheets from the index; cause-and-effect matrix from interlocks; valve datasheets |
| 0.5 | Company symbol and title-block templates; project-wide reports (MTO of valves and fittings); multi-user review comments |
| 1.0 | User guide, a validation note for the hydraulics, signed installer |

---

## Addendum (session 23): the direction is enterprise-class, object-based plant engineering

Sent to the running chat as a course correction; it does not change 0.1's features or the day plan.

1. **Objects are the master.** Every equipment item, line, valve and instrument is an object in the project model with a unique id; a symbol on a sheet is only a view of an object (later on several sheets, in lists and in datasheets). Deleting a symbol asks whether to delete the object or only remove it from the sheet.
2. **Plant hierarchy:** project › plant › unit › area, with defaults so it can be ignored at first; a "Plant" panel tab beside the palette; the lists can group by it.
3. **Class library:** object types are data, not code. Each class defines its attributes (name, unit, allowed values, required or not) and its default symbol; the built-in classes ship as a JSON library; users add attributes in Options. Checks and lists read attributes through the class library.
4. **The project is one SQLite database** (`.dschema`) with tables for objects, attributes, classes, hierarchy, sheets and views, and a **history** table of every change (who, when, old value, new value): the base for revisions and multi-user work.
5. **Names follow the open P&ID data standard (DEXPI)** where it costs nothing, so its import and export become a mapping.

**Roadmap towards enterprise class (replaces §7):**

| Version | Scope |
| --- | --- |
| 0.2 | DEXPI import and export; send a line to Datum Pipe, a loop to Datum Sim; DXF import as a background; datasheets generated from the class library |
| 0.3 | Process flow diagrams with stream tables and heat and mass balance checks; revisions with drawing comparison; change history per object |
| 0.4 | Instrumentation: instrument index with full attributes, loop diagrams, instrument datasheets, I/O list, cause-and-effect matrix |
| 0.5 | Multi-user projects (a shared project on a network drive or a small Datum server, with locking), approvals, issue for review, hand-over data export |
| 0.6 | Electrical: single-line diagrams, motor and cable lists linked to the same objects |
| 0.7 | Company class libraries and symbol sets, templates, project-wide reports (MTO of valves and fittings) |
| 1.0 | User guide, validation note for the hydraulics, signed installer |

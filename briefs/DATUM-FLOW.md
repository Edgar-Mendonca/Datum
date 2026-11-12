# Datum Flow: brief (paste this into the new chat)

You are starting **Datum Flow**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Flow` (MIT licence). The user creates it and gives this session access.
- **What it is:** fluid-flow simulation (CFD) on the desktop.
  - Draw or load a geometry.
  - Choose a fluid, set the inlets, outlets and walls.
  - Mesh it, solve it, and see velocity, pressure and temperature.
  - Get the numbers engineers need: pressure drop, flow rate, drag and lift, heat transfer.
  - Every release proves its answers in a built-in verification report.
- **Decided with the user (DATUM hub, session 46, 2026-11-12):**
  - **Datum Flow is the family's fluids app.** Datum Mesh keeps solids and heat conduction; the CFD stage on Mesh's roadmap moves here. The two meet later: flow loads into Mesh, conjugate heat transfer.
  - **Our own solver, in Rust, inside the app.** No mature CFD code can be built into an MIT app: the strong ones are GPL and may only ever run as separate programs. Those come later, and only as optional add-ons (§7).
  - **Start small and correct:** 0.1 is 2D, steady, laminar, with heat transfer and natural convection, and a verification report from day one. Grow release by release.
  - The old bucket-list idea called "Datum Flow" (pipe pressure drop and pump sizing) is retired. That work belongs in Datum Calc's packs and Datum Schema's line hydraulics.
- **Every decision below is made: do not stop to ask questions.** If something is unclear, choose the simplest sensible option, write it in `docs/MEMORY.md` (Decisions) and carry on. Release as you go (§6) and finish with the summary in §6.

---

## 0. First: read, plan, then build

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read:
   - `CLAUDE.md` and `MEMORY.md` (§3 Decisions; especially "every app is self-contained: copy shared pieces from the reference app, never link them" and "validate before adding");
   - the latest report in `status/`;
   - `FAMILY.md` (stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9 with **the build budget**, docs §10, how we work and the hardening standard §11, new-app checklist §12, public words §13);
   - `brand/BRAND.md`, and **`brand/datum-flow-icon.svg` (Flow's logo, final)**;
   - `brain/graph.json` with `brain/BRAIN.md`.
2. **The reference code** (read-only; **copy, don't reinvent**; every copy becomes Flow's own code):
   - **`Edgar-Mendonca/Datum-Mesh`: the closest relative.**
     - Its T6 (six-node triangle) elements, quadrature and assembly.
     - Its 2D mesher on the `spade` crate.
     - Its sparse solves with `faer`.
     - Its results views (contours, deformed shapes, probes).
     - Its command-line tool.
     - **Its verification report** (the pattern Flow copies).
   - **`Edgar-Mendonca/Datum-Plan`: the shell.** Ribbon, backstage (File page), Options, print, updater (`src-tauri/src/update.rs`), `help.tsx`, `roadmap.tsx`, styles, UI and hardening tests.
   - **`Edgar-Mendonca/Datum-Calc`:** the units engine.
   - **`Edgar-Mendonca/Datum-Plot`:** the family chart style, for residual plots and line plots.
3. **Write** `CLAUDE.md`, `docs/MEMORY.md` (same shape as the other apps: product table, Files, Decisions, Roadmap, Session log, How we work) and a short `docs/PLAN-0.1.md`. Then build.

---

## 1. Decisions already made

| Item | Decision |
| --- | --- |
| Name, tagline | **Datum Flow**: "Fluid flow simulation: draw it, set the flow, see and check the results." |
| Accent | **Cobalt** (new; the hub adds it to FAMILY §3 when Flow is released): `--blue` `#2F45B5`, `--blue2` `#25389A`, `--sky` `#9AA8E6`, `--pale` `#ECEEFA`, `--sel` `#DEE3F7`, `--sel2` `#C3CAF0`, dark `--blue` `#8C9CF0`, File sidebar `#1A2560`. Results colour maps are separate from the accent (§2) |
| Logo | **Final:** `brand/datum-flow-icon.svg` in the hub. A venturi (short inlet, throat, long outlet), three streamlines tightening in the throat, and the amber diamond in the throat. Copy it as-is and make the app icons from it |
| Identifier, file, installer | `com.edgarmendonca.datumflow`; `.dflow` (versioned JSON); `DatumFlow-x.y.z-setup.exe` + `SHA256SUMS.txt`; publisher **"Datum"**; copyright "© 2026 Edgar Mendonca" |
| Stack | Tauri 2, SolidJS, strict TypeScript; **all physics in the Rust engine** (`crates/`). CPU only (threads): no GPU in 0.x. GPU compute on Windows cannot do the double-precision maths these solvers need, so it waits until after 1.0, and then only for explicit kernels |
| Method | **Finite elements, Taylor–Hood P2/P1**: velocity on the six nodes of Mesh's T6 triangles, pressure on the three corners (stable without tricks). One coupled system, solved by **Picard then Newton**, with **sparse direct LU** (`faer`), all behind a small `LinearSolver` interface. **Continuation** (raise Reynolds or Rayleigh number step by step from a solved case) for hard cases. Temperature on P2 with the **Boussinesq** body force for buoyancy. **Grad-div** stabilisation for strong natural convection; **SUPG** once convection dominates (0.2+) |
| Not in 0.x | Compressible flow, LES, multiphase, free surfaces, combustion. Turbulence arrives in steps (§7) |
| Meshing | **Own 2D mesher** on `spade` (MIT/Apache), copied from Mesh, with **local refinement** at walls, corners and wakes. **Never** use Shewchuk's Triangle or its Rust wrappers (its terms forbid commercial distribution, which would bind our users at work). Boundary-layer (inflation) layers in 0.3. 3D meshing later: fTetWild (MPL-2.0) or Netgen (LGPL, as a DLL) can be built in; Gmsh, snappyHexMesh and cfMesh are GPL and may only run as separate programs |
| Licences | Read each dependency's licence before adding it; `cargo deny` in CI. **Never** link GPL or AGPL code into the app. **FluidX3D may never be used** (its licence bans commercial use; it is not open source). LGPL only as a separate, replaceable DLL with its source offered |
| Units | SI and US, per project, switchable; every value with its unit (Calc's engine) |
| Ribbon tabs | Home · Geometry · Physics · Mesh · Solve · Results · Check · View · Help |
| Window layout | Model tree on the left (Geometry, Fluid, Boundaries, Mesh, Solver, Results); 2D view in the centre; inspector on the right; bottom panel tabs: **Residuals** · **Monitors** · **Checks** · **Messages** |
| Public words (FAMILY §13) | Describe what Flow does. **Never name, compare with, or say it copies or replaces any commercial simulation, CFD or CAD product**, in any file, comment, commit, release note, help text or on the site. Open-source projects and standards may be named where they are used (spade, faer; later SU2, OpenFOAM as optional external solvers). Benchmark papers are cited by author and year. Add the family's line to README and NOTICE: "Product and file-format names are trademarks of their owners and are used only to describe file compatibility." |

---

## 2. What Datum Flow 0.1 does (keep it small, make it feel real)

**Geometry (2D):**
- Rectangles, circles, polygons and arcs; subtract and add (a channel with a cylinder inside, a step, a cavity).
- Templates: channel, cavity, step, cylinder in a channel, heated box.
- Type coordinates, snap to a grid, name every edge (it becomes a boundary).
- Import DXF outlines (lines and arcs only).

**Fluid:**
- Water, air and a light oil, with density, viscosity, conductivity, specific heat and expansion coefficient at a chosen temperature (each value with its source), or "custom".

**Boundaries (a wizard that checks before solving):**
- Velocity inlet: uniform or fully developed (parabolic).
- Pressure outlet.
- Wall: no-slip, or moving (lid).
- Symmetry or slip.
- Temperature, heat flux, or insulated.
- The wizard refuses to solve, and says why, when:
  - there is no outlet;
  - an edge has no boundary;
  - temperatures are set but heat is off;
  - the Reynolds or Rayleigh number shows the flow is likely turbulent. It warns in plain words: "Re ≈ 12 000: this flow is probably turbulent; 0.1 solves laminar flow only."

**Mesh:**
- Automatic, with a size slider and local refinement near walls, corners and the wake.
- A **quality report on the mesh**: element count, worst angle, size ratio, coloured on the view.

**Solve:**
- Steady laminar flow, optionally with heat and buoyancy.
- **Live residuals** and monitors (for example drag, or outlet temperature) plotted as it runs.
- Continuation for high Reynolds or Rayleigh numbers.
- Stop, resume, and plain advice when it does not converge ("Try a finer mesh near the cylinder", "Raise Re in steps").

**Results (in the app; no separate viewer needed):**
- Contours of speed, pressure, temperature and vorticity.
- Velocity arrows and **streamlines**.
- **Probes**, and plots along a line you draw (family chart style).
- **Integrated values:** flow rate through an edge, pressure drop between two edges, drag and lift on a body, wall heat flux and Nusselt number.
- Colour maps that are perceptually uniform and readable in print.

**Exports:**
- VTU (opens in free viewers).
- CSV of probes and line plots.
- PNG of the view.
- A **PDF report** (FAMILY §8): inputs, mesh, convergence and results, with the verification status of the version used.

**Examples (File › Examples), each solving in under a minute on a laptop:**
1. Lid-driven cavity (Re 100 and Re 1000).
2. Channel flow (exact parabolic profile).
3. **Flow past a cylinder** (the standard benchmark case at Re 20: drag, lift, pressure difference).
4. Backward-facing step (recirculation length).
5. Heated cavity (natural convection, Ra 10³ to 10⁶).
6. A heat-sink fin channel (an engineering case: pressure drop and heat removed).

**Who it's for:** mechanical, process, HVAC and energy engineers; researchers; students and lecturers who need trustworthy CFD without a specialist setup.

---

## 3. Verification report (Help › Verification; shipped with every release)

Same pattern as Datum Mesh: each case shows computed against reference, the error, the tolerance, and PASS or FAIL. Any FAIL blocks a release. Tiers:

1. **Exact solutions** (round-off level, about 1e-8): Couette, plane Poiseuille, Kovasznay flow.
2. **Order of accuracy:** the method of manufactured solutions (Salari & Knupp 2000), on three or more meshes. The observed order must be within ±0.1 of the formal order (P2 velocity: 3 in the L2 norm; P1 pressure: 2).
3. **Benchmarks** (published high-accuracy results). Error must be within twice the Grid Convergence Index (Celik et al. 2008: three grids, refinement ratio above 1.3, safety factor 1.25):
   - **Cylinder in a channel at Re 20** (Schäfer & Turek 1996; reference values from the benchmark's own results pages): drag 5.57953523384, lift 0.010618948146, pressure difference 0.11752016697.
   - **Lid-driven cavity at Re 1000** (Botella & Peyret 1998): stream-function minimum −0.1189366 at (0.5308, 0.5652).
   - **Heated cavity** (de Vahl Davis 1983): average Nusselt 2.243, 4.519, 8.800 at Ra 10⁴, 10⁵, 10⁶.
4. **Validation against experiment**, labelled as such: backward-facing step (Armaly et al. 1983), within the experiment's uncertainty.
5. **Regression:** each release compares its own results with the previous release's and flags any change.

**Reference values must be re-checked against the original papers before they gate a release.** The numbers above were confirmed from secondary sources during the hub's research; values not listed here (the benchmark's geometry details, Ra 10³ and its velocities, step reattachment lengths) must be taken from the papers directly. Published numbers are facts and may be keyed in with a citation. Do not ship anyone's data files without checking their terms.

---

## 4. Architecture

`crates/` (pure Rust, unit-tested):
- `flow-core`: model (geometry, fluid, boundaries, settings), units, `.dflow` read/write with version and migrations, undo/redo.
- `flow-mesh`: 2D geometry → constrained Delaunay (spade) with refinement and the quality report; boundary tagging.
- `flow-solve`: Taylor–Hood assembly, Picard and Newton, Boussinesq heat, continuation, residuals and monitors, behind the `LinearSolver` interface (faer LU now; iterative solvers later).
- `flow-post`: derived fields, streamlines, probes, line plots, integrated quantities, VTU and CSV.
- `flow-verify`: the cases of §3 as tests **and** as the in-app report.
- `flow-cli`: run a `.dflow` from the command line (copied from Mesh's CLI).

Mesh's T6 element, quadrature and faer code are **copied** in (FAMILY: self-contained apps), not linked.

`src-tauri`: commands, solving on a worker thread with progress events, the updater (`REPO = "Edgar-Mendonca/Datum-Flow"`), print to PDF, recovery.

`ui/`:
- the family window (FAMILY §6–8);
- the 2D canvas with geometry editing, mesh display and results;
- the residual and monitor charts;
- the boundary wizard, inspector and model tree;
- ? help cards;
- Options;
- light, dark and auto themes.

---

## 5. Quality bar (FAMILY §11) and the build budget (FAMILY §9)

- **Solver tests:**
  - every verification case of §3;
  - mass conservation on every example: net flow through all boundaries close to zero;
  - mesh-independence studies for the examples;
  - Newton converges in a few steps from a Picard start.
- **Hardening:**
  - degenerate geometries, zero-length edges and unconnected regions are reported, not panicked on;
  - damaged `.dflow` files open as far as possible and explain the rest;
  - a solve can be cancelled at any time;
  - a mesh of 200 000 unknowns solves within a few minutes (measured).
- **Checks before every push (run locally first):**
  - clippy `-D warnings`;
  - `cargo test --workspace`;
  - `npm run check:ui`;
  - the Playwright UI tests;
  - `cargo deny`;
  - a test that fails if a commercial product name appears in the window's text.
- **Build budget (GitHub free, public repo):** builds must stay quick and must not block the other apps.
  - CI runs on pushes to `main` and on pull requests only, with `concurrency` (`cancel-in-progress: true`), so a new push stops the old run.
  - `paths-ignore` for docs-only changes.
  - **Fast job on every push:** Linux, debug build, clippy and tests, `timeout-minutes: 30`.
  - **Heavy work** (release-mode solver tests, the full verification suite, the Windows build, UI tests) runs **nightly when something changed**, on manual dispatch, and in the release workflow.
  - **No macOS jobs for now** (Datum ships for Windows only today; this is about CI cost, not the product, and other systems can be added to the release workflow later).
  - Keep slow verification cases behind a feature or an `#[ignore]` run by the nightly job.
  - Release in batches, not on every commit.
- **Build provenance:** the release workflow adds `actions/attest-build-provenance` for the installer (as Datum Home does).

---

## 6. Docs to keep, and today's plan

**Docs (FAMILY §10):**
- `CLAUDE.md`, `docs/MEMORY.md`, `CHANGELOG.md` (plain language), `docs/PLAN-0.1.md`.
- `NOTICE` (crates, fonts; the trademark line), `LICENSE` (MIT, © 2026 Edgar Mendonca), `SECURITY.md`, `CONTRIBUTING.md`.
- `docs/VERIFICATION.md`: cases, sources, tolerances.
- `docs/site.json`:
  - `tagline`, `for`, `about`;
  - `steps` (three: **draw the geometry · set the flow · see and check the results**);
  - `highlights`;
  - `screenshots` (1440×900: cylinder streamlines, the heated cavity temperature field, the residual chart while solving, the verification report);
  - `roadmap` (§7).
- README per FAMILY §5, linking to `https://edgar-mendonca.github.io/Datum/apps/flow`.

**Plan (work in order, releasing as you go):**

| Step | Work | Release |
| --- | --- | --- |
| 1 | Read; skeleton copied from Plan (renamed, Cobalt accent, logo, publisher "Datum", updater, lean CI, release workflow with provenance); an empty model saves and opens | **0.1.0** |
| 2 | Geometry editor and templates; boundaries named on edges; mesher with refinement and quality report | 0.1.1 |
| 3 | Stokes, then Navier–Stokes (Picard → Newton) on Taylor–Hood; exact-solution and MMS tests pass; cavity and channel examples | 0.1.2 |
| 4 | Results: contours, arrows, streamlines, probes, line plots, integrated values; the cylinder benchmark passes | 0.1.3 |
| 5 | Heat and Boussinesq buoyancy; the heated cavity passes; the boundary wizard and its checks; live residuals and advice | 0.1.4 |
| 6 | Examples complete; the verification report in the app and in `docs/VERIFICATION.md`; PDF report; VTU and CSV; ? cards; screenshots, README, `docs/site.json` | **0.1.5** |

If time runs short, cut in this order: DXF import, the heat-sink example, VTU export, vorticity contours. **Never cut the verification report, the boundary checks, mass conservation, or the cylinder and cavity benchmarks.**

**At the end, write a summary** in `docs/MEMORY.md` (Session log) and in the chat:
- what was released;
- what works and what was cut;
- a 2-minute demo: open the cylinder example, solve it, show streamlines and the drag value, then open Help › Verification.

**After 0.1.0 is released**, tell the user to tell the hub chat: "add Datum Flow to apps.json (id flow, accent #2F45B5); its icon is already in brand/".

---

## 7. Roadmap: where Flow is heading and how the family joins up

```
Datum Schema ──line data──▶ Datum Flow ──pressures, temperatures──▶ Datum Mesh (loads, heat)
 (P&ID)                      (fluids)                                 (solids)
Datum Layout ──geometry (later: 3D)──▶ Datum Flow        Datum Plot ◀── results (CSV)
Datum Calc: hand checks (pipe and pump packs) beside Flow's full simulations
```

| Version | Scope |
| --- | --- |
| 0.1 | 2D steady laminar flow with heat and natural convection; verification report (this brief) |
| 0.2 **Transient** | Time-dependent flow (vortex shedding behind the cylinder: the benchmark at Re 100 with Strouhal number); SUPG; animations; monitors over time |
| 0.3 **Walls and solids** | Boundary-layer meshing with a y+ helper; conjugate heat transfer (heat through solid parts and the fluid together); axisymmetric flow (pipes, nozzles) |
| 0.4 **Bigger models** | Iterative solvers with preconditioners; parallel assembly; larger meshes; parameter sweeps |
| 0.5 **The 3D decision** | Choose, with measurements, between 3D finite elements and a finite-volume solver for 3D and turbulence; first 3D laminar cases (3D cavity, 3D cylinder benchmark); 3D meshing (fTetWild or Netgen) |
| 0.6 **External solvers (optional)** | Write case files for SU2 and OpenFOAM, run them as separate programs the user installs (never bundled into the app), read their results back, so big 3D jobs can use them |
| 0.7 **Turbulence** | Wall distance, then Spalart–Allmaras, then k-ω SST, each verified against the published turbulence-model verification cases (flat plate, bump, step) |
| 0.8 **CAD and family links** | STEP import (OpenCascade as a separate DLL); geometry from Datum Layout; line data from Datum Schema; pressures and temperatures into Datum Mesh |
| 0.9 **Teaching pack** | Guided lessons on the classic cases, each with its theory, its reference data and a "what went wrong" mode |
| 1.0 | Full verification and validation report, user guide, signed installer |

# Datum Mesh: brief (paste this into the new chat)

You are starting **Datum Mesh**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Mesh` (MIT licence). The user creates it and gives this session access.
- **What it is:** finite-element analysis on the desktop. Draw or import a part, mesh it, apply loads and supports, solve, and see stresses, deflections and temperatures, with a printable report and a built-in verification report.
- **Decided with the user (DATUM hub, session 13, 2026-10-28):** the long-term FEA/CFD/multiphysics idea (formerly "Datum Field") is now **Datum Mesh**. It is built **this week**, for a large engineering convention, together with Datum Calc. The decisions below are made; **do not wait for answers before building**. Write the plan quickly, then build.
- **Be honest about scope:** a week buys a solid, verified **2D** app (frames, trusses, plane stress and strain, heat conduction), not 3D CFD. 3D, nonlinear and CFD come in later releases with mature open solvers (§8).

---

## 0. First hour: read, plan, then build

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read, in this order:
   - `CLAUDE.md`, `MEMORY.md` (decisions for every app; §7 is the bucket list)
   - `FAMILY.md`, the design guide every app follows: stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9, docs §10, how we work and the hardening standard §11, new-app checklist §12, public words §13
   - `brand/BRAND.md`; `brain/graph.json` with `brain/BRAIN.md`
2. **The reference code.**
   - `Edgar-Mendonca/Datum-Plan` (read-only): **copy, don't reinvent**. The ribbon, backstage, Options, print, updater (`update.rs`), `help.tsx`, `roadmap.tsx`, workflows, UI and hardening tests. Its **Network Diagram canvas** (pan, zoom, snap, whiteboard) is the starting point for the drawing canvas.
   - `Edgar-Mendonca/Datum-Sim` (read-only): its solver crate layout, verification tests against known answers and its verification-report idea.
   - `Edgar-Mendonca/Datum-Atlas` (read-only): the materials data and its references (Mesh's material library comes from it).
3. **Write** `CLAUDE.md`, `docs/MEMORY.md` (same shape as the other apps) and a short `docs/PLAN-0.1.md` (scope, day plan, risks). Then build.

---

## 1. Decisions already made

| Item | Decision |
| --- | --- |
| Name | Datum Mesh |
| Accent | **Crimson**, the spare accent in FAMILY §3: `#B83250`, hover `#9C2944`, sky `#F1B3C1`, pale `#FBEBEF`, sel `#F6DCE3`, sel2 `#EDBAC7`, dark `#EF7A93`, File sidebar `#5E1A2A`. Errors keep `--crit` and always carry an icon and words, so they are never confused with the accent |
| Identifier, file, installer | `com.edgarmendonca.datummesh`, `.dmesh` (JSON, versioned), `DatumMesh-x.y.z-setup.exe` + `SHA256SUMS.txt` (Datum Home needs both; FAMILY §9) |
| Stack | Tauri 2, SolidJS, strict TypeScript; **own solver in Rust** (`crates/core`). No Python and no external solvers in 0.1 |
| Results colours | Contours with a smooth 12-band scale, blue (low) to red (high) by default, a colour-blind-safe option (viridis) in Options; the legend always shows values and units |
| Ribbon tabs | Home · Geometry · Mesh · Loads · Solve · Results · View · Help (contextual Format on a selection) |
| Logo | FAMILY §5 tile in crimson; glyph: a triangular mesh on an L-bracket, its corner shaded darker (the stress hot spot), the amber diamond as the family mark. Copy to the hub's `brand/datum-mesh-icon.svg` |

---

## 2. What Datum Mesh 0.1 does

**Two kinds of model in one app:**

**A. Frames and trusses (line elements)**
- Draw nodes and members on the canvas (snap to grid, type coordinates), 2D.
- Members: 2D beam (Euler–Bernoulli: axial + bending) or truss (axial only); sections from a library (rectangle, circle, tube, I, channel, angle; properties computed) or your own A, I, depth.
- Supports: pinned, roller, fixed, spring; loads: point forces and moments at nodes, uniform and linearly varying loads on members, self-weight.
- Results: deflected shape (scaled), axial, shear and bending-moment diagrams, reactions, member stresses and utilisation against yield.

**B. Plane solids (2D continuum)**
- Geometry: rectangles, circles, polygons and polylines, with holes (subtract), on the canvas; DXF import in 0.2.
- Analysis types: **plane stress** (thin plates, with thickness), **plane strain** (long bodies), **steady heat conduction** (same mesh, temperatures and heat flux).
- Mesh: automatic triangles (constrained Delaunay with quality refinement), global size and local refinement on edges or near points; **quadratic 6-node triangles** for accuracy (linear triangles as an option); mesh quality shown (min angle, aspect).
- Supports on edges and points: fixed, roller (normal fixed), symmetry; loads: edge pressure, edge force (total or per length), point force, gravity; heat: fixed temperature, heat flux, convection to ambient.
- Results: displacement (magnitude, x, y), von Mises, principal stresses, σx, σy, τxy, safety factor against yield; temperature and heat flux. Contours (smoothed and element), deformed shape with a scale slider, a probe (click anywhere for values), min/max markers, reactions and their sum against the applied loads (an equilibrium check shown on screen).

**Materials:** a library from Datum Atlas (steels, aluminium, titanium, copper, cast iron, common polymers; E, ν, density, yield, thermal conductivity, expansion; each with its source), plus your own.

**Report:** print to PDF (FAMILY §8): title block, the model (geometry, mesh statistics, materials, loads, supports), results pictures with legends, tables of maxima and reactions, the equilibrium check, and the solver version. What engineers hand in.

**Verification report (headline feature):** Help › Verification opens a document listing every benchmark, Datum Mesh's result, the reference value, the error and the source. It is generated by the test suite at build time, so it is always true for the version you run.

**Who it's for:** mechanical, structural, process and aerospace engineers, students and lecturers.

**Public words (FAMILY §13):** describe what Mesh does. Never name, compare with, or say it copies or replaces a commercial product, in any file, commit, release note or on the site. Open solvers and benchmark sets may be named (they are not products we compete with).

---

## 3. Architecture

**`crates/core` (pure Rust, unit-tested):**
- `model`: nodes, members, sections, regions (polygons with holes), materials with units, loads, supports, analysis settings; `.dmesh` read/write with a version and migrations; undo/redo as operations (like Plan's `doc.rs`).
- `mesh`: constrained Delaunay triangulation with refinement (the `spade` crate, MIT/Apache) → 6-node triangles; quality metrics; local sizes.
- `elements`: 2D beam and truss stiffness; T3 and T6 plane stress/strain (Gauss integration); T3/T6 heat conduction with convection boundaries; consistent load vectors (edge pressure, distributed member loads, gravity).
- `solve`: sparse assembly (triplets → CSC), supports by elimination, sparse Cholesky (the `faer` crate, MIT); a solve report (equations, time, residual, equilibrium).
- `post`: stresses at Gauss points, recovered and averaged to nodes, von Mises and principals, safety factor; member force diagrams; reactions.
- `bench`: the verification benchmarks (§5) as data and tests.

**`src-tauri`:** commands, the updater (`REPO = "Edgar-Mendonca/Datum-Mesh"`), print to PDF, recovery of unsaved work. Solving runs on a background thread with progress; models with 50 000 nodes solve in seconds.

**`ui/`:** the family window (FAMILY §6–8); the canvas (from Plan's whiteboard: pan, zoom, snap, rulers) drawing geometry, mesh and results with WebGL or Canvas 2D (contours as coloured triangles); a model tree (geometry, materials, mesh, loads, supports, results); an inspector with values and units; a results legend; the ? help cards; Options (units SI/US, contour scale, deformation scale); light/dark/auto.

---

## 4. The week (two releases before the convention)

| Day | Work | Release |
| --- | --- | --- |
| 1 | Read, plan, skeleton copied from Plan (renamed, crimson accent, logo, updater, CI, release workflow) | **0.1.0**: shell, updater, Home, File page, the canvas that saves and opens |
| 2 | Engine: frames and trusses end to end (elements, assembly, solve, diagrams) with benchmarks 1–3; frame drawing and results in the UI | 0.1.1 |
| 3 | Engine: meshing and T6 plane stress/strain with benchmarks 4–6 | — |
| 4 | Plane solid UI: geometry tools, mesh controls, edge loads and supports, contours, probe, deformed shape | 0.1.2 |
| 5 | Heat conduction; materials library; print report; verification report; six example models (below) | **0.1.3** (convention build) |
| 6–7 | Fixes from a clean Windows PC; speed on large meshes; README, screenshots, `docs/site.json` | 0.1.4 |

**Example models (File › Examples), chosen for the convention:** a portal frame with wind and roof loads; a roof truss; a lifting lug (plate with a hole, pin load); an L-bracket with a fillet (stress concentration); a flange plate with bolt holes; a heat sink fin with convection.

If time runs short, cut in this order: heat conduction, linear-triangle option, the section library beyond rectangle/circle/tube/I. **Never cut the benchmarks, the equilibrium check or the report.**

---

## 5. Quality bar: verified from day one

Every element and solver path has a test against a known answer, and each becomes a line of the verification report:

| # | Benchmark | Reference |
| --- | --- | --- |
| 1 | Cantilever, end load: tip deflection PL³/3EI and root moment | Beam theory |
| 2 | Simply supported beam, uniform load: 5wL⁴/384EI, wL²/8 | Beam theory |
| 3 | A statically determinate truss: member forces | Method of joints (hand calculation in the test) |
| 4 | Plate with a small circular hole in tension: stress concentration ≈ 3 | Kirsch solution |
| 5 | Thick cylinder under internal pressure (plane strain quarter model): hoop and radial stress | Lamé equations |
| 6 | Elliptic membrane: σyy at the inner point | NAFEMS LE1 (92.7 MPa) |
| 7 | Plane wall and fin with convection: temperature profile | 1D conduction analytical solution |
| 8 | Patch tests for T3 and T6 (constant stress reproduced exactly) | FE theory |

Plus: mesh convergence for benchmarks 4–6 shown in the report (the error falls as the mesh refines); random models never panic (hardening, FAMILY §11); damaged `.dmesh` files open as far as possible. FAMILY §11 workflow and all checks before every push: clippy `-D warnings`, `cargo test --workspace`, `npm run check:ui`, Playwright UI tests, `cargo deny`.

---

## 6. Docs to keep (FAMILY §10)

- `CLAUDE.md`; `docs/MEMORY.md`; `CHANGELOG.md`; `docs/PLAN-0.1.md`; `NOTICE`; `LICENSE`; `SECURITY.md`, `CONTRIBUTING.md`.
- `docs/site.json` with `tagline`, `for`, `about`, `steps` (three: draw and mesh · load and support · solve and report), `highlights`, `screenshots` (1440×900: the L-bracket stress contours, the portal frame moment diagram, the verification report, the heat fin), `roadmap`.
- README per FAMILY §5, linking to `https://edgar-mendonca.github.io/Datum/apps/mesh`.

**After 0.1.0 is released**, tell the user to tell the hub chat: "add Datum Mesh to apps.json (id mesh, accent #B83250) and copy its icon".

---

## 7. Links to the family

- **Atlas:** the materials library (0.1, copied data with sources; live link later).
- **Calc:** "send to Calc" a result as a variable with units, so a hand check sits beside the FE result (0.2).
- **Plot:** export probe lines and convergence data as CSV for Plot (0.2).
- **Sim:** a part's stiffness or thermal model as a block for Sim (later).

## 8. The long road (for `docs/site.json` and MEMORY; one step per release series)

| Step | Scope | Solver |
| --- | --- | --- |
| 0.1 | 2D frames and trusses, plane stress and strain, heat conduction | Own (Rust) |
| 0.2 | Axisymmetric solids, 3D frames, modal (natural frequencies), buckling of frames, DXF import, thermal stress | Own |
| 0.3 | 3D solids, linear static, modal and thermal; STEP import | Own, or CalculiX run as a separate program |
| 0.4 | Nonlinear: plasticity, large deflection, contact | CalculiX or Code_Aster (separate programs) |
| 0.5 | CFD: incompressible flow, conjugate heat transfer | OpenFOAM or SU2 (separate programs) |
| 0.6 | Multiphysics: electromagnetics, fluid–structure | Elmer, FEniCSx (separate programs) |
| 1.0 | Validation report covering every analysis type, user guide, signed installer | — |

Open-source building blocks for later steps: OpenCascade (CAD, LGPL), Gmsh (meshing, GPL, run as a separate program), meshio (MIT), VTK (BSD) for 3D results. **GPL solvers and meshers always run as separate programs**, never linked, so Datum Mesh stays MIT. Check every licence before adding it and record it in `NOTICE`.

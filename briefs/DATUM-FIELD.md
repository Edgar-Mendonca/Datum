# Datum Field: future app (parked)

**Status:** an idea, kept for later (decided with the user in DATUM hub session 9, 2026-10-27). Not being built. Datum Sim comes first (`briefs/DATUM-SIM.md`). When the user starts Field, turn this into a full brief, like DATUM-SIM.md.

## What it will be

One app for analysis on a mesh: **structural FEA, heat transfer, CFD and coupled multiphysics**, including vibration (modes) and later electromagnetics. The name: every result is a *field* (stress, temperature, velocity, pressure).

- **Who for:** mechanical, structural, thermal, process and aerospace engineers, researchers and students.
- **How Datum fits:** Datum builds what people touch:
  - set-up: geometry, materials from Datum Atlas, loads, supports, contacts
  - meshing controls
  - results: contours, deformed shapes, probes, sections, animations, plots via Datum Plot
  - clear reports

  Mature open solvers do the heavy solving as separate processes, which keeps Datum's MIT licence clean.
- **A headline feature:** a built-in **verification report** (NAFEMS and textbook benchmarks passed, with references).
- **Link to Datum Sim:** Field exports simplified models of parts (stiffness, thermal behaviour) as FMUs or blocks for Sim; Sim sends loads back to Field.

## Steps (each a useful app on its own)

| Step | Scope | Solver |
| --- | --- | --- |
| 1. Frame | 2D/3D beams, frames, trusses: shear, moment, deflection, buckling | Own Rust solver |
| 2. 2D | Plane stress/strain, axisymmetric, 2D heat conduction, modal | Own Rust solver |
| 3. 3D | Linear static, modal, thermal; STEP import; tetra/hexa meshes | Own Rust solver, or CalculiX |
| 4. Nonlinear | Plasticity, large deformation, contact, thermal–structural coupling | CalculiX, Code_Aster |
| 5. CFD | Incompressible and compressible flow, conjugate heat transfer | OpenFOAM, SU2 |
| 6. Multiphysics | Electromagnetics, fluid–structure, acoustics | Elmer, FEniCSx |

## What it will be built with

| Area | Open source | Licence (check again before use) |
| --- | --- | --- |
| CAD geometry (STEP/IGES) | OpenCascade (OCCT) | LGPL |
| Meshing | Gmsh (pygmsh), TetGen (optional) | GPL (external process) / AGPL-like (check) |
| Mesh formats | meshio | MIT |
| Structural/thermal solvers | CalculiX, Code_Aster | GPL (external process) |
| Multiphysics | Elmer FEM, FEniCSx (dolfinx), MFEM | GPL/LGPL (external process) / LGPL / BSD |
| Light Python FEM | scikit-fem | BSD |
| CFD | OpenFOAM, SU2 | GPL (external process) / LGPL |
| Results and 3D viewing | VTK / PyVista, vtk.js or three.js in the window | BSD / MIT |
| Rust (own solvers) | `faer`, `nalgebra`, `sprs` (sparse), `rayon` (parallel) | MIT/Apache |
| Python | numpy, scipy (sparse solvers, eigenvalues), matplotlib | BSD |

## Big risks to plan for

- **Trust:** results drive safety decisions. Verify every element and solver against benchmarks; show the verification report in the app.
- **CAD import and meshing** are the hardest parts; use OpenCascade and Gmsh rather than writing our own.
- **Licences:** keep GPL solvers as separate processes. Never link them into the MIT app.
- **Size:** steps 1–2 fit the family's way of building; steps 3–6 are a multi-year journey.

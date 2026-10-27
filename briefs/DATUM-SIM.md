# Datum Sim: brief (paste this into the new chat)

You are starting **Datum Sim**, a new app in the Datum family of free, open-source desktop tools for engineers, scientists, researchers and analysts.

- **Repository:** `Edgar-Mendonca/Datum-Sim` (MIT licence). The user creates it and gives this session access.
- **What it is:** a desktop app to model and simulate dynamic systems: block diagrams, control design, physical components, testing against data.
- **Decided with the user (DATUM hub, session 9, 2026-10-27):** the name is Datum Sim; it is the next app the family builds. The FEA/CFD idea is a separate, later app, **Datum Field** (see `briefs/DATUM-FIELD.md` in the hub); do not build any of it here.

---

## 0. First session: read, then plan (no code yet)

1. **The family hub.** Add `Edgar-Mendonca/Datum` read-only and read, in this order:
   - `CLAUDE.md` and `MEMORY.md` (decisions for every app; §7 is the bucket list)
   - `FAMILY.md`, the design guide every app follows: stack §2, colour §3, type §4, logo §5, window §6, components §7, printing §8, updates and releases §9, docs in every repo §10, how we work §11, new-app checklist §12, public words §13
   - `brand/BRAND.md` (the family brand; app icons follow FAMILY §5)
   - `brain/graph.json` with `brain/BRAIN.md`: the whole family as one graph (every app, file, decision, release, plan and session). Use it to find how things were done before.
2. **The reference code.** Add `Edgar-Mendonca/Datum-Plan` read-only. It is the reference implementation: copy, don't reinvent. Look at the ribbon, backstage (File page), Options, print (`print.tsx`), updater (`src-tauri/src/update.rs`), the **Network Diagram canvas** (the starting point for the block editor), `help.tsx` (the ? beside every tool), `roadmap.tsx` (reads `docs/site.json`), the workflows and the UI tests.
3. **How Python is bundled.** Add `Edgar-Mendonca/Datum-Plot` read-only. It shows the embeddable CPython runtime pack, the long-running worker over JSON lines (`py/worker.py`, `src-tauri/src/py.rs`, `runtime.rs`), one installer with the runtime inside, and how analyses feed graphs.
4. **Write the plan.** Follow FAMILY §12:
   - write `CLAUDE.md`, `docs/MEMORY.md` and `docs/PLAN-0.1.md` (brainstorm, architecture, 0.1 scope, release plan, the questions in §7 below);
   - draw the app icon per FAMILY §5;
   - **build only after the user answers the questions.**

---

## 1. What Datum Sim does

You draw a model, press Run, and see how the system behaves over time.

**Signal blocks (causal), from 0.1:**
- Sources: step, ramp, sine, pulse, constant, clock, table, from file (CSV/Plot)
- Math: gain, sum, product, divide, abs, sign, min/max, function (expression), saturation
- Continuous: integrator (with limits and reset), derivative, transfer function, zero-pole-gain, state-space, PID, transport delay
- Discontinuities: dead zone, rate limiter, relay, backlash, quantiser
- Discrete (0.2): zero-order hold, unit delay, discrete transfer function and state-space, discrete PID
- Routing: mux/demux, switch, selector, goto/from, subsystems, buses (0.2)
- Lookup tables: 1-D and 2-D
- Sinks: scope (live while running), XY graph, display, to file, to Datum Plot

**Physical components (acausal), from 0.4.** You connect ports; the app writes and solves the equations:
- mechanical translational: mass, spring, damper, friction, force and position sources
- rotational: inertia, torsion spring, gear, motor
- electrical: R, L, C, sources, diode, DC motor
- hydraulic and pneumatic: pipe, pump, valve, tank, accumulator, compressor
- thermal: heat capacity, conduction, convection, radiation

**Analysis:**
- parameter sweeps, Monte Carlo, sensitivity analysis
- operating points (trim) and linearisation
- Bode, Nyquist and root locus; PID tuning; step-response specifications (rise time, overshoot, settling)
- fitting model parameters to measured data

**Exchange:**
- results to Datum Plot and CSV
- material properties from Datum Atlas
- FMU import and export (the open FMI standard) in 0.5

**Who it's for:** control, mechanical, electrical, process and mechatronics engineers, researchers and students.

**Worked examples from the user's field:** compressor anti-surge control, pump–pipe–tank level control, DC motor speed control with PID, heat exchanger temperature control, mass–spring–damper, vehicle cruise control.

**Public words (FAMILY §13):** describe what the app does and who it helps. Never name, compare with, or say the app copies or replaces a commercial product.

---

## 2. Architecture (propose in PLAN-0.1, confirm with the user)

**Engine: Rust, in `crates/core`** (pure, unit-tested; the window never calculates):
- the model: blocks, ports, wires, parameters with units, subsystems, `.dsim` files (JSON, versioned, migrations)
- compile the diagram: flatten subsystems, check types and sizes, execution order, algebraic-loop detection
- assemble the system: ODEs for signal blocks; DAEs for physical components (0.4)
- solvers:
  - fixed step: Euler, Heun, RK4
  - variable step: Dormand–Prince RK45 with error control
  - stiff: BDF / SDIRK
  - DAE: IDA (0.4)
- events, zero-crossings and resets
- results: time series per signal, decimation, streaming to the scopes while running
- undo/redo as ops, like Plan's `doc.rs`

**Python, bundled** as in Datum Plot (FAMILY §2 exception), for the heavy analysis:
- control design
- symbolic work for physical models
- optimisation and fitting
- FMUs
- user-written Python blocks
- publication figures

Basic simulations run in Rust and need no Python.

**Window:** Tauri 2, SolidJS and strict TypeScript, with the family design (FAMILY §3–8):
- **Block canvas**, starting from Plan's Network Diagram: whiteboard dots, pan and zoom, snap, orthogonal wires that route around blocks, mini-map, multi-select, copy/paste, align.
- **Library panel**, searchable, with an icon per block (24×24 line icons, FAMILY §7).
- **Inspector:** parameters with units, a "?" card per block.
- **Run bar:** start time, stop time, solver, step, run/stop/step, progress.
- **Scopes** in the family chart style (Chart.js; live while running; cursors; PNG button).
- **Print to PDF** of diagrams, scopes and a results report.
- Light, dark and auto themes; the in-app updater; recovery of unsaved work.

**Files:** `.dsim` (models); results as CSV or HDF5. The identifier is `com.edgarmendonca.datumsim`; the installer is `DatumSim-x.y.z-setup.exe`.

---

## 3. Open-source building blocks

Check every licence before adding a dependency and record it in `NOTICE`. Add each Python library in the release that first needs it, as Plot does.

### Rust

| Crate | Use |
| --- | --- |
| `diffsol` | ODE/DAE solvers (BDF, SDIRK), stiff and non-stiff |
| `sundials-sys` / a SUNDIALS binding | CVODE and IDA, industrial-grade ODE/DAE solvers (BSD) |
| `nalgebra`, `faer` | Linear algebra, dense and sparse |
| `petgraph` | Block graph, execution order, algebraic loops |
| `evalexpr` (or `meval`) | Expressions inside blocks |
| `serde`, `serde_json` | Model files |
| `hdf5` (optional) | Large results |
| an FMI crate (0.5) | Reading FMUs natively |

### Python (bundled)

| Library | Use | Licence |
| --- | --- | --- |
| numpy, scipy | `solve_ivp`, `signal`, `linalg`, `optimize`: the core numerics | BSD |
| python-control | Transfer functions, state-space, Bode, Nyquist, root locus, LQR, PID tuning | BSD (**do not** add `slycot`: GPL) |
| sympy | Symbolic equations, simplification, DAE index reduction | BSD |
| CasADi | Optimal control, DAE sensitivities, parameter estimation | LGPL (dynamic library only) |
| scikits.odes / scikit-SUNDAE | SUNDIALS IDA from Python | BSD |
| FMPy | FMU import/export and co-simulation | BSD |
| lmfit | Fit model parameters to measured data | BSD |
| SALib | Sensitivity analysis (Sobol, Morris) | MIT |
| CoolProp | Fluid properties for thermal and hydraulic components | MIT |
| pint | Units on every parameter | BSD |
| networkx | Graph analysis of large models | BSD |
| numba | Fast user-written Python blocks | BSD |
| pandas, h5py | Results storage and export | BSD |
| matplotlib | Publication figures (the same renderer as Plot) | PSF-style |

### Optional external tools

These run as separate processes, which keeps Datum's MIT licence clean:
- **OpenModelica** (GPL/OSMC): a Modelica compiler.
- **Modelica Standard Library** (BSD-3): a reference for physical component equations and test cases.

---

## 4. Release plan (proposal)

| Version | Scope |
| --- | --- |
| **0.1.0** | FAMILY §12 shell: installer, updater, Home, File page, Options, Help with ?-cards, Roadmap page. Block editor with about 25 core blocks; scopes; Euler, RK4, Dormand–Prince and BDF; run, stop and step; parameter sweep; export to CSV and Datum Plot; `.dsim` with undo; Print to PDF. The whole UI laid out with planned features dimmed, as Plot did. 3–4 worked examples |
| 0.2 | Subsystems and masks (block dialogs), buses, discrete and multi-rate blocks, events and zero-crossings, algebraic-loop handling, goto/from |
| 0.3 | Control design: operating points, linearise, Bode, Nyquist and root locus, PID auto-tuning, step-response specifications |
| 0.4 | Physical modelling libraries (mechanical, rotational, electrical, hydraulic, thermal), DAE assembly, IDA |
| 0.5 | FMU import and export; optional Modelica import through OpenModelica |
| 0.6 | State machines, Python blocks, Monte Carlo and sensitivity, fitting to measured data, report builder |
| 1.0 | Validation suite and report, user guide, signed installer |

Small, consecutive releases (0.1.0, 0.1.1, …), each through the in-app updater (FAMILY §9).

---

## 5. Quality bar

- **Verified solvers and blocks.** Every block and solver has a unit test against a known answer:
  - first- and second-order step responses
  - harmonic oscillator energy
  - Van der Pol and the Robertson stiff problem
  - a bouncing ball for events
  - a PID loop against its closed-form response
- **A verification report** (Datum against analytical or published results) ships with the app.
- **Speed:** a model with 500 blocks stays smooth to edit, and simulation speed is measured in CI.
- **The FAMILY §11 workflow:** the user reviews a release; reproduce first; big asks get a plan and questions; engine first with a test; check in the real app (Xvfb screenshots); a UI test for every bug; run all checks; release; report in plain language.
- **Checks before every push:** clippy `-D warnings`, `cargo test --workspace`, `npm run check:ui`, the Python tests, the Playwright UI tests.

---

## 6. Docs to keep (FAMILY §10)

- `CLAUDE.md`
- `docs/MEMORY.md`, kept in the same shape as the other apps (product table, Files, Decisions, Roadmap, Session log, How we work), because the hub's brain reads it
- `CHANGELOG.md` (`## x.y.z — date`)
- `docs/PLAN-x.y.md` before each big release
- `docs/site.json` (tagline, for, highlights, screenshots, roadmap)
- `NOTICE`, `LICENSE`

**After the first release**, tell the user to add Datum Sim to the hub's `apps.json` (in the hub chat). The website and the Datum network then pick it up automatically.

---

## 7. Questions for the user (put them in PLAN-0.1)

1. **Accent colour:** a spare accent from FAMILY §3 (Amber `#A8650F` or Crimson `#B83250`, though crimson sits close to the red used for errors), or a new one, for example indigo or orange?
2. **Python:** bundled from 0.1 (like Plot; a bigger installer, but analysis is ready), or a Rust-only 0.1 with Python arriving in 0.3 for control design?
3. **Worked examples:** which first? Compressor anti-surge, pump–tank level, DC motor PID, heat exchanger, mass–spring–damper.
4. **Physical modelling (0.4):** our own equation-based components in Rust, or lean on OpenModelica as an external compiler?
5. **Priority after 0.1:** control design (0.3) or physical modelling (0.4) first?
6. **Ribbon tabs:** propose Model · Simulate · Analyze · View · Help, with Format tools as a contextual tab. Agree?

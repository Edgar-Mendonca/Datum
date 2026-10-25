# The Datum brain

`graph.json` is one graph of everything the Datum family has built and decided: the apps, the design guide, the technologies, every source file, decision, release, plan and working session. It is generated from the repositories, so it never drifts from them, and it is drawn as the interactive [Datum network](https://edgar-mendonca.github.io/Datum/network).

**Use it at the start of any project** (a new Datum app, or anything else): read `graph.json` to see how things are built, what was decided and why, and what is still planned, before writing a plan.

## Regenerate

```bash
node brain/brain.mjs      # reads FAMILY.md, MEMORY.md, apps.json here + each app's docs/MEMORY.md, CHANGELOG.md, docs/site.json
```

Run it at the end of every session that changes a MEMORY, a CHANGELOG or `apps.json`, and commit `brain/graph.json`. The website rebuilds the graph by itself every day.

## Schema

```jsonc
{
  "generated": "2026-10-25",
  "types": { "hub": "The DATUM hub", "app": "App", … },        // node kinds and their names
  "apps":  [{ "id": "plan", "name": "Datum Plan", "repo": "Edgar-Mendonca/Datum-Plan", "accent": "#0B5CAD" }],
  "nodes": [{ "id": "plan-decision-12", "type": "decision", "app": "plan", "label": "…", "text": "…\n\nWhy: …",
              "date": "0.3.1", "version": "…", "when": "Next", "path": "ui/src/help.tsx", "url": "https://github.com/…" }],
  "edges": [{ "source": "app-plan", "target": "plan-decision-12", "kind": "decided" }]
}
```

| Node `type` | From | Notes |
| --- | --- | --- |
| `hub` | — | `hub`: the DATUM repo itself |
| `app` | `apps.json`, `site.json`, MEMORY product table | `app-<id>`; text holds tagline, audience, stack |
| `guide` | `FAMILY.md` sections | `guide-<n>` = FAMILY §n |
| `tech` | stack lines, files, decisions | Rust, Tauri 2, SolidJS, Python… (only those used) |
| `workflow` | "How we work" in each MEMORY | `workflow-1` … `workflow-9`, shared by all apps |
| `decision` | Decisions tables (here and in each app) | text = decision + "Why:" |
| `file` | the Files table in each app MEMORY | `path`, what it does |
| `release` | each CHANGELOG `## x.y.z — date` | `<app>-v<x.y.z>`, chained oldest → newest |
| `roadmap` | `site.json` roadmap, else MEMORY roadmap rows 🔜/⬜ | chained after the newest release |
| `session` | each Session log heading | text = the session's bullets |

| Edge `kind` | Meaning |
| --- | --- |
| `app`, `guide` | hub → app, hub → FAMILY section |
| `follows` | app → FAMILY section it follows (and every "FAMILY §n" it cites) |
| `uses`, `about`, `names` | app, file, decision or guide → technology |
| `contains` | app → source file |
| `decided`, `session`, `released` | app (or hub) → its decisions, sessions, first and newest release |
| `in`, `shipped` | decision → the release it was made in; session → the release it shipped |
| `touches` | decision → a source file it names |
| `mentions`, `family-wide` | decision → another app it names; decision → hub when it applies to every app |
| `then`, `next` | release → next release; release/plan → next plan |
| `works by`, `describes` | app → workflow step; FAMILY §11 → workflow |

The public website leaves out sentences (and nodes) that name other products (FAMILY §13); this file keeps everything, as the MEMORY files do.

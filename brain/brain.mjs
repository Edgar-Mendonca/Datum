// The Datum brain: one graph of everything the family has built and decided.
// Reads FAMILY.md, MEMORY.md and apps.json here, and each app's docs/MEMORY.md, CHANGELOG.md and
// docs/site.json from GitHub, and turns them into nodes and edges (see BRAIN.md for the schema).
//   node brain/brain.mjs          → writes brain/graph.json
// The site imports buildBrain() to draw the Datum network page.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export const TYPES = {
  hub: "The DATUM hub",
  app: "App",
  guide: "Design guide (FAMILY.md)",
  tech: "Technology",
  workflow: "How we work",
  decision: "Decision",
  file: "Source file",
  release: "Release",
  roadmap: "Planned",
  idea: "Future app (bucket list)",
  session: "Session",
};

// Technologies recognised in the stack lines, decisions and file notes.
const TECH = ["Rust", "Tauri 2", "WebView2", "SolidJS", "Vite", "TypeScript", "Chart.js", "IBM Plex", "GridCraft", "Python", "numpy",
  "SciPy", "matplotlib", "statsmodels", "lmfit", "openpyxl", "Playwright", "NSIS", "GitHub Actions", "Astro", "d3-force", "Xvfb"];

const plain = s => String(s ?? "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*|__|`/g, "").replace(/\s+/g, " ").trim();
/** Like plain(), but keeps one line per paragraph or list item. */
const lines = s => String(s ?? "").split("\n").map(l => plain(l.replace(/^\s*([-*]|\d+\.)\s+/, "· "))).filter(l => l && !/^```/.test(l)).join("\n");
const short = (s, n = 64) => { s = plain(s); return s.length > n ? `${s.slice(0, n - 1).replace(/[\s,;:(]+\S*$/, "")}…` : s; };
const slug = s => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

/** The text of "## <title>" (or "### <title>") up to the next heading of the same or higher level. */
function section(md, title, level = 2) {
  const re = new RegExp(`^${"#".repeat(level)} [^\\n]*${title}[^\\n]*$`, "im");
  const m = md.match(re);
  if (!m) return "";
  const rest = md.slice(m.index + m[0].length);
  const end = rest.search(new RegExp(`^#{1,${level}} `, "m"));
  return end < 0 ? rest : rest.slice(0, end);
}
/** Markdown table rows (without the header and the --- line) as arrays of cells. */
function table(text) {
  const rows = text.split("\n").filter(l => /^\s*\|/.test(l)).map(l => l.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(c => c.trim()));
  return rows.length > 2 ? rows.slice(2) : [];
}

export async function buildBrain({ root = new URL("../", import.meta.url), get = defaultGet } = {}) {
  const read = p => readFileSync(new URL(p, root), "utf8");
  const nodes = new Map(), edges = [], seen = new Set();
  const node = (n) => { if (!nodes.has(n.id)) nodes.set(n.id, n); return nodes.get(n.id); };
  const edge = (source, target, kind) => {
    if (!source || !target || source === target || !nodes.has(source) || !nodes.has(target)) return;
    const k = `${source}>${target}>${kind}`;
    if (!seen.has(k)) { seen.add(k); edges.push({ source, target, kind }); }
  };
  const HUB = "https://github.com/Edgar-Mendonca/Datum/blob/HEAD/";

  // The hub, its guide sections and its own decisions.
  const registry = JSON.parse(read("apps.json")).apps;
  node({ id: "hub", type: "hub", label: "DATUM", text: "The home of the Datum family: the design guide, the family memory, the app registry and the website.", url: "https://github.com/Edgar-Mendonca/Datum" });
  const family = read("FAMILY.md");
  for (const part of family.split(/^## /m).slice(1)) {
    const m = part.match(/^(\d+)\.\s*(.+)/);
    if (!m) continue;
    node({ id: `guide-${m[1]}`, type: "guide", label: `§${m[1]} ${m[2].trim()}`, text: lines(part.slice(part.indexOf("\n") + 1)).slice(0, 1600), url: `${HUB}FAMILY.md` });
    edge("hub", `guide-${m[1]}`, "guide");
  }
  for (const t of TECH) node({ id: `tech-${slug(t)}`, type: "tech", label: t, text: "" });
  const hubMemory = read("MEMORY.md");
  table(section(hubMemory, "Decisions")).forEach((r, i) => {
    node({ id: `hub-decision-${i}`, type: "decision", app: "hub", label: short(r[1]), text: `${plain(r[1])}\n\nWhy: ${plain(r[2])}`, date: plain(r[0]), url: `${HUB}MEMORY.md` });
    edge("hub", `hub-decision-${i}`, "decided");
  });
  section(hubMemory, "Session log").split(/^### /m).slice(1).forEach((s, i) => {
    const head = s.slice(0, s.indexOf("\n"));
    node({ id: `hub-session-${i}`, type: "session", app: "hub", label: short(head.replace(/^[\d-/]+:\s*/, ""), 48), date: head.match(/^[\d-/]+/)?.[0], text: lines(s.slice(head.length)), url: `${HUB}MEMORY.md` });
    edge("hub", `hub-session-${i}`, "session");
  });

  // The bucket list: future apps (MEMORY §7), linked to the apps and technologies they reuse.
  const ideas = table(section(hubMemory, "Bucket list"));
  ideas.forEach(r => {
    const id = `idea-${slug(r[0])}`;
    node({ id, type: "idea", app: "hub", label: plain(r[0]), when: plain(r[5]), text: `${plain(r[1])}\n\nFor: ${plain(r[2])}\nReuses: ${plain(r[3])}\nSize: ${plain(r[4])}\nStatus: ${plain(r[5])}`, url: `${HUB}MEMORY.md` });
    edge("hub", id, "idea");
  });

  // Every app.
  for (const a of registry) {
    const raw = p => `https://raw.githubusercontent.com/${a.repo}/${a.branch ?? "HEAD"}/${p}`;
    const blob = p => `https://github.com/${a.repo}/blob/HEAD/${p}`;
    const [memory, changelog, siteText] = await Promise.all([get(raw("docs/MEMORY.md")), get(raw("CHANGELOG.md")), get(raw("docs/site.json"))]);
    const site = siteText ? JSON.parse(siteText) : null;
    const id = a.id, app = `app-${id}`, accent = site?.accent ?? a.accent;
    const product = Object.fromEntries(table(memory ? `| | |\n| --- | --- |\n${memory.split("\n---")[0]}` : "").map(r => [plain(r[0]).toLowerCase(), r[1]]));
    node({ id: app, type: "app", app: id, label: site?.name ?? a.name, accent, text: `${site?.tagline ?? a.tagline}\n\nFor: ${site?.for ?? a.for}${product.stack ? `\n\nStack: ${plain(product.stack)}` : ""}`, url: `https://github.com/${a.repo}` });
    edge("hub", app, "app");
    for (const n of [2, 3, 4, 5, 6, 7, 9, 10, 11]) edge(app, `guide-${n}`, "follows");

    const mem = memory ?? "", stack = `${product.stack ?? ""} ${product.product ?? ""}`;
    for (const t of TECH) if (new RegExp(`\\b${t.replace(/[.+]/g, "\\$&")}\\b`, "i").test(stack)) edge(app, `tech-${slug(t)}`, "uses");
    for (const m of mem.matchAll(/FAMILY(?:\.md)?\s*§\s*(\d+)/g)) edge(app, `guide-${m[1]}`, "follows");

    // Releases from the CHANGELOG, oldest first, chained.
    const rel = [];
    for (const part of (changelog ?? "").split(/^## /m).slice(1)) {
      const m = part.match(/^v?(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})/);
      if (!m) continue;
      const body = part.slice(part.indexOf("\n") + 1).trim();
      const first = body.split(/\n\s*\n/)[0] ?? "";
      const summary = !/^(\*\*|[-*] |#)/.test(first) ? first : body.match(/^[-*] (.+)$/m)?.[1] ?? "";
      rel.push(node({ id: `${id}-v${m[1]}`, type: "release", app: id, label: `${a.name.replace("Datum ", "")} ${m[1]}`, version: m[1], date: m[2], text: plain(summary), url: `https://github.com/${a.repo}/releases/tag/v${m[1]}` }));
    }
    rel.reverse().forEach((r, i) => i ? edge(rel[i - 1].id, r.id, "then") : edge(app, r.id, "released"));
    if (rel.length) edge(app, rel[rel.length - 1].id, "released");
    const ver = v => nodes.has(`${id}-v${v}`) ? `${id}-v${v}` : null;

    // Planned work: site.json roadmap, else the MEMORY roadmap rows not done yet.
    const planned = site?.roadmap?.length ? site.roadmap.map(s => ({ v: s.v, title: s.title, when: s.when, text: s.items.join("\n") }))
      : table(section(mem, "Roadmap")).filter(r => /🔜|⬜/.test(r[3] ?? "")).map(r => ({ v: plain(r[0]), title: plain(r[1]), when: /🔜/.test(r[3]) ? "Next" : "Later", text: plain(r[2]) }));
    let prev = rel.length ? rel[rel.length - 1].id : app;
    planned.forEach(p => {
      if (!p.v || p.v === "—") return;
      const n = node({ id: `${id}-plan-${slug(p.v)}`, type: "roadmap", app: id, label: `${p.v} ${p.title}`, version: p.v, when: p.when, text: p.text, url: blob("docs/MEMORY.md") });
      edge(prev, n.id, "next"); prev = n.id;
    });

    // Architecture: the Files table.
    const files = table(section(mem, "Files", 3)).map((r, i) => {
      const path = plain(r[0]).split(",")[0].trim();
      return node({ id: `${id}-file-${slug(path) || i}`, type: "file", app: id, label: path.split("/").pop(), path, text: plain(r[1]), url: blob(path) });
    });
    files.forEach(f => { edge(app, f.id, "contains"); for (const t of TECH) if (new RegExp(`\\b${t.replace(/[.+]/g, "\\$&")}\\b`, "i").test(f.text)) edge(f.id, `tech-${slug(t)}`, "uses"); });

    // Decisions, linked to their release, to the files and technologies they name, and to other apps.
    const others = registry.filter(o => o.id !== id);
    table(section(mem, "Decisions")).forEach((r, i) => {
      const text = `${plain(r[1])}\n\nWhy: ${plain(r[2])}`;
      const d = node({ id: `${id}-decision-${i}`, type: "decision", app: id, label: short(r[1]), date: plain(r[0]), text, url: blob("docs/MEMORY.md") });
      edge(app, d.id, "decided");
      const v = plain(r[0]).match(/\d+\.\d+(\.\d+)?/)?.[0];
      if (v) edge(d.id, ver(v.split(".").length === 2 ? `${v}.0` : v), "in");
      for (const f of files) if (f.label.length > 4 && text.includes(f.label)) edge(d.id, f.id, "touches");
      for (const t of TECH) if (new RegExp(`\\b${t.replace(/[.+]/g, "\\$&")}\\b`, "i").test(text)) edge(d.id, `tech-${slug(t)}`, "about");
      for (const o of others) if (new RegExp(`Datum ${o.name.replace("Datum ", "")}|\\b${o.name.replace("Datum ", "")}\\b`).test(text)) edge(d.id, `app-${o.id}`, "mentions");
      if (/every Datum app|all (the )?(Datum )?apps|FAMILY/i.test(text)) edge(d.id, "hub", "family-wide");
    });

    // How we work.
    section(mem, "How we work", 3).split("\n").filter(l => /^\d+\.\s/.test(l)).forEach((l, i) => {
      const w = node({ id: `workflow-${i + 1}`, type: "workflow", label: `${i + 1}. ${short(l.replace(/^\d+\.\s*/, "").split(/[.:]/)[0], 40)}`, text: plain(l.replace(/^\d+\.\s*/, "")), url: `${HUB}FAMILY.md` });
      edge(app, w.id, "works by");
      if (i) edge(`workflow-${i}`, w.id, "then");
    });

    // Sessions, linked to the releases they shipped.
    section(mem, "Session log").split(/^### /m).slice(1).forEach((s, i) => {
      const head = s.slice(0, s.indexOf("\n"));
      const n = node({ id: `${id}-session-${i}`, type: "session", app: id, label: short(head.replace(/^[\d-/]+:\s*/, ""), 48), date: head.match(/^[\d-/]+/)?.[0], text: lines(s.slice(head.length)).slice(0, 1600), url: blob("docs/MEMORY.md") });
      edge(app, n.id, "session");
      for (const m of head.matchAll(/\b(\d+\.\d+\.\d+)\b/g)) edge(n.id, ver(m[1]), "shipped");
    });
  }

  for (const r of ideas) {
    const id = `idea-${slug(r[0])}`, text = `${r[1]} ${r[3]}`;
    for (const a of registry) if (new RegExp(`\\b${a.name.replace("Datum ", "")}\\b`).test(text)) edge(id, `app-${a.id}`, "reuses");
    for (const t of TECH) if (new RegExp(`\\b${t.replace(/[.+]/g, "\\$&")}\\b`, "i").test(text)) edge(id, `tech-${slug(t)}`, "uses");
  }
  for (const t of TECH) if (!edges.some(e => e.target === `tech-${slug(t)}` || e.source === `tech-${slug(t)}`)) nodes.delete(`tech-${slug(t)}`);
  edge("guide-2", "tech-rust", "names"); edge("guide-2", "tech-tauri-2", "names"); edge("guide-2", "tech-solidjs", "names"); edge("guide-4", "tech-ibm-plex", "names");
  edge("guide-11", "workflow-1", "describes");

  return {
    $schema: "Datum brain graph: see brain/BRAIN.md. Generated by brain/brain.mjs; do not edit by hand.",
    generated: new Date().toISOString().slice(0, 10),
    types: TYPES,
    apps: registry.map(a => ({ id: a.id, name: a.name, repo: a.repo, accent: a.accent })),
    nodes: [...nodes.values()],
    edges,
  };
}

async function defaultGet(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "datum-brain" }, signal: AbortSignal.timeout(20000) });
    return r.ok ? await r.text() : null;
  } catch { return null; }
}

// CLI: node brain/brain.mjs
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const g = await buildBrain();
  const out = fileURLToPath(new URL("graph.json", import.meta.url));
  writeFileSync(out, `${JSON.stringify(g, null, 1)}\n`);
  const count = Object.keys(TYPES).map(t => `${g.nodes.filter(n => n.type === t).length} ${t}`).join(", ");
  console.log(`brain/graph.json: ${g.nodes.length} nodes (${count}), ${g.edges.length} edges`);
}

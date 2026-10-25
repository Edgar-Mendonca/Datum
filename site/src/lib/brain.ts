// The Datum network for the site: the brain graph (brain/brain.mjs), cleaned for public view and laid out.
// The repo's brain/graph.json keeps everything; the public page never names other products (FAMILY §13):
// sentences that do are removed, and a node whose title still would is left out.
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY, type SimulationNodeDatum } from "d3-force";
// @ts-expect-error plain ESM module shared with the CLI
import { buildBrain, TYPES } from "../../../brain/brain.mjs";
import { pathToFileURL } from "node:url";
import { NAMES } from "./github";

export type BNode = { id: string; type: string; label: string; text?: string; app?: string; accent?: string; date?: string; version?: string; when?: string; path?: string; url?: string; x?: number; y?: number; deg?: number };
export type BEdge = { source: string; target: string; kind: string };
export type Brain = { generated: string; types: Record<string, string>; apps: { id: string; name: string; repo: string; accent: string }[]; nodes: BNode[]; edges: BEdge[]; hidden: number };

const scrub = (t = "") => t.split("\n").map(l => l.split(/(?<=[.!?])\s+/).filter(s => !NAMES.test(s)).join(" ").trim()).filter(Boolean).join("\n");

/** Where each cluster settles: the hub in the middle, the apps on a triangle around it. */
export const ANCHOR: Record<string, [number, number]> = { hub: [0, 0], plan: [-430, 250], plot: [430, 250], atlas: [0, -480] };

export function loadBrain(): Promise<Brain> {
  const g = globalThis as any;
  return g.__datumBrain ??= (async () => {
    const raw = await buildBrain({ root: new URL("../", pathToFileURL(`${process.cwd()}/`)) });
    let hidden = 0;
    const nodes: BNode[] = [];
    for (const n of raw.nodes as BNode[]) {
      if (NAMES.test(n.label)) { hidden++; continue; }
      nodes.push({ ...n, text: scrub(n.text) });
    }
    const ids = new Set(nodes.map(n => n.id));
    const edges = (raw.edges as BEdge[]).filter(e => ids.has(e.source) && ids.has(e.target));
    const deg: Record<string, number> = {};
    for (const e of edges) { deg[e.source] = (deg[e.source] ?? 0) + 1; deg[e.target] = (deg[e.target] ?? 0) + 1; }
    for (const n of nodes) n.deg = deg[n.id] ?? 0;
    layout(nodes, edges);
    return { generated: raw.generated, types: TYPES, apps: raw.apps, nodes, edges, hidden };
  })();
}

/** A settled force layout, computed at build time (the page starts from it). */
function layout(nodes: BNode[], edges: BEdge[]) {
  type N = BNode & SimulationNodeDatum;
  const ns = nodes as N[];
  const anchor = (n: BNode) => ANCHOR[n.app ?? (n.type === "app" ? n.id.slice(4) : "hub")] ?? [0, 0];
  ns.forEach((n, i) => { const [ax, ay] = anchor(n); const a = i * 2.39996; n.x = ax + Math.cos(a) * (40 + i % 60); n.y = ay + Math.sin(a) * (40 + i % 60); });
  const shared = (n: BNode) => !n.app || n.app === "hub";
  forceSimulation(ns)
    .force("link", forceLink<N, any>(edges.map(e => ({ ...e }))).id(n => n.id).distance(l => (l.source.type === "app" || l.target.type === "app" ? 90 : 46)).strength(0.5))
    .force("charge", forceManyBody<N>().strength(n => n.type === "app" || n.type === "hub" ? -900 : -60).distanceMax(420))
    .force("collide", forceCollide<N>(n => radius(n) + 3))
    .force("x", forceX<N>(n => anchor(n)[0]).strength(n => shared(n) ? 0.02 : 0.09))
    .force("y", forceY<N>(n => anchor(n)[1]).strength(n => shared(n) ? 0.02 : 0.09))
    .stop().tick(420);
  for (const n of ns) { n.x = Math.round(n.x! * 10) / 10; n.y = Math.round(n.y! * 10) / 10; delete (n as any).vx; delete (n as any).vy; delete (n as any).index; }
}

export const radius = (n: BNode) => n.type === "hub" ? 26 : n.type === "app" ? 20 : n.type === "guide" || n.type === "tech" ? 7 + Math.min(6, Math.sqrt(n.deg ?? 1)) : 4 + Math.min(4, Math.sqrt(n.deg ?? 1) * 0.8);

export const TYPE_COLOR: Record<string, string> = {
  hub: "#F2B233", app: "#FFFFFF", guide: "#56B4E9", tech: "#E69F00", workflow: "#F0E442",
  decision: "#CC79A7", file: "#8FA3B8", release: "#009E73", roadmap: "#F2B233", session: "#D55E00",
};

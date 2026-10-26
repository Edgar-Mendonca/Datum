// The Datum network: a canvas map of the brain graph. Starts from the build-time layout, then lives in a
// d3-force simulation: drag nodes, pan, zoom (wheel or pinch), hover to see neighbours, click for details,
// search, filter by kind or app, and switch between the Network and Flow layouts.
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY, type Simulation, type SimulationNodeDatum } from "d3-force";

type N = SimulationNodeDatum & { id: string; type: string; label: string; text?: string; app?: string; accent?: string; date?: string; version?: string; when?: string; url?: string; deg?: number; r: number; color: string; nb: Set<N>; links: { n: N; kind: string; out: boolean }[] };
type E = { source: N; target: N; kind: string };
type Data = { types: Record<string, string>; colors: Record<string, string>; anchors: Record<string, [number, number]>; apps: { id: string; accent: string; name: string }[]; nodes: any[]; edges: any[] };

const APP_COLOR: Record<string, string> = { plan: "#4C9BEA", plot: "#3FC2B2", atlas: "#A58BEA", hub: "#F2B233" };
// Columns of the Flow layout, left to right, and the band of each app.
const FLOW: Record<string, number> = { guide: 0, workflow: 0, hub: 1, tech: 2, app: 3, decision: 4, file: 5, session: 6, release: 7, roadmap: 8, idea: 8 };
const LANE = ["plan", "plot", "atlas", "hub"];
const COLS = ["Design guide · how we work", "Hub", "Technology", "Apps", "Decisions", "Source files", "Sessions", "Releases", "Planned · ideas"];

export function start() {
  const data: Data = JSON.parse(document.getElementById("brain")!.textContent!);
  const canvas = document.getElementById("net") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const $ = (id: string) => document.getElementById(id)!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nodes: N[] = data.nodes.map(n => ({ ...n, r: size(n), color: n.type === "app" ? APP_COLOR[n.app] ?? n.accent : data.colors[n.type], nb: new Set(), links: [] }));
  const byId = new Map(nodes.map(n => [n.id, n]));
  const edges: E[] = data.edges.map(e => ({ source: byId.get(e.source)!, target: byId.get(e.target)!, kind: e.kind })).filter(e => e.source && e.target);
  for (const e of edges) {
    e.source.nb.add(e.target); e.target.nb.add(e.source);
    e.source.links.push({ n: e.target, kind: e.kind, out: true }); e.target.links.push({ n: e.source, kind: e.kind, out: false });
  }
  const appOf = (n: N) => n.app ?? (n.type === "app" ? n.id.slice(4) : "hub");
  const edgeColor = (e: E) => APP_COLOR[appOf(e.source.type === "app" || e.source.type === "hub" ? e.target : e.source)] ?? "#7F93AD";

  // State
  const hiddenTypes = new Set<string>(), hiddenApps = new Set<string>();
  let hover: N | null = null, sel: N | null = null, matches = new Set<N>(), mode: "net" | "flow" = "net";
  let W = 0, H = 0, dpr = 1, k = 1, tx = 0, ty = 0;
  const visible = (n: N) => !hiddenTypes.has(n.type) && !hiddenApps.has(appOf(n));

  // Simulation: quiet at first (the build already settled it), woken by drags and layout changes.
  const anchor = (n: N) => data.anchors[appOf(n)] ?? [0, 0];
  const shared = (n: N) => appOf(n) === "hub";
  const sim: Simulation<N, any> = forceSimulation(nodes)
    .force("link", forceLink<N, any>(edges).distance((l: E) => (l.source.type === "app" || l.target.type === "app" ? 90 : 46)).strength(0.5))
    .force("charge", forceManyBody<N>().strength(n => n.type === "app" || n.type === "hub" ? -900 : -60).distanceMax(420))
    .force("collide", forceCollide<N>(n => n.r + 3))
    .alpha(0.02).alphaDecay(0.03).on("tick", draw);
  setMode("net", false);

  // Flow layout: one column per kind, left to right; inside a column the apps are stacked lanes
  // (Plan, Plot, Atlas, then shared), and dated kinds keep their order.
  function setMode(m: typeof mode, wake = true) {
    mode = m;
    const flowY: Record<string, number> = {};
    if (m === "flow") {
      const cols = new Map<number, N[]>();
      for (const n of nodes) (cols.get(FLOW[n.type]) ?? cols.set(FLOW[n.type], []).get(FLOW[n.type])!).push(n);
      for (const list of cols.values()) {
        list.sort((a, b) => LANE.indexOf(appOf(a)) - LANE.indexOf(appOf(b)) || a.type.localeCompare(b.type)
          || (a.date ?? a.version ?? a.id).localeCompare(b.date ?? b.version ?? b.id, undefined, { numeric: true }));
        let y = 0, prev = "";
        for (const n of list) { if (prev && appOf(n) !== prev) y += 36; prev = appOf(n); flowY[n.id] = y + n.r; y += n.r * 2 + 6; }
        for (const n of list) flowY[n.id] -= y / 2;
      }
    }
    sim.force("x", forceX<N>(n => m === "flow" ? (FLOW[n.type] - 4) * 240 : anchor(n)[0]).strength(n => m === "flow" ? 0.9 : shared(n) ? 0.02 : 0.09))
       .force("y", forceY<N>(n => m === "flow" ? flowY[n.id] : anchor(n)[1]).strength(n => m === "flow" ? 0.9 : shared(n) ? 0.02 : 0.09));
    (sim.force("charge") as any).strength((n: N) => m === "flow" ? 0 : n.type === "app" || n.type === "hub" ? -900 : -60);
    (sim.force("link") as any).strength(m === "flow" ? 0 : 0.5);
    (sim.force("collide") as any).radius((n: N) => m === "flow" ? n.r + 1 : n.r + 3);
    document.querySelectorAll<HTMLButtonElement>("[data-layout]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.layout === m)));
    if (wake) { sim.alpha(0.9).restart(); setTimeout(fit, 700); setTimeout(fit, 2000); }
  }

  // Camera
  function resize() {
    const b = canvas.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = b.width; H = b.height; canvas.width = W * dpr; canvas.height = H * dpr; draw();
  }
  function fit() {
    const vs = nodes.filter(visible); if (!vs.length) return;
    const xs = vs.map(n => n.x!), ys = vs.map(n => n.y!);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const pr = document.querySelector(".panel.left")!.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
    const left = W > 760 ? pr.right - cr.left : 0, padT = W > 760 ? 20 : pr.bottom - cr.top;
    const nk = Math.min(2.4, Math.min((W - left - 60) / (x1 - x0 + 80), (H - padT - 60) / (y1 - y0 + 80)));
    animateTo(nk, left + (W - left) / 2 - ((x0 + x1) / 2) * nk, padT + (H - padT) / 2 - ((y0 + y1) / 2) * nk);
  }
  let anim = 0;
  function animateTo(nk: number, ntx: number, nty: number) {
    if (reduce) { k = nk; tx = ntx; ty = nty; return draw(); }
    const [k0, x0, y0] = [k, tx, ty], t0 = performance.now(); cancelAnimationFrame(anim);
    const step = (t: number) => { const p = Math.min(1, (t - t0) / 600), e = 1 - (1 - p) ** 3;
      k = k0 + (nk - k0) * e; tx = x0 + (ntx - x0) * e; ty = y0 + (nty - y0) * e; draw(); if (p < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  function focus(n: N) {
    const nk = Math.max(k, 1.3), left = W > 760 ? 360 : 0, right = W > 760 ? 400 : 0;
    animateTo(nk, left + (W - left - right) / 2 - n.x! * nk, (W > 760 ? H / 2 : H * 0.25) - n.y! * nk);
  }
  const zoomAt = (f: number, px = W / 2, py = H / 2) => { const nk = Math.max(0.15, Math.min(6, k * f)); tx = px - (px - tx) * (nk / k); ty = py - (py - ty) * (nk / k); k = nk; draw(); };
  const toWorld = (px: number, py: number) => [(px - tx) / k, (py - ty) / k];

  // Signals travelling along the links: the network "thinking".
  const pulses = Array.from({ length: reduce ? 0 : 70 }, () => ({ e: edges[(Math.random() * edges.length) | 0], t: Math.random(), v: 0.004 + Math.random() * 0.008 }));

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty);
    const focusN = sel ?? hover, lit = focusN ? new Set([focusN, ...focusN.nb]) : null, searching = matches.size > 0;
    const dimmed = (n: N) => (lit && !lit.has(n)) || (searching && !matches.has(n) && !(lit && lit.has(n)));

    // Links
    ctx.lineCap = "round";
    for (const e of edges) {
      if (!visible(e.source) || !visible(e.target)) continue;
      const on = lit && (e.source === focusN || e.target === focusN);
      ctx.strokeStyle = on ? edgeColor(e) : "#7F93AD";
      ctx.globalAlpha = on ? 0.85 : (lit || searching) ? 0.05 : 0.16;
      ctx.lineWidth = (on ? 1.6 : 0.8) / Math.sqrt(k);
      ctx.beginPath(); ctx.moveTo(e.source.x!, e.source.y!); ctx.lineTo(e.target.x!, e.target.y!); ctx.stroke();
    }
    // Pulses
    ctx.globalCompositeOperation = "lighter";
    for (const p of pulses) {
      if (!visible(p.e.source) || !visible(p.e.target)) continue;
      const x = p.e.source.x! + (p.e.target.x! - p.e.source.x!) * p.t, y = p.e.source.y! + (p.e.target.y! - p.e.source.y!) * p.t;
      ctx.globalAlpha = Math.sin(p.t * Math.PI) * (lit ? 0.35 : 0.9);
      ctx.fillStyle = edgeColor(p.e);
      ctx.beginPath(); ctx.arc(x, y, 2.2 / Math.sqrt(k), 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    // Flow: a title over each column.
    if (mode === "flow") {
      const tops = new Map<number, number>();
      for (const n of nodes) if (visible(n)) tops.set(FLOW[n.type], Math.min(tops.get(FLOW[n.type]) ?? Infinity, n.y! - n.r));
      ctx.font = `600 ${12 / Math.min(k, 1.4)}px "IBM Plex Mono", monospace`; ctx.textAlign = "center"; ctx.fillStyle = "#8FA3B8"; ctx.globalAlpha = 1;
      for (const [col, y] of tops) ctx.fillText(COLS[col].toUpperCase(), (col - 4) * 240, y - 18 / k);
    }
    // Nodes
    for (const n of nodes) {
      if (!visible(n)) continue;
      const big = n.type === "app" || n.type === "hub", d = dimmed(n);
      ctx.globalAlpha = d ? 0.14 : 1;
      if (!d && (big || n === focusN || matches.has(n))) { ctx.shadowColor = n.color; ctx.shadowBlur = (big ? 30 : 16) * k; }
      ctx.fillStyle = n.color;
      ctx.beginPath(); ctx.arc(n.x!, n.y!, n.r, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      if (big) { ctx.strokeStyle = "#070C13"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(n.x!, n.y!, n.r * 0.55, 0, 7); ctx.stroke(); }
      if (n === sel || matches.has(n)) { ctx.strokeStyle = "#F2B233"; ctx.lineWidth = 2 / k; ctx.beginPath(); ctx.arc(n.x!, n.y!, n.r + 5 / k, 0, 7); ctx.stroke(); }
    }
    // Labels: the big ones always, the rest when zoomed in or lit.
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (const n of nodes) {
      if (!visible(n)) continue;
      const big = n.type === "app" || n.type === "hub", mid = n.type === "guide" || n.type === "tech" || n.type === "workflow";
      const show = big || (lit ? lit.has(n) : (mid && k > 0.7) || k > 1.9 || matches.has(n));
      if (!show || (dimmed(n) && !big)) continue;
      const fs = (big ? 15 : 11) / Math.max(0.6, Math.min(k, 1.6));
      ctx.font = `${big ? 700 : 500} ${fs}px "IBM Plex Sans", sans-serif`;
      ctx.globalAlpha = dimmed(n) ? 0.35 : 1;
      const t = n.label.length > 42 ? `${n.label.slice(0, 40)}…` : n.label, y = n.y! + n.r + 4 / k;
      ctx.lineWidth = 4 / k; ctx.strokeStyle = "#070C13"; ctx.strokeText(t, n.x!, y);
      ctx.fillStyle = big ? "#FFFFFF" : "#C4CEDA"; ctx.fillText(t, n.x!, y);
    }
    ctx.globalAlpha = 1;
  }

  // Continuous loop for the pulses; the simulation draws on its own ticks.
  if (!reduce) {
    const loop = () => { for (const p of pulses) { p.t += p.v; if (p.t >= 1) { const src = hover ?? sel; const pool = src ? edges.filter(e => e.source === src || e.target === src) : edges; p.e = pool[(Math.random() * pool.length) | 0] ?? edges[0]; p.t = 0; } } draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // Picking
  const pick = (px: number, py: number) => {
    const [x, y] = toWorld(px, py); let best: N | null = null, bd = Infinity;
    for (const n of nodes) { if (!visible(n)) continue; const d = Math.hypot(n.x! - x, n.y! - y); if (d < n.r + 6 / k && d < bd) { best = n; bd = d; } }
    return best;
  };

  // Pointer: drag a node, pan the background, pinch to zoom; a click without movement selects.
  const pts = new Map<number, { x: number; y: number }>();
  let drag: N | null = null, moved = false, last = { x: 0, y: 0 }, pinch = 0;
  canvas.addEventListener("pointerdown", ev => {
    canvas.setPointerCapture(ev.pointerId); pts.set(ev.pointerId, { x: ev.offsetX, y: ev.offsetY });
    moved = false; last = { x: ev.offsetX, y: ev.offsetY };
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; return; }
    drag = pick(ev.offsetX, ev.offsetY);
    if (drag) { drag.fx = drag.x; drag.fy = drag.y; }
    canvas.classList.add("grabbing");
  });
  canvas.addEventListener("pointermove", ev => {
    if (pts.has(ev.pointerId)) pts.set(ev.pointerId, { x: ev.offsetX, y: ev.offsetY });
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) zoomAt(d / pinch, (a.x + b.x) / 2, (a.y + b.y) / 2); pinch = d; moved = true; return; }
    if (pts.size === 1) {
      const dx = ev.offsetX - last.x, dy = ev.offsetY - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (drag) { const [x, y] = toWorld(ev.offsetX, ev.offsetY); drag.fx = x; drag.fy = y; if (moved) sim.alphaTarget(0.15).restart(); }
      else { tx += dx; ty += dy; draw(); }
      last = { x: ev.offsetX, y: ev.offsetY };
      return;
    }
    const h = pick(ev.offsetX, ev.offsetY);
    if (h !== hover) { hover = h; canvas.classList.toggle("pointing", !!h); tip(h, ev.offsetX, ev.offsetY); draw(); }
    else if (h) tip(h, ev.offsetX, ev.offsetY);
  });
  const up = (ev: PointerEvent) => {
    pts.delete(ev.pointerId); canvas.classList.remove("grabbing");
    if (pts.size) return;
    if (drag) { drag.fx = null; drag.fy = null; sim.alphaTarget(0); }
    if (!moved) select(pick(ev.offsetX, ev.offsetY));
    drag = null; pinch = 0;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("pointerleave", () => { if (!pts.size && hover) { hover = null; tip(null, 0, 0); draw(); } });
  canvas.addEventListener("wheel", ev => { ev.preventDefault(); zoomAt(Math.exp(-ev.deltaY * 0.0015), ev.offsetX, ev.offsetY); }, { passive: false });
  canvas.addEventListener("dblclick", () => fit());

  const tipEl = $("tip");
  function tip(n: N | null, x: number, y: number) {
    if (!n) { tipEl.hidden = true; return; }
    tipEl.hidden = false; tipEl.textContent = `${data.types[n.type]} · ${n.label}`;
    tipEl.style.left = `${Math.min(x + 14, W - 290)}px`; tipEl.style.top = `${y + 14}px`;
  }

  // Details panel
  const info = $("info");
  function select(n: N | null) {
    sel = n; tip(null, 0, 0);
    if (!n) { info.hidden = true; draw(); return; }
    info.hidden = false;
    const app = data.apps.find(a => a.id === appOf(n));
    $("i-kind").textContent = `${data.types[n.type]}${app ? ` · ${app.name}` : n.type === "hub" ? "" : " · Family"}`;
    $("i-kind").style.color = n.color;
    $("i-title").textContent = n.label;
    $("i-meta").textContent = [n.version && n.type !== "release" ? `v${n.version}` : "", n.when ?? "", n.date ?? ""].filter(Boolean).join(" · ");
    const txt = $("i-text"); txt.replaceChildren(...(n.text ?? "").split(/\n+/).map(t => t.trim()).filter(Boolean).map(p => Object.assign(document.createElement("p"), { textContent: p })));
    const link = $("i-link") as HTMLAnchorElement; link.hidden = !n.url; if (n.url) link.href = n.url;
    const list = $("i-links"); list.replaceChildren(...n.links.filter(l => visible(l.n)).sort((a, b) => a.n.type.localeCompare(b.n.type)).map(l => {
      const li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.style.setProperty("--k", l.n.color);
      b.append(Object.assign(document.createElement("small"), { textContent: l.kind }), document.createTextNode(l.n.label));
      b.addEventListener("click", () => { select(l.n); focus(l.n); });
      li.append(b); return li;
    }));
    draw();
  }
  $("close").addEventListener("click", () => select(null));

  // Search
  const q = $("q") as HTMLInputElement, qn = $("qn");
  q.addEventListener("input", () => {
    const s = q.value.trim().toLowerCase();
    matches = new Set(s.length < 2 ? [] : nodes.filter(n => visible(n) && `${n.label} ${n.text ?? ""} ${n.id}`.toLowerCase().includes(s)));
    qn.textContent = s.length < 2 ? "" : `${matches.size} found${matches.size ? " · Enter to open the first" : ""}`;
    draw();
  });
  q.addEventListener("keydown", ev => {
    if (ev.key === "Enter") { const s = q.value.trim().toLowerCase(), first = [...matches].sort((a, b) => Number(b.label.toLowerCase().includes(s)) - Number(a.label.toLowerCase().includes(s)) || b.r - a.r)[0]; if (first) { select(first); focus(first); } }
    if (ev.key === "Escape") { q.value = ""; q.dispatchEvent(new Event("input")); q.blur(); }
  });
  addEventListener("keydown", ev => {
    if ((ev.target as HTMLElement).matches?.("input, textarea")) return;
    if (ev.key === "/") { ev.preventDefault(); q.focus(); }
    else if (ev.key === "Escape") select(null);
    else if (ev.key === "+" || ev.key === "=") zoomAt(1.25);
    else if (ev.key === "-") zoomAt(0.8);
    else if (ev.key === "0") fit();
  });

  // Filters and layout
  document.querySelectorAll<HTMLButtonElement>(".chip").forEach(b => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on));
    const set = b.dataset.type ? hiddenTypes : hiddenApps, key = (b.dataset.type ?? b.dataset.app)!;
    on ? set.delete(key) : set.add(key);
    if (sel && !visible(sel)) select(null);
    q.dispatchEvent(new Event("input")); draw();
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-layout]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.layout as typeof mode)));
  $("zin").addEventListener("click", () => zoomAt(1.3));
  $("zout").addEventListener("click", () => zoomAt(1 / 1.3));
  $("zfit").addEventListener("click", fit);
  if (innerWidth < 760) document.querySelector(".filters")?.removeAttribute("open");

  new ResizeObserver(() => { resize(); }).observe(canvas);
  resize(); fit();
  document.fonts?.ready.then(draw);
}

function size(n: any) {
  const d = n.deg ?? 1;
  return n.type === "hub" ? 26 : n.type === "app" ? 20 : n.type === "guide" || n.type === "tech" ? 7 + Math.min(6, Math.sqrt(d)) : 4 + Math.min(4, Math.sqrt(d) * 0.8);
}

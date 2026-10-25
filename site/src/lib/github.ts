// Build-time data: reads each app's docs/site.json, CHANGELOG.md, logo and releases from GitHub.
// Nothing here runs in the browser. One missing file or a failed request never fails the build:
// the app shows "Coming soon" (or the values from apps.json) instead.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { marked } from "marked";

export type Stage = { v: string; title: string; when: string; items: string[] };
export type Shot = { path: string; raw: string; file: string; alt: string; bytes?: Uint8Array };
export type Section = { version: string; date: string; summary: string; html: string };
export type Release = { app: string; name: string; accent: string; version: string; date: string; url: string; summary: string };
export type Latest = { version: string; date: string; url: string; download: string; size?: number; fromChangelog?: boolean };
export type App = {
  id: string; repo: string; branch: string; name: string; accent: string; tagline: string; for: string;
  logo: string; highlights: string[]; shots: Shot[]; roadmap: Stage[]; changelog: Section[];
  latest?: Latest; releases: Release[]; hasSite: boolean;
};

// The repo root (the build runs in site/; import.meta.url moves when Astro bundles this file).
const ROOT = new URL("../", pathToFileURL(`${process.cwd()}/`));
const read = (p: string) => readFileSync(new URL(p, ROOT), "utf8");
const TOKEN = process.env.GITHUB_TOKEN;

async function get(url: string, kind: "text" | "json" | "bytes" = "text"): Promise<any> {
  try {
    const api = url.startsWith("https://api.github.com/");
    const headers: Record<string, string> = { "User-Agent": "datum-site" };
    if (api) headers.Accept = "application/vnd.github+json";
    if (api && TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    if (!r.ok) { console.warn(`[datum] ${r.status} ${url}`); return null; }
    return kind === "json" ? await r.json() : kind === "bytes" ? new Uint8Array(await r.arrayBuffer()) : await r.text();
  } catch (e) { console.warn(`[datum] ${url}: ${(e as Error).message}`); return null; }
}

// Public text never names other products (FAMILY.md, "How we talk about Datum"). Lines in an app's
// CHANGELOG or site.json that do are left out of the site and listed in the build log for rewording.
const NAMES = /\b(MS Project|Microsoft Project|Primavera|P6|GraphPad|Prism|OriginPro|Granta|Ansys)\b/i;
export const flagged: string[] = [];
const plain = (text: string, where: string) => {
  if (!NAMES.test(text)) return true;
  flagged.push(`${where}: ${text.trim().slice(0, 140)}`);
  return false;
};

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const localSvg = (name: string) => existsSync(new URL(`brand/${name}`, ROOT)) ? read(`brand/${name}`) : null;
export const familyLogo = svgUri(read("brand/datum-icon.svg"));

/** Splits a CHANGELOG on "## X.Y.Z — date" headings; the first plain paragraph is the summary. */
export function parseChangelog(md: string, where = "CHANGELOG"): Section[] {
  const out: Section[] = [];
  for (let part of md.split(/^## /m).slice(1)) {
    const lines = part.split("\n");
    part = [lines[0], ...lines.slice(1).filter(l => plain(l, `${where} ${lines[0]}`))].join("\n");
    const nl = part.indexOf("\n"), head = part.slice(0, nl < 0 ? undefined : nl), body = nl < 0 ? "" : part.slice(nl + 1).trim();
    const m = head.match(/^v?(\d+\.\d+\.\d+)\s*[—–-]\s*(\d{4}-\d{2}-\d{2})/);
    if (!m) continue;
    const first = body.split(/\n\s*\n/)[0] ?? "";
    // The summary is the first plain paragraph, else the first bullet, as plain text.
    const bullet = body.match(/^[-*] (.+)$/m)?.[1] ?? "";
    const summary = (first && !/^(\*\*|[-*] |#)/.test(first) ? first : bullet).replace(/\s+/g, " ").replace(/\*\*|`/g, "").trim();
    out.push({ version: m[1], date: m[2], summary, html: marked.parse(body, { async: false }) as string });
  }
  return out;
}

async function loadApp(e: any): Promise<App> {
  const raw = (p: string) => `https://raw.githubusercontent.com/${e.repo}/${e.branch ?? "HEAD"}/${p}`;
  const site = JSON.parse((await get(raw("docs/site.json"))) ?? "null");
  const [md, rels] = await Promise.all([get(raw("CHANGELOG.md")), get(`https://api.github.com/repos/${e.repo}/releases?per_page=10`, "json")]);
  const s = site ?? {};
  const svg = await get(raw(s.logo ?? `docs/brand/datum-${e.id}-icon.svg`));
  const logo = svgUri(svg?.trimStart().startsWith("<svg") ? svg : localSvg(`datum-${e.id}-icon.svg`) ?? read("brand/datum-icon.svg"));
  const changelog = md ? parseChangelog(md, `${e.id} CHANGELOG`) : [];
  const app: App = {
    id: e.id, repo: e.repo, branch: e.branch ?? "HEAD", hasSite: !!site,
    name: s.name ?? e.name, accent: s.accent ?? e.accent, tagline: s.tagline ?? e.tagline, for: s.for ?? e.for,
    logo, highlights: (s.highlights ?? []).filter((h: string) => plain(h, `${e.id} site.json`)),
    roadmap: (s.roadmap ?? []).map((r: Stage) => ({ ...r, items: r.items.filter(i => plain(i, `${e.id} roadmap ${r.v}`)) })), changelog, releases: [],
    shots: [],
  };
  // Screenshots are downloaded now and written into dist after the build; one that fails is left out.
  const shots = await Promise.all((s.screenshots ?? []).map(async (p: string): Promise<Shot> => {
    const base = p.split("/").pop()!;
    return { path: p, raw: raw(p), file: `apps/${e.id}/${base}`, alt: `${app.name}: ${base.replace(/\.\w+$/, "").replace(/[-_]/g, " ")}`, bytes: await get(raw(p), "bytes") };
  }));
  app.shots = shots.filter(x => x.bytes);
  const gh = `https://github.com/${e.repo}`;
  const summary = (v: string) => changelog.find(c => c.version === v)?.summary ?? "";
  const list = Array.isArray(rels) ? rels.filter((r: any) => !r.draft && !r.prerelease) : [];
  if (list.length) {
    const r = list[0], v = String(r.tag_name).replace(/^v/, "");
    const exe = (r.assets ?? []).find((a: any) => /setup\.exe$/i.test(a.name));
    app.latest = { version: v, date: String(r.published_at).slice(0, 10), url: r.html_url, download: exe?.browser_download_url ?? `${gh}/releases/latest`, size: exe?.size };
    app.releases = list.map((r: any) => {
      const v = String(r.tag_name).replace(/^v/, "");
      return { app: app.id, name: app.name, accent: app.accent, version: v, date: String(r.published_at).slice(0, 10), url: r.html_url, summary: summary(v) };
    });
  } else if (changelog.length) {
    // No release API (no token, rate limit, or no release yet): use the CHANGELOG, link to the releases page.
    const c = changelog[0];
    app.latest = { version: c.version, date: c.date, url: `${gh}/releases/tag/v${c.version}`, download: `${gh}/releases/latest`, fromChangelog: true };
    app.releases = changelog.map(c => ({ app: app.id, name: app.name, accent: app.accent, version: c.version, date: c.date, url: `${gh}/releases/tag/v${c.version}`, summary: c.summary }));
  }
  return app;
}

/** Every app in apps.json, in order. Loaded once per build. */
export function loadAll(): Promise<App[]> {
  const g = globalThis as any;
  return g.__datumApps ??= (async () => {
    const entries = JSON.parse(read("apps.json")).apps;
    const apps = await Promise.all(entries.map((e: any) => loadApp(e).catch(err => {
      console.warn(`[datum] ${e.id}: ${err.message}`);
      return { ...e, branch: e.branch ?? "HEAD", logo: familyLogo, highlights: [], shots: [], roadmap: [], changelog: [], releases: [], hasSite: false } as App;
    })));
    if (flagged.length) console.warn(`[datum] ${flagged.length} lines name another product and are left out:\n  ${flagged.join("\n  ")}`);
    return apps;
  })();
}

/** The newest releases across the family, newest first. */
export const latestReleases = (apps: App[], n = 6) =>
  apps.flatMap(a => a.releases).sort((a, b) => b.date.localeCompare(a.date) || cmpVer(b.version, a.version)).slice(0, n);
const cmpVer = (a: string, b: string) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return (x[i] ?? 0) - (y[i] ?? 0); return 0; };

/** Writes the downloaded screenshots into the built site (called after the build), so pages never hotlink. */
export async function copyShots(dist: URL) {
  for (const a of await loadAll()) for (const s of a.shots) {
    const to = new URL(s.file, dist);
    mkdirSync(new URL(".", to), { recursive: true });
    writeFileSync(to, s.bytes!);
  }
}

/** The accent, darkened until white text on it passes WCAG AA (4.5:1); for filled buttons. */
export function inkOf(hex: string) {
  let [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const lum = () => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  while (1.05 / (lum() + 0.05) < 4.6) [r, g, b] = [r, g, b].map(v => Math.round(v * 0.94));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

export const fmtDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtSize = (b?: number) => b ? `${(b / 1048576).toFixed(b > 10485760 ? 0 : 1)} MB` : "";
export const app = async (id: string) => (await loadAll()).find(a => a.id === id);

// Build-time data: reads each app's docs/site.json, CHANGELOG.md, logo and releases from GitHub.
// Nothing here runs in the browser. One missing file or a failed request never fails the build:
// the app shows "Coming soon" (or the values from apps.json) instead.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { marked } from "marked";

export type Step = { title: string; text: string };
export type Stage = { v: string; title: string; when: string; items: string[] };
export type Shot = { path: string; raw: string; file: string; alt: string; bytes?: Uint8Array };
export type Section = { version: string; date: string; summary: string; html: string };
export type Release = { app: string; name: string; accent: string; version: string; date: string; url: string; summary: string };
export type Latest = { version: string; date: string; url: string; download: string; size?: number; sums?: string; fromChangelog?: boolean };
export type App = {
  id: string; repo: string; branch: string; name: string; accent: string; tagline: string; for: string;
  logo: string; about: string[]; steps: Step[]; highlights: string[]; shots: Shot[]; roadmap: Stage[]; changelog: Section[];
  latest?: Latest; releases: Release[]; hasSite: boolean; statusSet?: string;
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
export const NAMES = /\b(MS Project|Microsoft Project|MSP|Primavera|P6|GraphPad|Prism|OriginPro|Origin(?=[- ](power|style|like|look))|Granta|Ansys)\b/i;
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
    id: e.id, repo: e.repo, branch: e.branch ?? "HEAD", hasSite: !!site, statusSet: s.status ?? e.status,
    name: s.name ?? e.name, accent: s.accent ?? e.accent, tagline: s.tagline ?? e.tagline, for: s.for ?? e.for,
    logo, about: [s.about ?? e.about ?? []].flat().filter((p: string) => plain(p, `${e.id} about`)), steps: s.steps ?? e.steps ?? [],
    highlights: (s.highlights ?? []).filter((h: string) => plain(h, `${e.id} site.json`)),
    roadmap: (s.roadmap ?? []).map((r: Stage) => ({ ...r, items: r.items.filter(i => plain(i, `${e.id} roadmap ${r.v}`)) })), changelog, releases: [],
    shots: [],
  };
  // The screenshots (up to four) are downloaded now and written into dist after the build; one that fails is left out.
  const shots = await Promise.all((s.screenshots ?? (e.shot ? [e.shot] : [])).slice(0, 4).map(async (p: string): Promise<Shot> => {
    const base = p.split("/").pop()!.replace(/\.\w+$/, "");
    const png = await get(raw(p), "bytes");
    const bytes = png ? new Uint8Array(await sharp(png).resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer().catch(() => png)) : null;
    return { path: p, raw: raw(p), file: `apps/${e.id}/${base}.webp`, alt: `${app.name}: ${base.replace(/[-_]/g, " ")}`, bytes: bytes ?? undefined };
  }));
  app.shots = shots.filter(x => x.bytes);
  const gh = `https://github.com/${e.repo}`;
  const summary = (v: string) => changelog.find(c => c.version === v)?.summary ?? "";
  const list = Array.isArray(rels) ? rels.filter((r: any) => !r.draft && !r.prerelease) : [];
  if (list.length) {
    const r = list[0], v = String(r.tag_name).replace(/^v/, "");
    const exe = (r.assets ?? []).find((a: any) => /setup\.exe$/i.test(a.name));
    const sums = (r.assets ?? []).find((a: any) => /sha256sums\.txt$/i.test(a.name));
    app.latest = { version: v, date: String(r.published_at).slice(0, 10), url: r.html_url, download: exe?.browser_download_url ?? `${gh}/releases/latest`, size: exe?.size, sums: sums?.browser_download_url };
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
      return { ...e, branch: e.branch ?? "HEAD", logo: familyLogo, about: [e.about ?? []].flat(), steps: e.steps ?? [], highlights: [], shots: [], roadmap: [], changelog: [], releases: [], hasSite: false } as App;
    })));
    // One line per app in the build log: the version the site shows, where it came from, and the CHANGELOG's newest.
    for (const a of apps) console.log(`[datum] ${a.id}: ${a.latest ? `v${a.latest.version} (${a.latest.fromChangelog ? "from CHANGELOG, no release API" : "GitHub release"})` : "no release"}; CHANGELOG ${a.changelog[0]?.version ?? "none"}`);
    if (flagged.length) console.warn(`[datum] ${flagged.length} lines name another product and are left out:\n  ${flagged.join("\n  ")}`);
    return apps;
  })();
}

/** The newest releases across the family, newest first. */
/** Stable, Beta or Alpha: from site.json or apps.json ("status"), else from the version (1.x stable, 0.2+ beta). */
export const statusOf = (a: App) => {
  if (a.statusSet) return a.statusSet;
  const v = a.latest?.version; if (!v) return "Coming soon";
  const [maj, min] = v.split(".").map(Number);
  return maj >= 1 ? "Stable" : min >= 2 ? "Beta" : "Alpha";
};

/** The newest release of each app, newest first. */
export const latestPerApp = (apps: App[]) => apps.map(a => a.releases[0]).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));

export const latestReleases = (apps: App[], n = 6) =>
  apps.flatMap(a => a.releases).sort((a, b) => b.date.localeCompare(a.date) || cmpVer(b.version, a.version)).slice(0, n);
const cmpVer = (a: string, b: string) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return (x[i] ?? 0) - (y[i] ?? 0); return 0; };

/** Writes the downloaded screenshots into the built site (called after the build), so pages never hotlink,
 *  and home.json: the list of apps Datum Home reads when it opens (with each app's newest release, for when GitHub is busy). */
export async function copyShots(dist: URL) {
  const apps = await loadAll();
  for (const a of apps) for (const s of a.shots) {
    const to = new URL(s.file, dist);
    mkdirSync(new URL(".", to), { recursive: true });
    writeFileSync(to, s.bytes!);
  }
  // Release notes as plain text (the CHANGELOG section of that version).
  const text = (html = "") => html.replace(/<li>/g, "- ").replace(/<\/(p|li|h\d)>/g, "\n").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
  const latest = (a: App) => a.latest && !a.latest.fromChangelog && /setup\.exe$/i.test(a.latest.download)
    ? { version: a.latest.version, date: a.latest.date, notes: text(a.changelog.find(c => c.version === a.latest!.version)?.html), setup: a.latest.download,
        sums: a.latest.sums ?? null, size: a.latest.size ?? 0, page: a.latest.url } : null;
  const h = await loadHome();
  const home = { $schema: "Datum Home's list of apps and its own newest release, written by the Datum site at every build (site/src/lib/github.ts). Datum Home reads this instead of asking GitHub.",
    updated: new Date().toISOString(),
    home: h && h.sums ? { version: h.version, date: h.date, notes: h.notes, setup: h.download, sums: h.sums, size: h.size ?? 0, page: h.url } : null,
    apps: apps.map(a => ({ id: a.id, name: a.name, repo: a.repo, accent: a.accent, tagline: a.tagline, logo: a.logo, latest: latest(a) })) };
  writeFileSync(new URL("home.json", dist), JSON.stringify(home, null, 1));
}

/** Datum Home, the app that installs and updates the others: its newest release in this repository (tags home-vX.Y.Z). */
export type HomeApp = { version: string; date: string; url: string; download: string; size?: number; sums?: string; notes: string };
export function loadHome(): Promise<HomeApp | null> {
  const g = globalThis as any;
  return g.__datumHome ??= (async () => {
    const rels = await get("https://api.github.com/repos/Edgar-Mendonca/Datum/releases?per_page=20", "json");
    const r = (Array.isArray(rels) ? rels : []).find((r: any) => !r.draft && !r.prerelease && /^home-v\d/.test(r.tag_name));
    if (!r) return null;
    const exe = (r.assets ?? []).find((a: any) => /setup\.exe$/i.test(a.name));
    const sums = (r.assets ?? []).find((a: any) => /sha256sums\.txt$/i.test(a.name));
    return { version: String(r.tag_name).replace(/^home-v/, ""), date: String(r.published_at).slice(0, 10), url: r.html_url,
      download: exe?.browser_download_url ?? r.html_url, size: exe?.size, sums: sums?.browser_download_url, notes: String(r.body ?? "").replace(/\r\n/g, "\n").trim() };
  })();
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

// Saves today's public numbers for every Datum app (and Datum Home) to stats/history.json: stars, forks,
// installer downloads, releases and open issues. Run once a day by .github/workflows/stats.yml; the site can
// later draw growth from this history (GitHub itself only gives today's totals). Needs Node 20+; no packages.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const token = process.env.GITHUB_TOKEN;
const get = async url => {
  const r = await fetch(url, { headers: { "User-Agent": "datum-stats", Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const installer = a => /\.(exe|msi|dmg|appimage|deb|rpm)$/i.test(a.name);

async function numbers(repo, tagPrefix) {
  const [info, rels] = await Promise.all([get(`https://api.github.com/repos/${repo}`), get(`https://api.github.com/repos/${repo}/releases?per_page=100`)]);
  const list = rels.filter(r => !r.draft && !r.prerelease && (tagPrefix ? r.tag_name.startsWith(tagPrefix) : true));
  return {
    stars: info.stargazers_count, forks: info.forks_count, openIssues: info.open_issues_count,
    downloads: list.reduce((n, r) => n + r.assets.filter(installer).reduce((m, a) => m + a.download_count, 0), 0),
    releases: list.length,
  };
}

const root = new URL("../", import.meta.url);
const apps = JSON.parse(readFileSync(new URL("apps.json", root), "utf8")).apps;
const today = new Date().toISOString().slice(0, 10);
const entry = { date: today, apps: {} };
for (const a of apps) {
  try { entry.apps[a.id] = await numbers(a.repo); } catch (e) { console.warn(`${a.id}: ${e.message}`); }
}
try { entry.apps.home = await numbers("Edgar-Mendonca/Datum", "home-v"); } catch (e) { console.warn(`home: ${e.message}`); }

const file = new URL("stats/history.json", root);
const history = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { $schema: "Daily public numbers per Datum app (stats/snapshot.mjs): stars, forks, open issues, installer downloads and releases. One entry per day; a later run on the same day replaces it.", days: [] };
history.days = history.days.filter(d => d.date !== today).concat(entry).sort((x, y) => x.date.localeCompare(y.date));
writeFileSync(file, JSON.stringify(history, null, 1) + "\n");
console.log(`${today}: ${Object.keys(entry.apps).length} apps`, JSON.stringify(entry.apps));

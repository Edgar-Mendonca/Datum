// Datum Home's window: one card per Datum app with one main button (Install, Update or Open),
// Uninstall, the release notes and the app's web page. It checks everything when it opens; "Check again" repeats it.
import { render } from "solid-js/web";
import { For, Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./styles.css";
import { desktop, invoke, listen, type App, type CardInfo, type Progress, type Release } from "./api";
import family from "../../../brand/datum-icon.svg";
import plan from "../../../brand/datum-plan-icon.svg";
import plot from "../../../brand/datum-plot-icon.svg";
import atlas from "../../../brand/datum-atlas-icon.svg";
import sim from "../../../brand/datum-sim-icon.svg";
import calc from "../../../brand/datum-calc-icon.svg";
import mesh from "../../../brand/datum-mesh-icon.svg";
import pipe from "../../../brand/datum-pipe-icon.svg";

const ICONS: Record<string, string> = { plan, plot, atlas, sim, calc, mesh, pipe };
const SITE = "https://edgar-mendonca.github.io/Datum/";
const mb = (b: number) => (b ? `${(b / 1048576).toFixed(b > 10485760 ? 0 : 1)} MB` : "");
const day = (d: string) => (d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");

type Row = { app: App; info?: CardInfo; busy?: string; pct?: number; error?: string; notes?: boolean; confirm?: boolean };

function Home() {
  const [rows, setRows] = createStore<Row[]>([]);
  const [online, setOnline] = createSignal(true);
  const [checking, setChecking] = createSignal(false);
  const [checked, setChecked] = createSignal("");
  const [version, setVersion] = createSignal("");
  const [self, setSelf] = createSignal<Release | null>(null);
  const [selfBusy, setSelfBusy] = createSignal("");

  const idx = (id: string) => rows.findIndex(r => r.app.id === id);
  const refresh = async (id: string) => {
    const i = idx(id);
    if (i < 0) return;
    try { setRows(i, "info", await invoke<CardInfo>("card", { app: rows[i].app })); }
    catch (e) { setRows(i, "error", String(e)); }
  };
  const check = async () => {
    if (checking()) return;
    setChecking(true);
    try {
      const c = await invoke<{ online: boolean; apps: App[] }>("catalog");
      setOnline(c.online);
      setRows(c.apps.map(app => ({ app, info: rows.find(r => r.app.id === app.id)?.info })));
      await Promise.all(c.apps.map(a => refresh(a.id)));
      setChecked(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      invoke<Release | null>("home_update").then(setSelf).catch(() => {});
    } catch (e) {
      setRows([]);
      setOnline(false);
      console.error(e);
    } finally { setChecking(false); }
  };

  // Install, Update, Uninstall: one at a time per app; the card shows progress and any error.
  const run = async (id: string, label: string, cmd: string, args: object) => {
    const i = idx(id);
    setRows(i, { busy: label, pct: 0, error: undefined, confirm: false });
    try { await invoke(cmd, args); }
    catch (e) { setRows(idx(id), "error", String(e)); }
    finally { setRows(idx(id), { busy: undefined, pct: undefined }); await refresh(id); }
  };
  const main = (r: Row) => {
    const c = r.info?.card;
    if (!c) return;
    if (c.action === "open") return invoke("open", { app: r.app }).catch(e => setRows(idx(r.app.id), "error", String(e)));
    if (c.action === "install" || c.action === "update") return run(r.app.id, c.action === "install" ? "Installing" : "Updating", "install", { app: r.app, release: c.release });
  };
  const updates = () => rows.filter(r => r.info?.card.action === "update" && !r.info.running && !r.busy);
  const updateAll = async () => { for (const r of updates()) await main(r); };
  const web = (url: string) => invoke("open_url", { url }).catch(() => {});

  onMount(() => {
    listen("progress", (p: Progress) => { const i = idx(p.id); if (i >= 0) setRows(i, { pct: p.pct, busy: p.stage === "install" ? "Installing" : rows[i].busy }); });
    invoke<string>("version").then(setVersion).catch(() => {});
    if (desktop) check();
  });

  return (
    <div class="app">
      <header class="top">
        <img class="logo" src={family} alt="" />
        <span class="brand">Datum <b>Home</b></span>
        <span class="grow" />
        <span class="mono muted">{checked() ? `Checked ${checked()}` : checking() ? "Checking…" : ""}</span>
        <button class="btn line" disabled={checking()} onClick={check}>{checking() ? "Checking…" : "Check again"}</button>
      </header>

      <Show when={self()}>{s => (
        <div class="banner">
          <span>Datum Home {s().version} is ready{s().date ? ` (${day(s().date)})` : ""}.</span>
          <button class="btn solid" disabled={!!selfBusy()} onClick={async () => {
            setSelfBusy("Downloading…");
            try { await invoke("update_home", { release: s() }); } catch (e) { setSelfBusy(""); alert(String(e)); }
          }}>{selfBusy() || "Update and restart"}</button>
        </div>
      )}</Show>

      <main class="body">
        <section class="intro">
          <div>
            <h1>Your Datum apps</h1>
            <p class="muted">Install, update, open or remove each app. Apps install for your user account, with no administrator rights, and your files are never touched.</p>
          </div>
          <Show when={updates().length > 1}><button class="btn solid" onClick={updateAll}>Update all ({updates().length})</button></Show>
        </section>

        <Show when={!desktop}><p class="note">Datum Home must run inside its desktop window.</p></Show>
        <Show when={desktop && !online() && rows.length > 0}><p class="note">The Datum site could not be reached, so this is the built-in list of apps.</p></Show>

        <div class="grid">
          <For each={rows}>{r => {
            const c = () => r.info?.card;
            const inst = () => c()?.installed;
            const rel = () => c()?.release;
            const state = () => r.busy ? r.busy : !c() ? "Checking" : c()!.action === "update" ? "Update ready" : inst() ? "Installed" : c()!.action === "install" ? "Not installed" : "Coming soon";
            const label = () => {
              const a = c()?.action;
              if (a === "install") return `Install${rel()?.size ? ` · ${mb(rel()!.size)}` : ""}`;
              if (a === "update") return `Update to ${rel()!.version}`;
              if (a === "open") return r.info?.running ? "Running" : "Open";
              return "Not available yet";
            };
            return (
              <article class="card" classList={{ busy: !!r.busy }} style={{ "--c": r.app.accent || "#0B5CAD" }}>
                <div class="c-top">
                  <img src={r.app.logo || ICONS[r.app.id] || family} alt="" />
                  <div class="c-name">
                    <h2>{r.app.name}</h2>
                    <p class="muted">{r.app.tagline}</p>
                  </div>
                  <span class="badge mono" classList={{ upd: c()?.action === "update", on: !!inst() && c()?.action !== "update" }}>{state()}</span>
                </div>

                <dl class="vers mono">
                  <div><dt>Installed</dt><dd>{inst() ? inst()!.version || "?" : "—"}</dd></div>
                  <div><dt>Newest</dt><dd>{rel() ? `${rel()!.version}${rel()!.date ? ` · ${day(rel()!.date)}` : ""}` : r.info?.error ? "Unknown" : r.info ? "No release yet" : "…"}</dd></div>
                </dl>

                <Show when={r.busy}>
                  <div class="prog"><span style={{ width: `${r.busy === "Installing" ? 100 : r.pct ?? 0}%` }} classList={{ ind: r.busy === "Installing" || r.busy === "Removing" }} /></div>
                  <p class="mono muted small">{r.busy}{r.busy !== "Installing" && r.busy !== "Removing" && r.pct ? ` · ${r.pct}%` : "…"}</p>
                </Show>
                <Show when={r.error || r.info?.error}><p class="err">{r.error || r.info?.error}</p></Show>

                <Show when={r.confirm} fallback={
                  <div class="acts">
                    <button class="btn solid" disabled={!c() || !!r.busy || c()!.action === "unavailable" || (c()!.action === "open" && r.info!.running) || (c()!.action === "update" && r.info!.running)} onClick={() => main(r)}>{label()}</button>
                    <Show when={c()?.action === "update" && !r.busy}><button class="btn line" disabled={r.info!.running} onClick={() => invoke("open", { app: r.app })}>Open {inst()!.version}</button></Show>
                    <Show when={inst() && !r.busy}><button class="btn line" onClick={() => setRows(idx(r.app.id), "confirm", true)}>Uninstall</button></Show>
                    <span class="grow" />
                    <Show when={rel()?.notes}><button class="link mono" onClick={() => setRows(idx(r.app.id), "notes", !r.notes)}>{r.notes ? "Hide notes" : "What's new"}</button></Show>
                    <button class="link mono" onClick={() => web(`${SITE}apps/${r.app.id}`)}>About ↗</button>
                  </div>
                }>
                  <div class="confirm">
                    <span>Remove {r.app.name}{inst()?.version ? ` ${inst()!.version}` : ""}? Your files and documents are kept.</span>
                    <button class="btn solid danger" onClick={() => run(r.app.id, "Removing", "uninstall", { app: r.app })}>Uninstall</button>
                    <button class="btn line" onClick={() => setRows(idx(r.app.id), "confirm", false)}>Cancel</button>
                  </div>
                </Show>
                <Show when={r.notes && rel()?.notes}><pre class="notes">{rel()!.notes}</pre></Show>
              </article>
            );
          }}</For>
        </div>
      </main>

      <footer class="foot mono">
        <span>Datum Home {version()}</span>
        <span class="grow" />
        <span>Downloads come only from each app's GitHub releases and are checked before they run.</span>
        <button class="link" onClick={() => web(SITE)}>Datum site ↗</button>
      </footer>
    </div>
  );
}

render(() => <Home />, document.getElementById("app")!);

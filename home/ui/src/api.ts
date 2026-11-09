// Calls into the Rust shell and the shapes it returns (datum-home-core).
declare global {
  interface Window { __TAURI__?: { core: { invoke: (cmd: string, args?: object) => Promise<any> }; event: { listen: (e: string, f: (x: { payload: any }) => void) => Promise<() => void> } } }
}

export const desktop = !!window.__TAURI__;
export const invoke = <T = any>(cmd: string, args?: object): Promise<T> =>
  window.__TAURI__ ? window.__TAURI__.core.invoke(cmd, args) : Promise.reject("Datum Home must run inside its desktop window.");
export const listen = (e: string, f: (p: any) => void) => window.__TAURI__?.event.listen(e, x => f(x.payload));

export interface Release { version: string; date: string; notes: string; setup: string | null; sums: string | null; size: number; page: string }
export interface App { id: string; name: string; repo: string; accent: string; tagline: string; logo: string; latest: Release | null }
export interface Installed { name: string; version: string; publisher: string; exe: string; uninstall: string }
export type Action = "install" | "update" | "open" | "unavailable";
export interface Card { app: App; installed: Installed | null; release: Release | null; action: Action }
export interface CardInfo { card: Card; running: boolean; error: string | null }
/** What Datum Home is doing right now for one app (or "home"): the step, the file, bytes so far of the total, the speed, the checksum once checked, and why it is trying again. */
export interface Progress { id: string; stage: "checksums" | "download" | "retry" | "verify" | "verified" | "install"; file?: string; done?: number; total?: number; rate?: number; sha?: string; reason?: string; wait?: number; attempt?: number; of?: number }

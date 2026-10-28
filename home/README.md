<p align="center"><img src="../brand/datum-icon.svg" width="96" alt="Datum Home"></p>

<h1 align="center">Datum Home</h1>

<p align="center">One small window to install, update, open and remove every <a href="https://edgar-mendonca.github.io/Datum/">Datum</a> app.</p>

Datum Home shows one card per Datum app: what you have installed, the newest version, and one button to install, update or open it. It checks for new versions when you open it, never in the background. Each app can also be downloaded on its own from the [Datum site](https://edgar-mendonca.github.io/Datum/#apps); Datum Home is a convenience, not a requirement.

- **Safe downloads.** Installers come only from each app's own GitHub releases and are checked against the release's `SHA256SUMS.txt` before they run.
- **No administrator rights.** Every Datum app installs for your user account.
- **Your files stay.** Uninstall removes the program, never your documents.
- **Updates itself** from this repository's releases (tags `home-vX.Y.Z`).

Free and open source (MIT), Windows 10 and 11.

## How it works

| Step | Where |
| --- | --- |
| The list of apps | `https://edgar-mendonca.github.io/Datum/home.json`, written by the Datum site at every build from `apps.json`; a built-in list when offline |
| The newest release of each app | GitHub's releases API (`…-setup.exe` and `SHA256SUMS.txt`); the site's copy in home.json when GitHub is busy |
| What is installed | Windows' list of programs for this user (`HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall`), matched by name and publisher |
| Install and update | Download to the temp folder, check SHA-256, run the installer silently (`/S`); refused while the app is open |
| Uninstall | The app's own uninstaller, silently; waits until Windows no longer lists it |

## Code

```
home/
  crates/core/     datum-home-core: the rules (catalog, versions, releases, checksums, installed entries, the button), unit-tested, no I/O
  src-tauri/       the Tauri shell: main.rs (commands, downloads), sys.rs (registry, processes, installers; Windows)
  ui/              the window (SolidJS, the Datum design)
```

```bash
cd home
npm ci
npm run check:ui && npm run build:ui
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
npx tauri build --bundles nsis      # on Windows
```

Release: bump `version` in `src-tauri/Cargo.toml`, add a section to `CHANGELOG.md`, then `git tag home-v0.1.1 && git push origin home-v0.1.1`. The workflow `.github/workflows/home-release.yml` builds the installer, publishes the release and rebuilds the site.

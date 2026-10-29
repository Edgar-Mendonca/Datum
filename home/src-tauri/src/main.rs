//! Datum Home: one small window to install, update, open and remove the Datum apps.
//! The rules live in `datum-home-core`; this file does the I/O: the site's app list, GitHub releases,
//! downloads checked against SHA256SUMS.txt, Windows' list of installed programs, and running installers.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sys;

use datum_home_core::{self as core, App, Card, Installed, Release};
use serde_json::json;
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use tauri::{AppHandle, Emitter};

type R<T> = Result<T, String>;

fn agent() -> ureq::Agent {
    ureq::AgentBuilder::new()
        .timeout_connect(std::time::Duration::from_secs(10))
        .timeout_read(std::time::Duration::from_secs(30))
        .try_proxy_from_env(true)
        .user_agent(concat!("DatumHome/", env!("CARGO_PKG_VERSION")))
        .build()
}

/// Runs blocking work (network, installers) off the window's thread.
async fn blocking<T: Send + 'static>(f: impl FnOnce() -> R<T> + Send + 'static) -> R<T> {
    tauri::async_runtime::spawn_blocking(f).await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

/// The apps: from the Datum site, else the built-in list. `online` says which. The site (rebuilt every hour) also
/// carries each app's newest release and Datum Home's own, so a normal check asks GitHub nothing.
#[tauri::command]
async fn catalog() -> R<serde_json::Value> {
    blocking(|| {
        let text = agent().get(core::CATALOG_URL).call().ok().and_then(|r| r.into_string().ok());
        let site = text.as_deref().and_then(core::parse_catalog);
        let home = text.as_deref().and_then(core::parse_home);
        Ok(json!({ "online": site.is_some(), "apps": site.unwrap_or_else(core::builtin), "home": home }))
    })
    .await
}

/// The newest published release of a repository (Datum Home's own: tags `home-v…`). None when there is none yet.
fn latest(repo: &str) -> R<Option<Release>> {
    if !core::repo_ok(repo) {
        return Err("Unknown repository.".into());
    }
    let url = format!("https://api.github.com/repos/{repo}/releases?per_page=20");
    let list: serde_json::Value = match agent().get(&url).set("Accept", "application/vnd.github+json").call() {
        Ok(r) => r.into_json().map_err(|e| e.to_string())?,
        Err(ureq::Error::Status(404, _)) => return Ok(None),
        Err(ureq::Error::Status(403 | 429, _)) => return Err("GitHub is busy (rate limit). Try again in a few minutes.".into()),
        Err(ureq::Error::Status(c, _)) => return Err(format!("GitHub answered {c}. Try again later.")),
        Err(_) => return Err("Could not reach GitHub. Check your internet connection.".into()),
    };
    let home = repo == core::HOME_REPO;
    Ok(list
        .as_array()
        .into_iter()
        .flatten()
        .filter(|r| !r["prerelease"].as_bool().unwrap_or(false))
        .filter(|r| r["tag_name"].as_str().is_some_and(|t| t.starts_with("home-v") == home))
        .filter_map(core::parse_release)
        .max_by(|a, b| core::version_key(&a.version).cmp(&core::version_key(&b.version))))
}

/// One app's card: what is installed, the newest release, and what the button does. The site's copy of the
/// newest release is used when it can be installed; GitHub is asked only for an app the site does not cover
/// (GitHub allows about 60 questions an hour per network without an account).
#[tauri::command]
async fn card(app: App) -> R<serde_json::Value> {
    blocking(move || {
        let installed = sys::installed();
        let mine = core::find_installed(&app, &installed).cloned();
        let from_site = app.latest.as_ref().is_some_and(|r| core::installable(&app.repo, r));
        let (release, error) = if from_site {
            (None, None)
        } else {
            match latest(&app.repo) {
                Ok(r) => (r, None),
                Err(e) => (None, Some(e)),
            }
        };
        let c: Card = core::card(app, mine, release);
        let running = c.installed.as_ref().is_some_and(|i| sys::running(&i.exe));
        Ok(json!({ "card": c, "running": running, "error": error }))
    })
    .await
}

/// Datum Home's own newest release, if it is newer than this one: the site's copy when it has one, else GitHub.
#[tauri::command]
async fn home_update(site: Option<Release>) -> R<Option<Release>> {
    blocking(move || {
        let r = match site.filter(|r| core::installable(core::HOME_REPO, r)) {
            Some(r) => Some(r),
            None => latest(core::HOME_REPO)?,
        };
        Ok(r.filter(|r| core::newer(&r.version, env!("CARGO_PKG_VERSION")) && core::installable(core::HOME_REPO, r)))
    })
    .await
}

/// Downloads an installer to the temp folder and checks it against the release's SHA256SUMS.txt.
fn download(app: &AppHandle, id: &str, repo: &str, rel: &Release) -> R<std::path::PathBuf> {
    let (Some(url), Some(sums)) = (rel.setup.as_deref(), rel.sums.as_deref()) else {
        return Err("This release has no installer with a checksum. Download it from its releases page.".into());
    };
    if !core::download_ok(repo, url) || !core::download_ok(repo, sums) {
        return Err("Installers are only downloaded from the app's own releases page.".into());
    }
    let name = url.rsplit('/').next().filter(|n| !n.is_empty() && !n.contains(['\\', ':'])).unwrap_or("setup.exe").to_string();
    let fail = |e: String| format!("Could not fetch the checksums: {e}");
    let list = agent().get(sums).call().map_err(|e| fail(e.to_string()))?.into_string().map_err(|e| fail(e.to_string()))?;
    let want = core::checksum_for(&list, &name).ok_or("The checksum list does not include this installer.")?;
    let dir = std::env::temp_dir().join("DatumHome");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let dest = dir.join(&name);
    let resp = agent().get(url).call().map_err(|e| format!("Download failed: {e}"))?;
    let total: u64 = resp.header("Content-Length").and_then(|v| v.parse().ok()).unwrap_or(rel.size);
    let (mut src, mut file) = (resp.into_reader(), std::fs::File::create(&dest).map_err(|e| e.to_string())?);
    let (mut hash, mut buf, mut done, mut last) = (Sha256::new(), vec![0u8; 1 << 16], 0u64, 0u64);
    loop {
        let n = src.read(&mut buf).map_err(|e| format!("Download failed: {e}"))?;
        if n == 0 {
            break;
        }
        file.write_all(&buf[..n]).map_err(|e| e.to_string())?;
        hash.update(&buf[..n]);
        done += n as u64;
        if total > 0 && done * 100 / total > last {
            last = done * 100 / total;
            let _ = app.emit("progress", json!({ "id": id, "stage": "download", "pct": last }));
        }
    }
    drop(file);
    let got: String = hash.finalize().iter().map(|b| format!("{b:02x}")).collect();
    if got != want {
        let _ = std::fs::remove_file(&dest);
        return Err("The download did not match its checksum and was deleted. Try again.".into());
    }
    Ok(dest)
}

/// Installs or updates an app: download, check, then run its installer silently for this user.
#[tauri::command]
async fn install(handle: AppHandle, app: App, release: Release) -> R<()> {
    blocking(move || {
        if let Some(i) = core::find_installed(&app, &sys::installed()) {
            if sys::running(&i.exe) {
                return Err(format!("{} is open. Close it, then try again.", app.name));
            }
        }
        let file = download(&handle, &app.id, &app.repo, &release)?;
        let _ = handle.emit("progress", json!({ "id": app.id, "stage": "install", "pct": 100 }));
        let out = sys::run_wait(&file, &["/S"]);
        let _ = std::fs::remove_file(&file);
        out?;
        if core::find_installed(&app, &sys::installed()).is_none() {
            return Err(format!("The installer finished but {} was not found afterwards. Try installing it from its releases page.", app.name));
        }
        Ok(())
    })
    .await
}

/// Removes an app with its own uninstaller, silently. The user's documents are never touched.
#[tauri::command]
async fn uninstall(app: App) -> R<()> {
    blocking(move || {
        let list = sys::installed();
        let i: Installed = core::find_installed(&app, &list).cloned().ok_or(format!("{} is not installed.", app.name))?;
        if sys::running(&i.exe) {
            return Err(format!("{} is open. Close it, then try again.", app.name));
        }
        let (prog, mut args) = core::split_command(&i.uninstall);
        if !args.iter().any(|a| a.eq_ignore_ascii_case("/S")) {
            args.push("/S".into());
        }
        let args: Vec<&str> = args.iter().map(String::as_str).collect();
        sys::run_wait(std::path::Path::new(&prog), &args)?;
        // The uninstaller hands over to a copy of itself and returns at once: wait until Windows no longer lists the app.
        for _ in 0..240 {
            if core::find_installed(&app, &sys::installed()).is_none() {
                return Ok(());
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
        Err(format!("{} is still listed as installed. Try again, or remove it from Windows Settings › Apps.", app.name))
    })
    .await
}

#[tauri::command]
fn open(app: App) -> R<()> {
    let i = core::find_installed(&app, &sys::installed()).cloned().ok_or(format!("{} is not installed.", app.name))?;
    sys::start(&i.exe)
}

/// Opens a Datum web page in the browser (only our own pages).
#[tauri::command]
fn open_url(url: String) -> R<()> {
    let ok = url.starts_with("https://edgar-mendonca.github.io/Datum/") || url.starts_with(&format!("https://github.com/{}/", core::OWNER));
    if !ok {
        return Err("Only Datum pages open from here.".into());
    }
    sys::browse(&url)
}

/// Updates Datum Home itself: download and check, then close, install silently and start again.
#[tauri::command]
async fn update_home(handle: AppHandle, release: Release) -> R<()> {
    let h = handle.clone();
    let file = blocking(move || download(&h, "home", core::HOME_REPO, &release)).await?;
    sys::replace_self(&file)?;
    handle.exit(0);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![version, catalog, card, home_update, install, uninstall, open, open_url, update_home])
        .run(tauri::generate_context!())
        .expect("Datum Home could not start");
}

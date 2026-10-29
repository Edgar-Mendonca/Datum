//! Datum Home's engine: the list of Datum apps, their newest releases, what is installed on this
//! computer, and what each app's button should do. Pure Rust with no I/O, so every rule is unit-tested;
//! the window (src-tauri) does the downloading, the registry and the processes.
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Where the list of apps comes from: written by the Datum site at every build.
pub const CATALOG_URL: &str = "https://edgar-mendonca.github.io/Datum/home.json";
/// Datum Home's own releases (tags `home-vX.Y.Z` in the Datum hub repository).
pub const HOME_REPO: &str = "Edgar-Mendonca/Datum";
pub const OWNER: &str = "Edgar-Mendonca";
pub const PUBLISHER: &str = "Edgar Mendonca";

/// One app in the family, as the site lists it.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct App {
    pub id: String,
    pub name: String,
    pub repo: String,
    #[serde(default)]
    pub accent: String,
    #[serde(default)]
    pub tagline: String,
    /// The app's icon as a data: URI (from the site); empty means the window uses its built-in icon.
    #[serde(default)]
    pub logo: String,
    /// The newest release as the site saw it at its last build; used when GitHub cannot be reached.
    #[serde(default)]
    pub latest: Option<Release>,
}

/// The apps Datum Home knows without the internet, so it still works offline or before the site answers.
pub fn builtin() -> Vec<App> {
    [
        ("plan", "Datum Plan", "#0B5CAD", "Plan, schedule, track and report projects."),
        ("plot", "Datum Plot", "#0E8C7F", "Analyse data and make publication-ready graphs."),
        ("atlas", "Datum Atlas", "#6C4AB6", "Choose materials with property charts and selection indices."),
        ("sim", "Datum Sim", "#C2410C", "Model and simulate dynamic systems: block diagrams, control and motors."),
        ("calc", "Datum Calc", "#A8650F", "Engineering calculations with real units, as readable maths, with checks and a printable calc sheet."),
        ("mesh", "Datum Mesh", "#B83250", "Finite-element analysis on the desktop: stresses, deflections and temperatures in parts and frames."),
        ("pipe", "Datum Pipe", "#4D7C0F", "Pipe stress analysis on the desktop: displacements, support loads, nozzle loads and code stresses, with an automatic isometric."),
    ]
    .into_iter()
    .map(|(id, name, accent, tagline)| App {
        id: id.into(),
        name: name.into(),
        repo: format!("{OWNER}/{}", name.replace(' ', "-")),
        accent: accent.into(),
        tagline: tagline.into(),
        logo: String::new(),
        latest: None,
    })
    .collect()
}

/// Reads the site's home.json (`{"apps": [...]}`); keeps only apps from our own repositories.
pub fn parse_catalog(json: &str) -> Option<Vec<App>> {
    #[derive(Deserialize)]
    struct Catalog {
        apps: Vec<App>,
    }
    let c: Catalog = serde_json::from_str(json).ok()?;
    let apps: Vec<App> = c.apps.into_iter().filter(|a| repo_ok(&a.repo) && !a.id.is_empty() && !a.name.is_empty()).collect();
    (!apps.is_empty()).then_some(apps)
}

/// Datum Home's own newest release as the site saw it (`{"home": {...}}` in home.json), if it can be installed.
pub fn parse_home(json: &str) -> Option<Release> {
    #[derive(Deserialize)]
    struct Site {
        home: Option<Release>,
    }
    let r = serde_json::from_str::<Site>(json).ok()?.home?;
    installable(HOME_REPO, &r).then_some(r)
}

/// A release Datum Home can install: an installer from the repository's own releases, with its checksum list.
pub fn installable(repo: &str, r: &Release) -> bool {
    r.sums.as_deref().is_some_and(|u| download_ok(repo, u)) && r.setup.as_deref().is_some_and(|u| download_ok(repo, u))
}

/// Only `Edgar-Mendonca/Datum` and `Edgar-Mendonca/Datum-<Name>`.
pub fn repo_ok(repo: &str) -> bool {
    let Some(name) = repo.strip_prefix(&format!("{OWNER}/")) else { return false };
    name == "Datum" || name.strip_prefix("Datum-").is_some_and(|n| !n.is_empty() && n.chars().all(|c| c.is_ascii_alphanumeric()))
}

/// 0.3.0-beta.2 → [0, 3, 0, 0, 2]; 0.3.0 → [0, 3, 0, 1, 0], so a release beats its betas. Accepts `v` and `home-v` prefixes.
pub fn version_key(v: &str) -> Vec<u64> {
    let v = v.trim().trim_start_matches("home-").trim_start_matches('v');
    let (main, pre) = v.split_once('-').unwrap_or((v, ""));
    let mut out: Vec<u64> = main.split('.').map(|p| p.parse().unwrap_or(0)).collect();
    out.resize(3, 0);
    out.push(pre.is_empty() as u64);
    out.push(pre.rsplit('.').next().and_then(|n| n.parse().ok()).unwrap_or(0));
    out
}

pub fn newer(a: &str, b: &str) -> bool {
    version_key(a) > version_key(b)
}

/// The newest release of an app, from GitHub's `releases/latest`.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct Release {
    pub version: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub notes: String,
    /// The installer (`…-setup.exe`) and its checksum list (`SHA256SUMS.txt`).
    #[serde(default)]
    pub setup: Option<String>,
    #[serde(default)]
    pub sums: Option<String>,
    #[serde(default)]
    pub size: u64,
    #[serde(default)]
    pub page: String,
}

/// Reads one release object from the GitHub API. Drafts and releases without a version are ignored.
pub fn parse_release(rel: &Value) -> Option<Release> {
    if rel["draft"].as_bool().unwrap_or(false) {
        return None;
    }
    let tag = rel["tag_name"].as_str()?;
    let version = tag.trim_start_matches("home-").trim_start_matches('v').to_string();
    if version.is_empty() || !version.starts_with(|c: char| c.is_ascii_digit()) {
        return None;
    }
    let assets = rel["assets"].as_array().cloned().unwrap_or_default();
    let find = |suffix: &str| assets.iter().find(|a| a["name"].as_str().is_some_and(|n| n.to_lowercase().ends_with(suffix)));
    let exe = find("-setup.exe");
    Some(Release {
        version,
        date: rel["published_at"].as_str().unwrap_or("").get(..10).unwrap_or("").into(),
        notes: rel["body"].as_str().unwrap_or("").replace("\r\n", "\n").trim().into(),
        setup: exe.and_then(|a| a["browser_download_url"].as_str()).map(Into::into),
        sums: find("sha256sums.txt").and_then(|a| a["browser_download_url"].as_str()).map(Into::into),
        size: exe.and_then(|a| a["size"].as_u64()).unwrap_or(0),
        page: rel["html_url"].as_str().unwrap_or("").into(),
    })
}

/// Downloads are accepted only from the app's own GitHub releases.
pub fn download_ok(repo: &str, url: &str) -> bool {
    repo_ok(repo) && url.starts_with(&format!("https://github.com/{repo}/releases/download/"))
}

/// The expected SHA-256 of `file` in a `SHA256SUMS.txt` (lines of `<hash>  <name>`, `*name` allowed).
pub fn checksum_for(list: &str, file: &str) -> Option<String> {
    list.lines().find_map(|l| {
        let mut it = l.split_whitespace();
        let (hash, name) = (it.next()?, it.next()?);
        (name.trim_start_matches('*') == file && hash.len() == 64 && hash.chars().all(|c| c.is_ascii_hexdigit())).then(|| hash.to_lowercase())
    })
}

/// An app installed for this user, from Windows' list of installed programs.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct Installed {
    pub name: String,
    pub version: String,
    pub publisher: String,
    /// The app's program, from DisplayIcon (`"C:\…\datum-plan.exe",0` → `C:\…\datum-plan.exe`).
    pub exe: String,
    pub uninstall: String,
}

/// Cleans a DisplayIcon value into a program path.
pub fn icon_path(display_icon: &str) -> String {
    let s = display_icon.trim();
    let s = match s.rsplit_once(',') {
        Some((p, n)) if n.trim().parse::<i32>().is_ok() => p,
        _ => s,
    };
    s.trim().trim_matches('"').to_string()
}

/// Splits an UninstallString into the program and its arguments (`"C:\a b\uninstall.exe" /x` → program, ["/x"]).
pub fn split_command(cmd: &str) -> (String, Vec<String>) {
    let cmd = cmd.trim();
    let (prog, rest) = if let Some(r) = cmd.strip_prefix('"') {
        match r.split_once('"') {
            Some((p, rest)) => (p.to_string(), rest),
            None => (r.to_string(), ""),
        }
    } else if let Some(i) = cmd.to_lowercase().find(".exe") {
        (cmd[..i + 4].to_string(), &cmd[i + 4..])
    } else {
        match cmd.split_once(' ') {
            Some((p, rest)) => (p.to_string(), rest),
            None => (cmd.to_string(), ""),
        }
    };
    (prog, rest.split_whitespace().map(Into::into).collect())
}

/// The installed entry for an app: same display name and our publisher (or none given).
pub fn find_installed<'a>(app: &App, list: &'a [Installed]) -> Option<&'a Installed> {
    list.iter().find(|i| i.name.eq_ignore_ascii_case(&app.name) && (i.publisher.is_empty() || i.publisher == PUBLISHER))
}

/// What the app's main button does.
#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Action {
    /// Not installed and a verified installer exists.
    Install,
    /// Installed and a newer verified installer exists.
    Update,
    /// Installed and up to date (or nothing newer can be checked).
    Open,
    /// Not installed and nothing to install yet (no release, or a release without an installer and checksum).
    Unavailable,
}

#[derive(Debug, Clone, Serialize)]
pub struct Card {
    pub app: App,
    pub installed: Option<Installed>,
    pub release: Option<Release>,
    pub action: Action,
}

/// Works out each app's card from what is installed and the newest release.
pub fn card(app: App, installed: Option<Installed>, release: Option<Release>) -> Card {
    let release = release.or_else(|| app.latest.clone());
    let can_install = release.as_ref().is_some_and(|r| installable(&app.repo, r));
    let action = match (&installed, &release) {
        (Some(i), Some(r)) if can_install && newer(&r.version, &i.version) => Action::Update,
        (Some(_), _) => Action::Open,
        (None, _) if can_install => Action::Install,
        (None, _) => Action::Unavailable,
    };
    Card { app, installed, release, action }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn rel(tag: &str, repo: &str) -> Value {
        json!({
            "tag_name": tag, "draft": false, "published_at": "2026-10-28T09:00:00Z", "body": "Notes\r\n- one", "html_url": format!("https://github.com/{repo}/releases/tag/{tag}"),
            "assets": [
                { "name": format!("X-{}-setup.exe", tag.trim_start_matches('v')), "size": 12_000_000, "browser_download_url": format!("https://github.com/{repo}/releases/download/{tag}/X-setup.exe") },
                { "name": "SHA256SUMS.txt", "size": 90, "browser_download_url": format!("https://github.com/{repo}/releases/download/{tag}/SHA256SUMS.txt") }
            ]
        })
    }
    fn plan() -> App {
        builtin().into_iter().find(|a| a.id == "plan").unwrap()
    }
    fn inst(v: &str) -> Installed {
        Installed { name: "Datum Plan".into(), version: v.into(), publisher: PUBLISHER.into(), exe: "C:\\x\\datum-plan.exe".into(), uninstall: "\"C:\\x\\uninstall.exe\"".into() }
    }

    #[test]
    fn versions() {
        assert!(newer("0.3.12", "0.3.11"));
        assert!(newer("0.10.0", "0.9.9"));
        assert!(newer("1.0.0", "1.0.0-beta.3"));
        assert!(newer("1.0.0-beta.3", "1.0.0-beta.2"));
        assert!(!newer("v0.3.11", "0.3.11"));
        assert!(!newer("home-v0.1.0", "0.1.0"));
    }

    #[test]
    fn builtin_repos_are_ours() {
        let apps = builtin();
        assert_eq!(apps[0].repo, "Edgar-Mendonca/Datum-Plan");
        assert_eq!(apps.len(), 7);
        assert_eq!(apps[6].repo, "Edgar-Mendonca/Datum-Pipe");
        assert!(apps.iter().all(|a| repo_ok(&a.repo)));
    }

    #[test]
    fn repos_and_downloads() {
        assert!(repo_ok("Edgar-Mendonca/Datum"));
        assert!(repo_ok("Edgar-Mendonca/Datum-Sim"));
        assert!(!repo_ok("Edgar-Mendonca/Other"));
        assert!(!repo_ok("someone/Datum-Plan"));
        assert!(!repo_ok("Edgar-Mendonca/Datum-../x"));
        assert!(download_ok("Edgar-Mendonca/Datum-Plan", "https://github.com/Edgar-Mendonca/Datum-Plan/releases/download/v1/a.exe"));
        assert!(!download_ok("Edgar-Mendonca/Datum-Plan", "http://github.com/Edgar-Mendonca/Datum-Plan/releases/download/v1/a.exe"));
        assert!(!download_ok("Edgar-Mendonca/Datum-Plan", "https://github.com/Edgar-Mendonca/Datum-Plot/releases/download/v1/a.exe"));
        // The hub's own prefix does not cover the app repositories.
        assert!(!download_ok("Edgar-Mendonca/Datum", "https://github.com/Edgar-Mendonca/Datum-Plan/releases/download/v1/a.exe"));
    }

    #[test]
    fn catalog() {
        let json = r##"{"apps":[{"id":"plan","name":"Datum Plan","repo":"Edgar-Mendonca/Datum-Plan","accent":"#0B5CAD"},{"id":"x","name":"Bad","repo":"evil/Datum-X"}]}"##;
        let apps = parse_catalog(json).unwrap();
        assert_eq!(apps.len(), 1);
        assert_eq!(apps[0].tagline, "");
        assert!(parse_catalog("{}").is_none());
        assert!(parse_catalog(r#"{"apps":[]}"#).is_none());
        assert!(parse_catalog("<html>").is_none());
    }

    #[test]
    fn releases() {
        let r = parse_release(&rel("v0.3.12", "Edgar-Mendonca/Datum-Plan")).unwrap();
        assert_eq!(r.version, "0.3.12");
        assert_eq!(r.date, "2026-10-28");
        assert_eq!(r.notes, "Notes\n- one");
        assert_eq!(r.size, 12_000_000);
        assert!(r.setup.unwrap().ends_with("X-setup.exe"));
        assert!(r.sums.unwrap().ends_with("SHA256SUMS.txt"));
        assert_eq!(parse_release(&rel("home-v0.1.0", HOME_REPO)).unwrap().version, "0.1.0");
        let mut d = rel("v1.0.0", "Edgar-Mendonca/Datum-Plan");
        d["draft"] = json!(true);
        assert!(parse_release(&d).is_none());
        assert!(parse_release(&json!({ "tag_name": "nightly" })).is_none());
    }

    #[test]
    fn site_copy_of_releases() {
        let r = parse_release(&rel("home-v0.1.3", HOME_REPO)).unwrap();
        let json = serde_json::to_string(&json!({ "apps": [], "home": r })).unwrap();
        assert_eq!(parse_home(&json).unwrap().version, "0.1.3");
        assert!(parse_home(r#"{"apps":[]}"#).is_none());
        // An installer from another repository is never offered as Datum Home's update.
        let other = parse_release(&rel("v0.1.3", "Edgar-Mendonca/Datum-Plan")).unwrap();
        assert!(parse_home(&serde_json::to_string(&json!({ "home": other })).unwrap()).is_none());
        assert!(installable(HOME_REPO, &r));
        let mut nosums = r.clone();
        nosums.sums = None;
        assert!(!installable(HOME_REPO, &nosums));
    }

    #[test]
    fn checksums() {
        let h = "a".repeat(64);
        let list = format!("{h}  DatumPlan-0.3.12-setup.exe\n{}  *Other.exe\n", "B".repeat(64));
        assert_eq!(checksum_for(&list, "DatumPlan-0.3.12-setup.exe"), Some(h));
        assert_eq!(checksum_for(&list, "Other.exe"), Some("b".repeat(64)));
        assert_eq!(checksum_for(&list, "Missing.exe"), None);
        assert_eq!(checksum_for("short  DatumPlan.exe", "DatumPlan.exe"), None);
    }

    #[test]
    fn registry_values() {
        assert_eq!(icon_path("\"C:\\Users\\a\\AppData\\Local\\Datum Plan\\datum-plan.exe\",0"), "C:\\Users\\a\\AppData\\Local\\Datum Plan\\datum-plan.exe");
        assert_eq!(icon_path("C:\\x\\a.exe"), "C:\\x\\a.exe");
        assert_eq!(split_command("\"C:\\a b\\uninstall.exe\" /x"), ("C:\\a b\\uninstall.exe".into(), vec!["/x".into()]));
        assert_eq!(split_command("C:\\a b\\uninstall.exe /S"), ("C:\\a b\\uninstall.exe".into(), vec!["/S".into()]));
        assert_eq!(split_command("C:\\x\\u.exe"), ("C:\\x\\u.exe".into(), vec![]));
    }

    #[test]
    fn installed_lookup() {
        let mut other = inst("1.0.0");
        other.publisher = "Someone else".into();
        assert!(find_installed(&plan(), &[other]).is_none());
        let list = [inst("0.3.11")];
        assert_eq!(find_installed(&plan(), &list).unwrap().version, "0.3.11");
    }

    #[test]
    fn actions() {
        let r = || parse_release(&rel("v0.3.12", "Edgar-Mendonca/Datum-Plan"));
        assert_eq!(card(plan(), None, r()).action, Action::Install);
        assert_eq!(card(plan(), Some(inst("0.3.11")), r()).action, Action::Update);
        assert_eq!(card(plan(), Some(inst("0.3.12")), r()).action, Action::Open);
        assert_eq!(card(plan(), Some(inst("0.3.12")), None).action, Action::Open);
        assert_eq!(card(plan(), None, None).action, Action::Unavailable);
        // No checksum list: never installed automatically.
        let mut nosums = r().unwrap();
        nosums.sums = None;
        assert_eq!(card(plan(), None, Some(nosums.clone())).action, Action::Unavailable);
        assert_eq!(card(plan(), Some(inst("0.1.0")), Some(nosums)).action, Action::Open);
        // An installer from another repository is refused.
        let mut wrong = r().unwrap();
        wrong.setup = Some("https://github.com/Edgar-Mendonca/Datum-Plot/releases/download/v1/x-setup.exe".into());
        assert_eq!(card(plan(), None, Some(wrong)).action, Action::Unavailable);
        // Offline: the site's copy of the newest release is used.
        let mut app = plan();
        app.latest = r();
        assert_eq!(card(app, None, None).action, Action::Install);
    }
}

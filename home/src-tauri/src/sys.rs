//! Windows specifics: the user's list of installed programs (HKCU … Uninstall), running processes,
//! starting programs and installers. On other systems nothing is installed and nothing runs, so the
//! window can still be developed and tested there.
#[cfg(windows)]
use datum_home_core as core;
use datum_home_core::Installed;
use std::path::Path;

#[cfg(windows)]
const NO_WINDOW: u32 = 0x0800_0000; // CREATE_NO_WINDOW

/// The Datum programs installed for this user.
#[cfg(windows)]
pub fn installed() -> Vec<Installed> {
    use winreg::{enums::HKEY_CURRENT_USER, RegKey};
    let Ok(root) = RegKey::predef(HKEY_CURRENT_USER).open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Uninstall") else { return vec![] };
    root.enum_keys()
        .flatten()
        .filter_map(|k| root.open_subkey(&k).ok())
        .filter_map(|k| {
            let get = |v: &str| k.get_value::<String, _>(v).unwrap_or_default();
            let name = get("DisplayName");
            if !name.starts_with("Datum") {
                return None;
            }
            let uninstall = get("UninstallString");
            let mut exe = core::icon_path(&get("DisplayIcon"));
            if exe.is_empty() || !exe.to_lowercase().ends_with(".exe") {
                exe = program_beside(&core::split_command(&uninstall).0);
            }
            Some(Installed { name, version: get("DisplayVersion"), publisher: get("Publisher"), exe, uninstall })
        })
        .collect()
}

/// When DisplayIcon is missing: the program in the uninstaller's folder that is not the uninstaller.
#[cfg(windows)]
fn program_beside(uninstaller: &str) -> String {
    let Some(dir) = Path::new(uninstaller).parent() else { return String::new() };
    std::fs::read_dir(dir)
        .into_iter()
        .flatten()
        .flatten()
        .map(|e| e.path())
        .find(|p| p.extension().is_some_and(|x| x.eq_ignore_ascii_case("exe")) && !p.file_name().is_some_and(|n| n.to_string_lossy().to_lowercase().starts_with("uninstall")))
        .map(|p| p.display().to_string())
        .unwrap_or_default()
}

#[cfg(not(windows))]
pub fn installed() -> Vec<Installed> {
    vec![]
}

/// Whether a program (by its file name) is running for any user session.
#[cfg(windows)]
pub fn running(exe: &str) -> bool {
    use std::os::windows::process::CommandExt;
    let Some(name) = Path::new(exe).file_name().map(|n| n.to_string_lossy().to_string()) else { return false };
    std::process::Command::new("tasklist")
        .args(["/FO", "CSV", "/NH", "/FI", &format!("IMAGENAME eq {name}")])
        .creation_flags(NO_WINDOW)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_lowercase().contains(&format!("\"{}\"", name.to_lowercase())))
        .unwrap_or(false)
}

#[cfg(not(windows))]
pub fn running(_: &str) -> bool {
    false
}

/// Runs a program and waits for it to finish.
pub fn run_wait(prog: &Path, args: &[&str]) -> Result<(), String> {
    if !cfg!(windows) {
        return Err("Installing and removing apps works on Windows.".into());
    }
    let status = std::process::Command::new(prog).args(args).status().map_err(|e| format!("Could not start {}: {e}", prog.display()))?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("The installer stopped with code {}.", status.code().unwrap_or(-1)))
    }
}

pub fn start(exe: &str) -> Result<(), String> {
    let path = Path::new(exe);
    if exe.is_empty() || !path.exists() {
        return Err("The app's program was not found. Install it again.".into());
    }
    std::process::Command::new(path).current_dir(path.parent().unwrap_or(Path::new("."))).spawn().map(|_| ()).map_err(|e| format!("Could not start the app: {e}"))
}

/// Opens a web page in the default browser.
pub fn browse(url: &str) -> Result<(), String> {
    #[cfg(windows)]
    let r = std::process::Command::new("rundll32").args(["url.dll,FileProtocolHandler", url]).spawn();
    #[cfg(target_os = "macos")]
    let r = std::process::Command::new("open").arg(url).spawn();
    #[cfg(all(unix, not(target_os = "macos")))]
    let r = std::process::Command::new("xdg-open").arg(url).spawn();
    r.map(|_| ()).map_err(|e| e.to_string())
}

/// Datum Home updates itself: once this process has closed, install silently and start the new version.
#[cfg(windows)]
pub fn replace_self(installer: &Path) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let line = format!("/C ping -n 3 127.0.0.1 >nul & start \"\" /wait \"{}\" /S & start \"\" \"{}\"", installer.display(), exe.display());
    std::process::Command::new("cmd").raw_arg(line).creation_flags(NO_WINDOW).spawn().map_err(|e| format!("Could not start the installer: {e}"))?;
    Ok(())
}

#[cfg(not(windows))]
pub fn replace_self(_: &Path) -> Result<(), String> {
    Err("Updating Datum Home works on Windows.".into())
}

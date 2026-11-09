# Datum Home changelog

## 0.1.7 — 2026-11-09

Installs and updates keep going when GitHub's download servers are slow.

- When GitHub's download servers are busy or do not answer in time (errors 502, 503, 504) or the connection drops, Datum Home tries again by itself, up to four times, and says so on the card: what failed, how long it waits, and which try it is on. A download cut off halfway starts again.
- If every try fails, the message says in plain words that the problem is on GitHub's side and to try again in a few minutes, instead of showing a long web address.

## 0.1.6 — 2026-11-04

You see exactly what Datum Home downloads and does, and Datum Layout joins.

- Before you install or update, each card says which file it downloads, how big it is, and that it comes from the app's own GitHub releases and is checked with SHA-256 before it runs. The Update button shows the size too.
- While it works, every step is shown in words: fetching the checksum list; downloading, with megabytes so far of the total, percent, speed and time left; checking the SHA-256 (with the start of the checksum once it matches); installing for your user account.
- Updating Datum Home itself shows the same steps in its banner.
- Datum Layout (3D plant layout and piping) is in the list of apps, with its icon.

## 0.1.5 — 2026-10-29

Datum Schema joins Datum Home.

- Schema (intelligent P&IDs) is in Datum Home's own list of apps, with its icon, so it shows even when the Datum site cannot be reached.

## 0.1.4 — 2026-10-29

Windows now lists the publisher as "Datum".

- Settings › Apps shows "Datum" as Datum Home's publisher.
- Datum Home recognises the apps whether they were installed with the new publisher name or the earlier one, so nothing needs reinstalling.

## 0.1.3 — 2026-10-29

No more "GitHub is busy" messages.

- Datum Home now reads the newest version of every app, and of itself, from the Datum site, which checks GitHub every hour. Opening Datum Home no longer asks GitHub anything, so its limit of about 60 questions an hour per network is never reached.
- GitHub is asked directly only for an app the site does not list yet.
- Release notes come from the site too.

## 0.1.2 — 2026-10-29

Datum Pipe joins Datum Home.

- Pipe (pipe stress analysis) is in Datum Home's own list of apps, with its icon, so it shows even when the Datum site cannot be reached.

## 0.1.1 — 2026-10-28

Datum Calc and Datum Mesh join Datum Home.

- Calc (engineering calculations) and Mesh (finite-element analysis) are in Datum Home's own list of apps, with their icons, so they show even when the Datum site cannot be reached.

## 0.1.0 — 2026-10-28

The first Datum Home: one small window to install, update, open and remove every Datum app.

- One card per app with its newest version, what you have installed, and one main button: Install, Update or Open.
- Uninstall with one click (after a confirmation); your files and documents are kept.
- Update all, when more than one app has a new version.
- Every installer comes only from the app's own GitHub releases and is checked against its published checksum before it runs; apps install for your user account, with no administrator rights.
- Release notes and the app's page on the Datum site from each card.
- Checks for new versions when it opens, and updates itself the same way.
- Works with the built-in list of apps when the Datum site cannot be reached.

# KIK Trophy Desktop 1.0

A portable PS5 trophy backup inspector and owner-ID editor for Windows x64.
Built by **kiikeep**. English by default, with Spanish, Simplified Chinese, Italian, French, Japanese and Russian.

[Documentación en español](README.es.md)

## Features

- Open trophy backup folders, ZIP archives, TRPTITLE.DAT and TROPHY.UCP files.
- Inspect trophy names, descriptions, icons, grades, unlock status and timestamps.
- Read the local user ID and Account ID in hex and Base64.
- Validate every DAT SHA-256 block and the UCP's internal SHA-1.
- Take destination IDs from another **TRPTITLE.DAT**, or enter them manually.
- Export an adapted copy while preserving all trophy records and timestamps.
- Keep opened source files unchanged and write a verification report next to exports.
- Switch between seven UI languages and available catalog translations.
- Select multiple backups and change their owner IDs in one batch.

This is a local desktop tool. It does not connect to PSN, activate accounts,
unlock new trophies, merge histories or transfer files to a console.

## Get your files

Transfer existing trophies to a new local user, for example after a system reinstall.
Copy **both trophy2 folders** from your PS5 into one backup folder or ZIP:

```text
backup/user/home/<SOURCE_USER_ID>/trophy2/
backup/user/trophy2/
```

Preserve the two branches; do not merge folders named trophy2. The importer scans
recursively, pairs TRPTITLE.DAT with matching TROPHY.UCP catalogs, and ignores
unrelated files. ZIPs can also be opened with **Add files** or dragged into the app.
The DAT stores identity, progress and dates; the UCP supplies trophy text and icons.

1. Open the backup folder or ZIP and select one title or several checkboxes.
2. Choose **Change owner** or **Change IDs in batch**. Enter the destination IDs
   or take them from another **TRPTITLE.DAT** belonging to the destination user.
3. Export the adapted copy or batch to your PC.
4. On the PS5, **open each game at least once with the destination user**, then
   close it. Keep a backup of the current DAT.
5. Restore only the exported **TRPTITLE.DAT** to:

```text
/user/home/<DESTINATION_USER_ID>/trophy2/nobackup/data/<NPWR_ID>/TRPTITLE.DAT
```

**Only TRPTITLE.DAT is modified.** Restoring other trophy files has not been
tested; let the console generate them. The app exports copies to the PC; console
restoration is performed separately.

## Run the Windows app

Requires **Windows 10 or 11 x64 (Intel/AMD)**. This release does not include a
32-bit or native ARM64 build. Windows updates alone do not make every PC
compatible. The runtime is bundled; no developer tools are needed.

Extract the **entire** portable ZIP and open **KIK Trophy.exe**. Keep all DLLs,
`resources` and `locales` beside the executable. No Python, Node installation
or web server is needed for the packaged app.

Open a backup, select a title and choose **Change owner**. Use **Take IDs from
another TRPTITLE.DAT** or enter the new values. A blank field preserves its
current value. Export to a new path; existing files are never overwritten.
For a batch, select backup checkboxes or **Select all**, then **Change IDs in
batch**. Both single and batch exports ask for an output folder and create a new
export directory containing the destination console structure:

```text
user/home/<DESTINATION_USER_ID>/trophy2/nobackup/data/<NPWR_ID>/TRPTITLE.DAT
```

The destination UID comes from the rewritten DAT, not from the source folder.
The exported `user` branch corresponds to `/user` on the console. Copy each
DAT to its matching full console path. Only the exported DATs belong in that structure;
let the console generate other trophy files by launching each game once first.
The report includes each exact `/user/home/...` destination. If multiple backups
would write the same destination user/title file, selection is rejected before
any export: choose one history for that destination. Blank ID fields preserve
each backup’s current value; already matching backups are exported unchanged
in batch mode.

The language button in the upper-right corner remembers your choice.

Valid destination IDs are remembered on this PC when typed, loaded from a
TRPTITLE.DAT or successfully exported. They fill both single and batch dialogs
on the next use, including after restarting the app. Incomplete or invalid
input does not replace the last valid IDs. Blank fields keep their per-backup
meaning. Settings are stored in `%APPDATA%/KIK Trophy/preferences.json`; clearing
the imported backup list does not remove them.

## Identity fields

| Field               | Representation                                                  |
| ------------------- | --------------------------------------------------------------- |
| Local user ID       | 8 hex characters; corresponds to the folder under `/user/home/` |
| Account ID (hex)    | 16 hex characters, as stored in the DAT                         |
| Account ID (Base64) | Exactly 8 bytes, with byte order reversed from the shown hex    |

These are different fields. This tool changes the file's owner identity;
it does not create or activate a console account.

## Export behavior

The input is validated first. Only physical offsets `0x200..0x20B` (identity)
and `0x440..0x45F` (affected SHA-256) may change. The output is parsed again,
all block hashes are checked, and trophy records are compared with the original.
The saved file is read back and compared with the generated bytes.

A `*.kik-report.json` report records the old/new identity, checksums and result.
Reports can contain local paths and owner IDs; they are ignored by `.gitignore`.
Do not commit your backups or reports to a public repository.

An exported file can have a descriptive name on the PC. When installing it on
the console, it must be named **TRPTITLE.DAT** at the correct NPWR/user path.
Close games and keep a fresh copy of the current console file first. The title
must already be registered for the destination user. This app does not replace UCPs.

## Development

Node.js 24 is recommended.

```bash
npm ci
npm start
npm test
npx playwright install chromium
npm run test:ui
npm run package:win
```

Windows packaging outputs `dist/KIK-Trophy-win32-x64`. A GitHub Actions workflow
builds and uploads a portable ZIP when run manually or when a `v*` tag is pushed.
It does not automatically publish a GitHub Release.

All included tests generate **synthetic fixtures**. No personal backups, owner
IDs, account IDs or game artwork are bundled in this source repository.
The application reads artwork only from catalogs selected by the user.

## Validation and limitations

The owner-change method was manually verified on a PS5 with Ratchet & Clank
and ASTRO BOT. Earlier desktop exports were byte-identical to those successful
files. Version 1.0 keeps that rewriting algorithm and adds batch exports and seven UI languages.

Local tests cover parsing, integrity, ZIP CRC, ID conversion, preserved trophy
records, disk export, overwrite rejection, IPC checks, transactional batch rollback, remembered IDs across restarts and shutdown, seven-language UI and
minimum window layout. The packaged Windows executable needs a user-side run;
this build environment does not execute Windows applications.

Supported: PS5 T2PD v1 / T2TD v1 with the observed 9-section layout and UCP v1.
Not supported: PS3/PS4/Vita formats, encrypted or multi-disk ZIPs, ZIP64,
other DAT layouts, trophy unlocking or history merging.

Limits: 1 MiB/DAT, 64 MiB/UCP, 512 MiB/ZIP, 256 MiB imported trophy content,
512 distinct DATs, 10,000 scan entries and 16 folder levels.
Dates display to seconds in local time or UTC; export preserves original timestamps.
The progress percentage is a simple trophy count, not weighted PlayStation points.

Startup errors attempt to display a message and write `startup.log` in the app's
Windows user-data folder (normally `%APPDATA%/KIK Trophy/`).

## License

KIK Trophy source: [MIT](LICENSE). Electron/Chromium retain their own licenses,
shipped with the portable runtime. This project is not affiliated with Sony.

Bundled Noto Sans SC and Noto Sans JP fonts use SIL OFL 1.1;
see [font licenses](app/fonts/README.md). They support offline Chinese/Japanese text.

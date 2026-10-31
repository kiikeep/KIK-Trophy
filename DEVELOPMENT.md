# KIK Trophy development

Node.js 22.12+ (24 recommended), npm, Windows 10/11 x64 for native packaging.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:ui
# Windows only: verify real DPAPI across Electron processes
npm run test:session:win
npm start
npm run package:win
```

`build:psn` bundles the pinned MIT-licensed `psn-api` dependency into `app/vendor/psn-api.cjs`. Both startup and packaging run it automatically. The app needs no Node.js installation on the end user's PC. `app/vendor` and `node_modules` are generated, not committed. Include the whole packaged Windows directory, including `resources/app/vendor` and the third-party license.

The pull-request workflow tests the modules and UI, packages the Windows runtime and uploads a ZIP artifact. A draft PR is not a released or console-verified build.

## PSN modules

- `psn-session.cjs`: serialized, atomic encrypted refresh-token storage using Electron safeStorage (Windows DPAPI). Refuses unencrypted fallback backends.
- `psn-client.cjs`: session lifetime, refresh, pagination and downloaded snapshots. Uses `me` for the authenticated user's trophies.
- `psn-http.cjs`: bounded network reads, cancellation, timeouts and fixed errors. Permits GET requests to the Sony API hosts and POST only to Sony's OAuth token endpoint. Redirects are not followed automatically.
- `psn-backup.cjs`: validates and normalizes credential-free JSON snapshots. Imported JSON is user-supplied data, not a signed Sony response; the merge report distinguishes it from a download in an authenticated session.
- `psn-merge.cjs`: validates the DAT/catalog/snapshot combination and produces new bytes. No filesystem or network access.
- `psn-main.cjs`: validates IPC senders, holds snapshots in RAM, handles native file dialogs and fresh-folder exports.
- `psn-ui.js` / `psn-i18n.js`: PSN panel in the existing seven interface languages. Authentication uses an external browser and a password field, not an embedded Sony login.

NPSSO and access tokens are kept only in memory. Only the refresh token is saved, encrypted through Electron safeStorage, in `psn-session.bin` under the existing app user-data directory. No credentials are included in preferences, backup JSON, reports or logs. Windows DPAPI ties recovery to the OS user. `basic_text` and unavailable encryption are refused; PSN remains usable in memory with a visible save warning. Writes are serialized, fsynced and atomically replaced, including token rotation.

Opening the PSN panel automatically restores a saved session through a fresh OAuth token exchange and reloads the profile and games. Closing the panel clears the NPSSO field. Closing the app aborts requests and clears RAM while preserving the encrypted session. Disconnect explicitly deletes it and clears snapshots. Cancelled operations cannot recreate a forgotten session. Expired/revoked sessions are removed; transient network errors retain the saved refresh token for retry. Damaged or undecryptable files produce a reconnect message without exposing decrypted content.

## Merge policy and limits

Union with local unlocks preserved: never remove a local earned trophy. In 1.3, the default `local` date policy preserves existing earned records byte for byte. The optional `psn` policy replaces only both unlock-timestamp fields of shared earned trophies whose PSN date differs, preserving their flags, progress values and every other record byte. Latest-unlock summaries are recomputed for date changes, including earlier replacement dates; local-only trophies retain their dates. For a missing earned trophy, copy the locally defined target progress value and use PSN's unlock timestamp. Require matching Account ID, NPWR, PS5 platform, local catalog hash, complete trophy IDs, grades and group membership. Unknown layouts or unsupported unlock comparators are rejected. Owner transfer remains a separate operation.

Supported native layout: T2PD/T2TD v1, 1024-byte payload blocks plus SHA-256, fixed sections `0x400/500/600/700/800`. New earned records update both timestamp fields, earned flags and typed u32/u64 target values, global earned/touched bitmaps, per-group earned bitmaps and latest-unlock timestamps. Unknown bytes remain unchanged. Platinum merging also requires every dependency in its local definition to be earned; its flags are inferred and remain experimental. Checksums and the parsed result are verified before export.

Exports include `batch.kik-report.json` with added trophies, the selected date policy, preserved date conflicts, replaced dates with old/new values, local-only unlocks, changed blocks, download time, source type, `experimental: true` and `consoleRestoreVerified: false`. A repeated merge with the same snapshot and date policy changes no bytes. Date-only changes can be exported without adding a trophy.

`psn-dates.test.cjs` covers both policies, earlier/later global and DLC-group summaries, mirrored timestamps, unchanged non-date bytes, local-only/new trophies, idempotence and real IPC date-only export/report checks. The UI suite checks policy forwarding, preview invalidation and date-only export in the same seven-language interface.

## What is verified

`npm test` checks the existing owner-transfer/import behavior plus synthetic PSN merge cases: complete-row preservation, conflicting dates, local-only trophies, u32/u64 targets, bitmap boundaries, DLC groups, platinum dependencies, hash validation, idempotence and mismatch rejection. It also exercises the actual bundled `psn-api` with injected HTTP responses for login, metadata/earnings pagination, token refresh and cancellation. IPC tests write and re-read real exported files and reports and check cancellation, sender validation and overwrite refusal.

`npm run test:ui` checks the old interface and the new PSN flow with mocked IPC: credential input clearing, errors, downloading, preview, export, disconnect, offline JSON import, seven languages and minimum window size. `KIK_CHROME_PATH` can select a locally installed Chromium executable.

Private offline backups were also checked during development: 16 added Ratchet records and 9 added ASTRO BOT records exactly matched known-good earned records, including mirrored timestamps and typed values. These private game files are not distributed or used by CI. This validates byte handling, not Sony connectivity or console restoration.

`psn-session.test.cjs` additionally tests encrypted refresh-only persistence, app-client recreation, token rotation, logout, shutdown, corrupt/wrong-key data, unavailable crypto, offline retry and cancellation/write races. `test:session:win` runs real Electron safeStorage/DPAPI on Windows, then launches a fresh Electron process to decrypt the saved session. UI tests cover remembered-session recovery, explicit forgetting and the localized DAT prerequisite.

The user confirmed that live PSN connection and trophy reading work in 1.1. **Pending:** a real-account restart test of 1.2 session persistence and restoration of a merged DAT on PS5. Sony may change these unofficial API endpoints or restrict access. The original owner-transfer tests do not validate this new progress writer.

## 1.3.1 catalog compatibility

Local-vs-PSN version-string equality is no longer an export gate. For example, the supplied ASTRO’s PLAYROOM DAT encodes 1.4 while PSN reports 01.40; all 51 IDs and grades match. The writer still requires the matching local UCP hash, NPWR, owner, complete trophy count/IDs, local grades/groups/definitions, valid dates/bitmaps and supported native layout. `merge.catalogVersions` records the original local and PSN strings. PSN metadata-vs-earnings download consistency checks remain in place. Tests cover differently formatted and genuinely different version strings with compatible definitions, and rejection of structural mismatches despite version tolerance.

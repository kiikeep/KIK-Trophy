# KIK Trophy development

Node.js 22.12+ (24 recommended), npm, Windows 10/11 x64 for native packaging.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:ui
npm start
npm run package:win
```

`build:psn` bundles the pinned MIT-licensed `psn-api` dependency into `app/vendor/psn-api.cjs`. Both startup and packaging run it automatically. The app needs no Node.js installation on the end user's PC. `app/vendor` and `node_modules` are generated, not committed. Include the whole packaged Windows directory, including `resources/app/vendor` and the third-party license.

The pull-request workflow tests the modules and UI, packages the Windows runtime and uploads a ZIP artifact. A draft PR is a preview, not a released or console-verified build.

## PSN modules

- `psn-client.cjs`: session lifetime, refresh, pagination and downloaded snapshots. Uses `me` for the authenticated user's trophies.
- `psn-http.cjs`: bounded network reads, cancellation, timeouts and fixed errors. Permits GET requests to the Sony API hosts and POST only to Sony's OAuth token endpoint. Redirects are not followed automatically.
- `psn-backup.cjs`: validates and normalizes credential-free JSON snapshots. Imported JSON is user-supplied data, not a signed Sony response; the merge report distinguishes it from a download in an authenticated session.
- `psn-merge.cjs`: validates the DAT/catalog/snapshot combination and produces new bytes. No filesystem or network access.
- `psn-main.cjs`: validates IPC senders, holds snapshots in RAM, handles native file dialogs and fresh-folder exports.
- `psn-ui.js` / `psn-i18n.js`: PSN panel in the existing seven interface languages. Authentication uses an external browser and a password field, not an embedded Sony login.

NPSSO, access tokens and refresh tokens are not saved in preferences, backup JSON, reports or logs. Disconnect clears the session and snapshots and aborts in-flight network calls. Closing the PSN panel clears the input but deliberately keeps an active session until Disconnect or application exit.

## Merge policy and limits

Union with local history preserved: never remove a local earned trophy or replace its record/date. For a missing earned trophy, copy the locally defined target progress value and use PSN's unlock timestamp. Require matching Account ID, NPWR, PS5 platform, catalog hash/version, complete trophy IDs, grades and group membership. Unknown layouts or unsupported unlock comparators are rejected. Owner transfer remains a separate operation.

Supported native layout: T2PD/T2TD v1, 1024-byte payload blocks plus SHA-256, fixed sections `0x400/500/600/700/800`. New earned records update both timestamp fields, earned flags and typed u32/u64 target values, global earned/touched bitmaps, per-group earned bitmaps and latest-unlock timestamps. Unknown bytes remain unchanged. Platinum merging also requires every dependency in its local definition to be earned; its flags are inferred and remain experimental. Checksums and the parsed result are verified before export.

Exports include `batch.kik-report.json` with added trophies, preserved date conflicts, local-only unlocks, changed blocks, download time, source type, `experimental: true` and `consoleRestoreVerified: false`. A repeated merge with the same snapshot changes no bytes.

## What is verified

`npm test` checks the existing owner-transfer/import behavior plus synthetic PSN merge cases: complete-row preservation, conflicting dates, local-only trophies, u32/u64 targets, bitmap boundaries, DLC groups, platinum dependencies, hash validation, idempotence and mismatch rejection. It also exercises the actual bundled `psn-api` with injected HTTP responses for login, metadata/earnings pagination, token refresh and cancellation. IPC tests write and re-read real exported files and reports and check cancellation, sender validation and overwrite refusal.

`npm run test:ui` checks the old interface and the new PSN flow with mocked IPC: credential input clearing, errors, downloading, preview, export, disconnect, offline JSON import, seven languages and minimum window size. `KIK_CHROME_PATH` can select a locally installed Chromium executable.

Private offline backups were also checked during development: 16 added Ratchet records and 9 added ASTRO BOT records exactly matched known-good earned records, including mirrored timestamps and typed values. These private game files are not distributed or used by CI. This validates byte handling, not Sony connectivity or console restoration.

**Pending:** live authentication/download with a real Sony session and restoration of a merged DAT on PS5. Do not describe these as passed until performed. Sony may change these unofficial API endpoints or restrict access. The original owner-transfer tests do not validate this new progress writer.

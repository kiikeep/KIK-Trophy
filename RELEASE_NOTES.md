## New since 1.0: PSN trophy downloads and merging

- Connect your PSN account, browse your games and download trophy progress with original unlock dates.
- Merge downloaded progress into an existing PS5 `TRPTITLE.DAT`, adding missing unlocks while keeping local-only trophies.
- Choose **Keep local dates** or **Use PSN dates** for trophies earned in both sources. Date-only changes can also be exported.
- Remember your PSN session using encrypted Windows storage. Closing the app preserves it; **Disconnect** removes it.
- Save and reopen credential-free PSN JSON backups for offline use.
- Accept structurally compatible trophy sets even when local and PSN catalog version strings differ.
- Keep the existing owner-transfer, batch export and seven-language interface.

The experimental export legend has been removed after user-confirmed PS5 restoration, including ASTRO's PLAYROOM. The DAT prerequisite is displayed as normal help text.

### Downloads

- **KIK-Trophy-v1.3.2-Windows-x64.zip**: extract the entire ZIP and open **KIK Trophy.exe**. Windows 10/11 x64; no Node.js installation needed.
- **KIK-Trophy-v1.3.2-Source.zip**: full tracked source, tests, build scripts and documentation. Build instructions are in `DEVELOPMENT.md`.
- **SHA256SUMS.txt**: checksums for both archives.

For merging, first launch the game at least once on the PS5, close it, and copy its `TRPTITLE.DAT` and matching `TROPHY.UCP` to the PC. Restore only the exported DAT to the displayed `user/home/<USER_ID>/trophy2/nobackup/data/<NPWR>/TRPTITLE.DAT` path. Original PC files are preserved. This release downloads PSN data; it does not upload trophies to PSN.

### Validation

Automated DAT/UCP/ZIP, ownership, merge, date-policy, compatibility and IPC/export tests; seven-language Playwright UI tests; real Windows safeStorage/DPAPI session recovery across consecutive Electron launches; Windows portable packaging. PSN downloading and PS5 restoration were confirmed by the user. Hardware restoration is not an automated check for each exported file.

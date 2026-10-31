"use strict";
// Runs in Electron on Windows, exercising real safeStorage/DPAPI across processes.
const { app, safeStorage } = require("electron"),
  fs = require("node:fs/promises"),
  syncFs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  assert = require("node:assert/strict"),
  { spawnSync } = require("node:child_process"),
  { createSessionStore } = require("../app/psn-session.cjs");
const child = process.argv[2] === "--check-session";
const dir = child
  ? process.argv[3]
  : syncFs.mkdtempSync(path.join(os.tmpdir(), "kik-dpapi-"));
app.setPath("userData", dir);
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  try {
    assert.equal(process.platform, "win32");
    assert(safeStorage.isEncryptionAvailable());
    const store = createSessionStore({ directory: dir, safeStorage }),
      value = "synthetic-refresh-token-for-native-encryption-test";
    if (child) {
      assert.equal((await store.load()).refreshToken, value);
      app.exit(0);
      return;
    }
    await store.save({ refreshToken: value });
    const bytes = await fs.readFile(path.join(dir, "psn-session.bin"));
    assert(!bytes.includes(value));
    const next = spawnSync(
      process.execPath,
      [__filename, "--check-session", dir],
      { encoding: "utf8", timeout: 30000, windowsHide: true },
    );
    assert.equal(
      next.status,
      0,
      String(next.error || next.stderr || next.stdout),
    );
    await store.clear();
    assert.equal(await store.load(), null);
    console.log(
      "PASS: real Windows safeStorage/DPAPI encryption, recovery in a fresh Electron process and saved-session deletion",
    );
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    app.exit(0);
  } catch (e) {
    console.error(e);
    app.exit(1);
  }
});

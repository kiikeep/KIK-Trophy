"use strict";
// Node driver runs two consecutive Electron processes: a genuine close/reopen.
const fs = require("node:fs/promises"),
  syncFs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  assert = require("node:assert/strict"),
  { spawnSync } = require("node:child_process");
const value = "synthetic-refresh-token-for-native-encryption-test";
if (!process.versions.electron) {
  const dir = syncFs.mkdtempSync(path.join(os.tmpdir(), "kik-dpapi-"));
  try {
    assert.equal(process.platform, "win32");
    for (const mode of ["--write", "--read"]) {
      const next = spawnSync(require("electron"), [__filename, mode, dir], {
        encoding: "utf8",
        timeout: 30000,
        windowsHide: true,
      });
      assert.equal(
        next.status,
        0,
        String(next.error || next.stderr || next.stdout),
      );
    }
    console.log(
      "PASS: real Windows safeStorage/DPAPI encryption, recovery after Electron exits and a new process starts, and saved-session deletion",
    );
  } finally {
    syncFs.rmSync(dir, { recursive: true, force: true });
  }
} else {
  const { app, safeStorage } = require("electron"),
    { createSessionStore } = require("../app/psn-session.cjs"),
    dir = process.argv[3];
  app.setPath("userData", dir);
  app.disableHardwareAcceleration();
  app.whenReady().then(async () => {
    try {
      assert(safeStorage.isEncryptionAvailable());
      const store = createSessionStore({ directory: dir, safeStorage });
      if (process.argv[2] === "--write") {
        await store.save({ refreshToken: value });
        const bytes = await fs.readFile(path.join(dir, "psn-session.bin"));
        assert(!bytes.includes(value));
      } else {
        assert.equal((await store.load()).refreshToken, value);
        await store.clear();
        assert.equal(await store.load(), null);
      }
      await store.flush();
      app.quit();
    } catch (e) {
      console.error(e);
      app.exit(1);
    }
  });
}

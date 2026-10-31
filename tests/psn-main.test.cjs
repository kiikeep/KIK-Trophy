"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path"),
  core = require("../app/core.cjs"),
  { progressFixture } = require("./psn-fixtures.cjs"),
  { installPsnHandlers } = require("../app/psn-main.cjs");
(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kik-psn-"));
  try {
    const f = progressFixture(),
      dat = core.parseDat(f.bytes),
      handlers = {},
      r = { bytes: f.bytes, dat, source: "synthetic/TRPTITLE.DAT" },
      catalogs = new Map([
        [dat.npwr + ":" + dat.catalogHash, { ucp: { en: f.catalog } }],
      ]);
    let chosen = dir,
      cancel = false,
      disconnected = false,
      restored = 0,
      closed = false,
      opened = "";
    const fake = {
      restore: async () => {
        restored++;
      },
      shutdown: async () => {
        closed = true;
      },
      state: () => ({ connected: true, profile: {}, titles: [] }),
      connect: async () => fake.state(),
      disconnect: () => {
        disconnected = true;
      },
      download: async () => f.snapshot,
      listTitles: async () => fake.state(),
    };
    const api = installPsnHandlers({
      ipcMain: { handle: (key, fn) => (handlers[key] = fn) },
      win: () => null,
      sender: (e) => {
        assert.equal(e, "trusted", "untrusted sender");
      },
      record: (key) => {
        assert.equal(key, "local");
        return r;
      },
      catalogs,
      fileBytes: (p) => fs.readFile(p),
      shell: { openExternal: async (u) => (opened = u) },
      clientFactory: () => fake,
      dialog: {
        showOpenDialog: async () => ({ canceled: cancel, filePaths: [chosen] }),
        showSaveDialog: async () => ({
          canceled: cancel,
          filePath: path.join(dir, "saved.json"),
        }),
      },
    });
    const call = (key, ...args) => handlers[key]("trusted", ...args);
    assert.throws(() => handlers["psn-state"]("evil"), /untrusted/);
    assert.throws(
      () => call("psn-merge-preview", "local", "missing"),
      /PSN backup/,
    );
    await call("psn-state");
    await call("psn-state");
    assert.equal(restored, 1);
    const snapshot = await call("psn-download", "game");
    assert(snapshot.key);
    const plan = call("psn-merge-preview", "local", snapshot.key);
    assert.equal(plan.added.length, 2);
    assert.equal(
      plan.relativePath,
      "user/home/11223344/trophy2/nobackup/data/NPWR00001_00/TRPTITLE.DAT",
    );
    cancel = true;
    assert.equal(await call("psn-merge-export", "local", snapshot.key), null);
    cancel = false;
    const exported = await call("psn-merge-export", "local", snapshot.key);
    assert.equal(core.parseDat(await fs.readFile(exported.path)).earned, 3);
    assert.deepEqual(r.bytes, f.bytes);
    const report = JSON.parse(await fs.readFile(exported.reportPath));
    assert.equal(report.files[0].trophyRecordsPreserved, false);
    assert.equal(report.files[0].existingLocalTrophyRecordsPreserved, true);
    assert.equal(report.files[0].merge.source, "authenticated-psn-session");
    assert.equal(report.files[0].merge.consoleRestoreVerified, false);
    const saved = await call("psn-save", snapshot.key);
    assert.equal(
      JSON.parse(await fs.readFile(saved)).schema,
      "kik-trophy.psn-backup",
    );
    await assert.rejects(call("psn-save", snapshot.key), /EEXIST/);
    chosen = saved;
    const imported = await call("psn-import");
    assert.equal(
      call("psn-merge-preview", "local", imported.key).source,
      "imported-psn-json",
    );
    await call("psn-open-auth", "token");
    assert.equal(opened, "https://ca.account.sony.com/api/v1/ssocookie");
    await assert.rejects(call("psn-open-auth", "https://evil.com"), /Invalid/);
    await call("psn-disconnect");
    assert(disconnected);
    assert.throws(
      () => call("psn-merge-preview", "local", snapshot.key),
      /PSN backup/,
    );
    await api.close();
    assert(closed);
    console.log(
      "PASS: PSN IPC sender checks, preview, native cancellation, export tree/report, preserved originals, JSON save/import, overwrite refusal, exact Sony links and disconnect cleanup",
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

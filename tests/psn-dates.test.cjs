"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os"),
  core = require("../app/core.cjs"),
  { mergePsnDat, dateTicks } = require("../app/psn-merge.cjs"),
  { progressFixture, repack } = require("./psn-fixtures.cjs"),
  { installPsnHandlers } = require("../app/psn-main.cjs");
(async () => {
  for (const u64 of [false, true]) {
    const f = progressFixture({ count: 65, earned: [1, 32], dlc: true, u64 }),
      s = structuredClone(f.snapshot),
      parsed = core.parseDat(f.bytes),
      d = Buffer.from(parsed.logical),
      state = f.sections[0x800],
      sp = f.sections[0x600].off + 16,
      gp = f.sections[0x700].off + 16;
    for (const t of s.trophies) {
      t.earned = [1, 32].includes(t.id);
      t.earnedDateTime = t.earned
        ? t.id === 1
          ? "2010-01-01T01:02:03.456Z"
          : "2011-02-03T04:05:06Z"
        : null;
    }
    const oldTimes = [1, 32].map((id) => BigInt(parsed.trophies[id].ticks));
    for (const off of [sp + 0x30, sp + 0x60])
      d.writeBigUInt64BE(oldTimes[1], off);
    d.writeBigUInt64BE(oldTimes[0], gp + 0x10);
    d.writeBigUInt64BE(oldTimes[1], gp + 0xc0 + 0x10);
    const source = repack(f.bytes, d),
      original = Buffer.from(source);
    const local = mergePsnDat(source, s, f.catalog, "local");
    assert.deepEqual(local.bytes, source);
    assert.deepEqual(local.merge.conflictsPreserved, [1, 32]);
    assert.equal(local.merge.datesUpdated.length, 0);
    assert.equal(local.merge.datePolicy, "local");
    const psn = mergePsnDat(source, s, f.catalog, "psn");
    assert.equal(psn.after.earned, 2);
    assert.equal(psn.merge.added.length, 0);
    assert.deepEqual(
      psn.merge.datesUpdated.map((t) => t.id),
      [1, 32],
    );
    assert.deepEqual(psn.merge.conflictsPreserved, []);
    assert.deepEqual(source, original);
    const allowed = new Set();
    for (const id of [1, 32]) {
      const p = state.off + id * 96,
        ticks = dateTicks(s.trophies[id].earnedDateTime);
      for (const off of [p + 32, p + 48]) {
        assert.equal(psn.after.logical.readBigUInt64BE(off), ticks);
        for (let i = off; i < off + 8; i++) allowed.add(i);
      }
      assert.equal(
        psn.merge.datesUpdated.find((t) => t.id === id).localDateTime,
        parsed.trophies[id].unlockedAt,
      );
    }
    for (const [off, ticks] of [
      [sp + 0x30, dateTicks(s.trophies[32].earnedDateTime)],
      [sp + 0x60, dateTicks(s.trophies[32].earnedDateTime)],
      [gp + 0x10, dateTicks(s.trophies[1].earnedDateTime)],
      [gp + 0xc0 + 0x10, dateTicks(s.trophies[32].earnedDateTime)],
    ]) {
      assert.equal(psn.after.logical.readBigUInt64BE(off), ticks);
      for (let i = off; i < off + 8; i++) allowed.add(i);
    }
    for (let i = 0; i < d.length; i++)
      if (!allowed.has(i))
        assert.equal(psn.after.logical[i], d[i], "Changed non-date byte " + i);
    assert.deepEqual(
      mergePsnDat(psn.bytes, s, f.catalog, "psn").bytes,
      psn.bytes,
    );
    assert.deepEqual(psn.bytes.subarray(0, 64), source.subarray(0, 64));
    const partial = structuredClone(s);
    partial.trophies[32].earned = false;
    partial.trophies[32].earnedDateTime = null;
    const p = mergePsnDat(source, partial, f.catalog, "psn");
    assert.deepEqual(p.merge.localOnly, [32]);
    assert.equal(p.after.trophies[32].ticks, parsed.trophies[32].ticks);
    assert.equal(p.after.logical.readBigUInt64BE(sp + 0x30), oldTimes[1]);
    const later = structuredClone(s);
    later.trophies[1].earnedDateTime = "2030-01-02T03:04:05Z";
    assert.equal(
      mergePsnDat(
        source,
        later,
        f.catalog,
        "psn",
      ).after.logical.readBigUInt64BE(sp + 0x30),
      dateTicks(later.trophies[1].earnedDateTime),
    );
    const added = structuredClone(s);
    added.trophies[2].earned = true;
    added.trophies[2].earnedDateTime = "2025-03-04T05:06:07Z";
    const withNew = mergePsnDat(source, added, f.catalog, "psn");
    assert.equal(withNew.merge.added.length, 1);
    assert.equal(
      withNew.after.trophies[2].ticks,
      dateTicks(added.trophies[2].earnedDateTime).toString(),
    );
    assert.equal(
      withNew.after.logical.readBigUInt64BE(sp + 0x60),
      dateTicks(added.trophies[2].earnedDateTime),
    );
    assert.throws(
      () => mergePsnDat(source, s, f.catalog, "latest"),
      /date policy/,
    );
    assert.throws(() => mergePsnDat(source, s, f.catalog, null), /date policy/);
  }
  // Real IPC and file export: date-only changes must be exportable and reported accurately.
  const f = progressFixture(),
    base = mergePsnDat(f.bytes, f.snapshot, f.catalog).bytes,
    record = {
      bytes: base,
      dat: core.parseDat(base),
      source: "synthetic/TRPTITLE.DAT",
    },
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "kik-dates-"));
  try {
    const handlers = {},
      api = installPsnHandlers({
        ipcMain: { handle: (k, fn) => (handlers[k] = fn) },
        sender: (e) => assert.equal(e, "trusted"),
        win: () => null,
        record: () => record,
        catalogs: new Map([
          [
            record.dat.npwr + ":" + record.dat.catalogHash,
            { ucp: { en: f.catalog } },
          ],
        ]),
        fileBytes: () => {},
        shell: {},
        clientFactory: () => ({
          download: async () => f.snapshot,
          disconnect() {},
        }),
        dialog: {
          showOpenDialog: async () => ({ canceled: false, filePaths: [dir] }),
        },
      }),
      call = (k, ...args) => handlers[k]("trusted", ...args),
      snapshot = await call("psn-download", "game");
    assert.equal(
      call("psn-merge-preview", "local", snapshot.key, "local").datesUpdated
        .length,
      0,
    );
    await assert.rejects(
      call("psn-merge-export", "local", snapshot.key, "local"),
      /No PSN trophies or dates/,
    );
    const preview = call("psn-merge-preview", "local", snapshot.key, "psn");
    assert.equal(preview.added.length, 0);
    assert.equal(preview.datesUpdated.length, 1);
    const output = await call("psn-merge-export", "local", snapshot.key, "psn"),
      exported = core.parseDat(await fs.readFile(output.path));
    assert.equal(exported.earned, record.dat.earned);
    assert.equal(
      exported.trophies[1].ticks,
      dateTicks(f.snapshot.trophies[1].earnedDateTime).toString(),
    );
    const report = JSON.parse(await fs.readFile(output.reportPath));
    assert.equal(report.files[0].merge.datePolicy, "psn");
    assert.equal(report.files[0].existingLocalTrophyRecordsPreserved, false);
    assert.equal(report.files[0].existingLocalUnlocksPreserved, true);
    assert.deepEqual(record.bytes, base);
    await api.close();
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
  console.log(
    "PASS: local/PSN date policies, date-only exports, earlier/later global and DLC-group timestamps, mirrored dates, local-only/new trophies, unchanged non-date fields, source preservation, checksums, idempotence and policy/report validation",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os");
const core = require("../app/core.cjs"),
  batch = require("../app/batch.cjs"),
  { fixtures, NEW_UID, NEW_ACCOUNT } = require("./fixtures.cjs");
(async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "kik-batch-"));
  try {
    const f = fixtures(),
      record = (bytes, i) => ({
        bytes,
        dat: core.parseDat(bytes),
        source: `synthetic/${i}/TRPTITLE.DAT`,
      }),
      records = [record(f.old, 0), record(f.second, 1)],
      current = record(f.current, 2),
      target = { uid: NEW_UID, account: NEW_ACCOUNT },
      originals = records.map((r) => Buffer.from(r.bytes));
    assert.equal(batch.preview(records, target).count, 2);
    assert.throws(() => batch.prepare([], target), /Select/);
    assert.throws(
      () => batch.prepare([...records, current], target),
      /Multiple backups/,
    );
    assert.deepEqual(await fs.readdir(temp), []);
    const bad = Buffer.from(f.old);
    bad[100] ^= 1;
    assert.throws(() => batch.prepare([...records, record(bad, 3)], target));
    const prepared = batch.prepare(records, target),
      result = await batch.exportPrepared(prepared, temp),
      report = JSON.parse(await fs.readFile(result.reportPath));
    assert.equal(report.count, 2);
    for (let i = 0; i < 2; i++) {
      const expected = `user/home/${NEW_UID}/trophy2/nobackup/data/${records[i].dat.npwr}/TRPTITLE.DAT`;
      assert.equal(report.files[i].file, expected);
      assert.equal(report.files[i].consolePath, "/" + expected);
      const b = await fs.readFile(path.join(result.path, expected)),
        d = core.parseDat(b);
      assert.equal(d.uid, NEW_UID);
      assert.equal(d.accountHex, NEW_ACCOUNT);
      assert.equal(d.earned, records[i].dat.earned);
      assert.ok(records[i].bytes.equals(originals[i]));
      assert.ok(b.equals(prepared[i].result.bytes));
    }
    const again = await batch.exportPrepared(prepared, temp);
    assert.notEqual(again.path, result.path);
    const unchanged = batch.prepare([current], target);
    assert.equal(unchanged[0].result.changed, 0);
    await batch.exportPrepared(unchanged, temp);
    // Blank destination UID preserves each source user's identity and therefore separate home branches.
    const separate = batch.prepare([records[0], current], {
      uid: "",
      account: NEW_ACCOUNT,
    });
    assert.notEqual(
      batch.relativePath(separate[0].result.after),
      batch.relativePath(separate[1].result.after),
    );
    await batch.exportPrepared(separate, temp);
    const before = await fs.readdir(temp);
    await assert.rejects(
      () => batch.exportPrepared([prepared[0], prepared[0]], temp),
      /Multiple backups/,
    );
    const broken = {
      ...prepared[1],
      result: {
        ...prepared[1].result,
        bytes: Buffer.from(prepared[1].result.bytes),
      },
    };
    broken.result.bytes[0] ^= 1;
    await assert.rejects(() =>
      batch.exportPrepared([prepared[0], broken], temp),
    );
    assert.deepEqual(await fs.readdir(temp), before);
    console.log(
      "PASS: complete destination trees, rewritten UID, per-user paths, collision rejection, unchanged owners, rollback and preserved sources",
    );
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

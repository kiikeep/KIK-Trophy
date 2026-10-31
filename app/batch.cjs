"use strict";
const fs = require("node:fs/promises"),
  path = require("node:path"),
  core = require("./core.cjs");
function prepare(records, target) {
  if (!Array.isArray(records) || !records.length || records.length > 512)
    throw Error("Select between 1 and 512 backups");
  const items = records.map((r) => {
    try {
      return {
        record: r,
        result: core.rewriteDat(r.bytes, target, { allowUnchanged: true }),
      };
    } catch (e) {
      throw Error(r.dat.npwr + ": " + e.message);
    }
  });
  assertDestinations(items);
  return items;
}
function relativePath(dat) {
  return [
    "user",
    "home",
    dat.uid,
    "trophy2",
    "nobackup",
    "data",
    dat.npwr,
    "TRPTITLE.DAT",
  ].join("/");
}
function assertDestinations(items) {
  const paths = new Set();
  for (const { result: x } of items) {
    const dest = relativePath(x.after);
    if (paths.has(dest))
      throw Error(
        "Multiple backups target the same file. Select one backup per destination user and title.",
      );
    paths.add(dest);
  }
}
function preview(records, target) {
  const items = prepare(records, target);
  return {
    count: items.length,
    changed: items.reduce((n, x) => n + x.result.changed, 0),
    blocks: items.reduce((n, x) => n + x.result.after.blocks, 0),
    items: items.map(({ record: r, result: x }) => ({
      npwr: r.dat.npwr,
      source: r.source,
      relativePath: relativePath(x.after),
      before: { uid: x.before.uid, account: x.before.accountHex },
      after: { uid: x.after.uid, account: x.after.accountHex },
      earned: x.after.earned,
      total: x.after.total,
    })),
  };
}
async function writeVerified(file, bytes) {
  const f = await fs.open(file, "wx");
  try {
    await f.writeFile(bytes);
    await f.sync();
  } finally {
    await f.close();
  }
  const saved = await fs.readFile(file);
  if (!saved.equals(bytes)) throw Error("Export verification failed");
  core.parseDat(saved);
}
async function exportPrepared(items, parent) {
  assertDestinations(items);
  const st = await fs.lstat(parent);
  if (!st.isDirectory()) throw Error("Choose an existing output folder");
  const staging = await fs.mkdtemp(path.join(parent, ".kik-trophy-staging-"));
  const suffix = path.basename(staging).slice(".kik-trophy-staging-".length),
    stamp = new Date().toISOString().replace(/[:.]/g, "-"),
    final = path.join(parent, "KIK-Trophy-Export-" + stamp + "-" + suffix);
  const report = [];
  try {
    for (const { record: r, result: x } of items) {
      const relative = relativePath(x.after),
        dest = path.join(staging, ...relative.split("/"));
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await writeVerified(dest, x.bytes);
      report.push({
        npwr: r.dat.npwr,
        source: r.source,
        file: relative,
        consolePath: "/" + relative,
        originalSha256: r.dat.sha256,
        exportSha256: x.after.sha256,
        oldIdentity: { local: r.dat.uid, accountHex: r.dat.accountHex },
        newIdentity: {
          local: x.after.uid,
          accountHex: x.after.accountHex,
          accountBase64: x.after.accountBase64,
        },
        changedBytes: x.changed,
        verifiedBlocks: x.after.blocks,
        earned: x.after.earned,
        total: x.after.total,
        trophyRecordsPreserved: !x.merge,
        ...(x.merge
          ? { merge: x.merge, existingLocalTrophyRecordsPreserved: true }
          : {}),
      });
    }
    await fs.writeFile(
      path.join(staging, "batch.kik-report.json"),
      JSON.stringify(
        {
          app: "KIK Trophy Desktop",
          version: "1.2",
          exportedAt: new Date().toISOString(),
          count: items.length,
          files: report,
        },
        null,
        2,
      ),
      { flag: "wx" },
    );
    // Never replace a previous batch, even if a generated name collides.
    try {
      await fs.lstat(final);
      throw Error("Output folder already exists");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    await fs.rename(staging, final);
    return {
      path: final,
      count: items.length,
      reportPath: path.join(final, "batch.kik-report.json"),
    };
  } catch (e) {
    await fs.rm(staging, { recursive: true, force: true });
    throw e;
  }
}
module.exports = { prepare, preview, exportPrepared, relativePath };

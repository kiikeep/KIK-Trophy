"use strict";
const core = require("./core.cjs");
const EPOCH = 62135596800000000n;
function check(ok, message) {
  if (!ok) throw Error(message);
}
function version(s) {
  check(
    typeof s === "string" && /^\d{1,4}(?:\.\d{1,4}){0,3}$/.test(s),
    "Missing or unsupported trophy-set version",
  );
  const parts = s.split(".").map(Number);
  while (parts.length > 1 && parts.at(-1) === 0) parts.pop();
  return parts.join(".");
}
function dateTicks(s) {
  check(
    typeof s === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(s),
    "An earned PSN trophy has no valid UTC timestamp",
  );
  const ms = Date.parse(s);
  check(
    Number.isSafeInteger(ms) &&
      ms >= Date.UTC(2006, 0, 1) &&
      new Date(ms).toISOString().replace(".000Z", "Z") ===
        new Date(s).toISOString().replace(".000Z", "Z"),
    "Invalid trophy timestamp",
  );
  check(
    new Date(ms).toISOString().slice(0, 19) === s.slice(0, 19),
    "Invalid calendar date",
  );
  return EPOCH + BigInt(ms) * 1000n;
}
function bitmap(buffer, start, id) {
  return !!(buffer[start + (id >> 3)] & (1 << (id & 7)));
}
function mark(buffer, start, id) {
  buffer[start + (id >> 3)] |= 1 << (id & 7);
}
function accountHex(id) {
  check(
    typeof id === "string" && /^\d{1,20}$/.test(id),
    "Invalid PSN Account ID",
  );
  const n = BigInt(id);
  check(n > 0n && n <= 0xffffffffffffffffn, "Invalid PSN Account ID");
  return n.toString(16).padStart(16, "0");
}
function mergePsnDat(bytes, snapshot, catalog, datePolicy = "local") {
  check(["local", "psn"].includes(datePolicy), "Invalid merge date policy");
  const before = core.parseDat(bytes),
    d = Buffer.from(before.logical);
  check(
    snapshot?.schema === "kik-trophy.psn-backup" && snapshot.version === 1,
    "Unsupported PSN backup",
  );
  check(
    snapshot.title?.npServiceName === "trophy2" &&
      snapshot.title?.platform === "PS5",
    "DAT merging supports PS5 trophy sets only",
  );
  check(
    snapshot.title.npCommunicationId === before.npwr,
    "The PSN trophy set does not match the selected DAT",
  );
  check(
    accountHex(snapshot.account?.accountId) === before.accountHex,
    "The PSN Account ID and DAT owner differ. Use Change owner first or select the correct DAT",
  );
  check(
    catalog &&
      catalog.npwr === before.npwr &&
      catalog.hash === before.catalogHash,
    "Add the matching TROPHY.UCP before merging",
  );
  check(
    version(catalog.version) === version(snapshot.title.trophySetVersion),
    "The PSN and local catalogs have different versions",
  );
  check(
    Array.isArray(snapshot.trophies) &&
      snapshot.trophies.length === before.total &&
      catalog.trophies.size === before.total,
    "The PSN and local catalogs have different trophy counts",
  );
  const sections = new Map(before.sections.map((s) => [s.type, s]));
  check(sections.size === 9, "Duplicate DAT sections are unsupported");
  const ranges = before.sections
    .map((s) => [s.off, s.off + s.count * (s.size + 16)])
    .sort((a, b) => a[0] - b[0]);
  check(
    ranges.every((v, i) => v[0] >= 0x150 && (!i || v[0] >= ranges[i - 1][1])),
    "Overlapping DAT sections are unsupported",
  );
  const defs = sections.get(0x500),
    state = sections.get(0x800),
    summary = sections.get(0x600),
    groups = sections.get(0x700),
    groupDefs = sections.get(0x400);
  check(
    defs?.size === 0xc0 &&
      defs.count === before.total &&
      state?.size === 0x50 &&
      summary?.size === 0x1f0 &&
      summary.count === 1 &&
      groups?.size === 0xb0 &&
      groupDefs?.size === 0x90 &&
      groups.count === groupDefs.count,
    "Unsupported DAT progress layout",
  );
  const sp = summary.off + 16,
    groupMap = new Map();
  for (let i = 0; i < groups.count; i++) {
    const p = groups.off + i * 0xc0 + 16,
      dp = groupDefs.off + i * 0xa0 + 16,
      id = d.readUInt32BE(p);
    check(
      d.readUInt32BE(dp) === id && !groupMap.has(id),
      "Invalid DAT trophy groups",
    );
    groupMap.set(id, { p, dp });
  }
  const byId = new Map(),
    added = [],
    conflicts = [],
    datesUpdated = [],
    dateGroups = new Set(),
    localOnly = [],
    allowed = new Set(),
    groupLast = new Map();
  const gradeMap = { P: 1, G: 2, S: 3, B: 4 };
  for (const t of snapshot.trophies) {
    check(
      t &&
        Number.isInteger(t.id) &&
        t.id >= 0 &&
        t.id < before.total &&
        !byId.has(t.id) &&
        typeof t.earned === "boolean",
      "Invalid or duplicate PSN trophy ID",
    );
    check(["P", "G", "S", "B"].includes(t.grade), "Invalid PSN trophy grade");
    if (t.earned) dateTicks(t.earnedDateTime);
    byId.set(t.id, t);
  }
  let last = 0n;
  for (const old of before.trophies) {
    const t = byId.get(old.id),
      meta = catalog.trophies.get(old.id),
      p = state.off + old.id * 96,
      dp = defs.off + old.id * 208;
    check(
      t &&
        meta &&
        t.grade === meta.grade &&
        d.readUInt32BE(dp + 16) === old.id &&
        d.readUInt32BE(dp + 20) === gradeMap[meta.grade],
      "Trophy IDs or grades do not match the local definition",
    );
    const group = Number(meta.group || "0000"),
      g = groupMap.get(group);
    check(
      Number.isInteger(group) && g && bitmap(d, g.dp + 0x10, old.id),
      "Trophy group membership does not match the local definition",
    );
    check(
      bitmap(d, sp + 0x70, old.id) === old.earned &&
        bitmap(d, g.p + 0x30, old.id) === old.earned,
      "The local DAT has inconsistent earned-trophy bitmaps",
    );
    if (old.earned) {
      let ticks = BigInt(old.ticks);
      if (!t.earned) localOnly.push(old.id);
      else if (ticks !== dateTicks(t.earnedDateTime)) {
        if (datePolicy === "local") conflicts.push(old.id);
        else {
          ticks = dateTicks(t.earnedDateTime);
          for (const off of [p + 32, p + 48]) {
            d.writeBigUInt64BE(ticks, off);
            for (let i = off; i < off + 8; i++) allowed.add(i);
          }
          dateGroups.add(group);
          datesUpdated.push({
            id: old.id,
            name: meta.name,
            localDateTime: old.unlockedAt,
            psnDateTime: t.earnedDateTime,
            group,
          });
        }
      }
      if (ticks > last) last = ticks;
      if (ticks > (groupLast.get(group) || 0n)) groupLast.set(group, ticks);
      continue;
    }
    if (!t.earned) continue;
    check((old.flags & ~0x10) === 0, "Unsupported locked-trophy flags");
    const ticks = dateTicks(t.earnedDateTime),
      isPlatinum = meta.grade === "P";
    if (!isPlatinum) {
      check(
        meta.unlockComparator === "ge",
        "Unsupported local trophy unlock condition",
      );
      const kind = d[dp + 64],
        size = d.readUInt32BE(dp + 68);
      check(
        (kind === 0x75 && size === 4) || (kind === 0x55 && size === 8),
        "Unsupported trophy progress value type",
      );
      check(
        d.subarray(dp + 65, dp + 68).every((x) => x === 0),
        "Unsupported trophy value encoding",
      );
      d.copy(d, p + 64, dp + 64, dp + 80);
      for (let i = p + 64; i < p + 80; i++) allowed.add(i);
    }
    d.writeUInt32BE(old.flags | (isPlatinum ? 1 : 0x11), p + 20);
    allowed.add(p + 23);
    if (!isPlatinum) {
      d.writeUInt32BE(d.readUInt32BE(p + 24) | 0x2000, p + 24);
      for (let i = p + 24; i < p + 28; i++) allowed.add(i);
    }
    d.writeBigUInt64BE(ticks, p + 32);
    d.writeBigUInt64BE(ticks, p + 48);
    for (const offset of [32, 48])
      for (let i = p + offset; i < p + offset + 8; i++) allowed.add(i);
    for (const start of [sp + 0x70, sp + 0x170, g.p + 0x30]) {
      mark(d, start, old.id);
      allowed.add(start + (old.id >> 3));
    }
    if (ticks > last) last = ticks;
    if (ticks > (groupLast.get(group) || 0n)) groupLast.set(group, ticks);
    added.push({
      id: old.id,
      name: meta.name,
      earnedDateTime: t.earnedDateTime,
      group,
    });
  }
  // A PSN-earned platinum is only accepted if every dependency in the local definition is now earned.
  for (const t of added.filter(
    (t) => catalog.trophies.get(t.id).grade === "P",
  )) {
    const dp = defs.off + t.id * 208;
    let n = 0;
    for (let i = 0; i < 1024; i++)
      if (bitmap(d, dp + 80, i)) {
        check(
          i < before.total && d.readUInt32BE(state.off + i * 96 + 20) & 1,
          "The platinum depends on trophies absent from this merge",
        );
        n++;
      }
    check(n > 0, "The platinum dependency map is missing");
  }
  if (added.length || datesUpdated.length) {
    for (const off of [sp + 0x30, sp + 0x60]) {
      const existing = d.readBigUInt64BE(off);
      if ((datesUpdated.length && last !== existing) || last > existing) {
        d.writeBigUInt64BE(last, off);
        for (let i = off; i < off + 8; i++) allowed.add(i);
      }
    }
    for (const [id, ticks] of groupLast) {
      const off = groupMap.get(id).p + 0x10;
      if (
        (dateGroups.has(id) && ticks !== d.readBigUInt64BE(off)) ||
        ticks > d.readBigUInt64BE(off)
      ) {
        d.writeBigUInt64BE(ticks, off);
        for (let i = off; i < off + 8; i++) allowed.add(i);
      }
    }
  }
  for (let i = 0; i < d.length; i++)
    check(
      d[i] === before.logical[i] || allowed.has(i),
      "Unexpected change outside the allowed progress fields",
    );
  const out = Buffer.from(bytes);
  let changedBlocks = 0;
  for (let i = 0; i < before.blocks; i++) {
    const b = d.subarray(i * 1024, (i + 1) * 1024),
      p = 64 + i * 1056;
    if (!b.equals(before.logical.subarray(i * 1024, (i + 1) * 1024))) {
      b.copy(out, p);
      core.sha(b).copy(out, p + 1024);
      changedBlocks++;
    }
  }
  const after = core.parseDat(out);
  check(
    after.uid === before.uid &&
      after.accountHex === before.accountHex &&
      after.npwr === before.npwr &&
      after.catalogHash === before.catalogHash &&
      after.total === before.total,
    "The DAT identity or catalog changed unexpectedly",
  );
  for (const old of before.trophies) {
    const now = after.trophies[old.id];
    if (old.earned) {
      const replacement = datesUpdated.find((t) => t.id === old.id);
      check(
        now.earned &&
          now.ticks ===
            (replacement
              ? dateTicks(replacement.psnDateTime).toString()
              : old.ticks) &&
          now.flags === old.flags,
        "An existing local trophy changed unexpectedly",
      );
      const p = state.off + old.id * 96;
      for (let off = 0; off < 96; off++)
        if (
          !replacement ||
          !((off >= 32 && off < 40) || (off >= 48 && off < 56))
        )
          check(
            d[p + off] === before.logical[p + off],
            "A local trophy changed outside its timestamps",
          );
    }
    check(!old.earned || now.earned, "A local trophy was removed");
  }
  let changed = 0;
  for (let i = 0; i < out.length; i++) if (bytes[i] !== out[i]) changed++;
  return {
    bytes: out,
    before,
    after,
    changed,
    merge: {
      experimental: true,
      consoleRestoreVerified: false,
      psnAccountId: snapshot.account.accountId,
      snapshotDownloadedAt: snapshot.downloadedAt,
      added,
      keptLocal: before.earned - datesUpdated.length,
      datePolicy,
      datesUpdated,
      localOnly,
      conflictsPreserved: conflicts,
      changedBlocks,
      policy:
        datePolicy === "local"
          ? "union-preserve-local-timestamps"
          : "union-prefer-psn-timestamps",
    },
  };
}
module.exports = { mergePsnDat, dateTicks, accountHex, version };

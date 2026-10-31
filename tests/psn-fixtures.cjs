"use strict";
const core = require("../app/core.cjs"),
  { makeDat, makeUcp, OLD_ACCOUNT } = require("./fixtures.cjs");
const { dateTicks } = require("../app/psn-merge.cjs");
function repack(bytes, d) {
  const out = Buffer.from(bytes);
  for (let i = 0; i < d.length / 1024; i++) {
    d.copy(out, 64 + i * 1056, i * 1024, (i + 1) * 1024);
    core
      .sha(d.subarray(i * 1024, (i + 1) * 1024))
      .copy(out, 64 + i * 1056 + 1024);
  }
  return out;
}
function progressFixture({
  count = 4,
  earned = [1],
  u64 = false,
  dlc = false,
} = {}) {
  const ucp = makeUcp("NPWR00001_00", count),
    catalog = core.parseUcp(ucp, "en"),
    bytes = makeDat(catalog.npwr, ucp, {
      count,
      earned,
      groupCount: dlc ? 2 : 1,
    }),
    parsed = core.parseDat(bytes),
    d = parsed.logical,
    s = Object.fromEntries(parsed.sections.map((s) => [s.type, s]));
  if (dlc) {
    d.writeUInt32BE(1, s[0x400].off + 0xa0 + 16);
    d.writeUInt32BE(1, s[0x700].off + 0xc0 + 16);
  }
  for (let i = 0; i < count; i++) {
    const group = dlc && i >= Math.floor(count / 2) ? 1 : 0;
    catalog.trophies.get(i).group = String(group).padStart(4, "0");
    const dp = s[0x500].off + i * 208,
      p = s[0x800].off + i * 96,
      grade = catalog.trophies.get(i).grade;
    d.writeUInt32BE({ P: 1, G: 2, S: 3, B: 4 }[grade], dp + 20);
    catalog.trophies.get(i).unlockComparator = "ge";
    if (i) {
      d[dp + 64] = u64 ? 0x55 : 0x75;
      d.writeUInt32BE(u64 ? 8 : 4, dp + 68);
      if (u64) d.writeBigUInt64BE(5000000000n + BigInt(i), dp + 72);
      else d.writeUInt32BE(50 + i, dp + 72);
    } else {
      for (let j = 1; j < count; j++) d[dp + 80 + (j >> 3)] |= 1 << (j & 7);
    }
    d[s[0x400].off + group * 0xa0 + 16 + 0x10 + (i >> 3)] |= 1 << (i & 7);
    if (earned.includes(i)) {
      d.copy(d, p + 64, dp + 64, dp + 80);
      d.writeUInt32BE(0x2000, p + 24);
      d.copy(d, p + 48, p + 32, p + 40);
      for (const start of [
        s[0x600].off + 16 + 0x70,
        s[0x600].off + 16 + 0x170,
        s[0x700].off + group * 0xc0 + 16 + 0x30,
      ])
        d[start + (i >> 3)] |= 1 << (i & 7);
    }
  }
  const snapshot = {
    schema: "kik-trophy.psn-backup",
    version: 1,
    downloadedAt: "2026-10-30T00:00:00Z",
    account: {
      accountId: BigInt("0x" + OLD_ACCOUNT).toString(),
      onlineId: "synthetic",
    },
    title: {
      npCommunicationId: catalog.npwr,
      npServiceName: "trophy2",
      platform: "PS5",
      name: "Synthetic",
      trophySetVersion: "1.00",
    },
    trophies: Array.from(catalog.trophies.values(), (t, id) => ({
      id,
      grade: t.grade,
      name: t.name,
      earned: id !== 0,
      earnedDateTime: id ? "2025-01-02T03:04:05.123Z" : null,
    })),
  };
  return { bytes: repack(bytes, d), catalog, snapshot, ucp, sections: s };
}
module.exports = { progressFixture, repack, dateTicks };

"use strict";
const { accountHex, dateTicks, version } = require("./psn-merge.cjs");
const grades = { platinum: "P", gold: "G", silver: "S", bronze: "B" };
function check(ok, message = "Invalid PSN backup") {
  if (!ok) throw Error(message);
}
function text(x, max = 4000) {
  return typeof x === "string" ? x.slice(0, max) : "";
}
function validateSnapshot(input) {
  check(
    input && input.schema === "kik-trophy.psn-backup" && input.version === 1,
  );
  const accountId = input.account?.accountId;
  accountHex(accountId);
  const title = input.title;
  check(title && /^NPWR\d{5}_\d{2}$/.test(title.npCommunicationId));
  check(
    ["trophy", "trophy2"].includes(title.npServiceName) &&
      typeof title.platform === "string",
  );
  version(title.trophySetVersion);
  check(
    Array.isArray(input.trophies) &&
      input.trophies.length > 0 &&
      input.trophies.length <= 1024,
  );
  const ids = new Set(),
    trophies = input.trophies
      .map((t) => {
        check(
          t &&
            Number.isInteger(t.id) &&
            t.id >= 0 &&
            t.id < 1024 &&
            !ids.has(t.id) &&
            typeof t.earned === "boolean" &&
            ["P", "G", "S", "B"].includes(t.grade),
        );
        ids.add(t.id);
        if (t.earned) dateTicks(t.earnedDateTime);
        return {
          id: t.id,
          grade: t.grade,
          earned: t.earned,
          earnedDateTime: t.earned ? t.earnedDateTime : null,
          name: text(t.name, 1000),
          description: text(t.description),
          hidden: t.hidden === true,
        };
      })
      .sort((a, b) => a.id - b.id);
  check(typeof input.downloadedAt === "string");
  dateTicks(input.downloadedAt);
  return {
    schema: "kik-trophy.psn-backup",
    version: 1,
    downloadedAt: new Date(input.downloadedAt).toISOString(),
    account: {
      accountId,
      accountHex: accountHex(accountId),
      onlineId: text(input.account.onlineId, 64),
    },
    title: {
      npCommunicationId: title.npCommunicationId,
      name: text(title.name, 1000),
      platform: text(title.platform, 64),
      npServiceName: title.npServiceName,
      trophySetVersion: title.trophySetVersion,
    },
    trophies,
  };
}
function fromResponses(
  account,
  title,
  metadata,
  earnings,
  downloadedAt = new Date().toISOString(),
) {
  check(
    metadata.trophySetVersion &&
      version(metadata.trophySetVersion) === version(earnings.trophySetVersion),
    "PSN trophy-set versions changed during download",
  );
  check(
    metadata.trophies.length === earnings.trophies.length,
    "PSN returned an incomplete trophy list",
  );
  const earned = new Map();
  for (const t of earnings.trophies) {
    check(!earned.has(t.trophyId), "PSN returned duplicate trophy IDs");
    earned.set(t.trophyId, t);
  }
  return validateSnapshot({
    schema: "kik-trophy.psn-backup",
    version: 1,
    downloadedAt,
    account,
    title: {
      npCommunicationId: title.npCommunicationId,
      name: title.name,
      platform: title.platform,
      npServiceName: title.npServiceName,
      trophySetVersion: metadata.trophySetVersion,
    },
    trophies: metadata.trophies.map((t) => {
      const e = earned.get(t.trophyId);
      check(
        e && e.trophyType === t.trophyType,
        "PSN trophy IDs or grades changed during download",
      );
      return {
        id: t.trophyId,
        name: t.trophyName,
        description: t.trophyDetail,
        grade: grades[t.trophyType],
        hidden: t.trophyHidden,
        earned: e.earned,
        earnedDateTime: e.earnedDateTime,
      };
    }),
  });
}
module.exports = { validateSnapshot, fromResponses };

"use strict";
const assert = require("node:assert/strict"),
  core = require("../app/core.cjs"),
  { mergePsnDat, dateTicks } = require("../app/psn-merge.cjs"),
  { validateSnapshot } = require("../app/psn-backup.cjs"),
  { createPsnClient } = require("../app/psn-client.cjs"),
  { psnFetch, withPsnHttp } = require("../app/psn-http.cjs"),
  { progressFixture, repack } = require("./psn-fixtures.cjs");
(async () => {
  for (const u64 of [false, true]) {
    const f = progressFixture({ count: 65, earned: [1, 32], u64, dlc: true }),
      source = Buffer.from(f.bytes),
      before = core.parseDat(source),
      r = mergePsnDat(source, f.snapshot, f.catalog),
      after = r.after,
      ss = f.sections;
    assert.equal(after.earned, 64);
    assert.equal(r.merge.added.length, 62);
    assert.deepEqual(r.merge.conflictsPreserved, [1, 32]);
    assert.equal(r.merge.experimental, false);
    assert.equal(r.merge.consoleRestoreTested, true);
    assert.equal(r.merge.consoleRestoreVerified, false);
    assert.deepEqual(source, f.bytes);
    assert.equal(after.accountHex, before.accountHex);
    assert.deepEqual(r.bytes.subarray(0, 64), source.subarray(0, 64));
    const newly = 2,
      p = ss[0x800].off + newly * 96,
      dp = ss[0x500].off + newly * 208;
    assert.equal(
      after.logical.readBigUInt64BE(p + 32),
      dateTicks(f.snapshot.trophies[2].earnedDateTime),
    );
    assert.equal(
      after.logical.readBigUInt64BE(p + 48),
      after.logical.readBigUInt64BE(p + 32),
    );
    assert.deepEqual(
      after.logical.subarray(p + 64, p + 80),
      before.logical.subarray(dp + 64, dp + 80),
    );
    for (const id of [1, 32]) {
      const p = ss[0x800].off + id * 96;
      assert.deepEqual(
        after.logical.subarray(p, p + 96),
        before.logical.subarray(p, p + 96),
      );
    }
    assert.equal(after.logical[ss[0x600].off + 16 + 0x70 + 8] & 1, 1);
    assert.equal(after.logical[ss[0x700].off + 0xc0 + 16 + 0x30 + 8] & 1, 1);
    assert.deepEqual(
      mergePsnDat(r.bytes, f.snapshot, f.catalog).bytes,
      r.bytes,
    );
    const localOnly = structuredClone(f.snapshot);
    localOnly.trophies[1].earned = false;
    localOnly.trophies[1].earnedDateTime = null;
    assert.deepEqual(
      mergePsnDat(source, localOnly, f.catalog).merge.localOnly,
      [1],
    );
  }
  const f = progressFixture();
  const reject = (modify, pattern) => {
    const s = structuredClone(f.snapshot);
    modify(s);
    assert.throws(() => mergePsnDat(f.bytes, s, f.catalog), pattern);
  };
  reject((s) => (s.account.accountId = "123"), /owner differ/);
  reject((s) => (s.title.npCommunicationId = "NPWR99999_00"), /does not match/);
  reject((s) => (s.title.platform = "PS4"), /PS5/);
  for (const remoteVersion of ["01.40", "2.0"]) {
    const snapshot = structuredClone(f.snapshot);
    snapshot.title.trophySetVersion = remoteVersion;
    const localCatalog = { ...f.catalog, version: "1.4" };
    const result = mergePsnDat(f.bytes, snapshot, localCatalog);
    assert.equal(result.after.earned, 3);
    assert.deepEqual(result.merge.catalogVersions, {
      local: "1.4",
      psn: remoteVersion,
    });
    const wrongCount = structuredClone(snapshot);
    wrongCount.trophies.pop();
    assert.throws(
      () => mergePsnDat(f.bytes, wrongCount, localCatalog),
      /counts/,
    );
    const wrongGrade = structuredClone(snapshot);
    wrongGrade.trophies[2].grade = "G";
    assert.throws(
      () => mergePsnDat(f.bytes, wrongGrade, localCatalog),
      /grades/,
    );
    const wrongId = structuredClone(snapshot);
    wrongId.trophies[2].id = 1;
    assert.throws(
      () => mergePsnDat(f.bytes, wrongId, localCatalog),
      /duplicate/,
    );
  }
  reject((s) => s.trophies.pop(), /counts/);
  reject((s) => (s.trophies[2].id = 1), /duplicate/);
  reject((s) => (s.trophies[2].grade = "G"), /grades/);
  reject((s) => (s.trophies[2].earnedDateTime = null), /timestamp/);
  reject(
    (s) => (s.trophies[2].earnedDateTime = "2025-02-30T00:00:00Z"),
    /calendar/,
  );
  assert.throws(() => mergePsnDat(f.bytes, f.snapshot, null), /TROPHY.UCP/);
  const invalidCat = {
    ...f.catalog,
    trophies: new Map(
      [...f.catalog.trophies].map(([id, t]) => [
        id,
        { ...t, unlockComparator: "eq" },
      ]),
    ),
  };
  assert.throws(
    () => mergePsnDat(f.bytes, f.snapshot, invalidCat),
    /unlock condition/,
  );
  const bad = core.parseDat(f.bytes).logical;
  bad[f.sections[0x600].off + 16 + 0x70] = 0;
  assert.throws(
    () => mergePsnDat(repack(f.bytes, bad), f.snapshot, f.catalog),
    /bitmaps/,
  );
  const platinum = structuredClone(f.snapshot);
  platinum.trophies[0].earned = true;
  platinum.trophies[0].earnedDateTime = "2025-01-03T00:00:00Z";
  assert.equal(mergePsnDat(f.bytes, platinum, f.catalog).after.earned, 4);
  platinum.trophies[3].earned = false;
  assert.throws(
    () => mergePsnDat(f.bytes, platinum, f.catalog),
    /platinum depends/,
  );
  const dirty = core.parseDat(f.bytes).logical;
  dirty[f.sections[0x600].off + 16 + 0x170] |= 1;
  const dr = mergePsnDat(repack(f.bytes, dirty), f.snapshot, f.catalog);
  assert.equal(dr.after.logical[f.sections[0x600].off + 16 + 0x170] & 1, 1);
  const clean = validateSnapshot({
    ...f.snapshot,
    npsso: "SECRET",
    accessToken: "SECRET",
    account: { ...f.snapshot.account, refreshToken: "SECRET" },
  });
  assert(!JSON.stringify(clean).includes("SECRET"));
  assert.throws(
    () => validateSnapshot({ ...f.snapshot, downloadedAt: 123 }),
    /Invalid/,
  );
  // Exercise the real bundled psn-api against HTTP fixtures, including authentication and pagination.
  let clock = Date.parse("2026-10-30T01:00:00Z"),
    refreshes = 0;
  const requests = [];
  const fetchImpl = async (input, init) => {
    const u = new URL(input);
    requests.push({ url: u.href, method: init.method, headers: init.headers });
    assert.equal(init.redirect, "manual");
    if (u.pathname.endsWith("/authorize")) {
      assert.match(init.headers.Cookie, /npsso=/);
      return new Response(null, {
        status: 302,
        headers: {
          location:
            "com.scee.psxandroid.scecompcall://redirect/?code=synthetic-code",
        },
      });
    }
    if (u.pathname.endsWith("/token")) {
      const body = new URLSearchParams(init.body);
      if (body.get("grant_type") === "refresh_token") refreshes++;
      return Response.json({
        access_token: "synthetic-access",
        refresh_token: "synthetic-refresh",
        expires_in: 120,
      });
    }
    assert.match(init.headers.Authorization, /Bearer synthetic-access/);
    if (u.pathname.endsWith("/trophySummary"))
      return Response.json({
        accountId: f.snapshot.account.accountId,
        trophyLevel: 123,
        earnedTrophies: { platinum: 1, gold: 2, silver: 3, bronze: 4 },
      });
    if (u.pathname.endsWith("/profiles"))
      return Response.json({ profile: { onlineId: "synthetic" } });
    if (u.pathname.endsWith("/trophyTitles"))
      return Response.json({
        trophyTitles: [
          {
            npCommunicationId: f.catalog.npwr,
            npServiceName: "trophy2",
            trophyTitleName: "Synthetic",
            trophyTitlePlatform: "PS5",
            progress: 25,
          },
        ],
        totalItemCount: 1,
      });
    if (u.pathname.endsWith("/trophies")) {
      assert.equal(u.searchParams.get("npServiceName"), "trophy2");
      const offset = Number(u.searchParams.get("offset") || 0),
        user = u.pathname.includes("/users/"),
        all = f.snapshot.trophies.map((t) => ({
          trophyId: t.id,
          trophyType: { P: "platinum", G: "gold", S: "silver", B: "bronze" }[
            t.grade
          ],
          trophyName: t.name,
          trophyDetail: "Synthetic fixture",
          earned: t.earned,
          earnedDateTime: t.earnedDateTime,
        }));
      return Response.json({
        trophySetVersion: "1.00",
        trophies: all.slice(offset, offset + 2),
        totalItemCount: 4,
        ...(offset === 0 ? { nextOffset: 2 } : {}),
      });
    }
    throw Error("Unexpected HTTP fixture path " + u.pathname);
  };
  const client = createPsnClient({ fetchImpl, now: () => clock });
  await client.connect("a".repeat(64));
  assert.equal(client.state().profile.level, 123);
  assert.equal(client.state().profile.onlineId, "synthetic");
  assert(!JSON.stringify(client.state()).includes("synthetic-access"));
  clock += 90000;
  const titles = await client.listTitles();
  assert.equal(refreshes, 1);
  const download = await client.download(titles.titles[0].key);
  assert.equal(download.trophies.length, 4);
  assert.equal(
    download.trophies[2].earnedDateTime,
    f.snapshot.trophies[2].earnedDateTime,
  );
  assert.equal(requests.filter((r) => r.url.includes("/trophies?")).length, 4);
  client.disconnect();
  assert.equal(client.state().connected, false);
  await assert.rejects(client.connect("bad"), /PSN_INVALID_NPSSO/);
  const fail = createPsnClient({
    fetchImpl: async () => {
      throw Error("sensitive-npsso");
    },
  });
  await assert.rejects(
    fail.connect("a".repeat(64)),
    (e) => e.message === "PSN_REQUEST_FAILED",
  );
  await assert.rejects(psnFetch("https://example.com/"), /PSN_INVALID_HOST/);
  await assert.rejects(
    psnFetch("https://m.np.playstation.com/api/trophy", { method: "POST" }),
    /PSN_INVALID_METHOD/,
  );
  await assert.rejects(
    withPsnHttp(() => psnFetch("https://m.np.playstation.com/api/trophy"), {
      fetchImpl: async () => new Response("private", { status: 429 }),
    }),
    /PSN_RATE_LIMIT/,
  );
  await assert.rejects(
    withPsnHttp(() => psnFetch("https://m.np.playstation.com/api/trophy"), {
      fetchImpl: async () => new Response(Buffer.alloc(4 * 1024 * 1024 + 1)),
    }),
    /PSN_RESPONSE_TOO_LARGE/,
  );
  const deferred = {};
  const api = {
    exchangeNpssoForAccessCode: () =>
      new Promise((r) => (deferred.resolve = r)),
    exchangeAccessCodeForAuthTokens: async () => ({
      accessToken: "test-access",
      refreshToken: "test-refresh",
      expiresIn: 1000,
    }),
    getUserTrophyProfileSummary: async () => ({
      accountId: f.snapshot.account.accountId,
    }),
    getProfileFromAccountId: async () => ({}),
  };
  const abort = createPsnClient({ api });
  const pending = abort.connect("a".repeat(64));
  await assert.rejects(abort.connect("a".repeat(64)), /PSN_BUSY/);
  abort.disconnect();
  deferred.resolve("code");
  await assert.rejects(pending, /PSN_CANCELLED/);
  assert.equal(abort.state().connected, false);
  console.log(
    "PASS: PSN union, preserved rows/dates, u32/u64 values, bitmap boundaries, platinum dependencies, idempotence, mismatch rejection, JSON sanitization, real SDK HTTP auth/pagination/refresh, session cancellation and read-only network guard",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

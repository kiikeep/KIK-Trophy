"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path"),
  crypto = require("node:crypto");
const { createSessionStore } = require("../app/psn-session.cjs"),
  { createPsnClient } = require("../app/psn-client.cjs"),
  { PsnError } = require("../app/psn-http.cjs");
function cipher(key = crypto.randomBytes(32), onEncrypt = () => {}) {
  return {
    isEncryptionAvailable: () => true,
    encryptString(value) {
      onEncrypt();
      const iv = crypto.randomBytes(12),
        c = crypto.createCipheriv("aes-256-gcm", key, iv),
        data = Buffer.concat([c.update(value, "utf8"), c.final()]);
      return Buffer.concat([iv, c.getAuthTag(), data]);
    },
    decryptString(bytes) {
      const d = crypto.createDecipheriv(
        "aes-256-gcm",
        key,
        bytes.subarray(0, 12),
      );
      d.setAuthTag(bytes.subarray(12, 28));
      return Buffer.concat([d.update(bytes.subarray(28)), d.final()]).toString(
        "utf8",
      );
    },
  };
}
function makeApi() {
  let refreshes = 0,
    logins = 0;
  return {
    get refreshes() {
      return refreshes;
    },
    get logins() {
      return logins;
    },
    exchangeNpssoForAccessCode: async () => {
      logins++;
      return "code";
    },
    exchangeAccessCodeForAuthTokens: async () => ({
      accessToken: "access-only-in-memory",
      refreshToken: "original-refresh-secret",
      expiresIn: 120,
    }),
    exchangeRefreshTokenForAuthTokens: async (token) => {
      assert.match(token, /refresh-secret/);
      refreshes++;
      return {
        accessToken: "access-only-in-memory",
        refreshToken: "rotated-refresh-secret-" + refreshes,
        expiresIn: 120,
      };
    },
    getUserTrophyProfileSummary: async () => ({
      accountId: "123456789012345",
      trophyLevel: 12,
      earnedTrophies: { bronze: 3 },
    }),
    getProfileFromAccountId: async () => ({
      profile: { onlineId: "synthetic" },
    }),
    getUserTitles: async () => ({ trophyTitles: [], totalItemCount: 0 }),
  };
}
(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kik-session-"));
  try {
    const file = path.join(dir, "psn-session.bin"),
      safeStorage = cipher(),
      store = createSessionStore({ directory: dir, safeStorage }),
      api = makeApi();
    let clock = Date.now();
    assert.equal(await store.load(), null);
    const client = createPsnClient({
      api,
      sessionStore: store,
      now: () => clock,
    });
    const state = await client.connect("N".repeat(64));
    assert.equal(state.sessionRemembered, true);
    assert.equal(client.state().sessionRemembered, true);
    assert(!JSON.stringify(state).includes("secret"));
    let raw = await fs.readFile(file);
    assert(!raw.includes("refresh-secret"));
    assert(!raw.includes("access-only-in-memory"));
    assert(!raw.includes("N".repeat(64)));
    assert.deepEqual(JSON.parse(safeStorage.decryptString(raw)), {
      version: 1,
      refreshToken: "original-refresh-secret",
    });
    await client.shutdown();
    assert.equal(client.state().connected, false);
    assert(await store.load());
    const storeAfterRestart = createSessionStore({
        directory: dir,
        safeStorage,
      }),
      restored = createPsnClient({
        api,
        sessionStore: storeAfterRestart,
        now: () => clock,
      });
    const recovered = await restored.restore();
    assert.equal(recovered.connected, true);
    assert.equal(recovered.sessionRemembered, true);
    assert.equal(recovered.profile.onlineId, "synthetic");
    assert.equal(api.logins, 1);
    assert.equal(api.refreshes, 1);
    assert.equal((await store.load()).refreshToken, "rotated-refresh-secret-1");
    clock += 90000;
    await restored.listTitles();
    assert.equal(api.refreshes, 2);
    assert.equal((await store.load()).refreshToken, "rotated-refresh-secret-2");
    clock += 90000;
    api.getUserTitles = async () => {
      throw new PsnError("PSN_TIMEOUT");
    };
    await assert.rejects(restored.listTitles(), /PSN_TIMEOUT/);
    assert.equal((await store.load()).refreshToken, "rotated-refresh-secret-3");
    await restored.disconnect();
    assert.equal(await store.load(), null);
    assert.equal(
      (await createPsnClient({ api, sessionStore: store }).restore()).connected,
      false,
    );
    await store.save({ refreshToken: "original-refresh-secret" });
    const expired = makeApi();
    expired.exchangeRefreshTokenForAuthTokens = async () => {
      throw new PsnError("PSN_SESSION_EXPIRED");
    };
    await assert.rejects(
      createPsnClient({ api: expired, sessionStore: store }).restore(),
      /PSN_SESSION_EXPIRED/,
    );
    assert.equal(await store.load(), null);
    await store.save({ refreshToken: "original-refresh-secret" });
    const offline = makeApi();
    offline.exchangeRefreshTokenForAuthTokens = async () => {
      throw new PsnError("PSN_TIMEOUT");
    };
    await assert.rejects(
      createPsnClient({ api: offline, sessionStore: store }).restore(),
      /PSN_TIMEOUT/,
    );
    assert(await store.load());
    const wrongKey = createSessionStore({
      directory: dir,
      safeStorage: cipher(),
    });
    await assert.rejects(
      wrongKey.load(),
      (e) => e.message === "PSN_SESSION_LOAD_FAILED",
    );
    assert.equal(await store.load(), null);
    const unavailable = createSessionStore({
      directory: dir,
      safeStorage: { isEncryptionAvailable: () => false },
    });
    await assert.rejects(
      unavailable.save({ refreshToken: "original-refresh-secret" }),
      /PSN_SESSION_STORAGE_UNAVAILABLE/,
    );
    assert.equal(await store.load(), null);
    const transient = createPsnClient({
      api: makeApi(),
      sessionStore: unavailable,
    });
    assert.equal(
      (await transient.connect("N".repeat(64))).sessionWarning,
      "PSN_SESSION_STORAGE_UNAVAILABLE",
    );
    assert.equal(transient.state().sessionRemembered, false);
    assert.equal(transient.state().connected, true);
    await transient.shutdown();
    const insecure = createSessionStore({
      platform: "linux",
      directory: dir,
      safeStorage: {
        ...safeStorage,
        getSelectedStorageBackend: () => "basic_text",
      },
    });
    await assert.rejects(
      insecure.save({ refreshToken: "original-refresh-secret" }),
      /PSN_SESSION_STORAGE_UNAVAILABLE/,
    );
    await Promise.all([
      store.save({ refreshToken: "refresh-secret-one" }),
      store.save({ refreshToken: "refresh-secret-two" }),
      store.clear(),
    ]);
    assert.equal(await store.load(), null);
    let seen;
    const encrypted = new Promise((r) => (seen = r)),
      raceStore = createSessionStore({
        directory: dir,
        safeStorage: cipher(undefined, () => seen()),
      }),
      race = createPsnClient({ api: makeApi(), sessionStore: raceStore });
    const pending = race.connect("N".repeat(64));
    const cancelled = assert.rejects(pending, /PSN_CANCELLED/);
    await encrypted;
    await race.disconnect();
    await cancelled;
    await raceStore.flush();
    assert.equal(await raceStore.load(), null);
    assert.equal(race.state().connected, false);
    let finish;
    const deferred = makeApi();
    deferred.exchangeRefreshTokenForAuthTokens = () =>
      new Promise((r) => (finish = r));
    await store.save({ refreshToken: "original-refresh-secret" });
    const restoring = createPsnClient({ api: deferred, sessionStore: store });
    const operation = restoring.restore(),
      reject = assert.rejects(operation, /PSN_CANCELLED/);
    while (!finish) await new Promise((r) => setImmediate(r));
    await restoring.disconnect();
    finish({
      accessToken: "access-secret",
      refreshToken: "rotated-refresh-secret",
      expiresIn: 120,
    });
    await reject;
    assert.equal(await store.load(), null);
    await store.save({ refreshToken: "original-refresh-secret" });
    const revoked = createPsnClient({
      sessionStore: store,
      fetchImpl: async () => new Response("invalid_grant", { status: 400 }),
    });
    await assert.rejects(revoked.restore(), /PSN_AUTH_FAILED/);
    assert.equal(await store.load(), null);
    await fs.writeFile(file, Buffer.alloc(17000));
    await assert.rejects(store.load(), /PSN_SESSION_LOAD_FAILED/);
    await store.clear();
    assert.deepEqual(
      (await fs.readdir(dir)).filter((n) => n.startsWith(".kik-psn-")),
      [],
    );
    console.log(
      "PASS: encrypted refresh-only storage, restart recovery, token rotation, close retention, disconnect deletion, expired-session cleanup, offline retry, corrupted/wrong-key files, no plaintext fallback and cancellation/write races",
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

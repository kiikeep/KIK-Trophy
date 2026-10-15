const assert = require("node:assert/strict"),
  core = require("../app/core.cjs"),
  {
    fixtures,
    makeUcp,
    OLD_UID,
    NEW_UID,
    OLD_ACCOUNT,
    NEW_ACCOUNT,
  } = require("./fixtures.cjs");
const f = fixtures(),
  old = core.parseDat(f.old),
  now = core.parseDat(f.current);
assert.equal(old.earned, 2);
assert.equal(old.total, 3);
assert.equal(now.earned, 1);
assert.equal(old.uid, OLD_UID);
assert.equal(old.accountHex, OLD_ACCOUNT);
assert.equal(old.trophies[1].unlockedAt, "2020-01-02T03:04:06.000Z");
assert.equal(core.readZip(f.archive).length, 5);
assert.equal(core.parseUcp(f.ucp, "en").title, "Synthetic Test Game");
assert.equal(core.parseUcp(f.ucp, "es").title, "Juego de prueba");
for (const [lang, title] of [
  ["fr", "Jeu de test"],
  ["ja", "テストゲーム"],
  ["ru", "Тестовая игра"],
  ["it", "Gioco di prova"],
]) {
  assert.equal(core.parseUcp(f.ucp, lang).title, title);
  assert.equal(
    core.parseUcp(makeUcp("NPWR00003_00", 3, false), lang).language,
    "en-US",
  );
}
assert.equal(old.catalogHash, core.parseUcp(f.ucp).hash);
const edited = core.rewriteDat(f.old, {
  uid: NEW_UID,
  account: now.accountBase64,
});
assert.equal(edited.after.uid, NEW_UID);
assert.equal(edited.after.accountHex, NEW_ACCOUNT);
assert.deepEqual(edited.before.trophies, edited.after.trophies);
assert.equal(edited.after.npwr, old.npwr);
assert.ok(f.old.equals(fixtures().old));
const local = core.rewriteDat(f.old, { uid: NEW_UID });
assert.equal(local.after.accountHex, OLD_ACCOUNT);
const account = core.rewriteDat(f.old, { account: NEW_ACCOUNT });
assert.equal(account.after.uid, OLD_UID);
assert.equal(core.parseAccount(now.accountBase64).toString("hex"), NEW_ACCOUNT);
assert.throws(
  () => core.rewriteDat(f.old, { uid: OLD_UID, account: OLD_ACCOUNT }),
  /no hay cambios/,
);
assert.throws(() => core.rewriteDat(f.old, { uid: "xyz" }));
assert.throws(() => core.parseAccount("bad="));
assert.throws(() => core.rewriteDat(f.old, {}));
const bad = Buffer.from(f.old);
bad[300] ^= 1;
assert.throws(() => core.parseDat(bad), /SHA-256/);
assert.throws(() => core.parseDat(f.old.subarray(0, -1)));
const badUcp = Buffer.from(f.ucp);
badUcp[300] ^= 1;
assert.throws(() => core.parseUcp(badUcp), /SHA-1/);
const badZip = Buffer.from(f.archive);
badZip[100] ^= 1;
assert.throws(() => core.readZip(badZip));
assert.equal(
  core.publicDat(old, core.parseUcp(f.ucp)).trophies[1].name,
  "Test trophy 1",
);
console.log(
  "PASS: synthetic DAT/UCP/ZIP, integrity, IDs/Base64, exact timestamps, byte-preserving rewrite, independent ID edits, six-language metadata/fallback and invalid-input rejection",
);

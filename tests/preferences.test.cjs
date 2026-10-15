const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os"),
  { createStore, normalizeIdentity } = require("../app/preferences.cjs"),
  { NEW_UID, NEW_ACCOUNT } = require("./fixtures.cjs");
(async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "kik-prefs-"));
  try {
    const store = createStore(temp),
      target = { uid: NEW_UID, account: NEW_ACCOUNT };
    assert.equal(await store.get(), null);
    assert.equal(await store.save({ uid: "", account: "" }), null);
    assert.deepEqual(await fs.readdir(temp), []);
    assert.deepEqual(await store.save(target), target);
    assert.deepEqual(await createStore(temp).get(), target);
    for (const t of [
      { uid: "123", account: NEW_ACCOUNT },
      { uid: NEW_UID, account: "bad" },
      { uid: "../x", account: "" },
      { uid: 9, account: "" },
      null,
    ])
      assert.equal(await store.save(t), null);
    assert.deepEqual(await store.get(), target);
    const base64 = Buffer.from(NEW_ACCOUNT, "hex").reverse().toString("base64");
    assert.deepEqual(
      normalizeIdentity({ uid: NEW_UID.toUpperCase(), account: base64 }),
      { uid: NEW_UID, account: base64 },
    );
    const writes = [
      { uid: NEW_UID, account: "" },
      { uid: "", account: base64 },
      { uid: "aabbccdd", account: NEW_ACCOUNT },
    ];
    await Promise.all(writes.map((t) => store.save(t)));
    assert.deepEqual(await createStore(temp).get(), writes.at(-1));
    assert.deepEqual(await fs.readdir(temp), ["preferences.json"]);
    await fs.writeFile(path.join(temp, "preferences.json"), "{broken");
    assert.equal(await createStore(temp).get(), null);
    await store.save(target);
    assert.deepEqual(await store.get(), target);
    await fs.writeFile(path.join(temp, "preferences.json"), "x".repeat(4097));
    assert.equal(await store.get(), null);
    const blocked = path.join(temp, "file");
    await fs.writeFile(blocked, "x");
    await assert.rejects(() => createStore(blocked).save(target));
    console.log(
      "PASS: remembered IDs survive restart, preserve Base64/blank semantics, reject incomplete inputs, serialize writes and recover from damaged settings",
    );
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

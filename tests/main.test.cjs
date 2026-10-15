const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path"),
  vm = require("node:vm"),
  url = require("node:url"),
  { createRequire } = require("node:module"),
  { fixtures, NEW_UID, NEW_ACCOUNT } = require("./fixtures.cjs");
(async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "kik-test-"));
  try {
    const f = fixtures(),
      archive = path.join(temp, "fixtures.zip");
    await fs.writeFile(archive, f.archive);
    const mainPath = path.resolve(__dirname, "../app/main.cjs"),
      handlers = new Map(),
      oq = [],
      sq = [],
      appEvents = new Map();
    let quitIdentity = null;
    let win;
    class BrowserWindow {
      constructor() {
        win = this;
        this.webContents = {
          mainFrame: { url: "" },
          setWindowOpenHandler() {},
          on() {},
        };
      }
      loadFile(p) {
        this.webContents.mainFrame.url = url.pathToFileURL(p).href;
      }
    }
    const electron = {
      app: {
        setName() {},
        setAppUserModelId() {},
        whenReady: () => Promise.resolve(),
        on: (name, fn) => appEvents.set(name, fn),
        quit() {
          quitIdentity = JSON.parse(
            require("node:fs").readFileSync(
              path.join(temp, "preferences.json"),
            ),
          ).lastIdentity;
        },
        getPath: () => temp,
      },
      BrowserWindow,
      ipcMain: { handle: (k, v) => handlers.set(k, v) },
      dialog: {
        showOpenDialog: async () => oq.shift(),
        showSaveDialog: async () => sq.shift(),
        showErrorBox() {},
      },
      session: { defaultSession: { setPermissionRequestHandler() {} } },
      shell: {},
    };
    const rq = createRequire(mainPath);
    vm.runInNewContext(await fs.readFile(mainPath, "utf8"), {
      require: (n) => (n === "electron" ? electron : rq(n)),
      __dirname: path.dirname(mainPath),
      Buffer,
      console,
      process: { on() {} },
    });
    await new Promise((r) => setImmediate(r));
    const event = {
        sender: win.webContents,
        senderFrame: win.webContents.mainFrame,
      },
      call = (k, ...args) => handlers.get(k)(event, ...args);
    assert.equal(await call("last-identity"), null);
    assert.equal(
      await call("remember-identity", { uid: "123", account: "" }),
      null,
    );
    oq.push({ canceled: false, filePaths: [archive] });
    const imported = await call("import", "files");
    assert.equal(imported.records.length, 3);
    assert.equal(imported.records[0].title, "Synthetic Test Game");
    const es = await call("language", "es");
    assert.equal(es[0].title, "Juego de prueba");
    for (const [lang, title] of [
      ["fr", "Jeu de test"],
      ["ja", "テストゲーム"],
      ["ru", "Тестовая игра"],
      ["it", "Gioco di prova"],
    ])
      assert.equal((await call("language", lang))[0].title, title);
    await call("language", "en");
    const old = imported.records.find((r) => r.earned === 2),
      target = { uid: NEW_UID, account: NEW_ACCOUNT };
    const expected = rq("./core.cjs").rewriteDat(f.old, target).bytes;
    assert.equal((await call("preview", old.key, target)).after.uid, NEW_UID);
    oq.push({ canceled: false, filePaths: [temp] });
    const result = await call("export", old.key, target);
    assert.ok(
      result.path.endsWith(
        path.join(
          "user",
          "home",
          NEW_UID,
          "trophy2",
          "nobackup",
          "data",
          old.npwr,
          "TRPTITLE.DAT",
        ),
      ),
    );
    assert.deepEqual(await call("last-identity"), target);
    assert.deepEqual(
      await rq("./preferences.cjs").createStore(temp).get(),
      target,
    );
    assert.ok((await fs.readFile(result.path)).equals(expected));
    assert.ok(
      JSON.parse(await fs.readFile(result.reportPath)).files[0]
        .trophyRecordsPreserved,
    );
    oq.push({ canceled: false, filePaths: [temp] });
    const again = await call("export", old.key, target);
    assert.notEqual(again.path, result.path);
    assert.ok((await fs.readFile(result.path)).equals(expected));
    assert.ok((await fs.readFile(archive)).equals(f.archive));
    oq.push({ canceled: true });
    assert.equal(await call("export", old.key, target), null);
    assert.throws(() => handlers.get("clear")({ sender: {} }), /Origen/);
    await assert.rejects(
      () => handlers.get("remember-identity")({ sender: {} }, target),
      /Origen/,
    );
    assert.equal(
      await call("remember-identity", { uid: "123", account: NEW_ACCOUNT }),
      null,
    );
    assert.deepEqual(await call("last-identity"), target);
    const identityFile = path.join(temp, "identity.DAT");
    await fs.writeFile(identityFile, f.current);
    oq.push({ canceled: false, filePaths: [identityFile] });
    const identity = await call("identity");
    assert.equal(identity.uid, NEW_UID);
    assert.deepEqual(await call("last-identity"), target);
    for (const lang of ["zh-CN", "it", "fr", "ja", "ru", "en"])
      assert.equal((await call("language", lang)).length, 3);
    assert.throws(
      () =>
        call(
          "batch-preview",
          imported.records.map((r) => r.key),
          target,
        ),
      /Multiple backups/,
    );
    const keys = imported.records
      .filter((r) => r.key === old.key || r.npwr === "NPWR00002_00")
      .map((r) => r.key);
    assert.equal((await call("batch-preview", keys, target)).count, 2);
    assert.throws(
      () => call("batch-preview", [keys[0], keys[0]], target),
      /Invalid batch/,
    );
    oq.push({ canceled: false, filePaths: [temp] });
    const batchResult = await call("batch-export", keys, target);
    assert.equal(batchResult.count, 2);
    assert.equal(
      JSON.parse(await fs.readFile(batchResult.reportPath)).files.length,
      2,
    );
    oq.push({ canceled: true });
    assert.equal(await call("batch-export", keys, target), null);
    assert.ok((await fs.readFile(archive)).equals(f.archive));
    await call("clear");
    assert.deepEqual(await call("last-identity"), target);
    await assert.rejects(() => call("preview", old.key, target), /Selecciona/);
    const finalIdentity = { uid: "aabbccdd", account: NEW_ACCOUNT };
    const saving = call("remember-identity", finalIdentity);
    await appEvents.get("window-all-closed")();
    await saving;
    assert.deepEqual(quitIdentity, finalIdentity);
    console.log(
      "PASS: import/catalog pairing, language switching, preview, real file export/report, source preservation, overwrite rejection, cancellation and IPC sender validation",
    );
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

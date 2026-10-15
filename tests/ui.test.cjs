const assert = require("node:assert/strict"),
  { chromium } = require(process.env.KIK_PLAYWRIGHT || "playwright"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url"),
  core = require("../app/core.cjs"),
  { fixtures, NEW_UID, NEW_ACCOUNT } = require("./fixtures.cjs");
(async () => {
  const f = fixtures(),
    old = core.parseDat(f.old),
    current = core.parseDat(f.current),
    byLanguage = {};
  for (const lang of ["en", "es", "zh-CN", "it", "fr", "ja", "ru"])
    byLanguage[lang] = [old, current].map((d, i) => ({
      ...core.publicDat(d, core.parseUcp(f.ucp, lang)),
      key: d.sha256,
      source: `C:\\SyntheticBackups\\${i}\\TRPTITLE.DAT`,
    }));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.KIK_CHROME_PATH || undefined,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage({
        viewport: { width: 1460, height: 960 },
        timezoneId: "America/Mexico_City",
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.exposeFunction("testPreview", (key, t) => {
      const r = core.rewriteDat(key === old.sha256 ? f.old : f.current, t);
      return {
        before: { uid: r.before.uid, account: r.before.accountHex },
        after: { uid: r.after.uid, account: r.after.accountHex },
        changed: r.changed,
        blocks: r.after.blocks,
        relativePath: [
          "user",
          "home",
          r.after.uid,
          "trophy2",
          "nobackup",
          "data",
          r.after.npwr,
          "TRPTITLE.DAT",
        ].join("/"),
        earned: r.after.earned,
        total: r.after.total,
      };
    });
    await page.addInitScript(
      ({ data, uid, account }) => {
        let lang = "en",
          loaded = false;
        window.kik = {
          lastIdentity: async () =>
            JSON.parse(localStorage.getItem("test-owner") || "null"),
          rememberIdentity: async (t) => {
            if (
              (!t.uid && !t.account) ||
              (t.uid && !/^[0-9a-fA-F]{8}$/.test(t.uid)) ||
              (t.account && !/^[0-9a-fA-F]{16}$/.test(t.account))
            )
              return null;
            localStorage.setItem("test-owner", JSON.stringify(t));
            return t;
          },
          setLanguage: async (l) => {
            lang = l;
            return loaded ? data[lang] : [];
          },
          importFiles: async (mode) => {
            window.lastImportMode = mode;
            loaded = true;
            return { records: data[lang], errors: [], warnings: [] };
          },
          dropFiles: async () => ({
            records: data[lang],
            errors: [],
            warnings: [],
          }),
          identity: async () => ({ uid, account, npwr: "NPWR00001_00" }),
          preview: (k, t) => window.testPreview(k, t),
          batchPreview: async (keys, t) => ({
            count: keys.length,
            blocks: 6,
            items: keys.map((key) => ({
              npwr: "NPWR00001_00",
              relativePath: [
                "user",
                "home",
                t.uid,
                "trophy2",
                "nobackup",
                "data",
                "NPWR00001_00",
                "TRPTITLE.DAT",
              ].join("/"),
              before: { uid: "11223344" },
              after: { uid: t.uid },
            })),
          }),
          batchExport: async () => ({ path: "C:\\Export\\Batch", count: 2 }),
          export: async () => ({ path: "C:\\Export\\TRPTITLE.DAT" }),
          report: async () => null,
          clear: async () => {
            loaded = false;
            return true;
          },
        };
      },
      { data: byLanguage, uid: NEW_UID, account: NEW_ACCOUNT },
    );
    await page.goto(
      pathToFileURL(path.resolve(__dirname, "../app/index.html")).href,
    );
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await page.locator(".rail").count(), 0);
    assert.equal(await page.locator('[data-lang="hi"]').count(), 0);
    assert.equal(await page.locator('[data-lang="it"]').count(), 1);
    assert.match(
      await page.locator(".backupPaths").innerText(),
      /\/user\/home\//,
    );
    assert.match(
      await page.locator(".backupPaths").innerText(),
      /\/user\/trophy2\//,
    );
    assert.match(
      await page.locator("#welcomeTitle").innerText(),
      /Move your trophy history/,
    );
    for (const lang of ["es", "zh-CN", "it", "fr", "ja", "ru", "en"]) {
      await page.click("#languageToggle");
      await page.click(`[data-lang="${lang}"]`);
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      assert.match(
        await page.locator("#guideLaunch").innerText(),
        lang === "en" ? /at least once/ : /PS5/,
      );
      if (["zh-CN", "ja"].includes(lang))
        await page.evaluate(async (lang) => {
          const font = {
            "zh-CN": "KIK Chinese",
            ja: "KIK Japanese",
          }[lang];
          const loaded = await document.fonts.load(`14px "${font}"`);
          if (!loaded.length) throw Error("Bundled language font did not load");
        }, lang);
      if (process.env.KIK_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(
            process.env.KIK_SCREENSHOT_DIR,
            `welcome-${lang}.png`,
          ),
          fullPage: true,
        });
    }
    await page.click("#welcomeOpen");
    assert.equal(await page.evaluate(() => window.lastImportMode), "folder");
    await page.waitForFunction(
      () => document.querySelectorAll("#trophyRows tr").length === 3,
    );
    assert.equal(
      await page.locator("#gameTitle").innerText(),
      "Synthetic Test Game",
    );
    await page.selectOption("#stateFilter", "earned");
    assert.equal(await page.locator("#trophyRows tr").count(), 2);
    await page.fill("#search", "trophy 1");
    assert.equal(await page.locator("#trophyRows tr").count(), 1);
    await page.fill("#search", "");
    await page.click("#editOwner");
    assert.match(
      await page.locator("#loadIdentity").innerText(),
      /TRPTITLE\.DAT/,
    );
    await page.fill("#targetUid", NEW_UID);
    await page.fill("#targetAccount", NEW_ACCOUNT);
    await page.waitForSelector("#changePreview:not(.hidden)");
    assert.match(
      await page.locator("#changePreview").innerText(),
      /Change verified/,
    );
    assert.match(
      await page.locator("#changePreview").innerText(),
      /user\\home/,
    );
    if (process.env.KIK_SCREENSHOT_DIR)
      await page.screenshot({
        path: path.join(process.env.KIK_SCREENSHOT_DIR, "owner-remembered.png"),
      });
    await page.click("#closeDrawer");
    await page.click("#editOwner");
    assert.equal(await page.inputValue("#targetUid"), NEW_UID);
    assert.equal(await page.inputValue("#targetAccount"), NEW_ACCOUNT);
    await page.click("#closeDrawer");
    // Reload before exporting anything: manually entered valid IDs must already survive.
    await page.reload();
    await page.click("#welcomeOpen");
    await page.waitForSelector("#editOwner");
    await page.click("#editOwner");
    await page.waitForFunction(
      (uid) => document.querySelector("#targetUid").value === uid,
      NEW_UID,
    );
    assert.equal(await page.inputValue("#targetAccount"), NEW_ACCOUNT);
    await page.click("#loadIdentity");
    await page.waitForFunction(
      (uid) => document.querySelector("#targetUid").value === uid,
      NEW_UID,
    );
    await page.click("#closeDrawer");
    await page.click("#languageToggle");
    await page.click('[data-lang="es"]');
    assert.equal(await page.locator("html").getAttribute("lang"), "es");
    assert.equal(
      await page.locator("#gameTitle").innerText(),
      "Juego de prueba",
    );
    assert.match(await page.locator("#openFiles").innerText(), /Añadir/);
    await page.click("#editOwner");
    assert.match(
      await page.locator("#loadIdentity").innerText(),
      /Tomar IDs de otro TRPTITLE\.DAT/,
    );
    await page.click("#closeDrawer");
    await page.click("#languageToggle");
    await page.click('[data-lang="en"]');
    assert.equal(
      await page.locator("#gameTitle").innerText(),
      "Synthetic Test Game",
    );
    await page.click("#selectAll");
    assert.equal(await page.locator("#gameList input:checked").count(), 2);
    await page.click("#batchEdit");
    assert.match(
      await page.locator("#drawerTitle").innerText(),
      /2 backups selected/,
    );
    await page.fill("#targetUid", NEW_UID);
    await page.fill("#targetAccount", NEW_ACCOUNT);
    await page.waitForSelector("#changePreview:not(.hidden)");
    assert.match(
      await page.locator("#changePreview").innerText(),
      /Batch verified/,
    );
    await page.click("#exportDat");
    await page.waitForSelector("#drawer.hidden", { state: "attached" });
    await page.setViewportSize({ width: 1100, height: 760 });
    for (const lang of ["zh-CN", "it", "fr", "ja", "ru", "en"]) {
      await page.click("#languageToggle");
      await page.click(`[data-lang="${lang}"]`);
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        lang + " minimum layout",
      );
      if (lang !== "en")
        assert.notEqual(
          await page.locator("#openFiles").innerText(),
          "Add files",
        );
    }
    await page.reload();
    await page.click("#welcomeOpen");
    await page.waitForSelector("#editOwner");
    await page.click("#editOwner");
    assert.equal(await page.inputValue("#targetUid"), NEW_UID);
    assert.equal(await page.inputValue("#targetAccount"), NEW_ACCOUNT);
    await page.fill("#targetUid", "123");
    await page.click("#closeDrawer");
    await page.click("#editOwner");
    assert.equal(await page.inputValue("#targetUid"), NEW_UID);
    await page.click("#closeDrawer");
    await page.click("#tabFile");
    assert.match(await page.locator("#filePanel").innerText(), /Source file/);
    await page.setViewportSize({ width: 1100, height: 760 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: seven languages, welcome folder action, batch selection/preview/export, single preview, remembered IDs after reload, invalid-input preservation, filters and minimum layout",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

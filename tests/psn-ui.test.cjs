"use strict";
const assert = require("node:assert/strict"),
  { chromium } = require("playwright"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url"),
  core = require("../app/core.cjs"),
  { progressFixture } = require("./psn-fixtures.cjs"),
  { mergePsnDat } = require("../app/psn-merge.cjs");
(async () => {
  const f = progressFixture(),
    d = core.parseDat(f.bytes),
    local = { key: "local", ...core.publicDat(d, f.catalog) },
    snapshot = { key: "snapshot", ...f.snapshot },
    merge = mergePsnDat(f.bytes, f.snapshot, f.catalog),
    preview = {
      before: 1,
      after: 3,
      total: 4,
      relativePath:
        "user/home/11223344/trophy2/nobackup/data/NPWR00001_00/TRPTITLE.DAT",
      ...merge.merge,
    };
  const psnPreview = {
    ...preview,
    ...mergePsnDat(f.bytes, f.snapshot, f.catalog, "psn").merge,
  };
  const datesOnly = {
    ...preview,
    before: 3,
    after: 3,
    ...mergePsnDat(merge.bytes, f.snapshot, f.catalog, "psn").merge,
  };
  const unchanged = {
    ...preview,
    before: 3,
    after: 3,
    ...mergePsnDat(merge.bytes, f.snapshot, f.catalog, "local").merge,
  };
  const browser = await chromium.launch({
    executablePath: process.env.KIK_CHROME_PATH || undefined,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage({
        viewport: { width: 1100, height: 760 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(
      ({ local, snapshot, preview, psnPreview, datesOnly, unchanged }) => {
        let connected = sessionStorage.getItem("test-psn-session") === "yes";
        const title = {
          key: "game",
          name: "Synthetic game",
          npCommunicationId: "NPWR00001_00",
          platform: "PS5",
          progress: 75,
        };
        const state = () => ({
          connected,
          sessionRemembered: connected,
          profile: connected
            ? {
                onlineId: "synthetic",
                accountHex: "1020304050607080",
                level: 12,
                earnedTrophies: { bronze: 3 },
              }
            : null,
          titles: connected ? [title] : [],
        });
        window.kik = {
          lastIdentity: async () => null,
          setLanguage: async () => [local],
          importFiles: async () => ({
            records: [local],
            errors: [],
            warnings: [],
          }),
          psnState: async () => state(),
          psnConnect: async (value) => {
            window.testNpsso = value;
            if (value.length !== 64) throw Error("PSN_INVALID_NPSSO");
            connected = true;
            sessionStorage.setItem("test-psn-session", "yes");
            return state();
          },
          psnDisconnect: async () => {
            connected = false;
            sessionStorage.removeItem("test-psn-session");
            return state();
          },
          psnTitles: async () => state(),
          psnDownload: async () => snapshot,
          psnImport: async () => snapshot,
          psnSave: async () => "/synthetic/NPWR00001_00.psn-backup.json",
          psnMergePreview: async (_key, _snapshot, policy) => {
            window.testPreviewPolicy = policy;
            return window.testDateOnly
              ? policy === "psn"
                ? datesOnly
                : unchanged
              : policy === "psn"
                ? psnPreview
                : preview;
          },
          psnMergeExport: async (_key, _snapshot, policy) => {
            window.testExportPolicy = policy;
            window.testExported = true;
            return { path: "/synthetic/" + preview.relativePath };
          },
          psnOpenAuth: async () => true,
          onPsnProgress: () => {},
        };
      },
      { local, snapshot, preview, psnPreview, datesOnly, unchanged },
    );
    await page.goto(pathToFileURL(path.resolve("app/index.html")).href);
    await page.click("#openFolder");
    await page.click("#openPsn");
    assert(await page.locator("#psnPanel").isVisible());
    assert(await page.locator("#psnExport").isDisabled());
    await page.fill("#psnNpsso", "bad");
    await page.click("#psnConnect");
    await page.waitForSelector("#psnError:not(.hidden)");
    assert.match(await page.locator("#psnError").textContent(), /64-character/);
    assert.equal(await page.locator("#psnNpsso").inputValue(), "");
    await page.fill("#psnNpsso", JSON.stringify({ npsso: "a".repeat(64) }));
    await page.click("#psnConnect");
    await page.waitForSelector("#psnTitles button");
    assert.equal(await page.locator("#psnNpsso").inputValue(), "");
    assert.equal(
      await page.evaluate(() =>
        JSON.stringify(localStorage).includes("a".repeat(64)),
      ),
      false,
    );
    assert.match(
      await page.locator("#psnSessionNotice").textContent(),
      /Session saved/,
    );
    await page.reload();
    await page.click("#openPsn");
    await page.waitForSelector("#psnProfile:not(.hidden)");
    await page.waitForSelector("#psnTitles button");
    assert(await page.locator("#psnCredentials").isHidden());
    assert.match(
      await page.locator("#psnDatRequirement").textContent(),
      /Launch the game at least once/,
    );
    const instructionStyle = await page
      .locator("#psnDatRequirement")
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          color: s.color,
          border: s.borderTopWidth,
          background: s.backgroundColor,
          text: getComputedStyle(document.body).color,
        };
      });
    assert.equal(instructionStyle.color, instructionStyle.text);
    assert.equal(instructionStyle.border, "0px");
    assert.equal(instructionStyle.background, "rgba(0, 0, 0, 0)");
    assert.equal(
      await page.locator("#psnPanel").getByText("PSN", { exact: true }).count(),
      1,
    );
    assert(
      !(await page.locator("#psnPanel").textContent()).includes(
        "PLAYSTATION NETWORK",
      ),
    );
    await page.locator("#psnClose").click();
    await page.click("#openFolder");
    await page.locator("#openPsn").click();
    await page.click("#psnTitles button");
    await page.waitForSelector("#psnSnapshot:not(.hidden)");
    assert.equal(await page.locator("#psnTrophyRows tr").count(), 4);
    await page.click("#psnCompare");
    await page.waitForSelector("#psnPlan:not(.hidden)");
    assert.equal(await page.locator(".psnExperimental").count(), 0);
    assert.equal(
      (await page.locator("#psnExport").textContent()).includes("experimental"),
      false,
    );
    assert.match(await page.locator("#psnPlan").textContent(), /1 → 3/);
    assert.match(
      await page.locator("#psnPlan code").textContent(),
      /user\\home\\11223344/,
    );
    await page.click("#psnExport");
    await page.waitForFunction(() => window.testExported === true);
    assert.equal(await page.evaluate(() => window.testExportPolicy), "local");
    await page.selectOption("#psnDatePolicy", "psn");
    assert(await page.locator("#psnExport").isDisabled());
    assert(await page.locator("#psnPlan").isHidden());
    await page.click("#psnCompare");
    assert.match(
      await page.locator("#psnPlan").textContent(),
      /Dates updated: 1/,
    );
    assert.match(await page.locator("#psnPlan").textContent(), /2020-01-02/);
    await page.click("#psnExport");
    assert.equal(await page.evaluate(() => window.testExportPolicy), "psn");
    await page.evaluate(() => (window.testDateOnly = true));
    await page.selectOption("#psnDatePolicy", "local");
    await page.click("#psnCompare");
    assert(await page.locator("#psnExport").isDisabled());
    await page.selectOption("#psnDatePolicy", "psn");
    await page.click("#psnCompare");
    assert.match(
      await page.locator("#psnPlan").textContent(),
      /New trophies: 0/,
    );
    assert(await page.locator("#psnExport").isEnabled());
    await page.click("#psnExport");
    assert.equal(await page.evaluate(() => window.testExportPolicy), "psn");
    await page.evaluate(() => (window.testDateOnly = false));
    for (const lang of ["en", "es", "fr", "it", "ja", "ru", "zh-CN"]) {
      await page.evaluate((lang) => {
        window.I18N.lang = lang;
        window.dispatchEvent(new Event("kik-languagechange"));
      }, lang);
      assert(await page.locator("#psnConnect").textContent());
      if (lang !== "en")
        assert.notEqual(
          await page.locator("#psnCompare").textContent(),
          "Preview merge",
        );
      assert.equal(await page.locator("#psnDatePolicy option").count(), 2);
      if (lang !== "en")
        assert.notEqual(
          await page
            .locator('#psnDatePolicy option[value="psn"]')
            .textContent(),
          "Use PSN dates",
        );
      const warning = await page.locator("#psnDatRequirement").textContent();
      assert(warning.includes("TRPTITLE.DAT"));
      if (lang !== "en") assert(!warning.includes("Launch the game"));
      const overflow = await page
        .locator("#psnPanel")
        .evaluate((el) => el.scrollWidth > el.clientWidth + 1);
      assert.equal(overflow, false, lang + " panel overflow");
    }
    await page.screenshot({
      path: path.join(require("node:os").tmpdir(), "kik-psn-preview.png"),
    });
    await page.click("#psnDisconnect");
    assert(await page.locator("#psnCredentials").isVisible());
    assert(await page.locator("#psnExport").isDisabled());
    await page.click("#psnClose");
    await page.reload();
    await page.click("#openPsn");
    assert(await page.locator("#psnCredentials").isVisible());
    await page.click("#psnClose");
    await page.click("#openFolder");
    await page.click("#openPsn");
    await page.click("#psnImport");
    await page.waitForSelector("#psnSnapshot:not(.hidden)");
    await page.click("#psnCompare");
    assert(await page.locator("#psnExport").isEnabled());
    assert.deepEqual(errors, []);
    console.log(
      "PASS: local/PSN date selector, stale-preview clearing and date-only export, PSN remembered session after reload, disconnect forgetting, DAT warning, login input clearing, error recovery, games/downloads, merge preview/export, offline JSON import, disconnect, seven UI languages and 1100×760 layout",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

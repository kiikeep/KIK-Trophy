const assert = require("node:assert/strict"),
  languages = require("../app/languages.js"),
  { dictionaries, translate } = require("../app/translations.js");
assert.equal(Object.keys(languages).length, 7);
assert.ok(!languages.hi && !dictionaries.hi);
assert.equal(languages.it.catalogs[0], "it-IT");
for (const [lang, expected] of [
  ["fr", "2 sélectionnés"],
  ["ja", "2 個選択"],
  ["ru", "2 выбрано"],
  ["it", "2 selezionati"],
]) {
  for (const key of Object.keys(dictionaries["zh-CN"]))
    assert.ok(dictionaries[lang][key], `${lang}: ${key}`);
  assert.equal(translate("2 selected", lang), expected);
  assert.equal(translate("2 selected", "en"), "2 selected");
  assert.notEqual(
    translate("2 files · 40 verified blocks", lang),
    "2 files · 40 verified blocks",
  );
}
const warning =
  "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.";
for (const lang of ["zh-CN", "it", "fr", "ja", "ru"])
  assert.ok(dictionaries[lang][warning]);
console.log(
  "PASS: seven-language registry, complete added dictionaries, dynamic translations and revised restore guidance",
);

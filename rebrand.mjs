import fs from "node:fs";
import * as PE from "pe-library";
import * as R from "resedit";
const dir = process.argv[2];
if (!dir) throw Error("Usage: node rebrand.mjs WINDOWS_RUNTIME_FOLDER");
const original = fs.existsSync(dir + "/electron.exe")
  ? dir + "/electron.exe"
  : dir + "/KIK Trophy.exe";
const exe = PE.NtExecutable.from(fs.readFileSync(original), {
  ignoreCert: true,
});
const res = PE.NtExecutableResource.from(exe);
const ico = R.Data.IconFile.from(
  fs.readFileSync(new URL("./app/icon.ico", import.meta.url)),
);
const groups = R.Resource.IconGroupEntry.fromEntries(res.entries);
for (const g of groups)
  R.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    g.id,
    g.lang,
    ico.icons.map((i) => i.data),
  );
for (const vi of R.Resource.VersionInfo.fromEntries(res.entries)) {
  vi.setFileVersion(1, 2, 0, 0, 1033);
  vi.setProductVersion(1, 2, 0, 0, 1033);
  vi.setStringValues(
    { lang: 1033, codepage: 1200 },
    {
      FileVersion: "1.2",
      ProductVersion: "1.2",
      FileDescription: "KIK Trophy Desktop",
      ProductName: "KIK Trophy",
      CompanyName: "kiikeep",
      OriginalFilename: "KIK Trophy.exe",
      InternalName: "KIK Trophy",
      LegalCopyright:
        "2026 kiikeep. Electron and Chromium retain their respective licenses.",
    },
  );
  vi.outputToResourceEntries(res.entries);
}
res.outputResource(exe);
const out = Buffer.from(exe.generate());
const target = dir + "/KIK Trophy.exe";
const fd = fs.openSync(target, "w");
try {
  for (let offset = 0; offset < out.length; offset += 1024 * 1024) {
    const chunk = out.subarray(
      offset,
      Math.min(out.length, offset + 1024 * 1024),
    );
    let written = 0;
    while (written < chunk.length)
      written += fs.writeSync(fd, chunk, written, chunk.length - written);
  }
  fs.fsyncSync(fd);
} finally {
  fs.closeSync(fd);
}
if (fs.statSync(target).size !== out.length)
  throw new Error("Executable write size mismatch");
const check = PE.NtExecutable.from(out);
const rr = PE.NtExecutableResource.from(check);
if (!R.Resource.IconGroupEntry.fromEntries(rr.entries).length)
  throw Error("Missing exe icon");
if (original !== target) fs.unlinkSync(original);
console.log(
  "Windows executable branded and PE resources revalidated",
  out.length,
);

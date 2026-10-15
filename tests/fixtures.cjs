const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const OLD_UID = "11223344",
  NEW_UID = "55667788",
  OLD_ACCOUNT = "1020304050607080",
  NEW_ACCOUNT = "0123456789abcdef";
const hash = (b, alg = "sha256") => crypto.createHash(alg).update(b).digest();
function makeUcp(npwr, count = 3, extraLanguages = true) {
  const trophies = Array.from({ length: count }, (_, i) => ({
    id: String(i).padStart(4, "0"),
    grade: i === 0 ? "P" : i === 1 ? "B" : "S",
    hidden: i === 2,
  }));
  const meta = (lang) => ({
    metadata: {
      titleMetadata: {
        name: {
          en: "Synthetic Test Game",
          es: "Juego de prueba",
          fr: "Jeu de test",
          ja: "テストゲーム",
          ru: "Тестовая игра",
          it: "Gioco di prova",
        }[lang],
      },
      trophyMetadata: trophies.map((t, i) => ({
        id: t.id,
        name: (lang === "en" ? "Test trophy " : "Trofeo de prueba ") + i,
        detail:
          lang === "en"
            ? "Synthetic fixture description"
            : "Descripción de prueba sintética",
      })),
    },
  });
  const entries = [
    [
      "tropconf.json",
      Buffer.from(
        JSON.stringify({
          trophyNpCommId: npwr,
          trophySetVersion: "1.0",
          trophies,
        }),
      ),
    ],
    ["tropmeta_en-US.json", Buffer.from(JSON.stringify(meta("en")))],
    ["tropmeta_es-419.json", Buffer.from(JSON.stringify(meta("es")))],
    [
      "icon0_en-US.png",
      fs.readFileSync(path.join(__dirname, "../app/icon.png")),
    ],
  ];
  if (extraLanguages)
    for (const [lang, locale] of [
      ["fr", "fr-FR"],
      ["ja", "ja-JP"],
      ["ru", "ru-RU"],
      ["it", "it-IT"],
    ])
      entries.push([
        `tropmeta_${locale}.json`,
        Buffer.from(JSON.stringify(meta(lang))),
      ]);
  let offset = 96 + entries.length * 64;
  const positions = entries.map(([name, data]) => {
    const p = offset;
    offset += data.length;
    return { name, data, offset: p };
  });
  const out = Buffer.alloc(offset);
  out.writeUInt32BE(0xb228c60a, 0);
  out.writeUInt32BE(1, 4);
  out.writeBigUInt64BE(BigInt(out.length), 8);
  out.writeUInt32BE(entries.length, 16);
  out.writeUInt32BE(64, 20);
  positions.forEach((e, i) => {
    const p = 96 + i * 64;
    out.write(e.name, p, 32, "utf8");
    out.writeBigUInt64BE(BigInt(e.offset), p + 32);
    out.writeBigUInt64BE(BigInt(e.data.length), p + 40);
    e.data.copy(out, e.offset);
  });
  hash(out, "sha1").copy(out, 28);
  return out;
}
function makeDat(
  npwr,
  ucp,
  { uid = OLD_UID, account = OLD_ACCOUNT, count = 3, earned = [1, 2] } = {},
) {
  const defs = [
    [1, 0x30, 1],
    [2, 0x60, 1],
    [0x100, 0x40, 1],
    [0x300, 0x480, 1],
    [0x400, 0x90, 1],
    [0x500, 0xc0, count],
    [0x600, 0x1f0, 1],
    [0x700, 0xb0, 1],
    [0x800, 0x50, count],
  ];
  let off = 0x150;
  const sections = defs.map(([type, size, n]) => {
    const s = { type, size, count: n, off };
    off += n * (size + 16);
    return s;
  });
  const d = Buffer.alloc(Math.ceil(off / 1024) * 1024);
  d.write("T2TD");
  d.writeUInt32BE(0x10000, 4);
  d.writeUInt32BE(9, 8);
  sections.forEach((s, i) => {
    const p = 0x30 + i * 32;
    d.writeUInt32BE(s.type, p);
    d.writeUInt32BE(s.size, p + 4);
    d.writeUInt32BE(1, p + 8);
    d.writeUInt32BE(s.count, p + 12);
    d.writeBigUInt64BE(BigInt(s.off), p + 16);
    for (let j = 0; j < s.count; j++) {
      const r = s.off + j * (s.size + 16);
      d.writeUInt32BE(s.type, r);
      d.writeUInt32BE(s.size, r + 4);
      if (s.type === 0x500 || s.type === 0x800) d.writeUInt32BE(j, r + 16);
      if (s.type === 0x800 && earned.includes(j)) {
        d.writeUInt32BE(0x11, r + 20);
        d.writeBigUInt64BE(
          62135596800000000n +
            BigInt(Date.UTC(2020, 0, 2, 3, 4, 5) + j * 1000) * 1000n,
          r + 32,
        );
      }
    }
  });
  Buffer.from(account, "hex").copy(d, 0x1c0);
  Buffer.from(uid, "hex").copy(d, 0x1c8);
  ucp.copy(d, 0x210, 28, 48);
  d.write(npwr, 0x260, 12, "ascii");
  const blocks = d.length / 1024,
    out = Buffer.alloc(64 + blocks * 1056);
  out.write("T2PD");
  out.writeUInt32BE(0x10000, 4);
  out.writeBigUInt64BE(1056n, 8);
  out.writeBigUInt64BE(BigInt(blocks), 32);
  for (let i = 0; i < blocks; i++) {
    const b = d.subarray(i * 1024, (i + 1) * 1024),
      p = 64 + i * 1056;
    b.copy(out, p);
    hash(b).copy(out, p + 1024);
  }
  return out;
}
function crc32(b) {
  let c = 0xffffffff;
  for (const v of b) {
    c ^= v;
    for (let i = 0; i < 8; i++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function zip(entries) {
  let offset = 0;
  const data = [],
    central = [];
  for (const [name, b] of entries) {
    const n = Buffer.from(name),
      h = Buffer.alloc(30),
      c = Buffer.alloc(46),
      crc = crc32(b);
    h.writeUInt32LE(0x04034b50);
    h.writeUInt16LE(20, 4);
    h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(b.length, 18);
    h.writeUInt32LE(b.length, 22);
    h.writeUInt16LE(n.length, 26);
    c.writeUInt32LE(0x02014b50);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(b.length, 20);
    c.writeUInt32LE(b.length, 24);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(offset, 42);
    data.push(h, n, b);
    central.push(c, n);
    offset += h.length + n.length + b.length;
  }
  const cd = Buffer.concat(central),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...data, cd, end]);
}
function fixtures() {
  const npwr = "NPWR00001_00",
    other = "NPWR00002_00",
    ucp = makeUcp(npwr),
    otherUcp = makeUcp(other, 4),
    old = makeDat(npwr, ucp),
    current = makeDat(npwr, ucp, {
      uid: NEW_UID,
      account: NEW_ACCOUNT,
      earned: [1],
    }),
    second = makeDat(other, otherUcp, { count: 4, earned: [1] });
  const archive = zip([
    ["old/" + npwr + "/TRPTITLE.DAT", old],
    ["old/" + other + "/TRPTITLE.DAT", second],
    ["current/" + npwr + "/TRPTITLE.DAT", current],
    ["catalog/" + npwr + "/TROPHY.UCP", ucp],
    ["catalog/" + other + "/TROPHY.UCP", otherUcp],
  ]);
  return { npwr, other, ucp, otherUcp, old, current, second, archive };
}
module.exports = {
  fixtures,
  makeDat,
  makeUcp,
  zip,
  OLD_UID,
  NEW_UID,
  OLD_ACCOUNT,
  NEW_ACCOUNT,
};

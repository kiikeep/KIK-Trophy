"use strict";
const languages = require("./languages.js");
const crypto = require("node:crypto"),
  zlib = require("node:zlib");
const MAX_DAT = 1024 * 1024,
  MAX_UCP = 64 * 1024 * 1024;
const sha = (b) => crypto.createHash("sha256").update(b).digest();
function check(ok, msg) {
  if (!ok) throw Error(msg);
}
function u64(b, o) {
  check(o >= 0 && o + 8 <= b.length, "Offset fuera del archivo");
  const n = b.readBigUInt64BE(o);
  check(n <= BigInt(Number.MAX_SAFE_INTEGER), "Offset demasiado grande");
  return Number(n);
}
function npwr(s) {
  return /^NPWR\d{5}_\d{2}$/.test(s);
}
function dateFromTicks(ts) {
  if (ts === 0n) return null;
  const ms = Number((ts - 62135596800000000n) / 1000n);
  check(
    Number.isFinite(ms) && Math.abs(ms) < 8640000000000000,
    "Fecha fuera de rango",
  );
  return new Date(ms).toISOString();
}
function parseDat(buf) {
  check(
    Buffer.isBuffer(buf) && buf.length >= 1120 && buf.length <= MAX_DAT,
    "El DAT debe medir entre 1 KB y 1 MiB",
  );
  check(
    buf.toString("ascii", 0, 4) === "T2PD" && buf.readUInt32BE(4) === 0x10000,
    "No es un TRPTITLE.DAT T2PD v1 compatible",
  );
  check(
    u64(buf, 8) === 1056 && (buf.length - 64) % 1056 === 0,
    "Tamaño de bloque T2PD inválido",
  );
  const blocks = (buf.length - 64) / 1056;
  check(u64(buf, 32) === blocks, "Conteo de bloques inconsistente");
  const d = Buffer.alloc(blocks * 1024);
  for (let i = 0; i < blocks; i++) {
    const p = 64 + i * 1056;
    check(
      sha(buf.subarray(p, p + 1024)).equals(buf.subarray(p + 1024, p + 1056)),
      `SHA-256 inválido en el bloque ${i + 1}`,
    );
    buf.copy(d, i * 1024, p, p + 1024);
  }
  check(
    d.toString("ascii", 0, 4) === "T2TD" &&
      d.readUInt32BE(4) === 0x10000 &&
      d.readUInt32BE(8) === 9,
    "Estructura T2TD no compatible",
  );
  const sections = [];
  for (let i = 0; i < 9; i++) {
    const p = 0x30 + i * 32,
      type = d.readUInt32BE(p),
      size = d.readUInt32BE(p + 4),
      count = d.readUInt32BE(p + 12),
      off = u64(d, p + 16);
    check(
      size > 0 &&
        count > 0 &&
        count <= 512 &&
        off <= d.length &&
        count * (size + 16) <= d.length - off,
      "Sección fuera de límites",
    );
    for (let j = 0; j < count; j++) {
      const r = off + j * (size + 16);
      check(
        d.readUInt32BE(r) === type && d.readUInt32BE(r + 4) === size,
        "Cabecera de registro inconsistente",
      );
    }
    sections.push({ type, size, count, off });
  }
  check(
    sections[2].type === 0x100 &&
      sections[2].off === 0x200 &&
      sections[3].type === 0x300 &&
      sections[3].off === 0x250,
    "Ubicación de identidad incompatible",
  );
  const id = d.toString("ascii", 0x260, 0x26c);
  check(npwr(id) && d[0x26c] === 0, "NPWR inválido");
  const state = sections.find((s) => s.type === 0x800);
  check(state && state.size === 80, "Registros de progreso incompatibles");
  const trophies = [];
  for (let i = 0; i < state.count; i++) {
    const p = state.off + i * 96,
      tid = d.readUInt32BE(p + 16),
      flags = d.readUInt32BE(p + 20),
      ticks = d.readBigUInt64BE(p + 32);
    check(tid === i, "IDs de trofeo inconsistentes");
    trophies.push({
      id: tid,
      earned: !!(flags & 1),
      flags,
      ticks: ticks.toString(),
      unlockedAt: flags & 1 ? dateFromTicks(ticks) : null,
    });
  }
  const account = buf.subarray(0x200, 0x208),
    uid = buf.subarray(0x208, 0x20c).toString("hex");
  return {
    npwr: id,
    uid,
    catalogHash: buf.subarray(0x250, 0x264).toString("hex"),
    accountHex: account.toString("hex"),
    accountBase64: Buffer.from(account).reverse().toString("base64"),
    blocks,
    bytes: buf.length,
    sha256: sha(buf).toString("hex"),
    total: trophies.length,
    earned: trophies.filter((t) => t.earned).length,
    trophies,
    sections,
    logical: d,
  };
}
function parseAccount(text) {
  const s = text.trim();
  if (/^[a-fA-F0-9]{16}$/.test(s)) return Buffer.from(s, "hex");
  check(
    /^[A-Za-z0-9+/]{11}=$/.test(s),
    "Account ID: usa 16 caracteres hex o Base64 de 8 bytes",
  );
  const b = Buffer.from(s, "base64");
  check(
    b.length === 8 && b.toString("base64") === s,
    "Account ID Base64 inválido",
  );
  return Buffer.from(b).reverse();
}
function rewriteDat(
  buf,
  { uid = "", account = "" } = {},
  { allowUnchanged = false } = {},
) {
  const before = parseDat(buf),
    out = Buffer.from(buf);
  uid = uid.trim();
  account = account.trim();
  check(uid || account, "Escribe al menos un identificador nuevo");
  if (uid) {
    check(
      /^[a-fA-F0-9]{8}$/.test(uid),
      "ID local: escribe exactamente 8 caracteres hex",
    );
    Buffer.from(uid, "hex").copy(out, 0x208);
  }
  if (account) parseAccount(account).copy(out, 0x200);
  sha(out.subarray(64, 1088)).copy(out, 0x440);
  const after = parseDat(out);
  check(
    before.npwr === after.npwr &&
      JSON.stringify(before.trophies) === JSON.stringify(after.trophies),
    "El progreso cambió inesperadamente",
  );
  let changed = 0;
  for (let i = 0; i < buf.length; i++)
    if (buf[i] !== out[i]) {
      check(
        (i >= 0x200 && i < 0x20c) || (i >= 0x440 && i < 0x460),
        "Cambio fuera de la identidad o checksum",
      );
      changed++;
    }
  check(
    changed > 0 || allowUnchanged,
    "Los identificadores ya coinciden; no hay cambios para exportar",
  );
  return { bytes: out, before, after, changed };
}
function parseUcp(buf, language = "en") {
  check(
    buf.length >= 96 && buf.length <= MAX_UCP,
    "UCP vacío o demasiado grande",
  );
  check(
    buf.readUInt32BE(0) === 0xb228c60a && buf.readUInt32BE(4) === 1,
    "No es un UCP v1 compatible",
  );
  check(
    u64(buf, 8) === buf.length && buf.readUInt32BE(20) === 64,
    "Cabecera UCP inconsistente",
  );
  const count = buf.readUInt32BE(16);
  check(
    count > 0 && count <= 4096 && 96 + count * 64 <= buf.length,
    "Directorio UCP fuera de límites",
  );
  const hashed = Buffer.from(buf);
  hashed.fill(0, 28, 48);
  check(
    crypto
      .createHash("sha1")
      .update(hashed)
      .digest()
      .equals(buf.subarray(28, 48)),
    "SHA-1 interno de UCP inválido",
  );
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    const p = 96 + i * 64,
      n = buf
        .subarray(p, p + 32)
        .toString("utf8")
        .split("\0")[0],
      off = u64(buf, p + 32),
      size = u64(buf, p + 40);
    check(
      off >= 96 + count * 64 &&
        size <= MAX_UCP &&
        off <= buf.length &&
        size <= buf.length - off,
      "Entrada UCP fuera de límites",
    );
    check(!entries.has(n), "Entrada UCP duplicada");
    entries.set(n, { off, size });
  }
  const json = (name) => {
    const e = entries.get(name);
    check(e && e.size <= 1024 * 1024, `Falta ${name} o es demasiado grande`);
    return JSON.parse(buf.toString("utf8", e.off, e.off + e.size));
  };
  const conf = json("tropconf.json");
  check(
    npwr(conf.trophyNpCommId) && Array.isArray(conf.trophies),
    "Definición de trofeos inválida",
  );
  const lang = (languages[language]?.catalogs || languages.en.catalogs).find(
    (l) => entries.has(`tropmeta_${l}.json`),
  );
  const meta = lang ? json(`tropmeta_${lang}.json`).metadata : {};
  const descriptions = new Map(
    (meta.trophyMetadata || []).map((t) => [Number(t.id), t]),
  );
  const trophies = new Map(
    conf.trophies.map((t) => {
      const x = descriptions.get(Number(t.id)) || {};
      return [
        Number(t.id),
        {
          name: x.name || `Trofeo #${Number(t.id)}`,
          description: x.detail || "",
          grade: t.grade || "?",
          hidden: !!t.hidden,
          group: t.groupId || "0000",
          unlockComparator: t.unlockCondition?.comparator || null,
          trophyIcon: image("trop" + String(t.id).padStart(4, "0") + ".png"),
        },
      ];
    }),
  );
  function image(name) {
    const e = entries.get(name);
    if (!e || e.size > 2 * 1024 * 1024) return null;
    const b = buf.subarray(e.off, e.off + e.size);
    if (!b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")))
      return null;
    return "data:image/png;base64," + b.toString("base64");
  }
  const iconName = [
    `icon0_${lang}.png`,
    "icon0.png",
    "icon0_en-US.png",
    "icon0_en-GB.png",
    ...[...entries.keys()].filter((n) => /^icon0_.+\.png$/.test(n)),
  ].find((n) => entries.has(n));
  return {
    npwr: conf.trophyNpCommId,
    hash: buf.subarray(28, 48).toString("hex"),
    title: meta.titleMetadata?.name || conf.trophyNpCommId,
    version: conf.trophySetVersion || "?",
    language: lang || "—",
    trophies,
    icon: iconName ? image(iconName) : null,
    bytes: buf.length,
  };
}
let crcTable;
function crc32(b) {
  if (!crcTable)
    crcTable = Array.from({ length: 256 }, (_, n) => {
      for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
      return n >>> 0;
    });
  let c = 0xffffffff;
  for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function readZip(buf) {
  check(
    buf.length <= 512 * 1024 * 1024,
    "ZIP demasiado grande (máximo 512 MiB)",
  );
  let e = -1;
  for (let p = buf.length - 22; p >= Math.max(0, buf.length - 65557); p--)
    if (
      buf.readUInt32LE(p) === 0x06054b50 &&
      p + 22 + buf.readUInt16LE(p + 20) === buf.length
    ) {
      e = p;
      break;
    }
  check(e >= 0, "ZIP incompleto o no compatible");
  check(
    buf.readUInt16LE(e + 4) === 0 && buf.readUInt16LE(e + 6) === 0,
    "ZIP multidisco no compatible",
  );
  const count = buf.readUInt16LE(e + 10),
    dir = buf.readUInt32LE(e + 16),
    size = buf.readUInt32LE(e + 12);
  check(
    count <= 8192 && dir + size <= e,
    "Directorio ZIP inválido o ZIP64 no compatible",
  );
  let p = dir,
    total = 0;
  const out = [];
  for (let i = 0; i < count; i++) {
    check(
      p + 46 <= dir + size && buf.readUInt32LE(p) === 0x02014b50,
      "Entrada ZIP inválida",
    );
    const flag = buf.readUInt16LE(p + 8),
      method = buf.readUInt16LE(p + 10),
      crc = buf.readUInt32LE(p + 16),
      compressed = buf.readUInt32LE(p + 20),
      raw = buf.readUInt32LE(p + 24),
      nl = buf.readUInt16LE(p + 28),
      el = buf.readUInt16LE(p + 30),
      cl = buf.readUInt16LE(p + 32),
      offset = buf.readUInt32LE(p + 42);
    check(p + 46 + nl + el + cl <= dir + size, "Nombre ZIP fuera de límites");
    const name = buf.toString("utf8", p + 46, p + 46 + nl);
    p += 46 + nl + el + cl;
    if (!/(?:^|\/)(?:TRPTITLE\.DAT|TROPHY\.UCP)$/i.test(name)) continue;
    check(!(flag & 1), "ZIP cifrado no compatible");
    const isDat = /TRPTITLE\.DAT$/i.test(name);
    check(
      raw > 0 && raw <= (isDat ? MAX_DAT : MAX_UCP),
      "Archivo del ZIP demasiado grande",
    );
    total += raw;
    check(total <= 256 * 1024 * 1024, "El contenido de trofeos supera 256 MiB");
    check(
      offset + 30 <= dir && buf.readUInt32LE(offset) === 0x04034b50,
      "Cabecera ZIP local inválida",
    );
    const start =
      offset +
      30 +
      buf.readUInt16LE(offset + 26) +
      buf.readUInt16LE(offset + 28);
    check(start + compressed <= dir, "Datos ZIP fuera de límites");
    const data =
      method === 0
        ? Buffer.from(buf.subarray(start, start + compressed))
        : method === 8
          ? zlib.inflateRawSync(buf.subarray(start, start + compressed), {
              maxOutputLength: raw,
            })
          : null;
    check(
      data && data.length === raw && crc32(data) === crc,
      "CRC ZIP inválido o compresión no compatible",
    );
    out.push({ name, data });
  }
  return out;
}
function publicDat(dat, ucp) {
  const { logical, sections, ...d } = dat;
  const warnings = [];
  if (ucp && ucp.trophies.size !== dat.total)
    warnings.push(
      "El catálogo y el DAT tienen distinto número de trofeos. Revisa la revisión del juego.",
    );
  return {
    ...d,
    title: ucp?.title || dat.npwr,
    icon: ucp?.icon || null,
    catalog: !!ucp,
    catalogVersion: ucp?.version || "—",
    language: ucp?.language || "—",
    warnings,
    trophies: dat.trophies.map((t) => ({
      ...t,
      ...ucp?.trophies.get(t.id),
      name: ucp?.trophies.get(t.id)?.name || `Trofeo #${t.id}`,
      description: ucp?.trophies.get(t.id)?.description || "",
      grade: ucp?.trophies.get(t.id)?.grade || "?",
    })),
  };
}
module.exports = {
  parseDat,
  parseUcp,
  parseAccount,
  rewriteDat,
  readZip,
  publicDat,
  sha,
  MAX_DAT,
  MAX_UCP,
};

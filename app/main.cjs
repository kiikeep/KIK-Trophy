"use strict";
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  session,
  safeStorage,
} = require("electron");
const fs = require("node:fs/promises"),
  path = require("node:path");
const syncFs = require("node:fs");
function fatal(error) {
  const message = String(error?.stack || error);
  try {
    const dir = app.getPath("userData");
    syncFs.mkdirSync(dir, { recursive: true });
    syncFs.appendFileSync(
      path.join(dir, "startup.log"),
      new Date().toISOString() + " " + message + "\n",
    );
  } catch {}
  dialog.showErrorBox(
    D("KIK Trophy · startup error", "KIK Trophy · error de inicio"),
    message,
  );
}
process.on("uncaughtException", fatal);
process.on("unhandledRejection", fatal);
const core = require("./core.cjs");
const batch = require("./batch.cjs");
const languages = require("./languages.js");
const identityStore = require("./preferences.cjs").createStore(() =>
  app.getPath("userData"),
);
async function rememberForExport(t) {
  try {
    return { lastIdentity: await identityStore.save(t) };
  } catch (error) {
    return { rememberError: String(error.message || error) };
  }
}
let win, psnHandlers;
const records = new Map(),
  catalogs = new Map(),
  openedPaths = new Set();
let language = "en";
const localeData = require("./translations.js");
const D = (en, es) =>
  language === "es" ? es : localeData.translate(en, language);
const HTML = path.join(__dirname, "index.html");
function sender(e) {
  if (
    e.sender !== win?.webContents ||
    !e.senderFrame ||
    e.senderFrame !== e.sender.mainFrame ||
    e.senderFrame.url !== require("node:url").pathToFileURL(HTML).href
  )
    throw Error("Origen de solicitud inválido");
}
function view() {
  return [...records.values()].map((r) => ({
    ...core.publicDat(
      r.dat,
      catalogs.get(r.dat.npwr + ":" + r.dat.catalogHash)?.ucp[language],
    ),
    key: r.key,
    source: r.source,
    sourceName: r.source.split(/[\\/]/).slice(-3).join("/"),
  }));
}
async function fileBytes(file, max) {
  const st = await fs.lstat(file);
  if (!st.isFile() || st.size > max)
    throw Error("Archivo no regular o demasiado grande");
  return fs.readFile(file);
}
async function ingest(paths) {
  const errors = [],
    warnings = [];
  let count = 0,
    bytes = 0;
  const entries = [];
  async function load(file, depth = 0) {
    if (++count > 10000) throw Error("Límite de exploración: 10,000 entradas");
    if (depth > 16) return;
    const st = await fs.lstat(file);
    if (st.isSymbolicLink()) return;
    if (st.isDirectory()) {
      for (const name of await fs.readdir(file))
        await load(path.join(file, name), depth + 1);
      return;
    }
    if (!st.isFile()) return;
    const ext = path.extname(file).toLowerCase();
    if (![".dat", ".ucp", ".zip"].includes(ext)) return;
    // Recursively selected folders only include trophy filenames; individual DATs may be renamed.
    if (
      depth > 0 &&
      !/^(TRPTITLE\.DAT|TROPHY\.UCP)$/i.test(path.basename(file)) &&
      ext !== ".zip"
    )
      return;
    const b = await fileBytes(
      file,
      ext === ".zip"
        ? 512 * 1024 * 1024
        : ext === ".dat"
          ? core.MAX_DAT
          : core.MAX_UCP,
    );
    openedPaths.add(path.resolve(file).toLowerCase());
    if (ext === ".zip") {
      for (const x of core.readZip(b)) {
        bytes += x.data.length;
        if (bytes > 256 * 1024 * 1024)
          throw Error("Contenido importado supera 256 MiB");
        entries.push({
          data: x.data,
          source: file + " › " + x.name,
          kind: x.name.toLowerCase().endsWith(".dat") ? "dat" : "ucp",
        });
      }
    } else {
      bytes += b.length;
      if (bytes > 256 * 1024 * 1024)
        throw Error("Contenido importado supera 256 MiB");
      entries.push({ data: b, source: file, kind: ext.slice(1) });
    }
  }
  for (const file of paths) {
    try {
      await load(file);
    } catch (e) {
      errors.push(path.basename(file) + ": " + e.message);
    }
  }
  for (const e of entries.filter((x) => x.kind === "ucp"))
    try {
      const ucp = Object.fromEntries(
        Object.keys(languages).map((lang) => [
          lang,
          core.parseUcp(e.data, lang),
        ]),
      );
      const en = ucp.en;
      catalogs.set(en.npwr + ":" + en.hash, {
        ucp,
        source: e.source,
      });
    } catch (err) {
      errors.push(e.source + ": " + err.message);
    }
  for (const e of entries.filter((x) => x.kind === "dat"))
    try {
      const dat = core.parseDat(e.data);
      const key = dat.sha256;
      if (records.has(key)) {
        warnings.push("DAT idéntico ya cargado: " + dat.npwr);
        continue;
      }
      if (records.size >= 512) throw Error("Máximo 512 respaldos cargados");
      records.set(key, { key, dat, bytes: e.data, source: e.source });
    } catch (err) {
      errors.push(e.source + ": " + err.message);
    }
  if (!entries.length && !errors.length)
    warnings.push("No se encontraron archivos de trofeos compatibles.");
  return { records: view(), errors, warnings };
}
function record(key) {
  if (typeof key !== "string" || !records.has(key))
    throw Error("Selecciona un respaldo");
  return records.get(key);
}
function target(t) {
  if (
    !t ||
    typeof t.uid !== "string" ||
    typeof t.account !== "string" ||
    t.uid.length > 64 ||
    t.account.length > 64
  )
    throw Error("Identificadores inválidos");
  return t;
}
app.setName("KIK Trophy");
app.setAppUserModelId("kiikeep.kik-trophy.desktop");
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) =>
    cb(false),
  );
  win = new BrowserWindow({
    width: 1460,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#0b0e15",
    title: "KIK Trophy",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
    },
  });
  win.webContents.on("did-fail-load", (event, code, description) =>
    fatal(
      new Error("No se pudo abrir la interfaz: " + code + " " + description),
    ),
  );
  win.webContents.on("render-process-gone", (event, details) => {
    if (details.reason !== "clean-exit")
      fatal(new Error("La interfaz terminó: " + details.reason));
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  psnHandlers = require("./psn-main.cjs").installPsnHandlers({
    ipcMain,
    dialog,
    win: () => win,
    sender,
    record,
    catalogs,
    fileBytes,
    shell,
    sessionStore: require("./psn-session.cjs").createSessionStore({
      directory: () => app.getPath("userData"),
      safeStorage,
    }),
  });
  win.loadFile(HTML);
});
app.on("window-all-closed", async () => {
  await psnHandlers?.close();
  await identityStore.flush();
  app.quit();
});
ipcMain.handle("language", (e, value) => {
  sender(e);
  if (!Object.hasOwn(languages, value)) throw Error("Invalid language");
  language = value;
  return view();
});
ipcMain.handle("import", async (e, kind) => {
  sender(e);
  const o =
    kind === "folder"
      ? { properties: ["openDirectory"] }
      : {
          properties: ["openFile", "multiSelections"],
          filters: [
            {
              name: D("Trophy backups", "Respaldos de trofeos"),
              extensions: ["dat", "ucp", "zip"],
            },
          ],
        };
  const r = await dialog.showOpenDialog(win, o);
  return r.canceled ? null : ingest(r.filePaths);
});
ipcMain.handle("drop", async (e, paths) => {
  sender(e);
  if (
    !Array.isArray(paths) ||
    paths.length > 100 ||
    paths.some((p) => typeof p !== "string")
  )
    throw Error("Selección inválida");
  return ingest(paths);
});
ipcMain.handle("last-identity", async (e) => {
  sender(e);
  return identityStore.get();
});
ipcMain.handle("remember-identity", async (e, t) => {
  sender(e);
  return identityStore.save(target(t));
});
ipcMain.handle("identity", async (e) => {
  sender(e);
  const r = await dialog.showOpenDialog(win, {
    title: D(
      "Take IDs from another TRPTITLE.DAT",
      "Tomar identificadores de un DAT actual",
    ),
    properties: ["openFile"],
    filters: [{ name: "TRPTITLE.DAT", extensions: ["dat"] }],
  });
  if (r.canceled) return null;
  const file = r.filePaths[0];
  const d = core.parseDat(await fileBytes(file, core.MAX_DAT));
  openedPaths.add(path.resolve(file).toLowerCase());
  return {
    ...(await rememberForExport({ uid: d.uid, account: d.accountHex })),
    uid: d.uid,
    account: d.accountHex,
    base64: d.accountBase64,
    npwr: d.npwr,
  };
});
ipcMain.handle("preview", async (e, key, t) => {
  sender(e);
  const r = record(key),
    result = core.rewriteDat(r.bytes, target(t));
  return {
    before: { uid: result.before.uid, account: result.before.accountHex },
    after: {
      uid: result.after.uid,
      account: result.after.accountHex,
      base64: result.after.accountBase64,
    },
    changed: result.changed,
    earned: result.after.earned,
    total: result.after.total,
    blocks: result.after.blocks,
    sha256: result.after.sha256,
    relativePath: batch.relativePath(result.after),
  };
});
ipcMain.handle("export", async (e, key, t) => {
  sender(e);
  const r = record(key),
    result = core.rewriteDat(r.bytes, target(t));
  const d = await dialog.showOpenDialog(win, {
    title: D("Export an adapted copy", "Exportar una copia adaptada"),
    properties: ["openDirectory"],
  });
  if (d.canceled) return null;
  const exported = await batch.exportPrepared(
    [{ record: r, result }],
    d.filePaths[0],
  );
  return {
    ...exported,
    path: path.join(
      exported.path,
      ...batch.relativePath(result.after).split("/"),
    ),
    rootPath: exported.path,
    ...(await rememberForExport(t)),
    reportError: null,
  };
});
ipcMain.handle("report", async (e, key) => {
  sender(e);
  const r = record(key),
    d = await dialog.showSaveDialog(win, {
      title: D("Save trophy details", "Guardar detalle de trofeos"),
      defaultPath: r.dat.npwr + D("-trophies.json", "-trofeos.json"),
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
  if (d.canceled) return null;
  const data = core.publicDat(
    r.dat,
    catalogs.get(r.dat.npwr + ":" + r.dat.catalogHash)?.ucp[language],
  );
  delete data.icon;
  await fs.writeFile(
    d.filePath,
    JSON.stringify({ ...data, source: r.source }, null, 2),
    { flag: "wx" },
  );
  return d.filePath;
});
ipcMain.handle("clear", (e) => {
  sender(e);
  records.clear();
  catalogs.clear();
  openedPaths.clear();
  return true;
});

function batchRecords(keys) {
  if (
    !Array.isArray(keys) ||
    !keys.length ||
    keys.length > 512 ||
    new Set(keys).size !== keys.length
  )
    throw Error("Invalid batch selection");
  return keys.map(record);
}
ipcMain.handle("batch-preview", (e, keys, t) => {
  sender(e);
  return batch.preview(batchRecords(keys), target(t));
});
ipcMain.handle("batch-export", async (e, keys, t) => {
  sender(e);
  const prepared = batch.prepare(batchRecords(keys), target(t));
  const d = await dialog.showOpenDialog(win, {
    title: D(
      "Choose a folder for batch exports",
      "Elige una carpeta para exportar el lote",
    ),
    properties: ["openDirectory"],
  });
  if (d.canceled) return null;
  const exported = await batch.exportPrepared(prepared, d.filePaths[0]);
  return { ...exported, ...(await rememberForExport(t)) };
});

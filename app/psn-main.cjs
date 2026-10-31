"use strict";
const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto");
const { createPsnClient } = require("./psn-client.cjs"),
  { validateSnapshot } = require("./psn-backup.cjs"),
  { mergePsnDat } = require("./psn-merge.cjs"),
  batch = require("./batch.cjs");
function installPsnHandlers({
  ipcMain,
  dialog,
  win,
  sender,
  record,
  catalogs,
  fileBytes,
  shell,
  clientFactory = createPsnClient,
  sessionStore,
}) {
  const snapshots = new Map();
  let sessionChecked = false,
    restoring = null;
  const client = clientFactory({
    sessionStore,
    onProgress: (p) => win()?.webContents.send?.("psn-progress", p),
  });
  function snapshot(key) {
    if (typeof key !== "string" || !snapshots.has(key))
      throw Error("Select or open a PSN backup first");
    return snapshots.get(key);
  }
  function remember(data, source) {
    if (snapshots.size >= 128) throw Error("Too many PSN backups loaded");
    const value = validateSnapshot(data),
      key = crypto.randomUUID();
    snapshots.set(key, { value, source });
    return { key, ...value };
  }
  function prepare(key, snapshotKey, datePolicy) {
    const r = record(key),
      s = snapshot(snapshotKey),
      catalog = catalogs.get(r.dat.npwr + ":" + r.dat.catalogHash)?.ucp.en;
    const result = mergePsnDat(r.bytes, s.value, catalog, datePolicy);
    result.merge.source = s.source;
    return { record: r, result };
  }
  function preview(key, snapshotKey, datePolicy) {
    const { record: r, result: x } = prepare(key, snapshotKey, datePolicy);
    return {
      npwr: r.dat.npwr,
      uid: x.after.uid,
      account: x.after.accountHex,
      before: x.before.earned,
      after: x.after.earned,
      total: x.after.total,
      changed: x.changed,
      blocks: x.after.blocks,
      relativePath: batch.relativePath(x.after),
      ...x.merge,
    };
  }
  const handlers = {
    "psn-state": async () => {
      if (!sessionChecked && client.restore) {
        if (!restoring)
          restoring = client
            .restore()
            .then(() => {
              sessionChecked = true;
            })
            .finally(() => {
              restoring = null;
            });
        await restoring;
      }
      return client.state();
    },
    "psn-connect": async (npsso) => {
      sessionChecked = true;
      snapshots.clear();
      return client.connect(npsso);
    },
    "psn-disconnect": async () => {
      sessionChecked = true;
      await client.disconnect();
      snapshots.clear();
      return client.state();
    },
    "psn-titles": () => client.listTitles(),
    "psn-download": async (key) =>
      remember(await client.download(key), "authenticated-psn-session"),
    "psn-import": async () => {
      const d = await dialog.showOpenDialog(win(), {
        title: "Open PSN trophy backup",
        properties: ["openFile"],
        filters: [{ name: "PSN backup JSON", extensions: ["json"] }],
      });
      if (d.canceled) return null;
      return remember(
        JSON.parse(
          (await fileBytes(d.filePaths[0], 4 * 1024 * 1024)).toString("utf8"),
        ),
        "imported-psn-json",
      );
    },
    "psn-save": async (key) => {
      const s = snapshot(key),
        d = await dialog.showSaveDialog(win(), {
          title: "Save PSN trophy backup",
          defaultPath: s.value.title.npCommunicationId + ".psn-backup.json",
          filters: [{ name: "PSN backup JSON", extensions: ["json"] }],
        });
      if (d.canceled) return null;
      await fs.writeFile(d.filePath, JSON.stringify(s.value, null, 2), {
        flag: "wx",
      });
      return d.filePath;
    },
    "psn-merge-preview": preview,
    "psn-merge-export": async (key, snapshotKey, datePolicy) => {
      const item = prepare(key, snapshotKey, datePolicy);
      if (
        !item.result.merge.added.length &&
        !item.result.merge.datesUpdated.length
      )
        throw Error("No PSN trophies or dates to update");
      const d = await dialog.showOpenDialog(win(), {
        title: "Choose a folder for the merged DAT",
        properties: ["openDirectory"],
      });
      if (d.canceled) return null;
      const exported = await batch.exportPrepared([item], d.filePaths[0]);
      return {
        ...exported,
        path: path.join(
          exported.path,
          ...batch.relativePath(item.result.after).split("/"),
        ),
        merge: item.result.merge,
      };
    },
    "psn-open-auth": async (kind) => {
      const urls = {
        login: "https://www.playstation.com/",
        token: "https://ca.account.sony.com/api/v1/ssocookie",
      };
      if (!Object.hasOwn(urls, kind))
        throw Error("Invalid authentication link");
      await shell.openExternal(urls[kind]);
      return true;
    },
  };
  for (const [name, fn] of Object.entries(handlers))
    ipcMain.handle(name, (e, ...args) => {
      sender(e);
      return fn(...args);
    });
  return {
    close: async () => {
      if (client.shutdown) await client.shutdown();
      else await client.disconnect();
      snapshots.clear();
    },
  };
}
module.exports = { installPsnHandlers };

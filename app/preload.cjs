const { contextBridge, ipcRenderer, webUtils } = require("electron");
contextBridge.exposeInMainWorld("kik", {
  lastIdentity: () => ipcRenderer.invoke("last-identity"),
  rememberIdentity: (t) => ipcRenderer.invoke("remember-identity", t),
  psnState: () => ipcRenderer.invoke("psn-state"),
  psnConnect: (npsso) => ipcRenderer.invoke("psn-connect", npsso),
  psnDisconnect: () => ipcRenderer.invoke("psn-disconnect"),
  psnTitles: () => ipcRenderer.invoke("psn-titles"),
  psnDownload: (key) => ipcRenderer.invoke("psn-download", key),
  psnImport: () => ipcRenderer.invoke("psn-import"),
  psnSave: (key) => ipcRenderer.invoke("psn-save", key),
  psnMergePreview: (key, snapshot) =>
    ipcRenderer.invoke("psn-merge-preview", key, snapshot),
  psnMergeExport: (key, snapshot) =>
    ipcRenderer.invoke("psn-merge-export", key, snapshot),
  psnOpenAuth: (kind) => ipcRenderer.invoke("psn-open-auth", kind),
  onPsnProgress: (callback) => {
    const handler = (_e, data) => callback(data);
    ipcRenderer.on("psn-progress", handler);
    return () => ipcRenderer.removeListener("psn-progress", handler);
  },
  setLanguage: (lang) => ipcRenderer.invoke("language", lang),
  batchPreview: (keys, t) => ipcRenderer.invoke("batch-preview", keys, t),
  batchExport: (keys, t) => ipcRenderer.invoke("batch-export", keys, t),
  importFiles: (kind) => ipcRenderer.invoke("import", kind),
  dropFiles: (files) =>
    ipcRenderer.invoke(
      "drop",
      files.map((f) => webUtils.getPathForFile(f)),
    ),
  identity: () => ipcRenderer.invoke("identity"),
  preview: (key, target) => ipcRenderer.invoke("preview", key, target),
  export: (key, target) => ipcRenderer.invoke("export", key, target),
  report: (key) => ipcRenderer.invoke("report", key),
  clear: () => ipcRenderer.invoke("clear"),
});

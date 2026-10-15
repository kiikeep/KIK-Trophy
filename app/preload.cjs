const { contextBridge, ipcRenderer, webUtils } = require("electron");
contextBridge.exposeInMainWorld("kik", {
  lastIdentity: () => ipcRenderer.invoke("last-identity"),
  rememberIdentity: (t) => ipcRenderer.invoke("remember-identity", t),
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

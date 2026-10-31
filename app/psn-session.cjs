"use strict";
const fs = require("node:fs/promises"),
  path = require("node:path");
const { PsnError } = require("./psn-http.cjs");
function sessionValue(value) {
  if (
    !value ||
    value.version !== 1 ||
    typeof value.refreshToken !== "string" ||
    value.refreshToken.length < 8 ||
    value.refreshToken.length > 8192
  )
    throw new PsnError("PSN_SESSION_LOAD_FAILED");
  return { version: 1, refreshToken: value.refreshToken };
}
function createSessionStore({
  directory,
  safeStorage,
  platform = process.platform,
}) {
  let pending = Promise.resolve();
  const dir = () => (typeof directory === "function" ? directory() : directory);
  const file = () => path.join(dir(), "psn-session.bin");
  function encryption() {
    if (
      !safeStorage?.isEncryptionAvailable() ||
      (platform === "linux" &&
        safeStorage.getSelectedStorageBackend?.() === "basic_text")
    )
      throw new PsnError("PSN_SESSION_STORAGE_UNAVAILABLE");
  }
  function queue(fn) {
    const result = pending.then(fn);
    pending = result.catch(() => {});
    return result;
  }
  return {
    load() {
      return queue(async () => {
        let data;
        try {
          const stat = await fs.stat(file());
          if (!stat.isFile() || stat.size > 16384)
            throw new PsnError("PSN_SESSION_LOAD_FAILED");
          data = await fs.readFile(file());
        } catch (e) {
          if (e.code === "ENOENT") return null;
          throw new PsnError("PSN_SESSION_LOAD_FAILED");
        }
        encryption();
        try {
          return sessionValue(JSON.parse(safeStorage.decryptString(data)));
        } catch {
          await fs.rm(file(), { force: true }).catch(() => {});
          throw new PsnError("PSN_SESSION_LOAD_FAILED");
        }
      });
    },
    save(input) {
      return queue(async () => {
        encryption();
        const value = sessionValue({
          version: 1,
          refreshToken: input?.refreshToken,
        });
        const encrypted = safeStorage.encryptString(JSON.stringify(value));
        if (
          !Buffer.isBuffer(encrypted) ||
          encrypted.length === 0 ||
          encrypted.length > 16384
        )
          throw new PsnError("PSN_SESSION_SAVE_FAILED");
        await fs.mkdir(dir(), { recursive: true });
        const staging = await fs.mkdtemp(path.join(dir(), ".kik-psn-"));
        try {
          const temp = path.join(staging, "session"),
            h = await fs.open(temp, "wx", 0o600);
          try {
            await h.writeFile(encrypted);
            await h.sync();
          } finally {
            await h.close();
          }
          await fs.rename(temp, file());
        } finally {
          await fs.rm(staging, { recursive: true, force: true });
        }
      });
    },
    clear() {
      return queue(() => fs.rm(file(), { force: true }));
    },
    flush() {
      return pending;
    },
  };
}
module.exports = { createSessionStore };

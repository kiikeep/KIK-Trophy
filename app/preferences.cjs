"use strict";
const fs = require("node:fs/promises"),
  path = require("node:path"),
  core = require("./core.cjs");
function normalizeIdentity(t) {
  if (
    !t ||
    typeof t.uid !== "string" ||
    typeof t.account !== "string" ||
    t.uid.length > 64 ||
    t.account.length > 64
  )
    return null;
  const uid = t.uid.trim().toLowerCase(),
    account = t.account.trim();
  if ((!uid && !account) || (uid && !/^[0-9a-f]{8}$/.test(uid))) return null;
  if (account) {
    try {
      core.parseAccount(account);
    } catch {
      return null;
    }
  }
  return {
    uid,
    account: /^[0-9a-fA-F]{16}$/.test(account)
      ? account.toLowerCase()
      : account,
  };
}
function createStore(directory) {
  let pending = Promise.resolve();
  const dir = () => (typeof directory === "function" ? directory() : directory);
  async function read() {
    try {
      const file = path.join(dir(), "preferences.json"),
        stat = await fs.stat(file);
      if (!stat.isFile() || stat.size > 4096) return null;
      return normalizeIdentity(
        JSON.parse(await fs.readFile(file, "utf8")).lastIdentity,
      );
    } catch {
      return null;
    }
  }
  return {
    async get() {
      await pending;
      return read();
    },
    flush() {
      return pending;
    },
    save(input) {
      const value = normalizeIdentity(input);
      if (!value) return Promise.resolve(null);
      const operation = pending.then(async () => {
        await fs.mkdir(dir(), { recursive: true });
        const staging = await fs.mkdtemp(path.join(dir(), ".kik-prefs-"));
        try {
          const temp = path.join(staging, "preferences.json"),
            h = await fs.open(temp, "wx", 0o600);
          try {
            await h.writeFile(
              JSON.stringify({ version: "1.0", lastIdentity: value }, null, 2),
            );
            await h.sync();
          } finally {
            await h.close();
          }
          await fs.rename(temp, path.join(dir(), "preferences.json"));
          return value;
        } finally {
          await fs.rm(staging, { recursive: true, force: true });
        }
      });
      pending = operation.catch(() => {});
      return operation;
    },
  };
}
module.exports = { normalizeIdentity, createStore };

"use strict";
const { AsyncLocalStorage } = require("node:async_hooks");
const storage = new AsyncLocalStorage(),
  nativeFetch = globalThis.fetch;
const hosts = new Set([
  "ca.account.sony.com",
  "m.np.playstation.com",
  "us-prof.np.community.playstation.net",
]);
class PsnError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
function withPsnHttp(fn, options = {}) {
  return storage.run(options, fn);
}
async function psnFetch(input, init = {}) {
  const url = new URL(typeof input === "string" ? input : input.url);
  if (
    url.protocol !== "https:" ||
    !hosts.has(url.hostname) ||
    url.username ||
    url.password
  )
    throw new PsnError("PSN_INVALID_HOST");
  const method = (init.method || "GET").toUpperCase();
  if (
    method !== "GET" &&
    !(
      method === "POST" &&
      url.hostname === "ca.account.sony.com" &&
      url.pathname === "/api/authz/v3/oauth/token"
    )
  )
    throw new PsnError("PSN_INVALID_METHOD");
  const ctx = storage.getStore() || {},
    signal = AbortSignal.any(
      [
        AbortSignal.timeout(ctx.timeoutMs || 20000),
        ctx.signal,
        init.signal,
      ].filter(Boolean),
    );
  try {
    const response = await (ctx.fetchImpl || nativeFetch)(input, {
      ...init,
      redirect: "manual",
      signal,
    });
    if (response.status >= 400) {
      await response.body?.cancel();
      throw new PsnError(
        {
          401: "PSN_SESSION_EXPIRED",
          403: "PSN_PRIVATE",
          404: "PSN_NOT_FOUND",
          429: "PSN_RATE_LIMIT",
        }[response.status] || "PSN_REQUEST_FAILED",
      );
    }
    if (response.status >= 300) return response;
    const chunks = [];
    let size = 0;
    const reader = response.body?.getReader();
    if (reader) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 4 * 1024 * 1024) {
            await reader.cancel();
            throw new PsnError("PSN_RESPONSE_TOO_LARGE");
          }
          chunks.push(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
    }
    return new Response(chunks.length ? Buffer.concat(chunks) : null, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    if (error instanceof PsnError) throw error;
    if (signal.aborted)
      throw new PsnError(ctx.signal?.aborted ? "PSN_CANCELLED" : "PSN_TIMEOUT");
    throw new PsnError("PSN_REQUEST_FAILED");
  }
}
module.exports = { PsnError, withPsnHttp, psnFetch };

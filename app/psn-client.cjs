"use strict";
const { PsnError, withPsnHttp } = require("./psn-http.cjs"),
  { fromResponses } = require("./psn-backup.cjs"),
  { accountHex } = require("./psn-merge.cjs");
function createPsnClient({
  api,
  fetchImpl,
  now = () => Date.now(),
  onProgress = () => {},
  timeoutMs,
} = {}) {
  let tokens = null,
    profile = null,
    titles = new Map(),
    busy = false,
    epoch = 0,
    controller = null;
  function library() {
    if (!api) api = require("./vendor/psn-api.cjs");
    return api;
  }
  async function exclusive(fn) {
    if (busy) throw new PsnError("PSN_BUSY");
    busy = true;
    const current = epoch;
    controller = new AbortController();
    try {
      return await withPsnHttp(
        async () => {
          const value = await fn();
          if (current !== epoch) throw new PsnError("PSN_CANCELLED");
          return value;
        },
        { fetchImpl, signal: controller.signal, timeoutMs },
      );
    } catch (e) {
      if (["PSN_SESSION_EXPIRED", "PSN_AUTH_FAILED"].includes(e.code)) {
        tokens = null;
        profile = null;
        titles.clear();
      }
      if (e instanceof PsnError) throw e;
      throw new PsnError("PSN_REQUEST_FAILED");
    } finally {
      if (current !== epoch) {
        tokens = null;
        profile = null;
        titles.clear();
      }
      busy = false;
      controller = null;
    }
  }
  function validateTokens(t) {
    if (
      !t ||
      typeof t.accessToken !== "string" ||
      t.accessToken.length < 8 ||
      typeof t.refreshToken !== "string" ||
      !Number.isFinite(t.expiresIn) ||
      t.expiresIn <= 0
    )
      throw new PsnError("PSN_AUTH_FAILED");
    return {
      accessToken: t.accessToken,
      refreshToken: t.refreshToken,
      expiresAt: now() + t.expiresIn * 1000,
    };
  }
  async function authorization() {
    if (!tokens) throw new PsnError("PSN_NOT_CONNECTED");
    if (tokens.expiresAt < now() + 60000)
      tokens = validateTokens(
        await library().exchangeRefreshTokenForAuthTokens(tokens.refreshToken),
      );
    return { accessToken: tokens.accessToken };
  }
  async function pageAll(fn, field, options = {}) {
    const all = [],
      seen = new Set();
    let offset = 0,
      expected = null,
      setVersion = null;
    for (let page = 0; page < 100; page++) {
      const data = await fn(await authorization(), {
        ...options,
        limit: 100,
        offset,
      });
      if (!Array.isArray(data?.[field]))
        throw new PsnError("PSN_INVALID_RESPONSE");
      if (data.trophySetVersion) {
        if (setVersion && setVersion !== data.trophySetVersion)
          throw new PsnError("PSN_CHANGED_DURING_DOWNLOAD");
        setVersion = data.trophySetVersion;
      }
      if (data.totalItemCount != null) {
        if (
          !Number.isInteger(data.totalItemCount) ||
          data.totalItemCount < 0 ||
          data.totalItemCount > 10000
        )
          throw new PsnError("PSN_INVALID_RESPONSE");
        if (expected != null && expected !== data.totalItemCount)
          throw new PsnError("PSN_CHANGED_DURING_DOWNLOAD");
        expected = data.totalItemCount;
      }
      for (const t of data[field]) {
        const id =
          field === "trophies"
            ? t.trophyId
            : t.npCommunicationId + ":" + t.npServiceName;
        if (seen.has(id)) throw new PsnError("PSN_INVALID_RESPONSE");
        seen.add(id);
        all.push(t);
      }
      onProgress({ phase: field, count: all.length });
      if (data.nextOffset != null) {
        if (
          !Number.isInteger(data.nextOffset) ||
          data.nextOffset <= offset ||
          data[field].length === 0
        )
          throw new PsnError("PSN_INVALID_RESPONSE");
        offset = data.nextOffset;
        continue;
      }
      if (expected == null || all.length >= expected) {
        if (expected != null && all.length !== expected)
          throw new PsnError("PSN_INVALID_RESPONSE");
        return { trophies: all, trophySetVersion: setVersion };
      }
      if (!data[field].length) throw new PsnError("PSN_INVALID_RESPONSE");
      offset += data[field].length;
    }
    throw new PsnError("PSN_TOO_MANY_RESULTS");
  }
  return {
    state() {
      return {
        connected: !!tokens,
        profile: profile ? structuredClone(profile) : null,
        titles: [...titles.values()].map((t) => ({ ...t })),
      };
    },
    disconnect() {
      epoch++;
      controller?.abort();
      tokens = null;
      profile = null;
      titles.clear();
    },
    connect(npsso) {
      return exclusive(async () => {
        if (typeof npsso !== "string" || !/^[A-Za-z0-9_+\/=-]{64}$/.test(npsso))
          throw new PsnError("PSN_INVALID_NPSSO");
        tokens = null;
        profile = null;
        titles.clear();
        try {
          const code = await library().exchangeNpssoForAccessCode(npsso);
          tokens = validateTokens(
            await library().exchangeAccessCodeForAuthTokens(code),
          );
          const summary = await library().getUserTrophyProfileSummary(
            await authorization(),
            "me",
          );
          accountHex(summary.accountId);
          let onlineId = "";
          try {
            const p = await library().getProfileFromAccountId(
              await authorization(),
              summary.accountId,
            );
            onlineId = p?.profile?.onlineId || p?.onlineId || "";
          } catch (e) {
            if (
              ["PSN_CANCELLED", "PSN_TIMEOUT", "PSN_SESSION_EXPIRED"].includes(
                e.code,
              )
            )
              throw e;
          }
          profile = {
            accountId: summary.accountId,
            accountHex: accountHex(summary.accountId),
            onlineId: typeof onlineId === "string" ? onlineId.slice(0, 64) : "",
            level: summary.trophyLevel,
            earnedTrophies: Object.fromEntries(
              ["platinum", "gold", "silver", "bronze"].map((k) => [
                k,
                Number.isSafeInteger(summary.earnedTrophies?.[k])
                  ? summary.earnedTrophies[k]
                  : 0,
              ]),
            ),
          };
          return this.state();
        } catch (e) {
          tokens = null;
          profile = null;
          titles.clear();
          throw e;
        }
      });
    },
    listTitles() {
      return exclusive(async () => {
        if (!profile) throw new PsnError("PSN_NOT_CONNECTED");
        const response = await pageAll(
          (a, o) => library().getUserTitles(a, "me", o),
          "trophyTitles",
        );
        const next = new Map();
        for (const t of response.trophies) {
          if (!/^NPWR\d{5}_\d{2}$/.test(t.npCommunicationId))
            throw new PsnError("PSN_INVALID_RESPONSE");
          const service =
            t.npServiceName ||
            (t.trophyTitlePlatform === "PS5" ? "trophy2" : "trophy");
          if (!["trophy", "trophy2"].includes(service))
            throw new PsnError("PSN_INVALID_RESPONSE");
          const key = service + ":" + t.npCommunicationId;
          next.set(key, {
            key,
            npCommunicationId: t.npCommunicationId,
            npServiceName: service,
            name: String(t.trophyTitleName || t.npCommunicationId).slice(
              0,
              1000,
            ),
            platform: String(t.trophyTitlePlatform || ""),
            progress: Number(t.progress) || 0,
            earnedTrophies: t.earnedTrophies,
          });
        }
        titles = next;
        return this.state();
      });
    },
    download(key) {
      return exclusive(async () => {
        const title = titles.get(key);
        if (!title || !profile) throw new PsnError("PSN_SELECT_TITLE");
        const options = { npServiceName: title.npServiceName };
        const meta = await pageAll(
          (a, o) =>
            library().getTitleTrophies(a, title.npCommunicationId, "all", o),
          "trophies",
          options,
        );
        const earnings = await pageAll(
          (a, o) =>
            library().getUserTrophiesEarnedForTitle(
              a,
              "me",
              title.npCommunicationId,
              "all",
              o,
            ),
          "trophies",
          options,
        );
        return fromResponses(
          profile,
          title,
          meta,
          earnings,
          new Date(now()).toISOString(),
        );
      });
    },
  };
}
module.exports = { createPsnClient };

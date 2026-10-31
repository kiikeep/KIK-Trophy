"use strict";
(() => {
  const $ = (id) => document.getElementById(id),
    L = (en) => window.PSN_I18N.text(en),
    node = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text !== undefined) n.textContent = text;
      return n;
    };
  let state = { connected: false, profile: null, titles: [] },
    snapshot = null,
    plan = null,
    running = false,
    revision = 0;
  function message(text, error = false) {
    window.KIK_APP.notify(text, error);
  }
  function updateLabels() {
    for (const el of document.querySelectorAll("[data-psn-text]"))
      el.textContent = L(el.dataset.psnText);
    const badge = document.querySelector(".offline");
    if (badge) {
      const dot = document.createElement("i");
      badge.replaceChildren(
        dot,
        document.createTextNode(" " + L("Backups & PSN")),
      );
    }
    if (state.profile) renderProfile();
    renderTitles();
    localOptions();
    if (snapshot) renderSnapshot();
    if (plan) renderPlan();
  }
  function errorMessage(error) {
    const raw = String(error?.message || error).replace(
      /^Error invoking remote method '[^']+': Error: /,
      "",
    );
    return L(raw) || raw;
  }
  function controls() {
    for (const b of $("psnPanel").querySelectorAll("button"))
      b.disabled = running;
    bypass("psnClose", false);
    bypass("psnDisconnect", !state.connected);
    $("psnConnect").disabled = running || state.connected;
    $("psnRefresh").disabled = running || !state.connected;
    $("psnSave").disabled = running || !snapshot;
    $("psnCompare").disabled = running || !snapshot || !$("psnLocal").value;
    $("psnLocal").disabled = running;
    $("psnDatePolicy").disabled = running;
    $("psnExport").disabled =
      running || !plan || !(plan.added.length || plan.datesUpdated?.length);
  }
  function bypass(id, disabled) {
    $(id).disabled = disabled;
  }
  async function task(fn) {
    if (running) return;
    running = true;
    controls();
    $("psnError").classList.add("hidden");
    try {
      await fn();
    } catch (e) {
      $("psnError").textContent = errorMessage(e);
      $("psnError").classList.remove("hidden");
    } finally {
      running = false;
      controls();
    }
  }
  function renderProfile() {
    const p = state.profile;
    $("psnCredentials").classList.toggle("hidden", state.connected);
    $("psnProfile").classList.toggle("hidden", !state.connected);
    const notice = $("psnSessionNotice");
    notice.classList.toggle(
      "hidden",
      !state.sessionWarning && !(state.connected && state.sessionRemembered),
    );
    notice.textContent = state.sessionWarning
      ? L(state.sessionWarning)
      : L("Session saved on this computer. Disconnect to forget it.");
    if (!p) return;
    const counts = p.earnedTrophies || {};
    $("psnProfileName").textContent = p.onlineId || p.accountHex;
    $("psnProfileCounts").textContent = [
      L("Level") + " " + (p.level || "—"),
      "P " + (counts.platinum || 0),
      "G " + (counts.gold || 0),
      "S " + (counts.silver || 0),
      "B " + (counts.bronze || 0),
    ].join(" · ");
    $("psnProfileId").textContent = "Account ID: " + p.accountHex;
  }
  function localOptions() {
    const old = $("psnLocal").value,
      backups = window.KIK_APP.backups();
    $("psnLocal").replaceChildren(
      node("option", null, L("Select a local DAT")),
    );
    $("psnLocal").firstChild.value = "";
    for (const r of backups) {
      const o = node("option", null, `${r.title} · ${r.npwr} · ${r.uid}`);
      o.value = r.key;
      $("psnLocal").append(o);
    }
    const selected = backups.some((r) => r.key === old)
      ? old
      : window.KIK_APP.currentKey();
    if (selected) $("psnLocal").value = selected;
  }
  function renderTitles() {
    const q = $("psnSearch").value.toLocaleLowerCase(),
      container = $("psnTitles");
    container.replaceChildren();
    const titles = (state.titles || []).filter((t) =>
      `${t.name} ${t.npCommunicationId}`.toLocaleLowerCase().includes(q),
    );
    $("psnTitleCount").textContent = String(titles.length);
    for (const t of titles) {
      const row = node("div", "psnTitle"),
        info = node("div");
      info.append(
        node("strong", null, t.name),
        node(
          "small",
          null,
          `${t.platform} · ${t.npCommunicationId} · ${t.progress}%`,
        ),
      );
      const button = node("button", null, L("Download"));
      button.disabled = running;
      button.onclick = () =>
        task(async () => {
          const r = ++revision;
          const next = await window.kik.psnDownload(t.key);
          if (r !== revision) return;
          snapshot = next;
          plan = null;
          renderSnapshot();
          controls();
        });
      row.append(info, button);
      container.append(row);
    }
    if (!titles.length)
      container.append(
        node(
          "p",
          "psnEmpty",
          L(
            state.connected
              ? "Load your games to begin."
              : "Connect to PSN or open a saved PSN JSON.",
          ),
        ),
      );
  }
  function renderSnapshot() {
    const panel = $("psnSnapshot");
    panel.classList.toggle("hidden", !snapshot);
    if (!snapshot) return;
    const s = snapshot;
    $("psnSnapshotTitle").textContent = s.title.name;
    $("psnSnapshotMeta").textContent =
      `${s.title.npCommunicationId} · ${s.title.platform} · ${s.trophies.filter((t) => t.earned).length}/${s.trophies.length} · ${s.account.onlineId || s.account.accountHex}`;
    const rows = $("psnTrophyRows");
    rows.replaceChildren();
    for (const t of s.trophies) {
      const row = node("tr");
      row.append(
        node("td", null, String(t.id)),
        node("td", null, t.name || "—"),
        node("td", null, t.earned ? L("Unlocked") : L("Locked")),
        node(
          "td",
          null,
          t.earnedDateTime
            ? new Date(t.earnedDateTime).toLocaleString(
                window.KIK_LANGUAGES[window.I18N.lang].locale,
              )
            : "—",
        ),
      );
      rows.append(row);
    }
    $("psnPlan").classList.toggle("hidden", !plan);
  }
  function clearPlan() {
    plan = null;
    $("psnPlan").classList.add("hidden");
    controls();
  }
  $("openPsn").onclick = async () => {
    $("psnPanel").showModal();
    localOptions();
    updateLabels();
    controls();
    await task(async () => {
      $("psnProgress").textContent = L("Restoring saved session…");
      try {
        state = await window.kik.psnState();
        renderProfile();
        renderTitles();
        if (state.connected && !state.titles.length) {
          state = await window.kik.psnTitles();
          renderProfile();
          renderTitles();
        }
      } finally {
        $("psnProgress").textContent = "";
      }
    });
  };
  $("psnClose").onclick = () => {
    $("psnNpsso").value = "";
    $("psnPanel").close();
  };
  $("psnPanel").addEventListener("close", () => {
    $("psnNpsso").value = "";
  });
  $("psnLoginLink").onclick = () =>
    window.kik
      .psnOpenAuth("login")
      .catch((e) => message(errorMessage(e), true));
  $("psnTokenLink").onclick = () =>
    window.kik
      .psnOpenAuth("token")
      .catch((e) => message(errorMessage(e), true));
  $("psnConnect").onclick = () =>
    task(async () => {
      let value = $("psnNpsso").value.trim();
      $("psnNpsso").value = "";
      if (value.startsWith("{")) {
        try {
          value = JSON.parse(value).npsso;
        } catch {
          throw Error("PSN_INVALID_NPSSO");
        }
      }
      snapshot = null;
      plan = null;
      renderSnapshot();
      state = await window.kik.psnConnect(value);
      renderProfile();
      state = await window.kik.psnTitles();
      renderTitles();
    });
  $("psnDisconnect").onclick = async () => {
    revision++;
    try {
      state = await window.kik.psnDisconnect();
      snapshot = null;
      plan = null;
      renderProfile();
      renderTitles();
      renderSnapshot();
      controls();
    } catch (e) {
      message(errorMessage(e), true);
    }
  };
  $("psnRefresh").onclick = () =>
    task(async () => {
      state = await window.kik.psnTitles();
      renderTitles();
    });
  $("psnImport").onclick = () =>
    task(async () => {
      const next = await window.kik.psnImport();
      if (!next) return;
      snapshot = next;
      clearPlan();
      renderSnapshot();
    });
  $("psnSave").onclick = () =>
    task(async () => {
      const file = await window.kik.psnSave(snapshot.key);
      if (file) message(L("PSN backup saved") + "\n" + file);
    });
  function renderPlan() {
    const result = plan;
    const box = $("psnPlan");
    box.replaceChildren(
      node("strong", null, L("Merge preview")),
      node(
        "p",
        null,
        `${result.before} → ${result.after} / ${result.total} · ${L("New trophies")}: ${result.added.length}`,
      ),
      node(
        "p",
        null,
        `${L("Different dates kept local")}: ${result.conflictsPreserved.length} · ${L("Dates updated")}: ${result.datesUpdated?.length || 0}`,
      ),
      node(
        "code",
        "restorePath",
        "\\" + result.relativePath.replaceAll("/", "\\"),
      ),
    );
    const list = node("div", "psnChanges");
    for (const t of result.added)
      list.append(
        node("div", null, `${t.id} · ${t.name} · ${t.earnedDateTime}`),
      );
    for (const t of result.datesUpdated || [])
      list.append(
        node(
          "div",
          null,
          `${t.id} · ${t.name} · ${t.localDateTime} → ${t.psnDateTime}`,
        ),
      );
    box.append(list);
    box.classList.remove("hidden");
  }
  $("psnCompare").onclick = () =>
    task(async () => {
      plan = await window.kik.psnMergePreview(
        $("psnLocal").value,
        snapshot.key,
        $("psnDatePolicy").value,
      );
      renderPlan();
    });
  $("psnExport").onclick = () =>
    task(async () => {
      const result = await window.kik.psnMergeExport(
        $("psnLocal").value,
        snapshot.key,
        $("psnDatePolicy").value,
      );
      if (result) message(L("Merged DAT exported") + "\n" + result.path);
    });
  $("psnSearch").oninput = renderTitles;
  $("psnLocal").onchange = clearPlan;
  $("psnDatePolicy").onchange = clearPlan;
  window.kik.onPsnProgress?.((p) => {
    $("psnProgress").textContent =
      p.phase === "session"
        ? L("Restoring saved session…")
        : L("Downloading") + " · " + p.count;
  });
  window.addEventListener("kik-languagechange", updateLabels);
  updateLabels();
  controls();
})();

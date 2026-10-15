"use strict";
let batchMode = false;
let selectedKeys = new Set();
let rememberedTarget = { uid: "", account: "" };
let rememberSerial = 0;
const identityReady = window.kik
  .lastIdentity()
  .then((t) => {
    if (t) rememberedTarget = t;
  })
  .catch(() => {});
const L = (en, es) => window.I18N.text(en, es);
const $ = (id) => document.getElementById(id);
let records = [],
  selected = null,
  busy = false,
  timer,
  previewSerial = 0;
const gradeNames = {
  en: { P: "Platinum", G: "Gold", S: "Silver", B: "Bronze", "?": "No catalog" },
  es: { P: "Platino", G: "Oro", S: "Plata", B: "Bronce", "?": "Sin catálogo" },
};
function icon(name) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    u = document.createElementNS("http://www.w3.org/2000/svg", "use");
  u.setAttribute("href", "#i-" + name);
  s.append(u);
  return s;
}
function node(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function message(text, error = false) {
  $("toast").textContent = window.I18N.error(text);
  $("toast").classList.toggle("error", error);
  $("toast").classList.remove("hidden");
  clearTimeout(timer);
  timer = setTimeout(
    () => $("toast").classList.add("hidden"),
    error ? 14000 : 8000,
  );
}
function errorText(e) {
  return String(e.message || e).replace(
    /^Error invoking remote method '[^']+': Error: /,
    "",
  );
}
async function task(fn) {
  if (busy) return;
  busy = true;
  document.querySelectorAll("button").forEach((b) => (b.disabled = true));
  $("status").textContent = L("Processing files…", "Procesando archivos…");
  try {
    await fn();
  } catch (e) {
    message(errorText(e), true);
  } finally {
    busy = false;
    document.querySelectorAll("button").forEach((b) => (b.disabled = false));
    updateBatchControls();
    $("status").textContent = records.length
      ? L(
          `${records.length} backups loaded · source files preserved`,
          `${records.length} respaldos cargados · archivos originales conservados`,
        )
      : L("Ready to open your backups", "Listo para abrir tus respaldos");
  }
}
function updateImport(result) {
  if (!result) return;
  records = result.records;
  selectedKeys = new Set(
    [...selectedKeys].filter((key) => records.some((r) => r.key === key)),
  );
  if (!selected || !records.some((r) => r.key === selected))
    selected = records[0]?.key || null;
  render();
  const info = [];
  if (result.errors.length) info.push(result.errors.slice(0, 4).join("\n"));
  if (result.warnings.length) info.push(result.warnings.slice(0, 2).join("\n"));
  if (!info.length)
    info.push(
      L(
        `${records.length} backups available. SHA-256 verified.`,
        `${records.length} respaldos disponibles. SHA-256 verificados.`,
      ),
    );
  message(info.join("\n"), result.errors.length > 0);
}
const current = () => records.find((r) => r.key === selected);
function render() {
  $("welcome").classList.toggle("hidden", records.length > 0);
  $("workspace").classList.toggle("hidden", !records.length);
  $("libraryCount").textContent = records.length;
  const list = $("gameList");
  list.replaceChildren();
  for (const r of records) {
    const b = node(
      "button",
      "gameCard" + (r.key === selected ? " selected" : ""),
    );
    const thumb = node("span", "gameThumb");
    if (r.icon) {
      const img = node("img");
      img.src = r.icon;
      img.alt = "";
      thumb.append(img);
    } else thumb.append(icon("trophy"));
    const text = node("div", "gameCardText");
    text.append(
      node("strong", null, r.title),
      node("small", null, r.npwr),
      node("small", "cardCount", `${r.earned} / ${r.total} · ${r.uid}`),
    );
    b.title = r.source;
    b.append(thumb, text);
    b.onclick = () => {
      selected = r.key;
      closeDrawer();
      render();
    };
    const row = node("div", "gameCardRow"),
      check = node("input");
    check.type = "checkbox";
    check.checked = selectedKeys.has(r.key);
    check.setAttribute(
      "aria-label",
      L("Select backup", "Seleccionar respaldo") + " " + r.npwr,
    );
    check.onchange = () => {
      if (check.checked) selectedKeys.add(r.key);
      else selectedKeys.delete(r.key);
      updateBatchControls();
    };
    row.append(check, b);
    list.append(row);
  }
  updateBatchControls();
  const r = current();
  if (!r) return;
  $("gameTitle").textContent = r.title;
  $("gameTitle").title = r.title;
  $("gameNpwr").textContent = r.npwr;
  $("catalogTag").textContent = r.catalog
    ? L("Catalog ", "Catálogo ") + r.catalogVersion
    : L("DAT without catalog", "DAT sin catálogo");
  $("sourcePath").textContent = r.source;
  $("sourcePath").title = r.source;
  $("integrity").textContent = L(
    `Integrity valid · ${r.blocks}/${r.blocks} SHA-256 blocks`,
    `Integridad válida · ${r.blocks}/${r.blocks} bloques SHA-256`,
  );
  $("cover").replaceChildren();
  if (r.icon) {
    const img = node("img");
    img.src = r.icon;
    img.alt = r.title;
    $("cover").append(img);
  } else $("cover").append(icon("trophy"));
  $("earned").textContent = r.earned;
  $("earnedOf").textContent = L(`of ${r.total}`, `de ${r.total}`);
  $("locked").textContent = r.total - r.earned;
  const percent = Math.round((r.earned / r.total) * 100);
  $("percent").textContent = percent + "%";
  $("progress").value = percent;
  $("ownerUid").textContent = r.uid;
  $("ownerAccount").textContent = r.accountHex;
  $("ownerBase64").textContent = r.accountBase64;
  $("trophyCount").textContent = r.total;
  const warns = [...r.warnings];
  if (!r.catalog)
    warns.unshift(
      "Añade el TROPHY.UCP correspondiente para ver nombres, descripciones y categorías. El DAT ya permite leer el progreso y cambiar el propietario.",
    );
  $("warnings").textContent = window.I18N.error(warns.join(" "));
  $("warnings").classList.toggle("hidden", !warns.length);
  renderRows();
  renderFile();
}
function renderRows() {
  const r = current();
  if (!r) return;
  const grades = Object.fromEntries(
    Object.entries(gradeNames.en).map(([key, en]) => [
      key,
      L(en, gradeNames.es[key]),
    ]),
  );
  const q = $("search").value.trim().toLocaleLowerCase(),
    state = $("stateFilter").value,
    grade = $("gradeFilter").value,
    utc = $("timezone").value === "utc";
  const shown = r.trophies.filter(
    (t) =>
      (state === "all" || t.earned === (state === "earned")) &&
      (grade === "all" || t.grade === grade) &&
      (!q ||
        `${t.id} ${t.name} ${t.description}`.toLocaleLowerCase().includes(q)),
  );
  const body = $("trophyRows");
  body.replaceChildren();
  for (const t of shown) {
    const row = node("tr");
    row.append(node("td", "number", String(t.id).padStart(2, "0")));
    const title = node("td"),
      name = node(
        "div",
        "trophyTitle",
        window.I18N.lang === "en"
          ? t.name.replace(/^Trofeo #/, "Trophy #")
          : t.name,
      );
    if (t.hidden)
      name.append(node("span", "hiddenBadge", L("Hidden", "Oculto")));
    const info = node("div", "trophyInfo");
    info.append(
      name,
      node(
        "div",
        "trophyDescription",
        t.description ||
          L(
            "Name and description require the matching catalog",
            "Nombre y descripción no disponibles sin catálogo",
          ),
      ),
    );
    const wrap = node("div", "trophyCell");
    if (t.trophyIcon) {
      const img = node("img", "trophyIcon" + (t.earned ? "" : " lockedIcon"));
      img.src = t.trophyIcon;
      img.alt = "";
      wrap.append(img);
    }
    wrap.append(info);
    title.append(wrap);
    row.append(title);
    const category = node("td"),
      badge = node("span", "grade " + t.grade);
    badge.append(
      icon("trophy"),
      document.createTextNode(grades[t.grade] || "—"),
    );
    category.append(badge);
    row.append(category);
    const status = node("td");
    status.append(
      node(
        "span",
        "state" + (t.earned ? " earned" : ""),
        t.earned ? L("✓ Unlocked", "✓ Desbloqueado") : L("Locked", "Pendiente"),
      ),
    );
    row.append(status);
    const date = node("td", "date");
    if (t.earned && t.unlockedAt) {
      const d = new Date(t.unlockedAt),
        opts = utc ? { timeZone: "UTC" } : {};
      date.append(
        document.createTextNode(
          d.toLocaleDateString(window.KIK_LANGUAGES[window.I18N.lang].locale, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            ...opts,
          }),
        ),
        node(
          "small",
          null,
          d.toLocaleTimeString(window.KIK_LANGUAGES[window.I18N.lang].locale, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            ...opts,
          }),
        ),
      );
      date.title = t.unlockedAt + " · timestamp original: " + t.ticks;
    } else date.textContent = t.earned ? L("No timestamp", "Sin fecha") : "—";
    row.append(date);
    body.append(row);
  }
  $("visibleCount").textContent = L(
    `${shown.length} of ${r.total} trophies`,
    `${shown.length} de ${r.total} trofeos`,
  );
  $("zoneLabel").textContent = utc
    ? L("Timestamps in UTC", "Fechas en UTC")
    : L(
        `Local time · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        `Hora local · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      );
  $("noResults").classList.toggle("hidden", shown.length > 0);
}
function renderFile() {
  const r = current();
  if (!r) return;
  const p = $("filePanel");
  p.replaceChildren();
  for (const [label, value] of [
    [L("Source file", "Archivo de origen"), r.source],
    [L("Trophy set", "Conjunto de trofeos"), r.npwr],
    [L("Local user ID", "ID local"), r.uid],
    [L("Account ID · hex", "Account ID · hex"), r.accountHex],
    ["Account ID · Base64", r.accountBase64],
    [
      L("DAT size", "Tamaño del DAT"),
      r.bytes.toLocaleString(window.KIK_LANGUAGES[window.I18N.lang].locale) +
        " bytes",
    ],
    [
      L("SHA-256 blocks", "Bloques SHA-256"),
      L(`${r.blocks} / ${r.blocks} valid`, `${r.blocks} / ${r.blocks} válidos`),
    ],
    [L("File SHA-256", "SHA-256 del archivo"), r.sha256],
    [L("Catalog fingerprint", "Huella del catálogo"), r.catalogHash],
    [L("Catalog language", "Idioma del catálogo"), r.language],
    [L("Format", "Formato"), "T2PD v1 / T2TD v1"],
  ]) {
    const row = node("div", "fileRow");
    row.append(node("span", null, label), node("code", null, value));
    p.append(row);
  }
  p.append(
    node(
      "p",
      "fileNote",
      L(
        "The 8-character local user ID and the 8-byte Account ID are different fields. Base64 uses the reverse byte order of the hexadecimal Account ID shown.",
        "El ID local de 8 caracteres y el Account ID de 8 bytes son campos distintos. La representación Base64 del Account ID invierte el orden de sus bytes respecto al hexadecimal mostrado.",
      ),
    ),
  );
}
function tabs(file) {
  $("filePanel").classList.toggle("hidden", !file);
  $("trophiesPanel").classList.toggle("hidden", file);
  $("tabFile").classList.toggle("selected", file);
  $("tabTrophies").classList.toggle("selected", !file);
}
function closeDrawer() {
  previewSerial++;
  $("drawer").classList.add("hidden");
  $("drawerBackdrop").classList.add("hidden");
}
async function openDrawer(wantBatch = false) {
  await identityReady;
  try {
    const saved = await window.kik.lastIdentity();
    if (saved) rememberedTarget = saved;
  } catch {}
  batchMode = wantBatch;
  if (batchMode && !selectedKeys.size) {
    message(
      L("Select at least one backup", "Selecciona al menos un respaldo"),
      true,
    );
    return;
  }
  $("drawer").classList.toggle("batchMode", batchMode);
  const r = current();
  if (!r) return;
  $("drawerTitle").textContent = batchMode
    ? L(
        `${selectedKeys.size} backups selected`,
        `${selectedKeys.size} respaldos seleccionados`,
      )
    : r.title;
  $("drawerSummary").textContent = L(
    `${r.earned} unlocked trophies · timestamps preserved`,
    `${r.earned} trofeos desbloqueados · fechas conservadas`,
  );
  if (batchMode)
    $("drawerSummary").textContent = L(
      "Original files and timestamps stay unchanged",
      "Los originales y sus fechas se conservan",
    );
  const exportButton = $("exportDat");
  for (const n of [...exportButton.childNodes])
    if (n.nodeType === Node.TEXT_NODE) n.remove();
  exportButton.append(
    document.createTextNode(
      batchMode
        ? L("Verify & export batch", "Verificar y exportar lote")
        : L("Verify & export DAT", "Verificar y exportar DAT"),
    ),
  );
  $("drawer").classList.remove("hidden");
  $("drawerBackdrop").classList.remove("hidden");
  $("targetUid").value = rememberedTarget.uid;
  $("targetAccount").value = rememberedTarget.account;
  $("changePreview").classList.add("hidden");
  $("drawerError").classList.add("hidden");
  $("targetUid").focus();
  if (rememberedTarget.uid || rememberedTarget.account) preview();
}
function target() {
  return {
    uid: $("targetUid").value.trim(),
    account: $("targetAccount").value.trim(),
  };
}
async function rememberTarget(t = target()) {
  const serial = ++rememberSerial;
  try {
    const saved = await window.kik.rememberIdentity(t);
    if (saved && serial === rememberSerial) rememberedTarget = saved;
  } catch (e) {
    message(
      L(
        "The last IDs could not be remembered.",
        "No se pudieron recordar los últimos IDs.",
      ) +
        "\n" +
        errorText(e),
      true,
    );
  }
}
function exportedIdentity(result) {
  if (result.lastIdentity) rememberedTarget = result.lastIdentity;
  if (result.rememberError)
    message(
      L(
        "The last IDs could not be remembered.",
        "No se pudieron recordar los últimos IDs.",
      ) +
        "\n" +
        result.rememberError,
      true,
    );
}
let debounce;
async function preview() {
  const seq = ++previewSerial;
  const r = current();
  if (!r) return;
  $("drawerError").classList.add("hidden");
  $("changePreview").classList.add("hidden");
  const t = target();
  if (!t.uid && !t.account) return;
  try {
    if (batchMode) {
      const result = await window.kik.batchPreview([...selectedKeys], t);
      if (seq !== previewSerial) return;
      const p = $("changePreview"),
        list = node("div", "batchPreviewList");
      for (const item of result.items)
        list.append(
          node(
            "div",
            null,
            `${item.npwr}: ${item.before.uid} → ${item.after.uid}\n\\${item.relativePath.replaceAll("/", "\\")}`,
          ),
        );
      p.replaceChildren(
        node("strong", null, L("Batch verified", "Lote verificado")),
        node(
          "div",
          null,
          L(
            `${result.count} files · ${result.blocks} verified blocks`,
            `${result.count} archivos · ${result.blocks} bloques verificados`,
          ),
        ),
        list,
      );
      p.classList.remove("hidden");
      return;
    }
    const result = await window.kik.preview(r.key, t);
    if (seq !== previewSerial) return;
    const p = $("changePreview");
    p.replaceChildren(
      node("strong", null, L("Change verified", "Cambio verificado")),
      node(
        "div",
        null,
        L(
          `Local user ID: ${result.before.uid} → ${result.after.uid}`,
          `ID local: ${result.before.uid} → ${result.after.uid}`,
        ),
      ),
      node("div", null, `Account ID: ${result.after.account}`),
      node(
        "code",
        "restorePath",
        "\\" + result.relativePath.replaceAll("/", "\\"),
      ),
      node(
        "div",
        null,
        L(
          `${result.changed} bytes changed · ${result.blocks}/${result.blocks} valid blocks`,
          `${result.changed} bytes cambian · ${result.blocks}/${result.blocks} bloques válidos`,
        ),
      ),
      node(
        "div",
        null,
        L(
          `${result.earned} trophies and their timestamps remain unchanged.`,
          `${result.earned} trofeos y sus fechas permanecen intactos.`,
        ),
      ),
    );
    p.classList.remove("hidden");
  } catch (e) {
    if (seq !== previewSerial) return;
    $("drawerError").textContent = window.I18N.error(errorText(e));
    $("drawerError").classList.remove("hidden");
  }
}
$("openFiles").onclick = () =>
  task(async () => updateImport(await window.kik.importFiles("files")));

$("openFolder").onclick = () =>
  task(async () => updateImport(await window.kik.importFiles("folder")));
$("welcomeOpen").onclick = $("openFolder").onclick;
$("clear").onclick = () =>
  task(async () => {
    await window.kik.clear();
    records = [];
    selectedKeys.clear();
    selected = null;
    closeDrawer();
    render();
  });
$("editOwner").onclick = () => openDrawer(false);
$("batchEdit").onclick = () => openDrawer(true);
$("selectAll").onclick = () => {
  if (selectedKeys.size === records.length) selectedKeys.clear();
  else selectedKeys = new Set(records.map((r) => r.key));
  render();
};
$("closeDrawer").onclick = closeDrawer;
$("drawerBackdrop").onclick = closeDrawer;
$("search").oninput = renderRows;
$("stateFilter").onchange = renderRows;
$("gradeFilter").onchange = renderRows;
$("timezone").onchange = renderRows;
$("tabTrophies").onclick = () => tabs(false);
$("tabFile").onclick = () => tabs(true);
for (const id of ["targetUid", "targetAccount"])
  $(id).oninput = () => {
    rememberTarget();
    clearTimeout(debounce);
    debounce = setTimeout(preview, 220);
  };
$("loadIdentity").onclick = () =>
  task(async () => {
    const d = await window.kik.identity();
    if (!d) return;
    $("targetUid").value = d.uid;
    $("targetAccount").value = d.account;
    await rememberTarget();
    await preview();
    message(
      L("IDs read from TRPTITLE.DAT · ", "IDs tomados de TRPTITLE.DAT · ") +
        d.npwr,
    );
  });
$("exportDat").onclick = () =>
  task(async () => {
    const r = current();
    if (batchMode) {
      await window.kik.batchPreview([...selectedKeys], target());
      const result = await window.kik.batchExport([...selectedKeys], target());
      if (result) {
        closeDrawer();
        message(L("Batch exported:\n", "Lote exportado:\n") + result.path);
        exportedIdentity(result);
      }
      return;
    }
    await window.kik.preview(r.key, target());
    const result = await window.kik.export(r.key, target());
    if (result) {
      closeDrawer();
      message(
        L(
          "Adapted copy verified and saved:\n",
          "Copia adaptada y verificada:\n",
        ) +
          result.path +
          (result.reportError
            ? L(
                "\nThe DAT was saved, but the report could not be created.",
                "\nEl DAT se guardó; no se pudo crear el informe.",
              )
            : ""),
      );
      exportedIdentity(result);
    }
  });
$("exportReport").onclick = () =>
  task(async () => {
    const p = await window.kik.report(current().key);
    if (p) message(L("Details saved:\n", "Detalle guardado:\n") + p);
  });
window.addEventListener("dragover", (e) => {
  e.preventDefault();
  $("dropzone").classList.add("drag");
});
window.addEventListener("dragleave", (e) => {
  if (!e.relatedTarget) $("dropzone").classList.remove("drag");
});
window.addEventListener("drop", (e) => {
  e.preventDefault();
  $("dropzone").classList.remove("drag");
  const files = [...e.dataTransfer.files];
  if (files.length)
    task(async () => updateImport(await window.kik.dropFiles(files)));
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

$("languageToggle").onclick = () =>
  $("languageMenu").classList.toggle("hidden");
for (const button of document.querySelectorAll("[data-lang]"))
  button.onclick = () => switchLanguage(button.dataset.lang);
async function switchLanguage(lang) {
  window.I18N.lang = lang;
  localStorage.setItem("kik-language", lang);
  $("languageMenu").classList.add("hidden");
  window.I18N.apply();
  closeDrawer();
  try {
    const updated = await window.kik.setLanguage(lang);
    if (updated) records = updated;
    render();
    $("status").textContent = records.length
      ? L(
          `${records.length} backups loaded · source files preserved`,
          `${records.length} respaldos cargados · archivos originales conservados`,
        )
      : L("Ready to open your backups", "Listo para abrir tus respaldos");
  } catch (e) {
    message(errorText(e), true);
  }
}
function updateBatchControls() {
  const n = selectedKeys.size;
  $("batchCount").textContent = L(`${n} selected`, `${n} seleccionados`);
  $("selectAll").textContent =
    n === records.length && n
      ? L("Deselect all", "Deseleccionar todos")
      : L("Select all", "Seleccionar todos");
  $("batchEdit").disabled = busy || !n;
}
window.I18N.apply();
$("status").textContent = L(
  "Ready to open your backups",
  "Listo para abrir tus respaldos",
);
window.kik
  .setLanguage(window.I18N.lang)
  .catch((e) => message(errorText(e), true));

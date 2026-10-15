"use strict";
window.I18N = {
  lang: Object.keys(window.KIK_LANGUAGES).includes(
    localStorage.getItem("kik-language"),
  )
    ? localStorage.getItem("kik-language")
    : "en",
  text(en, es) {
    return window.I18N.lang === "es"
      ? es
      : window.KIK_LOCALES.translate(en, window.I18N.lang);
  },
  apply() {
    const L = (en, es) => this.text(en, es),
      set = (selector, en, es) => {
        const e = document.querySelector(selector);
        if (!e) return;
        const nodes = [...e.childNodes].filter(
          (n) => n.nodeType === Node.TEXT_NODE,
        );
        if (nodes.length) {
          nodes[0].textContent = L(en, es);
          nodes.slice(1).forEach((n) => n.remove());
        } else e.append(document.createTextNode(L(en, es)));
      };
    const flag =
      this.lang === "en"
        ? '<svg viewBox="0 0 60 40" aria-hidden="true"><path fill="#24447c" d="M0 0h60v40H0z"/><path stroke="#fff" stroke-width="9" d="m0 0 60 40M60 0 0 40"/><path stroke="#d64855" stroke-width="3" d="m0 0 60 40M60 0 0 40"/><path stroke="#fff" stroke-width="14" d="M30 0v40M0 20h60"/><path stroke="#d64855" stroke-width="8" d="M30 0v40M0 20h60"/></svg>'
        : '<svg viewBox="0 0 60 40" aria-hidden="true"><path fill="#b82d40" d="M0 0h60v40H0z"/><path fill="#f4c858" d="M0 10h60v20H0z"/></svg>';
    const extraFlags = {
      it: '<svg viewBox="0 0 60 40"><path fill="#009246" d="M0 0h20v40H0z"/><path fill="#fff" d="M20 0h20v40H20z"/><path fill="#ce2b37" d="M40 0h20v40H40z"/></svg>',
      fr: '<svg viewBox="0 0 60 40"><path fill="#0055a4" d="M0 0h20v40H0z"/><path fill="#fff" d="M20 0h20v40H20z"/><path fill="#ef4135" d="M40 0h20v40H40z"/></svg>',
      ja: '<svg viewBox="0 0 60 40"><path fill="#fff" d="M0 0h60v40H0z"/><circle cx="30" cy="20" r="12" fill="#bc002d"/></svg>',
      ru: '<svg viewBox="0 0 60 40"><path fill="#fff" d="M0 0h60v14H0z"/><path fill="#0039a6" d="M0 14h60v12H0z"/><path fill="#d52b1e" d="M0 26h60v14H0z"/></svg>',
      "zh-CN":
        '<svg viewBox="0 0 60 40"><path fill="#de2910" d="M0 0h60v40H0z"/><path fill="#ffde00" d="m13 6 2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/></svg>',
    };
    document.documentElement.lang = this.lang;
    document.getElementById("languageFlag").innerHTML =
      extraFlags[this.lang] || flag;
    document.getElementById("languageCode").textContent = {
      fr: "FR",
      ja: "日本語",
      ru: "RU",
      it: "IT",
      en: "EN",
      es: "ES",
      "zh-CN": "中文",
    }[this.lang];
    document.getElementById("languageToggle").title = L("Language", "Idioma");
    const rows = [
      [
        "#rememberHint",
        "Valid destination IDs are remembered on this PC.",
        "Los IDs destino v\u00e1lidos se recuerdan en este PC.",
      ],
      [
        "header h1",
        "PS5 Trophy File Manager",
        "Gestor de archivos de trofeos PS5",
      ],
      [
        "header .subtitle",
        "Inspect backups and export copies for another profile.",
        "Inspecciona respaldos y exporta copias para otro perfil.",
      ],
      [".offline", "Local files only", "Archivos locales"],
      ["#openFolder", "Open folder", "Abrir carpeta"],
      ["#openFiles", "Add files", "Añadir archivos"],
      [
        "#welcomeEyebrow",
        "TRANSFER TROPHIES BETWEEN USERS",
        "TRANSFERIR TROFEOS ENTRE USUARIOS",
      ],
      [
        "#welcomeTitle",
        "Move your trophy history to another user.",
        "Transfiere tu historial de trofeos a otro usuario.",
      ],
      [
        "#welcomeHelp",
        "For a new local user or after a system reinstall. Copy both trophy2 folders from your PS5 into one backup folder or ZIP.",
        "Para un usuario local nuevo o tras reinstalar el sistema. Copia ambas carpetas trophy2 de tu PS5 en una carpeta de respaldo o ZIP.",
      ],
      [
        "#welcomeDropHint",
        "Drop a backup folder or ZIP here, or use Open folder below.",
        "Arrastra una carpeta de respaldo o ZIP aquí, o usa Abrir carpeta abajo.",
      ],
      ["#welcomeOpen", "Open folder", "Abrir carpeta"],
      [
        "#keepPaths",
        "Keep the two folder paths separate inside the backup; do not merge the trophy2 folders.",
        "Conserva las dos rutas separadas dentro del respaldo; no mezcles las carpetas trophy2.",
      ],
      [
        "#guideImport",
        "Open the backup folder or ZIP and select the titles you want to transfer.",
        "Abre la carpeta o ZIP del respaldo y selecciona los títulos que quieres transferir.",
      ],
      [
        "#guideExport",
        "Enter the destination user's IDs and export one title or a batch.",
        "Introduce los IDs del usuario destino y exporta un título o un lote.",
      ],
      [
        "#guideLaunch",
        "On the PS5, open each game at least once with the destination user before restoring its DAT.",
        "En la PS5, abre cada juego al menos una vez con el usuario destino antes de restaurar su DAT.",
      ],
      [
        "#guideRestore",
        "Copy only the exported TRPTITLE.DAT into the matching title folder under /user/home/<USER_ID>/trophy2/.",
        "Copia solo el TRPTITLE.DAT exportado a la carpeta del título correspondiente bajo /user/home/<USER_ID>/trophy2/.",
      ],
      [
        "#restoreNoteText",
        "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.",
        "Solo se modifica TRPTITLE.DAT. Restaurar otros archivos de trofeos no se ha probado; deja que los genere tu consola al iniciar el juego al menos una vez. Guarda una copia del DAT actual antes de reemplazarlo.",
      ],
      ["#selectAll", "Select all", "Seleccionar todos"],
      ["#batchEdit", "Change IDs in batch", "Cambiar IDs en lote"],
      [".backupPaths div:first-child b", "USER DATA", "DATOS DEL USUARIO"],
      [".backupPaths div:last-child b", "CATALOGS", "CATÁLOGOS"],
      [
        ".welcomeCards article:nth-child(1) h3",
        "Trophy details",
        "Detalle de trofeos",
      ],
      [
        ".welcomeCards article:nth-child(1) p",
        "Names, grades, unlock status and original timestamps.",
        "Nombres, categorías, desbloqueos y fechas originales.",
      ],
      [
        ".welcomeCards article:nth-child(2) h3",
        "Owner identity",
        "Identidad del propietario",
      ],
      [
        ".welcomeCards article:nth-child(2) p",
        "Local user ID and Account ID, in hex and Base64.",
        "ID local y Account ID en hexadecimal y Base64.",
      ],
      [
        ".welcomeCards article:nth-child(3) h3",
        "Verified copies",
        "Copias verificadas",
      ],
      [
        ".welcomeCards article:nth-child(3) p",
        "Change the owner and export a new DAT with valid SHA-256 checksums.",
        "Cambia el propietario y exporta un DAT nuevo con SHA-256 válidos.",
      ],
      [".libraryHead>span", "BACKUPS", "RESPALDOS"],
      ["#clear", "Clear library", "Vaciar biblioteca"],
      [
        ".libraryNote p",
        "Files you open remain unchanged.",
        "Los archivos que abres se conservan sin cambios.",
      ],
      ["#editOwner", "Change owner", "Cambiar propietario"],
      [".stats article:nth-child(1)>span", "UNLOCKED", "DESBLOQUEADOS"],
      [".stats article:nth-child(2)>span", "REMAINING", "POR DESCUBRIR"],
      [
        ".stats article:nth-child(2)>small",
        "Locked trophies",
        "Trofeos pendientes",
      ],
      [".progressCard span", "TROPHIES EARNED", "TROFEOS CONSEGUIDOS"],
      [
        ".progressCard small",
        "Percentage by trophy count",
        "Porcentaje por cantidad de trofeos",
      ],
      [".ownerStrip>div:nth-child(1)>span", "LOCAL USER ID", "ID LOCAL"],
      ["#tabTrophies", "Trophies", "Trofeos"],
      ["#tabFile", "File details", "Datos del archivo"],
      ["#exportReport", "Export details", "Exportar detalle"],
      ["th:nth-child(2)", "TROPHY", "TROFEO"],
      ["th:nth-child(3)", "GRADE", "CATEGORÍA"],
      ["th:nth-child(4)", "STATUS", "ESTADO"],
      ["th:nth-child(5)", "UNLOCKED AT", "DESBLOQUEADO"],
      [
        "#noResults",
        "No trophies match your search.",
        "No hay trofeos que coincidan con la búsqueda.",
      ],
      ["#drawer .eyebrow", "CHANGE FILE OWNER", "CAMBIO DE PROPIETARIO"],
      ["#drawer h2", "Change file owner", "Cambiar propietario del archivo"],
      [
        "#drawer>.subtitle",
        "Trophies and timestamps stay intact. Only the owner IDs and the affected block checksum change.",
        "Los trofeos y sus fechas se conservan. Solo cambian los identificadores y el checksum del bloque afectado.",
      ],
      [
        "#loadIdentity",
        "Take IDs from another TRPTITLE.DAT…",
        "Tomar IDs de otro TRPTITLE.DAT…",
      ],
      [".formDivider span", "OR ENTER THEM BELOW", "O ESCRÍBELOS AQUÍ"],
      ['label[for="targetUid"]', "New local user ID", "Nuevo ID local"],
      ['label[for="targetUid"] span', "8 hex characters", "8 caracteres hex"],
      ['label[for="targetAccount"]', "New Account ID", "Nuevo Account ID"],
      ['label[for="targetAccount"] span', "Hex or Base64", "Hex o Base64"],
      [
        ".hint",
        "Leave a field empty to keep its current value. The Base64 representation uses the byte order of your Account ID.",
        "Deja un campo vacío para conservar su valor actual. Base64 usa el orden de bytes de tu Account ID.",
      ],
      [
        ".drawerBottom p",
        "A new file is created. Your original backup stays unchanged.",
        "Se genera un archivo nuevo. Tu respaldo original permanece intacto.",
      ],
      ["#exportDat", "Verify & export DAT", "Verificar y exportar DAT"],
    ];
    for (const r of rows) set(...r);
    document.getElementById("search").placeholder = L(
      "Search trophies…",
      "Buscar un trofeo…",
    );
    document.getElementById("targetUid").placeholder = L(
      "e.g. 1234abcd",
      "Ej. 1234abcd",
    );
    document.getElementById("targetAccount").placeholder = L(
      "16 hex characters or Base64",
      "16 caracteres hex o Base64",
    );
    for (const [id, labels] of [
      [
        "stateFilter",
        [
          ["All statuses", "Todos los estados"],
          ["Unlocked", "Desbloqueados"],
          ["Locked", "Pendientes"],
        ],
      ],
      [
        "gradeFilter",
        [
          ["All grades", "Todas las categorías"],
          ["Platinum", "Platino"],
          ["Gold", "Oro"],
          ["Silver", "Plata"],
          ["Bronze", "Bronce"],
        ],
      ],
      [
        "timezone",
        [
          ["Local time", "Hora local"],
          ["UTC", "UTC"],
        ],
      ],
    ]) {
      const opts = document.getElementById(id).options;
      labels.forEach((v, i) => (opts[i].textContent = L(...v)));
    }
  },
  error(text) {
    if (this.lang === "es")
      return text.replace(
        "Multiple backups target the same file. Select one backup per destination user and title.",
        "Varios respaldos apuntan al mismo archivo. Selecciona uno por cada usuario destino y t\u00edtulo.",
      );
    const pairs = [
      [
        "Elige otra ruta: la app conserva los archivos originales que abriste.",
        "Choose a different path: opened source files are preserved.",
      ],
      [
        "Los identificadores ya coinciden; no hay cambios para exportar",
        "The IDs already match; there are no changes to export",
      ],
      [
        "Escribe al menos un identificador nuevo",
        "Enter at least one new owner ID",
      ],
      [
        "ID local: escribe exactamente 8 caracteres hex",
        "Local user ID: enter exactly 8 hex characters",
      ],
      [
        "Account ID: usa 16 caracteres hex o Base64 de 8 bytes",
        "Account ID: use 16 hex characters or Base64 representing 8 bytes",
      ],
      ["Account ID Base64 inválido", "Invalid Base64 Account ID"],
      [
        "Añade el TROPHY.UCP correspondiente para ver nombres, descripciones y categorías. El DAT ya permite leer el progreso y cambiar el propietario.",
        "Add the matching TROPHY.UCP for trophy names, descriptions and grades. The DAT already provides progress and owner editing.",
      ],
      [
        "El catálogo y el DAT tienen distinto número de trofeos. Revisa la revisión del juego.",
        "The catalog and DAT have different trophy counts. Check the game revision.",
      ],
      ["SHA-256 inválido en el bloque", "Invalid SHA-256 in block"],
      ["SHA-1 interno de UCP inválido", "Invalid internal UCP SHA-1"],
      [
        "No se encontraron archivos de trofeos compatibles.",
        "No compatible trophy files found.",
      ],
      ["DAT idéntico ya cargado:", "Identical DAT already loaded:"],
      ["Selecciona un respaldo", "Select a backup"],
      ["Identificadores inválidos", "Invalid owner IDs"],
      [
        "No es un TRPTITLE.DAT T2PD v1 compatible",
        "Not a compatible T2PD v1 TRPTITLE.DAT",
      ],
      [
        "El DAT debe medir entre 1 KB y 1 MiB",
        "DAT size must be between 1 KB and 1 MiB",
      ],
      ["Tamaño de bloque T2PD inválido", "Invalid T2PD block size"],
      ["Conteo de bloques inconsistente", "Inconsistent block count"],
      ["Estructura T2TD no compatible", "Unsupported T2TD structure"],
      ["Sección fuera de límites", "Section outside file bounds"],
      ["Cabecera de registro inconsistente", "Inconsistent record header"],
      ["Ubicación de identidad incompatible", "Unsupported owner field layout"],
      ["NPWR inválido", "Invalid NPWR"],
      ["Registros de progreso incompatibles", "Unsupported progress records"],
      ["IDs de trofeo inconsistentes", "Inconsistent trophy IDs"],
      ["Fecha fuera de rango", "Timestamp outside supported range"],
      ["UCP vacío o demasiado grande", "UCP is empty or too large"],
      ["No es un UCP v1 compatible", "Not a compatible UCP v1"],
      ["Cabecera UCP inconsistente", "Inconsistent UCP header"],
      ["Directorio UCP fuera de límites", "UCP directory outside bounds"],
      ["Entrada UCP fuera de límites", "UCP entry outside bounds"],
      ["Entrada UCP duplicada", "Duplicate UCP entry"],
      ["Definición de trofeos inválida", "Invalid trophy definition"],
      [
        "ZIP demasiado grande (máximo 512 MiB)",
        "ZIP is too large (512 MiB maximum)",
      ],
      ["ZIP incompleto o no compatible", "Incomplete or unsupported ZIP"],
      ["ZIP multidisco no compatible", "Multi-disk ZIP is not supported"],
      [
        "Directorio ZIP inválido o ZIP64 no compatible",
        "Invalid ZIP directory or unsupported ZIP64",
      ],
      ["Entrada ZIP inválida", "Invalid ZIP entry"],
      ["Nombre ZIP fuera de límites", "ZIP name outside bounds"],
      ["ZIP cifrado no compatible", "Encrypted ZIP is not supported"],
      ["Archivo del ZIP demasiado grande", "ZIP entry is too large"],
      [
        "El contenido de trofeos supera 256 MiB",
        "Trophy content exceeds 256 MiB",
      ],
      ["Cabecera ZIP local inválida", "Invalid local ZIP header"],
      ["Datos ZIP fuera de límites", "ZIP data outside bounds"],
      [
        "CRC ZIP inválido o compresión no compatible",
        "Invalid ZIP CRC or unsupported compression",
      ],
      [
        "Archivo no regular o demasiado grande",
        "File is not regular or is too large",
      ],
      [
        "Contenido importado supera 256 MiB",
        "Imported content exceeds 256 MiB",
      ],
      ["Máximo 512 respaldos cargados", "Maximum of 512 loaded backups"],
      ["Límite de exploración: 10,000 entradas", "Scan limit: 10,000 entries"],
      [
        "El progreso cambió inesperadamente",
        "Trophy progress unexpectedly changed",
      ],
      [
        "Cambio fuera de la identidad o checksum",
        "Change outside identity or checksum fields",
      ],
      [
        "La copia guardada no coincide con la exportación",
        "Saved copy does not match the export",
      ],
    ];
    for (const [es, en] of pairs) text = text.replaceAll(es, en);
    return window.KIK_LOCALES.translate(text, this.lang);
  },
};

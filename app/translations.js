(function (root) {
  const dictionaries = {
    "zh-CN": {
      "PS5 Trophy File Manager": "PS5 奖杯文件管理器",
      "Inspect backups and export copies for another profile.":
        "查看备份并为另一个用户导出副本。",
      "Local files only": "仅处理本地文件",
      Language: "语言",
      "Open folder": "打开文件夹",
      "Add files": "添加文件",
      "TRANSFER TROPHIES BETWEEN USERS": "在用户之间转移奖杯",
      "Move your trophy history to another user.":
        "将奖杯记录转移给另一个用户。",
      "For a new local user or after a system reinstall. Copy both trophy2 folders from your PS5 into one backup folder or ZIP.":
        "适用于新建本地用户或重装系统后。从 PS5 复制两处 trophy2 文件夹，放入同一个备份文件夹或 ZIP 中。",
      "Keep the two folder paths separate inside the backup; do not merge the trophy2 folders.":
        "在备份中保留两条独立路径，不要合并两个 trophy2 文件夹。",
      "Open the backup folder or ZIP and select the titles you want to transfer.":
        "打开备份文件夹或 ZIP，选择要转移的游戏。",
      "Enter the destination user's IDs and export one title or a batch.":
        "输入目标用户的 ID，导出单个游戏或批量导出。",
      "On the PS5, open each game at least once with the destination user before restoring its DAT.":
        "在 PS5 上恢复 DAT 之前，先用目标用户至少启动一次每个游戏。",
      "Copy only the exported TRPTITLE.DAT into the matching title folder under /user/home/<USER_ID>/trophy2/.":
        "仅将导出的 TRPTITLE.DAT 复制到 /user/home/<USER_ID>/trophy2/ 下对应游戏的文件夹中。",
      "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.":
        "仅修改 TRPTITLE.DAT。其他奖杯文件的恢复尚未测试，请至少启动一次游戏，让主机自行生成。替换前请备份当前 DAT。",
      "Drop a backup folder or ZIP here, or use Open folder below.":
        "将备份文件夹或 ZIP 拖到这里，或点击下方的“打开文件夹”。",
      "USER DATA": "用户数据",
      CATALOGS: "奖杯目录",
      BACKUPS: "备份",
      "Select all": "全选",
      "Deselect all": "取消全选",
      "Change IDs in batch": "批量更改 ID",
      "Clear library": "清空列表",
      "Files you open remain unchanged.": "打开的源文件不会被修改。",
      "Change owner": "更改所有者",
      Catalog: "目录",
      "DAT without catalog": "无目录的 DAT",
      UNLOCKED: "已解锁",
      REMAINING: "未解锁",
      "Locked trophies": "未解锁奖杯",
      "TROPHIES EARNED": "已获得奖杯",
      "Percentage by trophy count": "按奖杯数量计算的百分比",
      "LOCAL USER ID": "本地用户 ID",
      "ACCOUNT ID · HEX": "账户 ID · 十六进制",
      "ACCOUNT ID · BASE64": "账户 ID · BASE64",
      Trophies: "奖杯",
      "File details": "文件详情",
      "Export details": "导出详情",
      TROPHY: "奖杯",
      GRADE: "级别",
      STATUS: "状态",
      "UNLOCKED AT": "解锁时间",
      "No trophies match your search.": "没有符合搜索条件的奖杯。",
      "CHANGE FILE OWNER": "更改文件所有者",
      "Change file owner": "更改文件所有者",
      "Trophies and timestamps stay intact. Only the owner IDs and the affected block checksum change.":
        "奖杯和时间戳保持不变，仅更改所有者 ID 和相关区块校验值。",
      "Take IDs from another TRPTITLE.DAT…": "从另一个 TRPTITLE.DAT 读取 ID…",
      "OR ENTER THEM BELOW": "或在下方输入",
      "New local user ID": "新的本地用户 ID",
      "8 hex characters": "8 位十六进制字符",
      "New Account ID": "新的账户 ID",
      "Hex or Base64": "十六进制或 Base64",
      "Leave a field empty to keep its current value. The Base64 representation uses the byte order of your Account ID.":
        "字段留空则保留原值。Base64 表示使用账户 ID 的字节顺序。",
      "A new file is created. Your original backup stays unchanged.":
        "将生成新文件，原始备份保持不变。",
      "Verify & export DAT": "验证并导出 DAT",
      "Verify & export batch": "验证并批量导出",
      "Search trophies…": "搜索奖杯…",
      "e.g. 1234abcd": "例如 1234abcd",
      "16 hex characters or Base64": "16 位十六进制字符或 Base64",
      "All statuses": "全部状态",
      Unlocked: "已解锁",
      Locked: "未解锁",
      "All grades": "全部级别",
      Platinum: "白金",
      Gold: "金",
      Silver: "银",
      Bronze: "铜",
      "Local time": "本地时间",
      "Ready to open your backups": "准备打开备份",
      "Processing files…": "正在处理文件…",
      Hidden: "隐藏",
      "Name and description require the matching catalog":
        "名称和说明需要匹配的目录文件",
      "✓ Unlocked": "✓ 已解锁",
      "No timestamp": "无时间戳",
      "Timestamps in UTC": "UTC 时间戳",
      "Source file": "源文件",
      "Trophy set": "奖杯组",
      "Local user ID": "本地用户 ID",
      "DAT size": "DAT 大小",
      "SHA-256 blocks": "SHA-256 区块",
      "File SHA-256": "文件 SHA-256",
      "Catalog fingerprint": "目录指纹",
      "Catalog language": "目录语言",
      Format: "格式",
      "The 8-character local user ID and the 8-byte Account ID are different fields. Base64 uses the reverse byte order of the hexadecimal Account ID shown.":
        "8 位本地用户 ID 与 8 字节账户 ID 是不同字段。Base64 使用与所示十六进制账户 ID 相反的字节顺序。",
      "Change verified": "更改已验证",
      "Batch verified": "批量更改已验证",
      "Adapted copy verified and saved:": "已验证并保存修改后的副本：",
      "Batch exported:": "批量导出完成：",
      "Details saved:": "详情已保存：",
      "The DAT was saved, but the report could not be created.":
        "DAT 已保存，但无法创建报告。",
      "Trophy backups": "奖杯备份",
      "Take IDs from another TRPTITLE.DAT": "从另一个 TRPTITLE.DAT 读取 ID",
      "Export an adapted copy": "导出适配后的副本",
      "Trophy file": "奖杯文件",
      "Save trophy details": "保存奖杯详情",
      "Choose a folder for batch exports": "选择批量导出的目标文件夹",
      "KIK Trophy · startup error": "KIK Trophy · 启动错误",
      "No catalog": "无目录",
      Trophy: "奖杯",
      "Select at least one backup": "请至少选择一个备份",
      "Select between 1 and 512 backups": "请选择 1 至 512 个备份",
      "Invalid batch selection": "批量选择无效",
      "Choose an existing output folder": "请选择已存在的输出文件夹",
      "Output folder already exists": "输出文件夹已存在",
      "Export verification failed": "导出验证失败",
      "Enter at least one new owner ID": "请至少输入一个新的所有者 ID",
      "Local user ID: enter exactly 8 hex characters":
        "本地用户 ID：请输入恰好 8 位十六进制字符",
      "Account ID: use 16 hex characters or Base64 representing 8 bytes":
        "账户 ID：请输入 16 位十六进制字符或代表 8 字节的 Base64",
      "Invalid Base64 Account ID": "Base64 账户 ID 无效",
      "The IDs already match; there are no changes to export":
        "ID 已一致，无需导出更改",
      "Choose a different path: opened source files are preserved.":
        "请选择其他路径，打开的源文件不会被覆盖。",
      "No compatible trophy files found.": "未找到兼容的奖杯文件。",
      "Select a backup": "请选择备份",
      "Invalid owner IDs": "所有者 ID 无效",
      "Not a compatible T2PD v1 TRPTITLE.DAT":
        "不是兼容的 T2PD v1 TRPTITLE.DAT",
      "DAT size must be between 1 KB and 1 MiB":
        "DAT 大小必须介于 1 KB 至 1 MiB",
      "Invalid T2PD block size": "T2PD 区块大小无效",
      "Inconsistent block count": "区块数量不一致",
      "Unsupported T2TD structure": "不支持的 T2TD 结构",
      "Section outside file bounds": "区段超出文件范围",
      "Inconsistent record header": "记录头不一致",
      "Unsupported owner field layout": "不支持的所有者字段布局",
      "Invalid NPWR": "NPWR 无效",
      "Unsupported progress records": "不支持的进度记录",
      "Inconsistent trophy IDs": "奖杯 ID 不一致",
      "Timestamp outside supported range": "时间戳超出支持范围",
      "UCP is empty or too large": "UCP 为空或过大",
      "Not a compatible UCP v1": "不是兼容的 UCP v1",
      "Invalid internal UCP SHA-1": "UCP 内部 SHA-1 无效",
      "Invalid ZIP CRC or unsupported compression":
        "ZIP CRC 无效或压缩格式不受支持",
      "Incomplete or unsupported ZIP": "ZIP 不完整或不受支持",
      "Encrypted ZIP is not supported": "不支持加密 ZIP",
      "Trophy progress unexpectedly changed": "奖杯进度意外发生变化",
      "Change outside identity or checksum fields": "更改超出了身份或校验字段",
      "Saved copy does not match the export": "保存的副本与导出内容不一致",
      "Add the matching TROPHY.UCP for trophy names, descriptions and grades. The DAT already provides progress and owner editing.":
        "添加匹配的 TROPHY.UCP 以显示奖杯名称、说明和级别。DAT 已支持查看进度及更改所有者。",
      "The catalog and DAT have different trophy counts. Check the game revision.":
        "目录和 DAT 的奖杯数量不同，请检查游戏版本。",
      "Select backup": "选择备份",
      "Original files and timestamps stay unchanged": "源文件和时间戳保持不变",
      "Multiple backups target the same file. Select one backup per destination user and title.":
        "多个备份指向同一文件。请为每个目标用户的每个游戏选择一个备份。",
    },
    fr: {
      "PS5 Trophy File Manager": "Gestionnaire de trophées PS5",
      "Inspect backups and export copies for another profile.":
        "Inspectez vos sauvegardes et exportez des copies pour un autre profil.",
      "Local files only": "Fichiers locaux uniquement",
      Language: "Langue",
      "Open folder": "Ouvrir un dossier",
      "Add files": "Ajouter des fichiers",
      "TRANSFER TROPHIES BETWEEN USERS":
        "TRANSFÉRER DES TROPHÉES ENTRE UTILISATEURS",
      "Move your trophy history to another user.":
        "Transférez vos trophées vers un autre utilisateur.",
      "For a new local user or after a system reinstall. Copy both trophy2 folders from your PS5 into one backup folder or ZIP.":
        "Pour un nouveau profil local ou après une réinstallation du système. Copiez les deux dossiers trophy2 de votre PS5 dans un dossier de sauvegarde ou un ZIP.",
      "Keep the two folder paths separate inside the backup; do not merge the trophy2 folders.":
        "Conservez les deux chemins séparés ; ne fusionnez pas les dossiers trophy2.",
      "Open the backup folder or ZIP and select the titles you want to transfer.":
        "Ouvrez le dossier ou le ZIP et sélectionnez les jeux à transférer.",
      "Enter the destination user's IDs and export one title or a batch.":
        "Saisissez les identifiants du destinataire et exportez un jeu ou un lot.",
      "On the PS5, open each game at least once with the destination user before restoring its DAT.":
        "Sur la PS5, lancez chaque jeu au moins une fois avec le destinataire avant de restaurer son DAT.",
      "Copy only the exported TRPTITLE.DAT into the matching title folder under /user/home/<USER_ID>/trophy2/.":
        "Copiez uniquement le TRPTITLE.DAT exporté dans le dossier du jeu correspondant sous /user/home/<USER_ID>/trophy2/.",
      "Drop a backup folder or ZIP here, or use Open folder below.":
        "Déposez un dossier ou un ZIP ici, ou utilisez Ouvrir un dossier ci-dessous.",
      "USER DATA": "DONNÉES UTILISATEUR",
      CATALOGS: "CATALOGUES",
      BACKUPS: "SAUVEGARDES",
      "Select all": "Tout sélectionner",
      "Deselect all": "Tout désélectionner",
      "Change IDs in batch": "Modifier les ID par lot",
      "Clear library": "Vider la liste",
      "Files you open remain unchanged.":
        "Les fichiers ouverts restent inchangés.",
      "Change owner": "Changer le propriétaire",
      Catalog: "Catalogue",
      "DAT without catalog": "DAT sans catalogue",
      UNLOCKED: "DÉBLOQUÉS",
      REMAINING: "RESTANTS",
      "Locked trophies": "Trophées verrouillés",
      "TROPHIES EARNED": "TROPHÉES OBTENUS",
      "Percentage by trophy count": "Pourcentage par nombre de trophées",
      "LOCAL USER ID": "ID UTILISATEUR LOCAL",
      "ACCOUNT ID · HEX": "ACCOUNT ID · HEX",
      "ACCOUNT ID · BASE64": "ACCOUNT ID · BASE64",
      Trophies: "Trophées",
      "File details": "Détails du fichier",
      "Export details": "Exporter les détails",
      TROPHY: "TROPHÉE",
      GRADE: "CATÉGORIE",
      STATUS: "ÉTAT",
      "UNLOCKED AT": "DATE D’OBTENTION",
      "No trophies match your search.":
        "Aucun trophée ne correspond à votre recherche.",
      "CHANGE FILE OWNER": "MODIFIER LE PROPRIÉTAIRE",
      "Change file owner": "Modifier le propriétaire du fichier",
      "Trophies and timestamps stay intact. Only the owner IDs and the affected block checksum change.":
        "Les trophées et leurs dates sont préservés. Seuls les ID et le hash du bloc concerné changent.",
      "Take IDs from another TRPTITLE.DAT…":
        "Lire les ID d’un autre TRPTITLE.DAT…",
      "OR ENTER THEM BELOW": "OU LES SAISIR CI-DESSOUS",
      "New local user ID": "Nouvel ID utilisateur local",
      "8 hex characters": "8 caractères hexadécimaux",
      "New Account ID": "Nouvel Account ID",
      "Hex or Base64": "Hex ou Base64",
      "Leave a field empty to keep its current value. The Base64 representation uses the byte order of your Account ID.":
        "Laissez un champ vide pour conserver sa valeur. Base64 utilise l’ordre des octets de votre Account ID.",
      "A new file is created. Your original backup stays unchanged.":
        "Un nouveau fichier est créé. Votre sauvegarde d’origine reste intacte.",
      "Verify & export DAT": "Vérifier et exporter le DAT",
      "Verify & export batch": "Vérifier et exporter le lot",
      "Search trophies…": "Rechercher des trophées…",
      "e.g. 1234abcd": "ex. 1234abcd",
      "16 hex characters or Base64": "16 caractères hex ou Base64",
      "All statuses": "Tous les états",
      Unlocked: "Débloqué",
      Locked: "Verrouillé",
      "All grades": "Toutes les catégories",
      Platinum: "Platine",
      Gold: "Or",
      Silver: "Argent",
      Bronze: "Bronze",
      "Local time": "Heure locale",
      "Ready to open your backups": "Prêt à ouvrir vos sauvegardes",
      "Processing files…": "Traitement des fichiers…",
      Hidden: "Masqué",
      "Name and description require the matching catalog":
        "Le nom et la description nécessitent le catalogue correspondant",
      "✓ Unlocked": "✓ Débloqué",
      "No timestamp": "Sans date",
      "Timestamps in UTC": "Dates en UTC",
      "Source file": "Fichier source",
      "Trophy set": "Ensemble de trophées",
      "Local user ID": "ID utilisateur local",
      "DAT size": "Taille du DAT",
      "SHA-256 blocks": "Blocs SHA-256",
      "File SHA-256": "SHA-256 du fichier",
      "Catalog fingerprint": "Empreinte du catalogue",
      "Catalog language": "Langue du catalogue",
      Format: "Format",
      "The 8-character local user ID and the 8-byte Account ID are different fields. Base64 uses the reverse byte order of the hexadecimal Account ID shown.":
        "L’ID local de 8 caractères et l’Account ID de 8 octets sont distincts. Base64 utilise l’ordre inverse des octets de l’Account ID hexadécimal affiché.",
      "Change verified": "Modification vérifiée",
      "Batch verified": "Lot vérifié",
      "Adapted copy verified and saved:":
        "Copie adaptée vérifiée et enregistrée :",
      "Batch exported:": "Lot exporté :",
      "Details saved:": "Détails enregistrés :",
      "The DAT was saved, but the report could not be created.":
        "Le DAT a été enregistré, mais le rapport n’a pas pu être créé.",
      "Trophy backups": "Sauvegardes de trophées",
      "Take IDs from another TRPTITLE.DAT":
        "Lire les ID d’un autre TRPTITLE.DAT",
      "Export an adapted copy": "Exporter une copie adaptée",
      "Trophy file": "Fichier de trophées",
      "Save trophy details": "Enregistrer les détails des trophées",
      "Choose a folder for batch exports":
        "Choisir un dossier pour les exports par lot",
      "KIK Trophy · startup error": "KIK Trophy · erreur au démarrage",
      "No catalog": "Sans catalogue",
      Trophy: "Trophée",
      "Select at least one backup": "Sélectionnez au moins une sauvegarde",
      "Select between 1 and 512 backups":
        "Sélectionnez entre 1 et 512 sauvegardes",
      "Invalid batch selection": "Sélection de lot invalide",
      "Choose an existing output folder":
        "Choisissez un dossier de sortie existant",
      "Output folder already exists": "Le dossier de sortie existe déjà",
      "Export verification failed": "La vérification de l’export a échoué",
      "Enter at least one new owner ID":
        "Saisissez au moins un nouvel ID de propriétaire",
      "Local user ID: enter exactly 8 hex characters":
        "ID local : saisissez exactement 8 caractères hexadécimaux",
      "Account ID: use 16 hex characters or Base64 representing 8 bytes":
        "Account ID : 16 caractères hex ou du Base64 représentant 8 octets",
      "Invalid Base64 Account ID": "Account ID Base64 invalide",
      "The IDs already match; there are no changes to export":
        "Les ID sont déjà identiques ; rien à exporter",
      "Choose a different path: opened source files are preserved.":
        "Choisissez un autre chemin : les fichiers source sont préservés.",
      "No compatible trophy files found.":
        "Aucun fichier de trophées compatible trouvé.",
      "Select a backup": "Sélectionnez une sauvegarde",
      "Invalid owner IDs": "Identifiants de propriétaire invalides",
      "Not a compatible T2PD v1 TRPTITLE.DAT":
        "TRPTITLE.DAT T2PD v1 incompatible",
      "DAT size must be between 1 KB and 1 MiB":
        "La taille du DAT doit être comprise entre 1 Ko et 1 Mio",
      "Invalid T2PD block size": "Taille de bloc T2PD invalide",
      "Inconsistent block count": "Nombre de blocs incohérent",
      "Unsupported T2TD structure": "Structure T2TD non prise en charge",
      "Section outside file bounds": "Section hors des limites du fichier",
      "Inconsistent record header": "En-tête d’enregistrement incohérent",
      "Unsupported owner field layout":
        "Structure des champs du propriétaire non prise en charge",
      "Invalid NPWR": "NPWR invalide",
      "Unsupported progress records":
        "Enregistrements de progression non pris en charge",
      "Inconsistent trophy IDs": "ID de trophées incohérents",
      "Timestamp outside supported range":
        "Date hors de la plage prise en charge",
      "UCP is empty or too large": "UCP vide ou trop volumineux",
      "Not a compatible UCP v1": "UCP v1 incompatible",
      "Invalid internal UCP SHA-1": "SHA-1 interne du UCP invalide",
      "Invalid ZIP CRC or unsupported compression":
        "CRC ZIP invalide ou compression non prise en charge",
      "Incomplete or unsupported ZIP": "ZIP incomplet ou non pris en charge",
      "Encrypted ZIP is not supported":
        "Les ZIP chiffrés ne sont pas pris en charge",
      "Trophy progress unexpectedly changed":
        "La progression des trophées a changé de façon inattendue",
      "Change outside identity or checksum fields":
        "Modification en dehors des champs d’identité ou de contrôle",
      "Saved copy does not match the export":
        "La copie enregistrée ne correspond pas à l’export",
      "Add the matching TROPHY.UCP for trophy names, descriptions and grades. The DAT already provides progress and owner editing.":
        "Ajoutez le TROPHY.UCP correspondant pour les noms, descriptions et catégories. Le DAT permet déjà de voir la progression et de modifier le propriétaire.",
      "The catalog and DAT have different trophy counts. Check the game revision.":
        "Le catalogue et le DAT ont des nombres de trophées différents. Vérifiez la version du jeu.",
      "Select backup": "Sélectionner une sauvegarde",
      "Original files and timestamps stay unchanged":
        "Les fichiers source et leurs dates restent inchangés",
      "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.":
        "Seul TRPTITLE.DAT est modifié. La restauration des autres fichiers de trophées n’a pas été testée ; laissez la console les générer en lançant le jeu au moins une fois. Conservez une copie du DAT actuel avant de le remplacer.",
      "Multiple backups target the same file. Select one backup per destination user and title.":
        "Plusieurs sauvegardes visent le même fichier. Sélectionnez une sauvegarde par utilisateur de destination et par titre.",
    },
    ja: {
      "PS5 Trophy File Manager": "PS5 トロフィーファイル管理",
      "Inspect backups and export copies for another profile.":
        "バックアップを確認し、別のユーザー用にコピーを出力します。",
      "Local files only": "ローカルファイルのみ",
      Language: "言語",
      "Open folder": "フォルダーを開く",
      "Add files": "ファイルを追加",
      "TRANSFER TROPHIES BETWEEN USERS": "ユーザー間でトロフィーを移行",
      "Move your trophy history to another user.":
        "トロフィー履歴を別のユーザーに移行。",
      "For a new local user or after a system reinstall. Copy both trophy2 folders from your PS5 into one backup folder or ZIP.":
        "新しいローカルユーザーやシステム再インストール時に使用できます。PS5 の両方の trophy2 フォルダーを、1つのバックアップフォルダーまたは ZIP にコピーしてください。",
      "Keep the two folder paths separate inside the backup; do not merge the trophy2 folders.":
        "バックアップ内でも2つのパスを分け、trophy2 フォルダーを結合しないでください。",
      "Open the backup folder or ZIP and select the titles you want to transfer.":
        "バックアップフォルダーまたは ZIP を開き、移行するタイトルを選択します。",
      "Enter the destination user's IDs and export one title or a batch.":
        "移行先ユーザーの ID を入力し、単独または一括で出力します。",
      "On the PS5, open each game at least once with the destination user before restoring its DAT.":
        "DAT を復元する前に、PS5 で移行先ユーザーを使って各ゲームを少なくとも1回起動してください。",
      "Copy only the exported TRPTITLE.DAT into the matching title folder under /user/home/<USER_ID>/trophy2/.":
        "出力した TRPTITLE.DAT のみを /user/home/<USER_ID>/trophy2/ 内の対応するタイトルフォルダーにコピーしてください。",
      "Drop a backup folder or ZIP here, or use Open folder below.":
        "ここにバックアップフォルダーまたは ZIP をドロップするか、下のボタンでフォルダーを開いてください。",
      "USER DATA": "ユーザーデータ",
      CATALOGS: "カタログ",
      BACKUPS: "バックアップ",
      "Select all": "すべて選択",
      "Deselect all": "選択をすべて解除",
      "Change IDs in batch": "ID を一括変更",
      "Clear library": "一覧をクリア",
      "Files you open remain unchanged.":
        "開いた元のファイルは変更されません。",
      "Change owner": "所有者を変更",
      Catalog: "カタログ",
      "DAT without catalog": "カタログなしの DAT",
      UNLOCKED: "獲得済み",
      REMAINING: "未獲得",
      "Locked trophies": "未獲得トロフィー",
      "TROPHIES EARNED": "獲得したトロフィー",
      "Percentage by trophy count": "トロフィー数による割合",
      "LOCAL USER ID": "ローカルユーザー ID",
      "ACCOUNT ID · HEX": "アカウント ID · 16進数",
      "ACCOUNT ID · BASE64": "アカウント ID · BASE64",
      Trophies: "トロフィー",
      "File details": "ファイル詳細",
      "Export details": "詳細を出力",
      TROPHY: "トロフィー",
      GRADE: "グレード",
      STATUS: "状態",
      "UNLOCKED AT": "獲得日時",
      "No trophies match your search.":
        "検索条件に一致するトロフィーがありません。",
      "CHANGE FILE OWNER": "ファイル所有者を変更",
      "Change file owner": "ファイル所有者を変更",
      "Trophies and timestamps stay intact. Only the owner IDs and the affected block checksum change.":
        "トロフィーと獲得日時は保持されます。所有者 ID と該当ブロックのチェックサムのみを変更します。",
      "Take IDs from another TRPTITLE.DAT…":
        "別の TRPTITLE.DAT から ID を取得…",
      "OR ENTER THEM BELOW": "または以下に入力",
      "New local user ID": "新しいローカルユーザー ID",
      "8 hex characters": "16進数8桁",
      "New Account ID": "新しいアカウント ID",
      "Hex or Base64": "16進数または Base64",
      "Leave a field empty to keep its current value. The Base64 representation uses the byte order of your Account ID.":
        "空欄の項目は現在の値を保持します。Base64 表現はアカウント ID のバイト順を使用します。",
      "A new file is created. Your original backup stays unchanged.":
        "新しいファイルを作成します。元のバックアップは変更しません。",
      "Verify & export DAT": "検証して DAT を出力",
      "Verify & export batch": "検証して一括出力",
      "Search trophies…": "トロフィーを検索…",
      "e.g. 1234abcd": "例: 1234abcd",
      "16 hex characters or Base64": "16進数16桁または Base64",
      "All statuses": "すべての状態",
      Unlocked: "獲得済み",
      Locked: "未獲得",
      "All grades": "すべてのグレード",
      Platinum: "プラチナ",
      Gold: "ゴールド",
      Silver: "シルバー",
      Bronze: "ブロンズ",
      "Local time": "ローカル時刻",
      "Ready to open your backups": "バックアップを開けます",
      "Processing files…": "ファイルを処理中…",
      Hidden: "非表示",
      "Name and description require the matching catalog":
        "名前と説明には対応するカタログが必要です",
      "✓ Unlocked": "✓ 獲得済み",
      "No timestamp": "日時なし",
      "Timestamps in UTC": "日時を UTC で表示",
      "Source file": "元ファイル",
      "Trophy set": "トロフィーセット",
      "Local user ID": "ローカルユーザー ID",
      "DAT size": "DAT サイズ",
      "SHA-256 blocks": "SHA-256 ブロック",
      "File SHA-256": "ファイルの SHA-256",
      "Catalog fingerprint": "カタログの指紋",
      "Catalog language": "カタログの言語",
      Format: "形式",
      "The 8-character local user ID and the 8-byte Account ID are different fields. Base64 uses the reverse byte order of the hexadecimal Account ID shown.":
        "8桁のローカルユーザー ID と8バイトのアカウント ID は別の項目です。Base64 は表示された16進数のアカウント ID と逆のバイト順を使用します。",
      "Change verified": "変更を検証済み",
      "Batch verified": "一括変更を検証済み",
      "Adapted copy verified and saved:":
        "変更したコピーを検証して保存しました:",
      "Batch exported:": "一括出力しました:",
      "Details saved:": "詳細を保存しました:",
      "The DAT was saved, but the report could not be created.":
        "DAT は保存しましたが、レポートを作成できませんでした。",
      "Trophy backups": "トロフィーバックアップ",
      "Take IDs from another TRPTITLE.DAT": "別の TRPTITLE.DAT から ID を取得",
      "Export an adapted copy": "変更したコピーを出力",
      "Trophy file": "トロフィーファイル",
      "Save trophy details": "トロフィー詳細を保存",
      "Choose a folder for batch exports": "一括出力先のフォルダーを選択",
      "KIK Trophy · startup error": "KIK Trophy · 起動エラー",
      "No catalog": "カタログなし",
      Trophy: "トロフィー",
      "Select at least one backup": "バックアップを1つ以上選択してください",
      "Select between 1 and 512 backups":
        "バックアップを1〜512個選択してください",
      "Invalid batch selection": "一括選択が無効です",
      "Choose an existing output folder":
        "既存の出力先フォルダーを選択してください",
      "Output folder already exists": "出力先フォルダーはすでに存在します",
      "Export verification failed": "出力の検証に失敗しました",
      "Enter at least one new owner ID":
        "新しい所有者 ID を1つ以上入力してください",
      "Local user ID: enter exactly 8 hex characters":
        "ローカルユーザー ID: 16進数8桁で入力してください",
      "Account ID: use 16 hex characters or Base64 representing 8 bytes":
        "アカウント ID: 16進数16桁、または8バイトを表す Base64 を入力してください",
      "Invalid Base64 Account ID": "Base64 のアカウント ID が無効です",
      "The IDs already match; there are no changes to export":
        "ID はすでに一致しているため変更がありません",
      "Choose a different path: opened source files are preserved.":
        "別の保存先を選んでください。元のファイルは保持します。",
      "No compatible trophy files found.":
        "対応するトロフィーファイルが見つかりません。",
      "Select a backup": "バックアップを選択してください",
      "Invalid owner IDs": "所有者 ID が無効です",
      "Not a compatible T2PD v1 TRPTITLE.DAT":
        "対応する T2PD v1 の TRPTITLE.DAT ではありません",
      "DAT size must be between 1 KB and 1 MiB":
        "DAT サイズは1 KB〜1 MiBである必要があります",
      "Invalid T2PD block size": "T2PD ブロックサイズが無効です",
      "Inconsistent block count": "ブロック数が一致しません",
      "Unsupported T2TD structure": "非対応の T2TD 構造です",
      "Section outside file bounds": "セクションがファイル範囲外です",
      "Inconsistent record header": "レコードヘッダーが一致しません",
      "Unsupported owner field layout": "所有者フィールドの配置が非対応です",
      "Invalid NPWR": "NPWR が無効です",
      "Unsupported progress records": "進行状況レコードが非対応です",
      "Inconsistent trophy IDs": "トロフィー ID が一致しません",
      "Timestamp outside supported range": "日時が対応範囲外です",
      "UCP is empty or too large": "UCP が空か大きすぎます",
      "Not a compatible UCP v1": "対応する UCP v1 ではありません",
      "Invalid internal UCP SHA-1": "UCP 内部の SHA-1 が無効です",
      "Invalid ZIP CRC or unsupported compression":
        "ZIP の CRC が無効か、圧縮方式が非対応です",
      "Incomplete or unsupported ZIP": "ZIP が不完全か非対応です",
      "Encrypted ZIP is not supported": "暗号化された ZIP は非対応です",
      "Trophy progress unexpectedly changed":
        "トロフィーの進行状況が予期せず変わりました",
      "Change outside identity or checksum fields":
        "ID またはチェックサム以外の領域が変更されました",
      "Saved copy does not match the export":
        "保存したコピーが出力内容と一致しません",
      "Add the matching TROPHY.UCP for trophy names, descriptions and grades. The DAT already provides progress and owner editing.":
        "名前、説明、グレードには対応する TROPHY.UCP が必要です。DAT のみでも進行状況の確認と所有者の変更は可能です。",
      "The catalog and DAT have different trophy counts. Check the game revision.":
        "カタログと DAT のトロフィー数が異なります。ゲームのバージョンを確認してください。",
      "Select backup": "バックアップを選択",
      "Original files and timestamps stay unchanged":
        "元ファイルと獲得日時は保持されます",
      "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.":
        "変更するのは TRPTITLE.DAT のみです。他のトロフィーファイルの復元は未検証です。ゲームを少なくとも1回起動し、本体に生成させてください。置き換える前に現在の DAT をバックアップしてください。",
      "Multiple backups target the same file. Select one backup per destination user and title.":
        "複数のバックアップの出力先が同じです。移行先ユーザーとタイトルごとに1つ選択してください。",
    },
    ru: {
      "PS5 Trophy File Manager": "Менеджер файлов трофеев PS5",
      "Inspect backups and export copies for another profile.":
        "Просматривайте резервные копии и экспортируйте их для другого профиля.",
      "Local files only": "Только локальные файлы",
      Language: "Язык",
      "Open folder": "Открыть папку",
      "Add files": "Добавить файлы",
      "TRANSFER TROPHIES BETWEEN USERS": "ПЕРЕНОС ТРОФЕЕВ МЕЖДУ ПОЛЬЗОВАТЕЛЯМИ",
      "Move your trophy history to another user.":
        "Перенесите историю трофеев другому пользователю.",
      "For a new local user or after a system reinstall. Copy both trophy2 folders from your PS5 into one backup folder or ZIP.":
        "Для нового локального пользователя или после переустановки системы. Скопируйте обе папки trophy2 с PS5 в одну папку резервной копии или ZIP.",
      "Keep the two folder paths separate inside the backup; do not merge the trophy2 folders.":
        "Сохраните обе структуры путей отдельно; не объединяйте папки trophy2.",
      "Open the backup folder or ZIP and select the titles you want to transfer.":
        "Откройте папку или ZIP и выберите игры для переноса.",
      "Enter the destination user's IDs and export one title or a batch.":
        "Введите ID нового владельца и экспортируйте одну или несколько копий.",
      "On the PS5, open each game at least once with the destination user before restoring its DAT.":
        "Перед восстановлением DAT запустите каждую игру на PS5 хотя бы один раз от имени нового пользователя.",
      "Copy only the exported TRPTITLE.DAT into the matching title folder under /user/home/<USER_ID>/trophy2/.":
        "Скопируйте только экспортированный TRPTITLE.DAT в папку нужной игры внутри /user/home/<USER_ID>/trophy2/.",
      "Drop a backup folder or ZIP here, or use Open folder below.":
        "Перетащите папку или ZIP сюда либо нажмите «Открыть папку» ниже.",
      "USER DATA": "ДАННЫЕ ПОЛЬЗОВАТЕЛЯ",
      CATALOGS: "КАТАЛОГИ",
      BACKUPS: "РЕЗЕРВНЫЕ КОПИИ",
      "Select all": "Выбрать всё",
      "Deselect all": "Снять выделение",
      "Change IDs in batch": "Изменить ID пакетом",
      "Clear library": "Очистить список",
      "Files you open remain unchanged.":
        "Открытые исходные файлы не изменяются.",
      "Change owner": "Изменить владельца",
      Catalog: "Каталог",
      "DAT without catalog": "DAT без каталога",
      UNLOCKED: "ПОЛУЧЕНО",
      REMAINING: "ОСТАЛОСЬ",
      "Locked trophies": "Неполученные трофеи",
      "TROPHIES EARNED": "ПОЛУЧЕННЫЕ ТРОФЕИ",
      "Percentage by trophy count": "Доля по количеству трофеев",
      "LOCAL USER ID": "ID ЛОКАЛЬНОГО ПОЛЬЗОВАТЕЛЯ",
      "ACCOUNT ID · HEX": "ID АККАУНТА · HEX",
      "ACCOUNT ID · BASE64": "ID АККАУНТА · BASE64",
      Trophies: "Трофеи",
      "File details": "Сведения о файле",
      "Export details": "Экспорт сведений",
      TROPHY: "ТРОФЕЙ",
      GRADE: "ТИП",
      STATUS: "СТАТУС",
      "UNLOCKED AT": "ДАТА ПОЛУЧЕНИЯ",
      "No trophies match your search.": "Нет трофеев, соответствующих запросу.",
      "CHANGE FILE OWNER": "ИЗМЕНИТЬ ВЛАДЕЛЬЦА ФАЙЛА",
      "Change file owner": "Изменить владельца файла",
      "Trophies and timestamps stay intact. Only the owner IDs and the affected block checksum change.":
        "Трофеи и время получения сохраняются. Меняются только ID владельца и контрольная сумма затронутого блока.",
      "Take IDs from another TRPTITLE.DAT…":
        "Взять ID из другого TRPTITLE.DAT…",
      "OR ENTER THEM BELOW": "ИЛИ ВВЕДИТЕ НИЖЕ",
      "New local user ID": "Новый ID локального пользователя",
      "8 hex characters": "8 шестнадцатеричных символов",
      "New Account ID": "Новый ID аккаунта",
      "Hex or Base64": "Hex или Base64",
      "Leave a field empty to keep its current value. The Base64 representation uses the byte order of your Account ID.":
        "Оставьте поле пустым, чтобы сохранить его значение. Base64 использует порядок байтов ID аккаунта.",
      "A new file is created. Your original backup stays unchanged.":
        "Создаётся новый файл. Исходная копия остаётся без изменений.",
      "Verify & export DAT": "Проверить и экспортировать DAT",
      "Verify & export batch": "Проверить и экспортировать пакет",
      "Search trophies…": "Поиск трофеев…",
      "e.g. 1234abcd": "например, 1234abcd",
      "16 hex characters or Base64": "16 символов hex или Base64",
      "All statuses": "Все статусы",
      Unlocked: "Получен",
      Locked: "Не получен",
      "All grades": "Все типы",
      Platinum: "Платиновый",
      Gold: "Золотой",
      Silver: "Серебряный",
      Bronze: "Бронзовый",
      "Local time": "Местное время",
      "Ready to open your backups": "Готово к открытию резервных копий",
      "Processing files…": "Обработка файлов…",
      Hidden: "Скрытый",
      "Name and description require the matching catalog":
        "Для названия и описания нужен соответствующий каталог",
      "✓ Unlocked": "✓ Получен",
      "No timestamp": "Время отсутствует",
      "Timestamps in UTC": "Время в UTC",
      "Source file": "Исходный файл",
      "Trophy set": "Набор трофеев",
      "Local user ID": "ID локального пользователя",
      "DAT size": "Размер DAT",
      "SHA-256 blocks": "Блоки SHA-256",
      "File SHA-256": "SHA-256 файла",
      "Catalog fingerprint": "Отпечаток каталога",
      "Catalog language": "Язык каталога",
      Format: "Формат",
      "The 8-character local user ID and the 8-byte Account ID are different fields. Base64 uses the reverse byte order of the hexadecimal Account ID shown.":
        "Локальный ID из 8 символов и ID аккаунта из 8 байтов — разные поля. Base64 использует обратный порядок байтов показанного ID аккаунта в hex.",
      "Change verified": "Изменение проверено",
      "Batch verified": "Пакет проверен",
      "Adapted copy verified and saved:":
        "Изменённая копия проверена и сохранена:",
      "Batch exported:": "Пакет экспортирован:",
      "Details saved:": "Сведения сохранены:",
      "The DAT was saved, but the report could not be created.":
        "DAT сохранён, но создать отчёт не удалось.",
      "Trophy backups": "Резервные копии трофеев",
      "Take IDs from another TRPTITLE.DAT": "Взять ID из другого TRPTITLE.DAT",
      "Export an adapted copy": "Экспорт изменённой копии",
      "Trophy file": "Файл трофеев",
      "Save trophy details": "Сохранить сведения о трофеях",
      "Choose a folder for batch exports":
        "Выберите папку для пакетного экспорта",
      "KIK Trophy · startup error": "KIK Trophy · ошибка запуска",
      "No catalog": "Нет каталога",
      Trophy: "Трофей",
      "Select at least one backup": "Выберите хотя бы одну копию",
      "Select between 1 and 512 backups": "Выберите от 1 до 512 копий",
      "Invalid batch selection": "Недопустимое выделение пакета",
      "Choose an existing output folder":
        "Выберите существующую папку для экспорта",
      "Output folder already exists": "Папка экспорта уже существует",
      "Export verification failed": "Проверка экспорта не пройдена",
      "Enter at least one new owner ID":
        "Введите хотя бы один новый ID владельца",
      "Local user ID: enter exactly 8 hex characters":
        "Локальный ID: введите ровно 8 символов hex",
      "Account ID: use 16 hex characters or Base64 representing 8 bytes":
        "ID аккаунта: 16 символов hex или Base64, представляющий 8 байтов",
      "Invalid Base64 Account ID": "Недопустимый ID аккаунта в Base64",
      "The IDs already match; there are no changes to export":
        "ID уже совпадают; изменений для экспорта нет",
      "Choose a different path: opened source files are preserved.":
        "Выберите другой путь: исходные файлы сохраняются.",
      "No compatible trophy files found.":
        "Совместимые файлы трофеев не найдены.",
      "Select a backup": "Выберите резервную копию",
      "Invalid owner IDs": "Недопустимые ID владельца",
      "Not a compatible T2PD v1 TRPTITLE.DAT":
        "Несовместимый TRPTITLE.DAT T2PD v1",
      "DAT size must be between 1 KB and 1 MiB":
        "Размер DAT должен быть от 1 КБ до 1 МиБ",
      "Invalid T2PD block size": "Недопустимый размер блока T2PD",
      "Inconsistent block count": "Несогласованное количество блоков",
      "Unsupported T2TD structure": "Неподдерживаемая структура T2TD",
      "Section outside file bounds": "Раздел за пределами файла",
      "Inconsistent record header": "Несогласованный заголовок записи",
      "Unsupported owner field layout":
        "Неподдерживаемая структура полей владельца",
      "Invalid NPWR": "Недопустимый NPWR",
      "Unsupported progress records": "Неподдерживаемые записи прогресса",
      "Inconsistent trophy IDs": "Несогласованные ID трофеев",
      "Timestamp outside supported range":
        "Время вне поддерживаемого диапазона",
      "UCP is empty or too large": "UCP пуст или слишком велик",
      "Not a compatible UCP v1": "Несовместимый UCP v1",
      "Invalid internal UCP SHA-1": "Недопустимый внутренний SHA-1 UCP",
      "Invalid ZIP CRC or unsupported compression":
        "Недопустимый CRC ZIP или неподдерживаемое сжатие",
      "Incomplete or unsupported ZIP": "ZIP неполон или не поддерживается",
      "Encrypted ZIP is not supported": "Зашифрованные ZIP не поддерживаются",
      "Trophy progress unexpectedly changed":
        "Прогресс трофеев неожиданно изменился",
      "Change outside identity or checksum fields":
        "Изменение вне полей ID или контрольной суммы",
      "Saved copy does not match the export":
        "Сохранённая копия не совпадает с экспортом",
      "Add the matching TROPHY.UCP for trophy names, descriptions and grades. The DAT already provides progress and owner editing.":
        "Добавьте соответствующий TROPHY.UCP для названий, описаний и типов. DAT уже позволяет просматривать прогресс и менять владельца.",
      "The catalog and DAT have different trophy counts. Check the game revision.":
        "Количество трофеев в каталоге и DAT отличается. Проверьте версию игры.",
      "Select backup": "Выбрать копию",
      "Original files and timestamps stay unchanged":
        "Исходные файлы и время получения не изменяются",
      "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.":
        "Изменяется только TRPTITLE.DAT. Восстановление других файлов трофеев не проверялось; запустите игру хотя бы один раз, чтобы консоль создала их сама. Сохраните копию текущего DAT перед заменой.",
      "Multiple backups target the same file. Select one backup per destination user and title.":
        "Несколько копий направлены в один файл. Выберите одну копию для каждого пользователя назначения и игры.",
    },
    it: {
      "PS5 Trophy File Manager": "Gestore dei file trofei PS5",
      "Inspect backups and export copies for another profile.":
        "Esamina i backup ed esporta copie per un altro profilo.",
      "Local files only": "Solo file locali",
      Language: "Lingua",
      "Open folder": "Apri cartella",
      "Add files": "Aggiungi file",
      "TRANSFER TROPHIES BETWEEN USERS": "TRASFERISCI TROFEI TRA UTENTI",
      "Move your trophy history to another user.":
        "Trasferisci la cronologia dei trofei a un altro utente.",
      "For a new local user or after a system reinstall. Copy both trophy2 folders from your PS5 into one backup folder or ZIP.":
        "Per un nuovo utente locale o dopo una reinstallazione del sistema. Copia entrambe le cartelle trophy2 dalla PS5 in una cartella di backup o in uno ZIP.",
      "Keep the two folder paths separate inside the backup; do not merge the trophy2 folders.":
        "Mantieni separati i due percorsi nel backup; non unire le cartelle trophy2.",
      "Open the backup folder or ZIP and select the titles you want to transfer.":
        "Apri la cartella o lo ZIP e seleziona i titoli da trasferire.",
      "Enter the destination user's IDs and export one title or a batch.":
        "Inserisci gli ID dell’utente di destinazione ed esporta un titolo o un gruppo.",
      "On the PS5, open each game at least once with the destination user before restoring its DAT.":
        "Sulla PS5, avvia ogni gioco almeno una volta con l’utente di destinazione prima di ripristinare il DAT.",
      "Copy only the exported TRPTITLE.DAT into the matching title folder under /user/home/<USER_ID>/trophy2/.":
        "Copia solo il TRPTITLE.DAT esportato nella cartella del titolo corrispondente sotto /user/home/<USER_ID>/trophy2/.",
      "Only TRPTITLE.DAT is modified. Restoring other trophy files has not been tested; let your console generate them by launching the game at least once. Keep a copy of the current DAT before replacing it.":
        "Viene modificato solo TRPTITLE.DAT. Il ripristino degli altri file dei trofei non è stato testato; lascia che la console li generi avviando il gioco almeno una volta. Conserva una copia del DAT attuale prima di sostituirlo.",
      "Drop a backup folder or ZIP here, or use Open folder below.":
        "Trascina qui una cartella di backup o uno ZIP, oppure usa Apri cartella qui sotto.",
      "USER DATA": "DATI UTENTE",
      CATALOGS: "CATALOGHI",
      BACKUPS: "BACKUP",
      "Select all": "Seleziona tutto",
      "Deselect all": "Deseleziona tutto",
      "Change IDs in batch": "Modifica ID in gruppo",
      "Clear library": "Svuota elenco",
      "Files you open remain unchanged.": "I file aperti rimangono invariati.",
      "Change owner": "Cambia proprietario",
      Catalog: "Catalogo",
      "DAT without catalog": "DAT senza catalogo",
      UNLOCKED: "SBLOCCATI",
      REMAINING: "RIMANENTI",
      "Locked trophies": "Trofei bloccati",
      "TROPHIES EARNED": "TROFEI OTTENUTI",
      "Percentage by trophy count": "Percentuale per numero di trofei",
      "LOCAL USER ID": "ID UTENTE LOCALE",
      "ACCOUNT ID · HEX": "ID ACCOUNT · HEX",
      "ACCOUNT ID · BASE64": "ID ACCOUNT · BASE64",
      Trophies: "Trofei",
      "File details": "Dettagli del file",
      "Export details": "Esporta dettagli",
      TROPHY: "TROFEO",
      GRADE: "GRADO",
      STATUS: "STATO",
      "UNLOCKED AT": "DATA DI SBLOCCO",
      "No trophies match your search.":
        "Nessun trofeo corrisponde alla ricerca.",
      "CHANGE FILE OWNER": "CAMBIA PROPRIETARIO DEL FILE",
      "Change file owner": "Cambia proprietario del file",
      "Trophies and timestamps stay intact. Only the owner IDs and the affected block checksum change.":
        "Trofei e date rimangono intatti. Cambiano solo gli ID del proprietario e il checksum del blocco interessato.",
      "Take IDs from another TRPTITLE.DAT…":
        "Leggi ID da un altro TRPTITLE.DAT…",
      "OR ENTER THEM BELOW": "OPPURE INSERISCILI QUI SOTTO",
      "New local user ID": "Nuovo ID utente locale",
      "8 hex characters": "8 caratteri esadecimali",
      "New Account ID": "Nuovo ID account",
      "Hex or Base64": "Hex o Base64",
      "Leave a field empty to keep its current value. The Base64 representation uses the byte order of your Account ID.":
        "Lascia vuoto un campo per mantenerne il valore attuale. Base64 usa l’ordine dei byte dell’ID account.",
      "A new file is created. Your original backup stays unchanged.":
        "Viene creato un nuovo file. Il backup originale rimane invariato.",
      "Verify & export DAT": "Verifica ed esporta DAT",
      "Verify & export batch": "Verifica ed esporta gruppo",
      "Search trophies…": "Cerca trofei…",
      "e.g. 1234abcd": "es. 1234abcd",
      "16 hex characters or Base64": "16 caratteri hex o Base64",
      "All statuses": "Tutti gli stati",
      Unlocked: "Sbloccato",
      Locked: "Bloccato",
      "All grades": "Tutti i gradi",
      Platinum: "Platino",
      Gold: "Oro",
      Silver: "Argento",
      Bronze: "Bronzo",
      "Local time": "Ora locale",
      "Ready to open your backups": "Pronto per aprire i backup",
      "Processing files…": "Elaborazione dei file…",
      Hidden: "Nascosto",
      "Name and description require the matching catalog":
        "Nome e descrizione richiedono il catalogo corrispondente",
      "✓ Unlocked": "✓ Sbloccato",
      "No timestamp": "Nessuna data",
      "Timestamps in UTC": "Date in UTC",
      "Source file": "File sorgente",
      "Trophy set": "Set di trofei",
      "Local user ID": "ID utente locale",
      "DAT size": "Dimensione DAT",
      "SHA-256 blocks": "Blocchi SHA-256",
      "File SHA-256": "SHA-256 del file",
      "Catalog fingerprint": "Impronta del catalogo",
      "Catalog language": "Lingua del catalogo",
      Format: "Formato",
      "The 8-character local user ID and the 8-byte Account ID are different fields. Base64 uses the reverse byte order of the hexadecimal Account ID shown.":
        "L’ID utente locale di 8 caratteri e l’ID account di 8 byte sono campi diversi. Base64 usa l’ordine inverso dei byte dell’ID account esadecimale visualizzato.",
      "Change verified": "Modifica verificata",
      "Batch verified": "Gruppo verificato",
      "Adapted copy verified and saved:":
        "Copia adattata verificata e salvata:",
      "Batch exported:": "Gruppo esportato:",
      "Details saved:": "Dettagli salvati:",
      "The DAT was saved, but the report could not be created.":
        "Il DAT è stato salvato, ma non è stato possibile creare il rapporto.",
      "Trophy backups": "Backup dei trofei",
      "Take IDs from another TRPTITLE.DAT": "Leggi ID da un altro TRPTITLE.DAT",
      "Export an adapted copy": "Esporta una copia adattata",
      "Trophy file": "File dei trofei",
      "Save trophy details": "Salva dettagli dei trofei",
      "Choose a folder for batch exports":
        "Scegli una cartella per l’esportazione del gruppo",
      "KIK Trophy · startup error": "KIK Trophy · errore di avvio",
      "No catalog": "Nessun catalogo",
      Trophy: "Trofeo",
      "Select at least one backup": "Seleziona almeno un backup",
      "Select between 1 and 512 backups": "Seleziona da 1 a 512 backup",
      "Invalid batch selection": "Selezione del gruppo non valida",
      "Choose an existing output folder":
        "Scegli una cartella di destinazione esistente",
      "Output folder already exists": "La cartella di destinazione esiste già",
      "Export verification failed": "Verifica dell’esportazione non riuscita",
      "Enter at least one new owner ID":
        "Inserisci almeno un nuovo ID del proprietario",
      "Local user ID: enter exactly 8 hex characters":
        "ID utente locale: inserisci esattamente 8 caratteri esadecimali",
      "Account ID: use 16 hex characters or Base64 representing 8 bytes":
        "ID account: usa 16 caratteri hex o Base64 che rappresenti 8 byte",
      "Invalid Base64 Account ID": "ID account Base64 non valido",
      "The IDs already match; there are no changes to export":
        "Gli ID coincidono già; non ci sono modifiche da esportare",
      "Choose a different path: opened source files are preserved.":
        "Scegli un altro percorso: i file sorgente aperti vengono conservati.",
      "No compatible trophy files found.":
        "Nessun file di trofei compatibile trovato.",
      "Select a backup": "Seleziona un backup",
      "Invalid owner IDs": "ID del proprietario non validi",
      "Not a compatible T2PD v1 TRPTITLE.DAT":
        "TRPTITLE.DAT T2PD v1 non compatibile",
      "DAT size must be between 1 KB and 1 MiB":
        "La dimensione del DAT deve essere tra 1 KB e 1 MiB",
      "Invalid T2PD block size": "Dimensione del blocco T2PD non valida",
      "Inconsistent block count": "Numero di blocchi incoerente",
      "Unsupported T2TD structure": "Struttura T2TD non supportata",
      "Section outside file bounds": "Sezione fuori dai limiti del file",
      "Inconsistent record header": "Intestazione del record incoerente",
      "Unsupported owner field layout":
        "Struttura dei campi del proprietario non supportata",
      "Invalid NPWR": "NPWR non valido",
      "Unsupported progress records": "Record di avanzamento non supportati",
      "Inconsistent trophy IDs": "ID dei trofei incoerenti",
      "Timestamp outside supported range":
        "Data fuori dall’intervallo supportato",
      "UCP is empty or too large": "UCP vuoto o troppo grande",
      "Not a compatible UCP v1": "UCP v1 non compatibile",
      "Invalid internal UCP SHA-1": "SHA-1 interno dell’UCP non valido",
      "Invalid ZIP CRC or unsupported compression":
        "CRC ZIP non valido o compressione non supportata",
      "Incomplete or unsupported ZIP": "ZIP incompleto o non supportato",
      "Encrypted ZIP is not supported":
        "Gli ZIP crittografati non sono supportati",
      "Trophy progress unexpectedly changed":
        "L’avanzamento dei trofei è cambiato inaspettatamente",
      "Change outside identity or checksum fields":
        "Modifica al di fuori dei campi ID o checksum",
      "Saved copy does not match the export":
        "La copia salvata non corrisponde all’esportazione",
      "Add the matching TROPHY.UCP for trophy names, descriptions and grades. The DAT already provides progress and owner editing.":
        "Aggiungi il TROPHY.UCP corrispondente per nomi, descrizioni e gradi. Il DAT consente già di vedere l’avanzamento e modificare il proprietario.",
      "The catalog and DAT have different trophy counts. Check the game revision.":
        "Il catalogo e il DAT hanno numeri di trofei diversi. Controlla la versione del gioco.",
      "Select backup": "Seleziona backup",
      "Original files and timestamps stay unchanged":
        "I file originali e le date rimangono invariati",
      "Multiple backups target the same file. Select one backup per destination user and title.":
        "Più backup hanno lo stesso file di destinazione. Seleziona un backup per ogni utente di destinazione e titolo.",
    },
  };
  const patterns = {
    "zh-CN": [
      ["^(\\d+) selected$", "已选 $1 个"],
      ["^(\\d+) backups selected$", "已选择 $1 个备份"],
      [
        "^(\\d+) backups loaded · source files preserved$",
        "已加载 $1 个备份 · 源文件已保留",
      ],
      [
        "^(\\d+) backups available\\. SHA-256 verified\\.$",
        "$1 个备份可用，SHA-256 已验证。",
      ],
      [
        "^Integrity valid · (\\d+)/(\\d+) SHA-256 blocks$",
        "完整性有效 · $1/$2 个 SHA-256 区块",
      ],
      ["^of (\\d+)$", "共 $1 个"],
      ["^(\\d+) / (\\d+) valid$", "$1 / $2 有效"],
      ["^(\\d+) of (\\d+) trophies$", "显示 $1 / $2 个奖杯"],
      ["^Local time · (.+)$", "本地时间 · $1"],
      [
        "^(\\d+) unlocked trophies · timestamps preserved$",
        "$1 个已解锁奖杯 · 时间戳已保留",
      ],
      ["^Local user ID: (.+) → (.+)$", "本地用户 ID：$1 → $2"],
      [
        "^(\\d+) bytes changed · (\\d+)/(\\d+) valid blocks$",
        "已更改 $1 字节 · $2/$3 个区块有效",
      ],
      [
        "^(\\d+) trophies and their timestamps remain unchanged\\.$",
        "$1 个奖杯及其时间戳保持不变。",
      ],
      [
        "^(\\d+) files · (\\d+) verified blocks$",
        "$1 个文件 · $2 个区块已验证",
      ],
      [
        "^IDs read from TRPTITLE\\.DAT · (.+)$",
        "已从 TRPTITLE.DAT 读取 ID · $1",
      ],
    ],
    fr: [
      ["^(\\d+) selected$", "$1 sélectionnés"],
      ["^(\\d+) backups selected$", "$1 sauvegardes sélectionnées"],
      [
        "^(\\d+) backups loaded · source files preserved$",
        "$1 sauvegardes chargées · fichiers source préservés",
      ],
      [
        "^(\\d+) backups available\\. SHA-256 verified\\.$",
        "$1 sauvegardes disponibles. SHA-256 vérifié.",
      ],
      [
        "^Integrity valid · (\\d+)/(\\d+) SHA-256 blocks$",
        "Intégrité valide · $1/$2 blocs SHA-256",
      ],
      ["^of (\\d+)$", "sur $1"],
      ["^(\\d+) / (\\d+) valid$", "$1 / $2 valides"],
      ["^(\\d+) of (\\d+) trophies$", "$1 trophées sur $2"],
      ["^Local time · (.+)$", "Heure locale · $1"],
      [
        "^(\\d+) unlocked trophies · timestamps preserved$",
        "$1 trophées débloqués · dates préservées",
      ],
      ["^Local user ID: (.+) → (.+)$", "ID utilisateur local : $1 → $2"],
      [
        "^(\\d+) bytes changed · (\\d+)/(\\d+) valid blocks$",
        "$1 octets modifiés · $2/$3 blocs valides",
      ],
      [
        "^(\\d+) trophies and their timestamps remain unchanged\\.$",
        "$1 trophées et leurs dates restent inchangés.",
      ],
      [
        "^(\\d+) files · (\\d+) verified blocks$",
        "$1 fichiers · $2 blocs vérifiés",
      ],
      [
        "^IDs read from TRPTITLE\\.DAT · (.+)$",
        "ID lus depuis TRPTITLE.DAT · $1",
      ],
    ],
    ja: [
      ["^(\\d+) selected$", "$1 個選択"],
      ["^(\\d+) backups selected$", "$1 個のバックアップを選択"],
      [
        "^(\\d+) backups loaded · source files preserved$",
        "$1 個のバックアップを読み込み済み · 元ファイルは保持",
      ],
      [
        "^(\\d+) backups available\\. SHA-256 verified\\.$",
        "$1 個のバックアップがあります。SHA-256 検証済み。",
      ],
      [
        "^Integrity valid · (\\d+)/(\\d+) SHA-256 blocks$",
        "整合性正常 · $1/$2 SHA-256 ブロック",
      ],
      ["^of (\\d+)$", "全 $1 個"],
      ["^(\\d+) / (\\d+) valid$", "$1 / $2 正常"],
      ["^(\\d+) of (\\d+) trophies$", "$2 個中 $1 個のトロフィー"],
      ["^Local time · (.+)$", "ローカル時刻 · $1"],
      [
        "^(\\d+) unlocked trophies · timestamps preserved$",
        "$1 個獲得済み · 獲得日時は保持",
      ],
      ["^Local user ID: (.+) → (.+)$", "ローカルユーザー ID: $1 → $2"],
      [
        "^(\\d+) bytes changed · (\\d+)/(\\d+) valid blocks$",
        "$1 バイト変更 · $2/$3 ブロック正常",
      ],
      [
        "^(\\d+) trophies and their timestamps remain unchanged\\.$",
        "$1 個のトロフィーと獲得日時は変更されません。",
      ],
      [
        "^(\\d+) files · (\\d+) verified blocks$",
        "$1 ファイル · $2 ブロック検証済み",
      ],
      [
        "^IDs read from TRPTITLE\\.DAT · (.+)$",
        "TRPTITLE.DAT から ID を取得 · $1",
      ],
    ],
    ru: [
      ["^(\\d+) selected$", "$1 выбрано"],
      ["^(\\d+) backups selected$", "$1 копий выбрано"],
      [
        "^(\\d+) backups loaded · source files preserved$",
        "$1 копий загружено · исходные файлы сохранены",
      ],
      [
        "^(\\d+) backups available\\. SHA-256 verified\\.$",
        "Доступно копий: $1. SHA-256 проверен.",
      ],
      [
        "^Integrity valid · (\\d+)/(\\d+) SHA-256 blocks$",
        "Целостность подтверждена · $1/$2 блоков SHA-256",
      ],
      ["^of (\\d+)$", "из $1"],
      ["^(\\d+) / (\\d+) valid$", "$1 / $2 верны"],
      ["^(\\d+) of (\\d+) trophies$", "$1 из $2 трофеев"],
      ["^Local time · (.+)$", "Местное время · $1"],
      [
        "^(\\d+) unlocked trophies · timestamps preserved$",
        "Получено трофеев: $1 · время сохранено",
      ],
      ["^Local user ID: (.+) → (.+)$", "Локальный ID: $1 → $2"],
      [
        "^(\\d+) bytes changed · (\\d+)/(\\d+) valid blocks$",
        "Изменено байтов: $1 · $2/$3 блоков верны",
      ],
      [
        "^(\\d+) trophies and their timestamps remain unchanged\\.$",
        "$1 трофеев и время их получения не изменены.",
      ],
      [
        "^(\\d+) files · (\\d+) verified blocks$",
        "$1 файлов · $2 блоков проверено",
      ],
      [
        "^IDs read from TRPTITLE\\.DAT · (.+)$",
        "ID прочитаны из TRPTITLE.DAT · $1",
      ],
    ],
    it: [
      ["^(\\d+) selected$", "$1 selezionati"],
      ["^(\\d+) backups selected$", "$1 backup selezionati"],
      [
        "^(\\d+) backups loaded · source files preserved$",
        "$1 backup caricati · file sorgente conservati",
      ],
      [
        "^(\\d+) backups available\\. SHA-256 verified\\.$",
        "$1 backup disponibili. SHA-256 verificato.",
      ],
      [
        "^Integrity valid · (\\d+)/(\\d+) SHA-256 blocks$",
        "Integrità valida · $1/$2 blocchi SHA-256",
      ],
      ["^of (\\d+)$", "su $1"],
      ["^(\\d+) / (\\d+) valid$", "$1 / $2 validi"],
      ["^(\\d+) of (\\d+) trophies$", "$1 trofei su $2"],
      ["^Local time · (.+)$", "Ora locale · $1"],
      [
        "^(\\d+) unlocked trophies · timestamps preserved$",
        "$1 trofei sbloccati · date conservate",
      ],
      ["^Local user ID: (.+) → (.+)$", "ID utente locale: $1 → $2"],
      [
        "^(\\d+) bytes changed · (\\d+)/(\\d+) valid blocks$",
        "$1 byte modificati · $2/$3 blocchi validi",
      ],
      [
        "^(\\d+) trophies and their timestamps remain unchanged\\.$",
        "$1 trofei e le loro date rimangono invariati.",
      ],
      [
        "^(\\d+) files · (\\d+) verified blocks$",
        "$1 file · $2 blocchi verificati",
      ],
      [
        "^IDs read from TRPTITLE\\.DAT · (.+)$",
        "ID letti da TRPTITLE.DAT · $1",
      ],
    ],
  };
  dictionaries["zh-CN"]["Valid destination IDs are remembered on this PC."] =
    "有效的目标用户 ID 会保存在此电脑上。";
  dictionaries["zh-CN"]["The last IDs could not be remembered."] =
    "无法保存上次使用的 ID。";
  dictionaries["fr"]["Valid destination IDs are remembered on this PC."] =
    "Les ID de destination valides sont mémorisés sur ce PC.";
  dictionaries["fr"]["The last IDs could not be remembered."] =
    "Impossible de mémoriser les derniers ID.";
  dictionaries["it"]["Valid destination IDs are remembered on this PC."] =
    "Gli ID di destinazione validi vengono ricordati su questo PC.";
  dictionaries["it"]["The last IDs could not be remembered."] =
    "Impossibile ricordare gli ultimi ID.";
  dictionaries["ja"]["Valid destination IDs are remembered on this PC."] =
    "有効な移行先 ID はこの PC に保存されます。";
  dictionaries["ja"]["The last IDs could not be remembered."] =
    "前回の ID を保存できませんでした。";
  dictionaries["ru"]["Valid destination IDs are remembered on this PC."] =
    "Корректные ID назначения сохраняются на этом ПК.";
  dictionaries["ru"]["The last IDs could not be remembered."] =
    "Не удалось сохранить последние ID.";
  function translate(text, lang) {
    const dict = dictionaries[lang];
    if (!dict) return text;
    const trim = text.trim();
    if (dict[trim]) return text.replace(trim, dict[trim]);
    for (const [pattern, value] of patterns[lang]) {
      const rx = new RegExp(pattern);
      if (rx.test(text)) return text.replace(rx, value);
    }
    for (const [key, value] of Object.entries(dict).sort(
      (a, b) => b[0].length - a[0].length,
    )) {
      if (
        text.startsWith(key + ":") ||
        text.startsWith(key + "\n") ||
        text.startsWith(key + " ")
      )
        return value + text.slice(key.length);
    }
    return text;
  }
  const api = { dictionaries, translate };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KIK_LOCALES = api;
})(globalThis);

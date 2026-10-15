# KIK Trophy 1.0

**Move your PS5 trophy progress to another local user while preserving unlocked trophies and their original timestamps.**

Useful after creating a new user or reinstalling/resetting your console, when you want to restore trophies from an earlier backup. Work with one game or several at once.

[Download for Windows](https://github.com/kiikeep/KIK-Trophy/releases) · [Español](README.es.md)

Windows 10/11 x64, Intel or AMD. Extract the entire ZIP and open **KIK Trophy.exe**.

<img width="1632" height="1180" alt="{5C848C2A-62E2-4A17-B0A4-EEA65D9BFC38}" src="https://github.com/user-attachments/assets/158f34f3-114b-4635-b28b-c9ee9274f59f" />

## Which files do you need?

The two `trophy2` folders serve different purposes:

| PS5 path | Contents |
| --- | --- |
| `/user/trophy2/` | Each game's **catalog**: trophy names, descriptions, grades and images. |
| `/user/home/<USER_ID>/trophy2/` | **That user's progress**: earned trophies, timestamps and owner identity. |

These are the main files, using Ratchet & Clank as an example:

**Game catalog — `TROPHY.UCP`:**

```text
/user/trophy2/nobackup/conf/NPWR20842_00/TROPHY.UCP
```

**User progress — `TRPTITLE.DAT`:**

```text
/user/home/<USER_ID>/trophy2/nobackup/data/NPWR20842_00/TRPTITLE.DAT
```

`NPWR20842_00` identifies the game's trophy set. `<USER_ID>` is the folder belonging to a local user on your console.

**KIK Trophy modifies only `TRPTITLE.DAT`. This is the file you copy to the new installation to restore trophy progress.** The catalog supplies trophy details in the app; it does not contain your personal unlock history.

## 1. Back up your files to the PC

Copy both `trophy2` folders from the PS5 to your PC using FTP or your file manager. Keep them in a backup folder or ZIP archive.

Preserve their separate paths: one belongs to `/user/trophy2/`, the other to `/user/home/<USER_ID>/trophy2/`. **Do not merge them into one `trophy2` folder.** If you plan to reset the console, make this backup first.

Copying the folders preserves the files, but **the progress still belongs to the original user**. To restore it to another user—including after a system reinstall—you must adapt the DAT's owner IDs to the user in the new installation.

## 2. Get the destination user's IDs

The app uses two values: **Local user ID** and **Account ID**. Enter them manually if you know them.

If you do not:

1. Select the **local user who will receive the trophies** on your current PS5 installation.
2. Launch any game for the first time, then close it so the console can generate its trophy files.
3. Copy the resulting `TRPTITLE.DAT` for that user to your PC.

For example, if the destination user were `1234abcd` and you used ASTRO BOT:

```text
/user/home/1234abcd/trophy2/nobackup/data/NPWR24170_00/TRPTITLE.DAT
```

In KIK Trophy, click **Take IDs from another TRPTITLE.DAT** and select that file. The app reads both IDs.

**A DAT from any game works, but it must belong to the destination user on the current installation.** It does not have to be from the game you are restoring. `1234abcd` is an example ID; use the one from your console.

## 3. Adapt your backed-up progress

1. Use **Open folder** for your backup folder, or **Add files** for its ZIP archive.
2. Select a game and click **Change owner**. For several games, select their checkboxes and click **Change IDs in batch**.
3. Enter the destination IDs or read them from the DAT obtained in the previous step.
4. Review the destination path and export to a folder on your PC.

Your original files stay unchanged. The last valid IDs are remembered between app sessions. If multiple backups target the same game and user, select the history you want to restore.

## 4. Prepare the game and restore the DAT

**Before restoring, launch the game you want to recover at least once with the destination user, then close it.** Letting the console generate the catalog and other files is recommended.

Check that the catalog already exists on the current installation. For Ratchet & Clank:

```text
/user/trophy2/nobackup/conf/NPWR20842_00/TROPHY.UCP
```

If it does not exist yet, launch the game and check again before continuing.

Your export contains a structure like this:

```text
user/home/1234abcd/trophy2/nobackup/data/NPWR20842_00/TRPTITLE.DAT
```

Back up the console's current DAT, then copy **only the exported `TRPTITLE.DAT`** to its matching destination:

```text
/user/home/1234abcd/trophy2/nobackup/data/NPWR20842_00/TRPTITLE.DAT
```

Keep the filename `TRPTITLE.DAT` and check the user and game identifiers. The exported `user` folder corresponds to `/user` on the console.

**Your backup can contain complete folders; this restoration uses only the adapted DAT.** Restoring other trophy files has not been tested: let your console generate them. Copying files back to the PS5 is done separately from KIK Trophy.

---

Tested with **Ratchet & Clank: Rift Apart** and **ASTRO BOT**. The tool transfers existing progress; it does not unlock new trophies or sync with PSN.

Created by **kiikeep** · [MIT License](LICENSE)

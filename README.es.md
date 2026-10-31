# KIK Trophy 1.3.2

**Transfiere el progreso de trofeos de PS5 entre usuarios locales y restaura trofeos descargados desde PSN.**

Útil si creaste un usuario nuevo o reinstalaste/formateaste tu consola y quieres recuperar los trofeos de un respaldo anterior. Puedes trabajar con un juego o con varios a la vez.

[Descargar para Windows](https://github.com/kiikeep/KIK-Trophy/releases/latest) · [Código fuente](https://github.com/kiikeep/KIK-Trophy/releases/latest) · [English](README.md)

Para Windows 10/11 de 64 bits, Intel o AMD. Extrae el ZIP completo y abre **KIK Trophy.exe**.

## Novedad: descargar y combinar desde PSN

**PSN en línea** descarga el progreso que ya está sincronizado con tu cuenta de Sony. Permite consultarlo, guardarlo como JSON y añadir desbloqueos faltantes a un `TRPTITLE.DAT` local de PS5. No sube trofeos a PSN.

1. Abre tu carpeta o ZIP local, incluyendo el `TRPTITLE.DAT` y su catálogo `TROPHY.UCP` correspondiente.
2. Abre **PSN en línea** y pulsa **1. Iniciar sesión en Sony**. Inicia sesión en tu navegador. **2. Obtener NPSSO** abre el endpoint de sesión de Sony: pega su valor NPSSO o su JSON en la aplicación y pulsa **Conectar**. KIK Trophy recuerda tu sesión mediante almacenamiento cifrado para esta cuenta de Windows. Cerrar la aplicación la conserva; **Desconectar** la elimina. Si Sony la vence o revoca, necesitarás un NPSSO nuevo.
3. Busca el juego y pulsa **Descargar**. **Guardar JSON de PSN** crea un respaldo del progreso sin credenciales; **Abrir JSON de PSN** permite usar una descarga guardada sin conexión.
4. Selecciona un **Backup local** y pulsa **Vista previa del merge**. El Account ID de PSN debe coincidir con el propietario del DAT. Si hace falta, usa **Change owner**, exporta y vuelve a abrir ese DAT primero. Se conserva el ID local del DAT seleccionado.
5. Revisa los trofeos añadidos y la ruta de destino, y pulsa **Exportar DAT combinado**. Se crea una carpeta nueva con un reporte; los originales permanecen intactos.

El merge conserva todos los desbloqueos locales. **Fechas de trofeos en ambas fuentes** permite elegir **Conservar fechas locales** (predeterminado) o **Usar fechas de PSN** para los trofeos desbloqueados en ambas fuentes. Los trofeos nuevos usan su fecha de PSN y los que solo existen localmente conservan su fecha local. La vista previa detalla los reemplazos y permite exportar aunque solo cambien fechas. Requiere el mismo conjunto de trofeos de PS5 y coincidencia de IDs, cantidad y tipos. El número de versión por sí solo no bloquea el merge; ambas versiones quedan registradas en el reporte. Puedes descargar y consultar PS3/PS4, pero no combinarlos con un DAT de PS5.

**Antes del merge debe existir un DAT de ese juego. Abre el juego al menos una vez en tu PS5, ciérralo y copia su DAT y el TROPHY.UCP correspondiente al PC.**

El merge de PSN y su restauración se han confirmado en PS5 con ASTRO’s PLAYROOM. Conserva una copia del DAT original y prepara el juego y su catálogo como se explica abajo antes de restaurar un archivo exportado.

Instrucciones para compilar y detalles de validación: [DEVELOPMENT.md](DEVELOPMENT.md).

## Qué archivos necesitas

Hay dos carpetas `trophy2` con funciones diferentes:

| Ruta en la PS5 | Qué contiene |
| --- | --- |
| `/user/trophy2/` | El **catálogo** de cada juego: nombres, descripciones, categorías e imágenes de los trofeos. |
| `/user/home/<ID_USUARIO>/trophy2/` | El **progreso de ese usuario**: trofeos obtenidos, fechas e identidad del propietario. |

Estos son los archivos principales, usando Ratchet & Clank como ejemplo:

**Catálogo del juego — `TROPHY.UCP`:**

```text
/user/trophy2/nobackup/conf/NPWR20842_00/TROPHY.UCP
```

**Progreso del usuario — `TRPTITLE.DAT`:**

```text
/user/home/<ID_USUARIO>/trophy2/nobackup/data/NPWR20842_00/TRPTITLE.DAT
```

`NPWR20842_00` identifica el conjunto de trofeos del juego. `<ID_USUARIO>` corresponde a la carpeta de un usuario local de tu consola.

**KIK Trophy modifica únicamente `TRPTITLE.DAT`. Ese es el archivo que debes copiar a la nueva instalación para restaurar el progreso.** El catálogo permite mostrar los detalles de los trofeos en la aplicación, pero no contiene tus desbloqueos personales.

## 1. Guarda tu respaldo en el PC

Copia ambas carpetas `trophy2` de la PS5 al PC, mediante FTP o tu administrador de archivos. Puedes conservarlas dentro de una carpeta de respaldo o de un ZIP.

Mantén separadas sus rutas: una pertenece a `/user/trophy2/` y la otra a `/user/home/<ID_USUARIO>/trophy2/`. **No las combines en una sola carpeta `trophy2`.** Si vas a formatear, haz este respaldo antes.

Copiar las carpetas conserva los archivos, pero **el progreso sigue asociado al usuario original**. Para restaurarlo en otro usuario —también después de una reinstalación— debes adaptar los IDs del DAT al usuario de la instalación nueva.

## 2. Obtén los IDs del usuario destino

La aplicación utiliza dos datos: **Local user ID** e **Account ID**. Puedes introducirlos manualmente si los conoces.

Si no los conoces:

1. En la instalación actual de tu PS5, entra con el **usuario que recibirá los trofeos**.
2. Abre cualquier juego por primera vez y ciérralo para que la consola genere sus archivos de trofeos.
3. Copia al PC el `TRPTITLE.DAT` que se haya generado para ese usuario.

Por ejemplo, si el usuario destino fuera `1234abcd` y el juego utilizado fuera ASTRO BOT:

```text
/user/home/1234abcd/trophy2/nobackup/data/NPWR24170_00/TRPTITLE.DAT
```

En KIK Trophy, pulsa **Take IDs from another TRPTITLE.DAT** y selecciona ese archivo. La aplicación leerá ambos IDs.

**Puede ser un DAT de cualquier juego, pero debe pertenecer al usuario destino de la instalación actual.** No tiene que ser del juego cuyos trofeos quieres recuperar. `1234abcd` es solo un ID de ejemplo; utiliza el de tu consola.

## 3. Adapta el progreso del respaldo

1. Abre la carpeta del respaldo con **Open folder**, o selecciona su ZIP con **Add files**.
2. Para un juego, selecciónalo y pulsa **Change owner**. Para varios, marca sus casillas y pulsa **Change IDs in batch**.
3. Introduce los IDs destino o léelos del DAT obtenido en el paso anterior.
4. Revisa la ruta de destino y exporta a una carpeta del PC.

Los archivos originales permanecen intactos. Los últimos IDs válidos se recuerdan incluso después de cerrar la aplicación. Si varios respaldos apuntan al mismo juego y usuario, selecciona el historial que quieras restaurar.

## 4. Prepara el juego y restaura el DAT

**Antes de restaurar, abre el juego que vas a recuperar al menos una vez con el usuario destino y después ciérralo.** Se recomienda dejar que la consola genere el catálogo y los demás archivos.

Comprueba que ya exista su catálogo en la instalación actual. Para Ratchet & Clank:

```text
/user/trophy2/nobackup/conf/NPWR20842_00/TROPHY.UCP
```

Si todavía no existe, abre el juego y verifica de nuevo antes de continuar.

Dentro de la carpeta exportada encontrarás una estructura como esta:

```text
user/home/1234abcd/trophy2/nobackup/data/NPWR20842_00/TRPTITLE.DAT
```

Guarda una copia del DAT actual de la consola y copia **únicamente el `TRPTITLE.DAT` exportado** a su destino correspondiente:

```text
/user/home/1234abcd/trophy2/nobackup/data/NPWR20842_00/TRPTITLE.DAT
```

Conserva el nombre `TRPTITLE.DAT` y comprueba que coincidan el usuario y el identificador del juego. La carpeta `user` exportada corresponde a `/user` en la consola.

**El respaldo puede contener carpetas completas; para esta restauración solo se utiliza el DAT adaptado.** La restauración de otros archivos de trofeos no se ha probado: deja que los genere tu consola. La copia a la PS5 se realiza por separado de KIK Trophy.

---

Cambio de propietario probado con **Ratchet & Clank: Rift Apart** y **ASTRO BOT**. La descarga de PSN y el merge se explican arriba.

Creado por **kiikeep** · [Licencia MIT](LICENSE)

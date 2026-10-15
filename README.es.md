# KIK Trophy Desktop 1.0

Herramienta portátil para inspeccionar respaldos de trofeos PS5 y transferirlos
a otro usuario local, por ejemplo tras reinstalar el sistema o crear un perfil.
Autor: **kiikeep**. [Documentación técnica en inglés](README.md).

## Uso

1. Copia **las dos carpetas trophy2** de tu PS5 al PC, dentro de una carpeta
   de respaldo o un ZIP. Conserva las dos rutas separadas, sin fusionarlas:

```text
respaldo/user/home/<ID_ORIGEN>/trophy2/
respaldo/user/trophy2/
```

2. Abre la carpeta con **Open folder**. Para ZIP usa **Add files** o arrástralo
   a la aplicación. Se leen los respaldos y catálogos de forma recursiva.
3. Para un respaldo usa **Change owner**. Para varios, marca sus casillas o
   **Select all** y pulsa **Change IDs in batch**.
4. Introduce los IDs del usuario destino, o léelos desde otro **TRPTITLE.DAT**
   de ese usuario. Un campo vacío conserva el valor de cada respaldo.
5. Exporta. Los originales permanecen intactos. Cada lote crea una carpeta nueva
   con un informe; se elige un solo historial por juego y usuario destino.
6. En la PS5, **abre cada juego al menos una vez con el usuario destino** y
   ciérralo antes de restaurar. Guarda una copia del DAT actual.
7. Copia únicamente el **TRPTITLE.DAT** exportado a su ruta correspondiente:

```text
/user/home/<ID_DESTINO>/trophy2/nobackup/data/<NPWR_ID>/TRPTITLE.DAT
```

**Solo se modifica TRPTITLE.DAT.** No se ha probado restaurar los demás archivos
de trofeos: deja que los genere la consola. La aplicación exporta al PC;
la copia a la PS5 se realiza por separado. No mezcla historiales ni desbloquea
nuevos trofeos. Si tienes varios respaldos del mismo juego, elige el historial
que deseas restaurar.

## Windows e idiomas

Extrae el ZIP completo y abre **KIK Trophy.exe**. Conserva las DLL y carpetas
que lo acompañan. Incluye el entorno necesario, sin instalar Node ni Python.
Para **Windows 10/11 x64, Intel o AMD**; no incluye versión de 32 bits ni ARM64
nativa. No se puede garantizar compatibilidad con cualquier PC.

Inglés por defecto; español, chino simplificado, italiano, francés, japonés y ruso desde el botón superior.
El catálogo de cada juego puede no incluir todos esos idiomas; en ese caso se
muestran los textos disponibles. La selección de idioma se recuerda.

## Datos y comprobaciones

Muestra usuario local, Account ID hexadecimal y Base64, trofeos, fechas y
catálogo. Valida los hashes antes de editar y después de guardar; conserva los
registros de trofeos y sus fechas. El ID local corresponde a la carpeta del
usuario y es distinto del Account ID. No activa cuentas ni se conecta a PSN.

El método fue probado en PS5 con Ratchet & Clank y ASTRO BOT. Las pruebas de
esta versión cubren archivos sintéticos, cambios individuales y por lotes,
exportación real, cancelación, errores, preservación de originales y siete
idiomas de interfaz. El ejecutable Windows no se ejecutó en el entorno de
compilación. Consulta README.md para formatos admitidos, límites y desarrollo.

## Publicar y compilar

El código incluye licencia MIT, pruebas sintéticas y GitHub Actions para
compilar Windows. No contiene respaldos personales ni arte de juegos. Los
informes de exportación contienen IDs y rutas locales; no los subas al repositorio.

```bash
npm ci
npm test
npx playwright install chromium
npm run test:ui
npm run package:win
```

El workflow permite ejecución manual o etiquetas `v*`; genera un ZIP descargable
como artefacto, sin publicar automáticamente una GitHub Release.

## Estructura de exportación

Tanto la exportación individual como por lotes solicitan una carpeta de salida.
Dentro de una carpeta nueva se crea la estructura `user/home/<ID_DESTINO>/trophy2/nobackup/data/<NPWR_ID>/TRPTITLE.DAT`.
El ID corresponde al usuario nuevo del DAT. La vista previa y el informe
muestran el destino. La carpeta exportada `user` corresponde a `/user` en la consola.
Si varios respaldos apuntan al mismo archivo, debes elegir un historial;
no se sobrescriben ni mezclan los trofeos.

## Últimos IDs

Los IDs destino válidos se recuerdan en este PC al escribirlos, leerlos de un
TRPTITLE.DAT o exportar. Se rellenan al abrir el editor individual o por lotes,
incluso después de reiniciar la aplicación. Una entrada incompleta o inválida
no reemplaza los últimos valores válidos. Los campos vacíos mantienen su
significado de conservar el valor de cada respaldo. Vaciar la lista de respaldos
no borra estos datos. Se guardan en `%APPDATA%/KIK Trophy/preferences.json`.

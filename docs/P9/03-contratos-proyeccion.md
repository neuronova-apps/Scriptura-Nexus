# P9.1.3. Contratos y proyección textual reproducible

## Objetivo y alcance

Formalizar los contratos ENT19–ENT23 y ENT37 y proyectar en memoria las dos ediciones admitidas en P9.1.2. La salida de la fase es un informe de integridad y cobertura, no un corpus persistido. La línea base es main 13776e1d81692ab0336929ca282c9bfaf420ee37.

## Entidades

- ENT19, edición textual: dos registros, TXT-RV1909 y TXT-SBLGNT-V1-2. Ambos identifican fuente, lengua, tipo, versión, recursos, licencia, cobertura y revisión de origen. canonId y versificationId permanecen null.
- ENT20, canon: se define el contrato de identidad, contexto/tradición, lista ordenada de libros y fuentes. No se crea un canon real ni se atribuye pertenencia canónica a los inventarios de las ediciones.
- ENT21, versificación: se define el contrato de reglas y correspondencias con evidencia. No se crea una versificación armonizada ni se asigna una a las ediciones.
- ENT22, libro bíblico: 66 identificadores internos LIB-*, nombres españoles y alias de fuente. Son claves de identidad y navegación; no constituyen una decisión canónica ni una ordenación universal.
- ENT23, unidad textual: cada marcador original de capítulo/versículo produce una unidad efímera con ID determinista, etiqueta literal, orden de origen, texto proyectado, recurso, localizador y huellas. Los rangos y sufijos se conservan como cadenas.
- ENT37, manifiesto de corpus: dos manifiestos metadata-only con recursos, fragmentos por libro, recuentos y hashes. El manifiesto no contiene texto bíblico.

## Fuentes y transformación

### Reina-Valera 1909

Se descarga el ZIP spaRV1909 ya admitido, se verifica su tamaño, SHA-256, inventario y cada archivo. Los 66 USFM se leen desde memoria. El proyector conserva los marcadores de capítulo y versículo como cadenas, elimina del texto de lectura las notas, referencias cruzadas, encabezados y marcadores de formato, conserva el contenido visible, la puntuación y Unicode, y normaliza espacios consecutivos. El hash del archivo y el hash del segmento fuente permiten rastrear la proyección. Esta transformación no reescribe ni sustituye el archivo original.

### SBL Greek New Testament v1.2

Se descargan los 27 XML desde el commit fijado en P9.1.2 y se verifican Git blob SHA-1, tamaño y SHA-256. Las unidades se forman con los marcadores verse-number. El texto visible se proyecta a partir de w, prefix y suffix en el orden original; los signos y espacios del suffix se conservan, y se separan palabras adyacentes cuando el sufijo no aporta separación. No se incorporan lemas, morfología, Strong ni aparatos críticos. El pasaje Juan 7:53–8:11 se conserva como parte de esta edición, sin inferencia canónica.

Los localizadores originales de cada fuente se mantienen. No se convierte un rango en versículos individuales, no se corrigen numeraciones, no se infiere canon y no se crean alineaciones entre ediciones. La identidad común de libro LIB-* es una clave interna; no afirma equivalencia de unidades.

## Integridad y controles

El informe de P9.1.3 incluye dos ediciones, 66 libros internos, recursos y fragmentos por archivo, unidades proyectadas, unidades vacías, marcadores de rango, elementos de palabra cuando la fuente los ofrece, huellas por fragmento y digest global por edición. Los digest se calculan sobre unidades serializadas de forma canónica, incluyendo el texto efímero; solo se conserva el hash, no el texto.

El script no escribe archivos de corpus, no imprime texto bíblico, no modifica src/data/linguistica/registro.json ni src/data/publicaciones/registro.json, no genera tokens ENT24, lemas, análisis, alineaciones ni snapshots de publicación. ENT20 y ENT21 quedan definidos como contratos, sin instancias aprobadas. La publicación continúa bloqueada por P11.4.

## Validación

Las pruebas sintéticas cubren USFM, XML, Unicode, etiquetas con sufijos/rangos, puntuación, prefijos/sufijos, notas excluidas, referencias duplicadas, archivos malformados, DTD/entidades, libro equivocado, elementos XML desconocidos, IDs deterministas y huellas. El workflow repite la validación de admisión P9.1.2, comprueba los contratos, proyecta ambas fuentes reales y ejecuta check, test, build y verificación del artefacto estático.

La proyección real solo se considera conforme si los recuentos por libro coinciden exactamente con el manifiesto P9.1.2. Un fallo de parseo o una estructura desconocida detiene la fase; no se completa mediante inferencias.

## Salida y dependencia siguiente

El informe metadata-only se registra en docs/P9/proyeccion-ediciones-p913.json una vez generadas y verificadas las huellas de proyección reales. P9.1.3 no habilita el lector ni la publicación. P9.2 deberá decidir su alcance de lector, cobertura, navegación y representación de referencias a partir de estos contratos, sin dar por resueltos canon o versificación.

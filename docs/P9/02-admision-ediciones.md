# P9.1.2. Revisión y admisión de ediciones bíblicas

Fecha de decisión: 26 de noviembre de 2026. Base main 949a5610729308c85a48aa66ea7aa4954a1fd408. P9.1.1 PR #55 integrado; despliegue #150 exitoso; auditoría específica #1 exitosa (10/10). La decisión se limita a admitir dos snapshots para procesamiento técnico controlado y proyección en memoria en P9.1.3. No habilita todavía el lector, la persistencia del corpus ni la publicación.

## 1. Decisiones

| ID | Fuente | Edición/version | Decisión | Alcance |
|---|---|---|---|---|
| ED-C01 / F05 | eBible.org | Reina-Valera 1909, spaRV1909 | Admitida | 66 archivos USFM del snapshot fijado |
| ED-C02 / F03 | Faithlife/SBLGNT | SBLGNT v1.2 | Admitida | 27 archivos XML oficiales del Nuevo Testamento griego |
| F19 | OSHB/WLC | Distribución previa P8 | Sin ampliación | Se conserva exactamente el alcance anterior; no se admite en P9 por esta decisión |
| F16–18, F22 | Ediciones históricas, TR, bizantino y LXX | Edición concreta pendiente | Diferidas | No hay snapshot y licencia de archivo revisados |
| F11–15, F20–21, F24–25 | Traducciones modernas/católicas, ediciones críticas comerciales y NET Notes | Varias | Consulta externa | Sin admisión de corpus |
| F10 | Léxicos comerciales | Varias | Restringido | No importar ni redistribuir |

## 2. ED-C01. Reina-Valera 1909

La ficha oficial de eBible.org identifica la distribución como spaRV1909, dialecto Castellano 1909, atribución "Reina y Valera" y declara "Public Domain / Dominio Público". La página registra 13 de diciembre de 2013; la ficha del PDF del proveedor identifica archivos fuente fechados el 10 de agosto de 2015. No se deben confundir la fecha de edición de 1909, la fecha de la página y la fecha de los archivos digitales.

- Fuente: https://ebible.org/find/details.php?id=spaRV1909
- Evidencia de licencia: https://ebible.org/spaRV1909/copyright.htm
- Archivo: https://ebible.org/Scriptures/spaRV1909_usfm.zip
- ZIP: 2.384.901 bytes; SHA-256 `56937c2be9ad278aed91370d6a15a98fe976f275d0cbaa6e26910291d949c7a5`.
- Contenido auditado: 66 libros, 1.189 capítulos y 31.102 marcadores; 66 SHA-256 individuales.
- Cuatro auxiliares del ZIP (copr.htm, keys.asc, signature.txt.asc, latin.css) no se admiten como corpus. La firma incluida no se verificó criptográficamente.
- Decisión: admitir el texto de los 66 archivos USFM para lectura y proyección técnica en memoria. Mantener el archivo y sus marcadores originales. La declaración de dominio público es la del distribuidor; no equivale a un dictamen jurídico independiente ni extiende derechos a otras revisiones de Reina-Valera. La revisión territorial de publicación sigue pendiente.

## 3. ED-C02. SBL Greek New Testament

Se fija el repositorio oficial Faithlife/SBLGNT en commit `736fdc76158950c3d04b949b7e013ca14305145a` (11 de julio de 2023). El README versionado del repositorio registra v1.2 con fecha 10 de julio de 2023 e indica que incorpora Juan 7:53–8:11; el commit fijado añade ese pasaje a los archivos XML y de texto. Se comprobó que los marcadores John 7:53 y John 8:11 están presentes en el XML de Juan.

- Corpus: 27 XML de libros, 260 capítulos, 7.939 marcadores y 137.741 elementos w.
- Licencia: CC BY 4.0. LICENSE y README del snapshot conservan la declaración. Copyright 2010 Society of Biblical Literature y Logos Bible Software. Editor: Michael W. Holmes.
- Atribución propuesta: "The SBL Greek New Testament (SBLGNT), edited by Michael W. Holmes. Copyright 2010 Society of Biblical Literature and Logos Bible Software. Licensed under CC BY 4.0. Source revision: 736fdc76158950c3d04b949b7e013ca14305145a. Changes, if any, are identified with the distributed version."
- Se admite exclusivamente el texto oficial de los 27 archivos XML y sus elementos estructurales. No se incorporan MorphGNT, Strong, glosas, aparatos críticos, manuscritos ni variantes externas.
- El commit no está firmado/verificado. La integridad queda fijada mediante commit, Git blob SHA-1 y SHA-256 por archivo; no se declara una firma digital inexistente.

## 4. Reglas comunes de admisión

1. El estado "admitido" se limita a la proyección en memoria y validación técnica de P9.1.3.
2. No se asignan canonId ni versificationId. Los 66 libros de RV1909 y los 27 de SBLGNT son cobertura observada de cada fuente, no un canon normativo de la plataforma.
3. No se crean alineaciones RV1909–SBLGNT ni se deducen equivalencias por coincidencia numérica de capítulo/versículo.
4. Se conserva grafía Unicode, puntuación, marcadores y estructura del proveedor; cualquier transformación futura debe ser reproducible y documentada.
5. No se persisten textos originales en `src/data`, `public/data` ni en otro directorio del repositorio durante P9.1.2. Los registros públicos de lingüística y publicaciones permanecen vacíos.
6. La licencia permite determinados usos bajo sus términos, pero el proyecto no autoriza la publicación en esta fase. El control de publicación corresponde a P11.4, con atribución visible, revisión territorial cuando proceda, pruebas y aprobación expresa.

## 5. Verificación y trazabilidad

El manifiesto `admisiones-ediciones-p912.json` contiene el snapshot de 66 archivos RV1909 y 27 archivos SBLGNT, sus tamaños, hashes y recuentos estructurales, evidencia de licencia, versiones, atribuciones y límites de uso. El validador descarga las fuentes oficiales, compara cada SHA-256 y el inventario, y no escribe el corpus. Se ejecutan pruebas sintéticas positivas y negativas y se conserva el resultado de CI.

## 6. Resultado de P9.1.2

Admitidas técnicamente: 2 ediciones (93 archivos de libros). Diferidas/restringidas: las fuentes restantes indicadas en el manifiesto. Corpus persistido: 0. Registros públicos modificados: 0. Alineaciones creadas: 0. Publicación autorizada: no. P9.1.3 puede comenzar con proyección en memoria, sin lector ni publicación.

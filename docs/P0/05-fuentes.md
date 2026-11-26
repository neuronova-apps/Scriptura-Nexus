# P0.5. Inventario de fuentes, léxicos, traducciones y licencias

Fecha de revisión documental: 25 de noviembre de 2026
Versión: 1.0
Dependencias: [P0.2](02-alcance.md), [P0.3](03-ejes.md), [P0.4](04-metodologia.md).

## 1. Finalidad y alcance

Identificar recursos para la plataforma pública y para la investigación individual. Esta etapa registra candidatos y condiciones de uso; no descarga, importa, redistribuye ni integra corpus, textos, imágenes o datos. No constituye dictamen jurídico ni autorización general. La admisión definitiva de cada archivo se realiza antes de su incorporación en P7–P9.

## 2. Clasificación operativa

- A: candidato prioritario con licencia abierta o declaración de dominio público localizada en fuente del proyecto/distribuidor; requiere fijar versión, archivo, procedencia y atribución antes de importar.
- B: candidato condicionado a revisar la edición, el archivo, las licencias de componentes, su compatibilidad o permisos específicos. No importar hasta resolver.
- C: consulta externa, referencia bibliográfica, enlace o cita permitida. No almacenar obras completas sin autorización acreditada.

La clasificación corresponde a uso público en Scriptura Nexus y no a calidad académica. Una fuente comercial puede ser esencial para investigación aun cuando no se pueda redistribuir.

## 3. Inventario inicial

| ID | Recurso | Licencia o condición | Clase | Fase/uso | Fuente o localizador |
|---|---|---|---|---|---|
| F01 | STEPBible Data (TAGNT, TAHOT, léxicos y tablas de códigos) | CC BY 4.0 declarada; comprobar cabecera y componentes | A | P8 | https://stepbible.github.io/STEPBible-Data/ |
| F02 | Open Scriptures Hebrew Bible (OSHB) | Lemas y morfología CC BY 4.0; comprobar texto WLC por separado | A | P8 | https://github.com/openscriptures/morphhb/blob/master/LICENSE.md |
| F03 | SBLGNT, distribución pública v1.2 (2023-07-10) | CC BY 4.0; conservar atribución SBL y Logos | A | P9 | https://github.com/Faithlife/SBLGNT |
| F04 | MorphGNT SBLGNT | Lemas y análisis morfológico CC BY-SA; verificar versión exacta y separar licencia del texto | B | P8 | https://github.com/morphgnt/sblgnt |
| F05 | Reina-Valera 1909 (spaRV1909) | Dominio público declarado por distribuidor; conservar procedencia | A | P9 | https://ebible.org/spaRV1909/copyright.htm |
| F06 | MACULA Greek | Licencias por componente; revisar datos sintácticos y glosas separadamente | B | P8 | https://github.com/Clear-Bible/macula-greek/blob/main/LICENSE.md |
| F07 | MACULA Hebrew | Licencias por componente; no importar todo el repositorio indiscriminadamente | B | P8 | https://github.com/Clear-Bible/macula-hebrew |
| F08 | Strong, concordancia histórica y diccionarios digitales | Pendiente identificar edición/digitalización; preferir identificadores de F01 | B | P8 | https://stepbible.github.io/STEPBible-Data/ |
| F09 | BDB, Gesenius, Thayer, LSJ | Obras históricas; comprobar edición, digitalización, adiciones y derechos por recurso | B | P8 | https://stepbible.github.io/STEPBible-Data/ |
| F10 | BDAG, HALOT, Louw-Nida | No se ha acreditado autorización de redistribución; consulta de edición adquirida | C | P7/P8 | Logos o editorial correspondiente |
| F11 | Reina-Valera 1960 | Derechos gestionados por American Bible Society; citas sujetas a condiciones | C | P9 | https://www.americanbible.org/rights-and-permissions/ |
| F12 | NVI | Biblica; citas condicionadas a pautas y atribución | C | P9 | https://www.biblica.com/permissions/ |
| F13 | LBLA y NBLA | Lockman Foundation; condiciones específicas de cita | C | P9 | https://www.lockman.org/espanol/permiso-para-citar/ |
| F14 | Reina-Valera 1995, RVR2015, NTV y otras modernas | Licencia de edición y medio pendiente; no importar | C | P9 | Editorial o titular por identificar |
| F15 | Biblia de Jerusalén, Nácar-Colunga, Biblia Latinoamericana | Edición y derechos pendientes; no asumir dominio público | C | P9 | Editorial o titular por identificar |
| F16 | Reina 1569 y Valera 1602 | Ediciones históricas; verificar facsímil/transcripción, proveedor y derechos de digitalización | B | P9 | Proveedor y edición por seleccionar |
| F17 | Textus Receptus (Erasmo, Estienne, Beza, Elzevir, Scrivener) | Seleccionar edición concreta y fuente digital; no asumir identidad entre ediciones | B | P9 | Proveedor por seleccionar |
| F18 | Texto bizantino y mayoritario | Seleccionar edición y comprobar licencia; no equivalentes automáticos de TR | B | P9 | Proveedor por seleccionar |
| F19 | Texto masorético / WLC | Seleccionar distribución y comprobar condiciones de texto y anotaciones | B | P9 | https://github.com/openscriptures/morphhb |
| F20 | BHS y BHQ | Ediciones críticas y aparatos: derechos no acreditados; consultar | C | P9 | Editorial Deutsche Bibelgesellschaft; edición por identificar |
| F21 | NA28 y UBS5 | Ediciones críticas y aparatos: derechos no acreditados; consultar | C | P9 | Editorial Deutsche Bibelgesellschaft; edición por identificar |
| F22 | Septuaginta, Vulgata, Tárgumes y Pentateuco samaritano | Seleccionar ediciones concretas; licencias por edición y transcripción | B | P9 | Proveedor por seleccionar |
| F23 | Rollos del mar Muerto, papiros y códices | Permisos de imágenes, transcripciones y metadatos por institución; enlaces antes de importar | B | P9 | Institución custodiante por seleccionar |
| F24 | NET Bible Notes | Licencia y condiciones de notas separadas del texto; no importar mientras no se verifiquen | C | P7/P9 | https://netbible.org/ |
| F25 | Logos Bible Software | Acceso por licencia personal; no presupone redistribución ni API disponible | C | Investigación | https://www.logos.com/ |
| F26 | Documentos doctrinales y patrística | Citar originales y ediciones identificadas; verificar traducciones y permisos | B | P7 | Sitios institucionales y editoriales por seleccionar |
| F27 | Monografías, comentarios, revistas y artículos académicos | Derechos por obra; preferir enlaces, referencias, citas permitidas y acceso abierto comprobado | C | P7 | Editorial, DOI o repositorio institucional por obra |

## 4. Evidencia de licencias consultada

- F01: https://github.com/STEPBible/STEPBible-Data y https://stepbible.github.io/STEPBible-Data/ declaran CC BY 4.0. Las tablas y sus encabezados deben revisarse por archivo.
- F02: https://github.com/openscriptures/morphhb y https://github.com/openscriptures/morphhb/blob/master/LICENSE.md identifican CC BY 4.0 para lemas y morfología y una atribución específica. No extender automáticamente esta licencia a cualquier edición hebrea.
- F03: el README de Faithlife/SBLGNT registra v1.2 (2023-07-10), que incorpora Jn 7:53–8:11, y declara CC BY 4.0; LICENSE contiene el texto de la licencia. P9 fija el corpus al commit 736fdc76158950c3d04b949b7e013ca14305145a (2023-07-11), con huellas por archivo. Copyright 2010 Society of Biblical Literature y Logos Bible Software. La versión v1.1 de 2022 queda como antecedente, no como snapshot admitido.
- F04: https://github.com/morphgnt/sblgnt distingue licencia CC BY-SA de lematización/análisis morfológico y condiciones del texto SBLGNT. No se ha fijado todavía la versión de CC BY-SA ni el archivo exacto; comprobar antes de mezclar o adaptar.
- F05: https://ebible.org/find/details.php?id=spaRV1909 y https://ebible.org/spaRV1909/copyright.htm declaran dominio público de esta distribución. Verificar procedencia, integridad, edición y aplicabilidad territorial antes de importar.
- F06–F07: https://github.com/Clear-Bible/macula-greek/blob/main/LICENSE.md y https://github.com/Clear-Bible/macula-hebrew documentan diversas fuentes y licencias por componente. Pendiente auditoría de archivos.
- F11: https://www.americanbible.org/rights-and-permissions/ identifica al gestor de derechos RVR1960 y condiciones de cita. No es permiso para un lector completo.
- F12: https://www.biblica.com/permissions/ y https://www.biblica.com/general-use-guidelines/ establecen condiciones de reproducción limitada y atribución. Comprobar edición NVI y uso digital concreto.
- F13: https://www.lockman.org/permission-to-quote-copyright-trademark-information/ y https://www.lockman.org/espanol/permiso-para-citar/ describen permisos y atribuciones para LBLA y NBLA.
- Los restantes registros son candidatos o consultas con verificación individual pendiente; no se afirma haber revisado todas sus licencias.

## 5. Selección inicial propuesta

P8: priorizar STEPBible para identificación léxica, concordancias, códigos Strong y datos morfológicos; OSHB como referencia complementaria hebrea. MorphGNT y MACULA quedan condicionados a auditoría de componentes y compatibilidad. No duplicar ni fusionar automáticamente formas, lemas o identificadores de diferentes ediciones.

P9: priorizar RV1909 en español y SBLGNT v1.2 en griego; seleccionar una distribución hebrea concreta con licencia verificada. Para comparación TR/crítica y Septuaginta, seleccionar ediciones digitales específicas antes de importar. Las Biblias contemporáneas y católicas permanecerán disponibles como referencias externas y citas permitidas, no como textos completos alojados. Buscar una edición católica en español con autorización abierta comprobable antes de incorporar un corpus católico completo.

P7: fichas bibliográficas, autores, documentos doctrinales, referencias patrísticas y enlaces; no alojar monografías, comentarios o léxicos comerciales completos. Incorporar fuentes oficiales pentecostales, protestantes y católicas y estudios académicos según tema, con edición, página y autoridad institucional verificadas.

## 6. Registro obligatorio antes de cualquier importación

ID de fuente; autor/titular y distribuidor; título y edición; URL de origen y de licencia; fecha de consulta; versión o commit fijo; ruta del archivo original; licencia exacta y alcance por componente; evidencia conservada; atribución requerida; cambios realizados; compatibilidad y restricciones; territorios cuando proceda; checksum SHA-256 del archivo; formato; estado de revisión; responsable y fecha de aprobación.

No usar enlaces mutables como único identificador. Separar datos originales, derivados, traducciones propias y código. Mantener avisos y textos de licencia asociados a los archivos; enlazar atribuciones desde la interfaz pública. CC BY exige atribución y señalamiento de cambios; CC BY-SA puede exigir compartir adaptaciones bajo licencia compatible. No imponer una licencia global del repositorio que contradiga las licencias de terceros. Licencia general del código/contenido propio queda pendiente de decisión del titular.

## 7. Controles técnicos y editoriales

Validar Unicode, versificación, libros/canon, idioma, cobertura, recuentos, tokens, correspondencia lema/forma/Strong, códigos morfológicos y procedencia por edición. Conservar distinciones entre manuscrito, edición y traducción. No fabricar alineaciones entre RV1909 y ediciones originales; identificar discrepancias y verificar correspondencias antes de ofrecer interlineales. No traducir masivamente léxicos sin comprobar derechos de adaptación. No publicar archivos descargados de Logos ni credenciales, notas privadas o material licenciado. Para citas de Biblias modernas verificar límites acumulados por obra/producto, avisos, medio y términos vigentes; si no es claro, solicitar permiso o limitarse a referencia/enlace.

## 8. Flujo de admisión y actualización

Identificar recurso → revisar licencia exacta y componentes → documentar evidencia y versión → comprobar compatibilidad → aprobación de incorporación → descarga y checksum → pruebas de integridad → publicación con atribuciones → revisión cuando cambie versión o licencia. Si falta permiso, conservar como consulta externa o bloquear. Registrar fecha y motivo de cada cambio de clasificación. No presentar disponibilidad en internet como autorización de redistribución.

## 9. Cierre P0.5

Inventario de 27 registros: 4 prioritarios abiertos, 12 condicionados y 11 de consulta externa. La revisión ha confirmado declaraciones de licencia de recursos prioritarios y condiciones generales de varias traducciones comerciales; la auditoría por archivo, versión, territorio y compatibilidad permanece pendiente antes de importación. No se han importado datos ni iniciado investigaciones. P0.6 definirá arquitectura técnica teniendo en cuenta estas restricciones. El cierre documental de P0.5 no equivale a autorización de redistribución.

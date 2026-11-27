# P11.4.6.1. Auditoría de manuscritos, variantes y derechos

Base main d3ba06f78f0e9728a0737823bc3917391aed23ca; PR #119 integrado, 50 comprobaciones satisfactorias y una omitida; run 46049050821/job 140675510099 confirma compuerta del comparador bloqueada por revisión manual, derechos/privacidad y autorización del responsable. Pages 46049746249 se verifica por separado.

## Inventario y límites

P9.4.1–P9.4.4 y P9.5 ya desarrollaron inventario, contratos ENT19/31/32/33, muestra documental, interfaz y validación integral. Se conserva ese trabajo; no se repiten sus implementaciones. Fuentes: docs/P9/12-plan-manuscritos-variantes.md a 17-cierre-integral-herramientas-textuales.md. La página src/pages/manuscritos/consulta.astro monta emptyManuscriptRelease(), no importa la muestra y mantiene los controles públicos deshabilitados. El modelo src/lib/manuscript-view.ts acepta una proyección de referencia y exige autorización para cualquier contenido público. El futuro adaptador privado debe separar explícitamente validación aislada de autorización real; no falsificar publicationAuthorized para representar permisos.

La auditoría histórica registró 11 candidatos: cinco repositorios solo para enlace externo y seis grupos editoriales sin selección. INTF NTVMR, CSNTM, Codex Sinaiticus Project, Biblioteca Apostólica Vaticana y Leon Levy Dead Sea Scrolls Digital Library conservan las restricciones documentadas en P9.4.1. No se copian imágenes, transcripciones, exportaciones de metadatos ni aparatos. BHS/BHQ, NA28/UBS5, Reina 1569/Valera 1602, Textus Receptus, texto bizantino/mayoritario y las tradiciones agrupadas en ED-C06 continúan sin selección. ED-C01 y ED-C02 de este inventario son identificadores locales de P9.4.1, no los candidatos del lector P11.4.2.

## Alcance documental inicial

Reutilizar exclusivamente la muestra P9.4.3 (Juan 1:18), siete recursos, ocho evidencias, dos testigos (P66 y GA 02/A), una variante, dos referencias de lectura y dos atestaciones secundarias. Cero inspecciones directas, folios o manos verificados y valoraciones de originalidad. SBLGNT v1.2 es edición crítica; su aparato compara ediciones y no proporciona por sí mismo una lista de testigos manuscritos. RV1909 es traducción, no testigo. El locus permanece source_native_only, sin asignar unidades ni versificación. La mano es desconocida en ambas atestaciones. Se conserva el registro histórico P9.4.2 vacío.

Las referencias al catálogo, custodia, aparato editorial, depósito IGNTP y artículo de Wright conservan la procedencia y restricciones históricas. La licencia CC BY 4.0 declarada para SBLGNT no implica admisión de archivos de aparato; IGNTP P66 permanece solo como enlace con versión de licencia no comprobada. No se reproduce la tabla de Wright ni sus conclusiones. Los datos factuales mínimos y enlaces propios de la muestra deberán revisarse antes de publicación. Esta auditoría del repositorio no vuelve a consultar las páginas de terceros ni certifica derechos vigentes o acceso actual; la revisión específica de permisos y enlaces se exige antes de liberar.

## Ruta operativa propuesta

P11.4.6.2: proyección de referencia aislada, validación de procedencia y permisos por componente, sin admisión implícita. P11.4.6.3: candidato privado con las fichas documentales reales de la muestra existente. P11.4.6.4: pruebas de integridad, accesibilidad, privacidad y revisión de límites. P11.4.6.5: consolidación y decisión de liberación controlada. Subdivisiones propuestas, ajustables a hallazgos; no amplían alcance editorial. Sin nuevos manuscritos ni variantes hasta aprobación documental independiente. No se altera el comparador, lector, analizador o léxicos.

## Validación

Registro de auditoría y pruebas de conciliación con los contratos y muestra histórica, barreras de derechos, identidad, fuente, ausencia de publicación y gates previos. Workflow ejecuta regresiones del módulo y escaneo de artefacto público. Los resultados de CI se verifican antes de integrar. Se conserva último progreso registrado 63/69, pendiente de conciliación en cierre transversal; la siguiente línea es P11.4.6.2.

# P10.1.3. Ampliación del catálogo

Fecha: 26 de noviembre de 2026. Base main: 19c182a208bb30a85df4fc551070ecc7fedeceac. P10.1.1 y P10.1.2: PR #71, build #212 y P9.5 #3 satisfactorios; despliegue de rama omitido. El responsable aprobó las 38 investigaciones propuestas y autorizó P10.1.3.

## Decisiones

Se conserva byte por byte el catálogo inicial src/data/catalogo/estudios.json (blob Git 012e624be0fceb093befd7ad321566d586be3fd6) y la taxonomía histórica de P0.3/P5. El nuevo archivo src/data/catalogo/ampliacion-p1013.json contiene la correspondencia de propuestas P10-Qnn a SN-043–SN-080, 38 registros planificados y las cinco revisiones autorizadas de SN-007, SN-020, SN-023, SN-031 y SN-034. La proyección operativa src/lib/catalog.ts combina ambos archivos sin duplicación: 42 + 38 = 80. La versión 0.2.0 de las cinco revisiones corresponde a metadatos del catálogo, no a publicación editorial aprobada. Sus títulos, identificadores, fechas originales y ejes permanecen estables.

Se conservan todas las 49 preguntas consolidadas. Los temas agrupados se representan en el campo pregunta de su estudio, no como copias independientes. Se incorporan referencias orientativas de las cinco ampliaciones y del tema familiar SN-080; para los otros temas nuevos se declara pendiente la selección de fuentes, sin simular evidencia. En SN-031 se explicita la abreviatura dependiente de contexto Ex 25:18-22. Los perfiles y 30 relaciones cruzadas específicas conservan su registro de planificación para P10.1.4; no se presentan como evidencia doctrinal. Los nuevos relatedAxisIds permanecen vacíos hasta la revisión correspondiente.

## Distribución operativa

| Eje | Original | Actual |
|---|---:|---:|
| E01 | 1 | 2 |
| E02 | 5 | 5 |
| E03 | 2 | 2 |
| E04 | 3 | 4 |
| E05 | 6 | 6 |
| E06 | 1 | 4 |
| E07 | 3 | 5 |
| E08 | 5 | 8 |
| E09 | 9 | 13 |
| E10 | 4 | 10 |
| E11 | 3 | 7 |
| E12 | 0 | 5 |
| E13 | 0 | 3 |
| E14 | 0 | 6 |
| Total | 42 | 80 |

## Validación

El validador P10.1.3 reproduce la ampliación a partir de las propuestas autorizadas, verifica el hash histórico, los 80 IDs únicos, las cinco revisiones exactas y el estado planificado. Se añaden cinco pruebas de integridad, referencias, búsqueda y plantillas; se adaptan las regresiones de filtros, búsqueda, publicación y relaciones taxonómicas, conservando las pruebas históricas P5.2. Se auditan 96 páginas de catálogo, búsqueda, ejes y estudios y las 1600 posiciones de las plantillas, con verificación de enlaces y barreras de publicación.

No se modifican la base de datos lingüística, corpus, licencias, dependencias, plantillas de investigación ni registro de snapshots. La aprobación del catálogo no autoriza publicar investigaciones, textos o conclusiones. CI confirmado para e7072818: Infraestructura #223, lector #32, comparador #27, manuscritos #15, cierre P9.5 #14, rendimiento lingüístico #16 y accesibilidad lingüística #14 satisfactorios. Deploy omitido por tratarse de un PR de desarrollo. Se corrigió TS2339 (tipo común del catálogo), un recuento de contrato editorial y una importación de pruebas, sin cambios en los registros. El PR #71 se conserva como borrador hasta completar P10.1.4 y P10.1.5. Los cinco pilotos siguen siendo los del plan maestro. No se exige investigar los 80 temas para cerrar P10.

Siguiente etapa operativa: P10.1.4, integración de perfiles y relaciones cruzadas con los identificadores definitivos.

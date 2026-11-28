# SN-001 — Revisión de versión exacta 5.5.4

## Estado

Resultado: expediente de revisión preparado; aprobación bloqueada y pendiente de decisión humana.

Esta fase identifica y fija el objeto exacto de revisión. No constituye una aprobación editorial, una revisión académica externa, una admisión de fuentes ni una autorización de publicación.

## Versión sometida a revisión

- Estudio: SN-001, Levítico 19:28.
- Registro editorial: 0.4.3.
- Paquete: `docs/investigaciones/SN-001-registro-consolidado-553.json`.
- Huella SHA-256 del contenido revisable: `ac69d5692246d4c9b24b279237f299101b53b46579f5a40dcb745310042baddc`.
- Huella Git del paquete consolidado: `d051321c8356150d3fbc6139d4c0c4ad0eeb9ad6`.
- Rama de origen: `research/sn-001-consolidacion-553`.

La huella de contenido se calcula con el procedimiento `reviewedContentDigest`: incluye identidad y versión del estudio, registro editorial sin el historial de revisiones, relaciones y cuerpos de las secciones. El validador vuelve a calcularla y comprueba que coincida. Si cambia cualquiera de esos elementos, la huella deja de corresponder y la revisión deberá prepararse de nuevo.

Los archivos de origen y sus hashes Git se conservan en `SN-001-revision-554.json`. Las etiquetas 0.4 del manuscrito y 0.4.0 del candidato de integración se mantienen como referencias históricas distintas; no se convierten en la versión sometida a revisión.

## Alcance revisable

| Elemento | Cantidad | Estado |
|---|---:|---|
| Secciones totales | 20 | Estructura cotejada |
| Secciones analizadas | 14 | Requieren revisión humana |
| Secciones fuera del alcance | 6 | Justificaciones preservadas |
| Afirmaciones | 5 | Vínculos estructurales cotejados |
| Conclusiones | 3 | Correspondencia con preregistro cotejada |
| Evidencias editoriales | 8 | Todas vinculadas a spaRV1909 |
| Términos lingüísticos | 12 | No admitidos |
| Pasajes con cotejo pendiente | 8 | Sin admisión de fuente |
| Decisiones de permisos | 13 | Pendientes |

La existencia de recursos WLC y léxicos en la biblioteca demuestra que esos recursos están registrados y que su procedencia documental fue organizada. No demuestra que las ocurrencias concretas de Levítico y sus paralelos hayan sido cotejadas. Los ocho registros de evidencia actuales remiten a Reina-Valera 1909; no deben utilizarse como respaldo suficiente de afirmaciones sobre formas, lemas, raíces, morfología o Strong hebreos.

La comparación griega de la Septuaginta continúa como preliminar no admitida. No existe una edición de la Septuaginta registrada en el catálogo de recursos de este expediente.

## Matriz de controles críticos

| Control | Estado | Fundamento |
|---|---|---|
| Fuentes | No conforme | Las evidencias actuales no acreditan las afirmaciones lingüísticas hebreas. |
| Exactitud textual | No conforme | Doce términos sin admisión; ocho pasajes pendientes de cotejo; comparación LXX sin edición registrada. |
| Licencias | Pendiente | Las trece decisiones de permisos continúan pendientes. |
| Privacidad | Pendiente | Falta una comprobación humana del contenido exacto y sus anexos. |
| Aprobación | Pendiente | No existe rol de revisor, fecha, decisión ni huella aprobada. |
| Imparcialidad | Pendiente | Requiere revisión humana de atribuciones, argumentos y tratamiento de perspectivas. |
| Contexto canónico | Pendiente | Requiere comprobación humana de canon, edición y alcance de las comparaciones. |

Los estados no conforme y pendiente bloquean la aprobación. No se convierten en conformes por la ejecución satisfactoria de GitHub Actions.

## Acciones necesarias para la decisión

1. Cotejar las ocurrencias hebreas con WLC y las capas de anotación pertinentes, conservando por separado texto, lema, morfología e identificadores. Registrar localizador exacto y versión de cada recurso.
2. Revisar los términos y pasajes que actualmente figuran como reportados y no admitidos. No completar campos ausentes mediante inferencias.
3. Incorporar una edición de la Septuaginta y su procedencia si se desea mantener la comparación griega como evidencia. Si no se incorpora, mantenerla expresamente como observación preliminar.
4. Resolver individualmente las trece decisiones de permisos. Distinguir consulta, cita, reproducción y adaptación. Una licencia documentada no sustituye la decisión editorial ni la autorización aplicable.
5. Revisar las catorce secciones analizadas, las seis justificaciones de no aplicabilidad, las cinco afirmaciones y las tres conclusiones. Mantener los grados de respaldo proporcionales a la evidencia.
6. Completar los controles de privacidad, imparcialidad y contexto canónico.
7. El responsable debe identificarse mediante su rol, registrar fecha y decisión, y aprobar o devolver la versión exacta. Si el contenido cambia, generar una nueva huella y repetir la revisión.

## Límites de esta fase

- No modifica el manuscrito ni los cuerpos consolidados.
- No cambia las conclusiones ni los grados de respaldo.
- No admite fuentes ni altera permisos.
- No marca secciones como revisadas en nombre de una persona.
- No registra una aprobación ficticia ni una firma editorial.
- No crea instantáneas públicas ni habilita la publicación.
- No fusiona PR anteriores ni modifica `main`.

## Criterio de cierre 5.5.4

La fase podrá pasar a decisión editorial cuando los controles críticos estén conformes o, cuando corresponda, justificados como no aplicables. La aprobación requiere un responsable identificado, revisión de las secciones pertinentes, decisión explícita, fecha y coincidencia exacta de la huella revisada.

Mientras persistan los controles no conformes o pendientes, el expediente permanece en borrador y no puede pasar a publicación.

# P10.1.4. Perfiles metodológicos y referencias cruzadas

Base de trabajo: commit e7072818bb54206b9f641d542182960b33f438ff del PR #71. P10.1.3 aprobada y validada con siete workflows satisfactorios. La rama principal y el catálogo histórico de 42 registros permanecen intactos.

## Alcance

Se integra la proyección de planificación src/data/catalogo/perfiles-relaciones-p1014.json, derivada de las propuestas originales y las correspondencias de P10.1.3. Los siete perfiles transversales no son nuevas disciplinas, perspectivas M01–M18, doctrinas ni métodos ya aplicados. Se conservan los 14 ejes, 80 identificadores y 20 secciones por ficha. Se muestran perfiles orientativos en 48 fichas: 38 nuevos estudios, cinco ampliaciones y cinco pilotos. Las 32 fichas originales restantes se marcan pendientes de delimitación, sin inferir métodos ni adscripciones. Una ficha puede tener varios perfiles.

| Perfil | Fichas asignadas |
|---|---:|
| Bíblico-exegético | 38 |
| Teológico-doctrinal | 36 |
| Histórico-eclesiástico | 18 |
| Textual-lingüístico | 9 |
| Ético-práctico | 11 |
| Interdisciplinario | 6 |
| Religioso comparado | 1 |

El catálogo incorpora un selector de perfil combinable con eje y estado; incluye la opción pendiente y restablecimiento de todos los filtros. Los listados y las fichas muestran la clasificación o su ausencia. Las rutas y las fichas son consultables sin JavaScript; los filtros interactivos lo requieren.

## Referencias cruzadas

Se trasladan los 30 vínculos originales sin modificar sus motivos ni tipos, con códigos SN definitivos. Se representan en ambos extremos (60 enlaces, 36 estudios vinculados) mediante una sección independiente de las relaciones por ejes compartidos y de las relaciones editoriales aprobadas. Cada vínculo indica su tipo y justificación de planificación. No se interpreta como prueba de una postura ni como dependencia doctrinal confirmada. Los estudios sin vínculos muestran un estado explícito.

Ejemplo: SN-080 responsabilidades recíprocas entre padres e hijos se vincula a SN-044 perdón, memoria, reconciliación y confianza, SN-027 autoridad y límites, SN-064 juicio y corrección y SN-071 Dios, sufrimiento y mal. La clasificación de SN-073 preserva el enfoque interdisciplinario; SN-074 preserva religión comparada y no queda reducida a análisis exclusivamente bíblico.

## Validación y límites

Se agrega un validador que reproduce exactamente las asignaciones y aristas de P10.1, rechaza modificaciones, duplicados, destinos inexistentes y metadatos editoriales no autorizados; seis pruebas de integridad, filtros, relaciones y barreras. La verificación de build comprueba los 80 bloques de perfiles y referencias, las 48 asignaciones, 32 estados pendientes, 60 enlaces recíprocos, destinos correctos y la coincidencia de los atributos del filtro con la proyección aprobada. Las auditorías anteriores de relaciones taxonómicas, integridad, publicación y artefactos se mantienen.

No se modifica el corpus, permisos, snapshots, resultados de investigación, los 80 registros operativos ni los cinco pilotos seleccionados. Los documentos de delimitación no se importan como contenido público. Solo se proyecta información de planificación. P10.1.4 validada en 7c7e89f05c8acb3212ed547fb2ebfc5312bf4fa8: Infraestructura #232, rendimiento lingüístico #25, accesibilidad lingüística #23, lector #41, comparador #36, manuscritos #24 y cierre P9.5 #23 satisfactorios; deploy omitido por tratarse de PR. P10.1.5 consolida pruebas de interacción, revisión final y despliegue del PR #71. P10.2 no se inicia hasta el cierre.

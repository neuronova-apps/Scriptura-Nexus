# P11.4.3.2. Preparación de admisión y ampliación lingüística

PR #99 integrado en 99ff0283fbbbf5bb52787e8ac33184e32b68480f, 25 workflows satisfactorios. Evidencia de auditoría: run 46018749734, job 140572572345; seis archivos y tres evidencias de licencia verificadas. PR #98 integrado, no habilitación pública del lector. Pages de la nueva base: 46019506753 (success al preparar este registro).

| Libro | Ocurrencias candidatas | Observación |
|---|---:|---|
| Levítico | 11950 | Palabras directas OSHB |
| Deuteronomio | 14294 | Palabras directas OSHB |
| Hechos | 18412 | 18272 coincidencias exactas MorphGNT; 140 retenidas |
| 1 Corintios | 6812 | 6754 coincidencias exactas MorphGNT; 58 retenidas |

Total 51468 candidatas, 78218 potenciales con las 26750 de P8; no equivale a tokens admitidos ni a cobertura efectiva. Las ocho referencias piloto existen; Hch 19:6 presenta una anotación retenida. No se completa análisis académico por disponibilidad.

Se propone aprobar únicamente las capas indicadas en el manifiesto: texto WLC y códigos de lema/morfología OSHB (dominio público declarado y CC BY 4.0 para anotaciones), texto oficial SBLGNT CC BY 4.0, anotaciones de lema y morfología MorphGNT CC BY-SA 3.0. Excluir notas/variantes, glosas no autorizadas y columnas textuales de MorphGNT; mantener atribución, procedencia, licencia y cambios, y compartir igual en las anotaciones derivadas según licencia. Los códigos originales no implican interpretación automática ni significados. Los datos de texto y anotaciones griegas se proyectan por separado. El registro de aprobación de preparación del lector no autoriza estas capas.

Se incorpora un ensayo privado sobre los bytes fijados. Verifica la compatibilidad de la estructura primaria OSIS usando el analizador existente mediante una entrada específica que conserva la barrera histórica del importador P8. Para griego reproduce las referencias y posiciones oficiales, retiene divergencias y prepara las dos capas en memoria. Valida los recuentos y huellas de las seis fuentes contra el resultado de PR #99; solo emite métricas y huellas, sin corpus. No es todavía el registro del motor público, admisión específica o autorización de publicación. Éxodo y Esdras siguen aplazados. Siguiente: decisión por componente y conexión al analizador. Progreso 61/69.

## Corrección de compatibilidad OSIS (PR #100)

La auditoría original y las pruebas sintéticas pasaron; el ensayo de proyección falló por cobertura OSIS (run 46019689497/job 140575798278). La inspección de los blobs fijados de Levítico y Deuteronomio identificó tres elementos w directos con un segmento interno seg type="x-large": uno en Lev.11.42 y dos en Deut.6.4. El importador histórico solo procesa palabras sin hijos. La ampliación privada admite exclusivamente esta estructura tipográfica documentada, conserva todos los puntos de código en orden, los atributos lingüísticos y los intervalos de letras ampliadas. Se contrasta el inventario esperado de tres segmentos y la igualdad de cada forma, referencia, lema y morfología con las palabras directas de la fuente. No se elimina ni se rellena ninguna palabra; cualquier estructura interna distinta se rechaza. El modo antiguo y las barreras de admisión/publicación permanecen sin cambios. La nueva ejecución debe confirmar las 51468 ocurrencias candidatas y las 198 anotaciones retenidas.

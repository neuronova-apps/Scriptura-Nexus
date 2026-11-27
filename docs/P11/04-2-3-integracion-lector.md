# P11.4.2.3. Integración aislada con el lector

Base main f0b4b167c5bef2691768049c59ce91f67874ccaf. PR #89 integrado tras 21 workflows satisfactorios; run 45987384440, job 140466370851. Proyección real: 1449 capítulos, 39041 unidades, 18 marcadores vacíos, máximo 29701 bytes gzip, total 8265301 bytes gzip, índice fc883fb3b99c47ba17fca2b1def24b2b80fe0c52263eef86e8c875709334568c. Despliegue 45988015148 confirmado build/deploy satisfactorios después de fijar el registro histórico.

## Integración

Se añade un adaptador asíncrono de fragmentos que obtiene metadatos de cobertura sin descargar textos, solicita únicamente el capítulo consultado, verifica bytes y SHA-256, identidad, etiquetas, orden, localizador, recurso y huella de texto/identificador. Conserva un capítulo en caché, permite referencias anteriores y siguientes dentro del mismo libro y no equipara distintas ediciones. El lector existente admite resultados síncronos y asíncronos; identifica carga, fallo de integridad, reintento y descarta respuestas obsoletas tras cambiar la selección. Conserva el estado público vacío.

El arnés recompone en memoria las dos ediciones mediante el proyector verificado, contrasta el índice histórico y sirve datos solo en loopback en CI. Un contexto Chromium aislado, sin acceso externo ni trazas, usa el HTML compilado del lector y los módulos reales transpilados. Se prevén nueve controles: catálogo y cero descargas previas, consulta RV1909 y procedencia, caché, cruce de capítulo, marcador vacío, consulta griega y atribución, estados de ausencia, corrupción y reintento, respuesta obsoleta. Seis pruebas Node adicionales con fixtures sintéticos. Se conserva la regresión P9.2.4. Solo conteos y nombres de etapas en los logs de datos reales; nunca se imprime el texto. Sin archivos persistidos, subida de artefactos de datos ni ruta pública de corpus.

## Límites y continuidad

La CI debe confirmar los nuevos resultados; no se afirma ejecución exitosa antes de comprobarlos. La página pública mantiene emptyReaderRelease, sin cambiar los registros ni permisos. No se confunde acceso local de validación con publicación. La revisión territorial RV1909 y la aprobación específica de ambas ediciones siguen pendientes. P11.4.2.4 ampliará pruebas de funcionalidad, accesibilidad y rendimiento con datos reales; P11.4.2.5 requiere autorizaciones y condiciones de publicación. El avance global sigue 61/69 (88,4 %); no se modifica el denominador.

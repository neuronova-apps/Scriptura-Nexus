# P11.4.2.4. Validación integral del lector con datos reales

Base main 13b65df8eb231f5895edbc13508dcbfbeb63269a. PR #90 integrado tras 24 workflows satisfactorios. Run 45988344532, job 140469555958: 520 pruebas Node aprobadas, nueve comprobaciones de integración aislada, siete solicitudes de capítulos. Despliegue 45989154894 confirmado build/deploy satisfactorios después de fijar el registro histórico.

## Auditoría prevista

Se reconstruyen las dos ediciones mediante el proyector fijado y el servidor aislado de loopback. Se comprueba el recorrido de las 39041 referencias, sus vecinos en el orden nativo, los 18 marcadores vacíos y la carga de exactamente 1449 capítulos (93 libros por edición acumulados). Se conserva el control de huellas de cada fragmento y no se solicitan textos antes de consultar una referencia. Se comprime también el catálogo de metadatos con gzip y se verifica el presupuesto de 250 KiB por catálogo y capítulo.

En Chromium se prueban dos muestras reales (RV1909 y SBLGNT), cuatro temas, tres escalas y cinco anchos: 120 comprobaciones de reflow y 24 escaneos axe con texto y procedencia visibles. Se comprueba idioma, foco, nueve campos de procedencia y ausencia de nuevas descargas al cambiar apariencia. Doce mediciones en contextos fríos (dos lenguas, dos anchos, tres repeticiones) registran montaje, primera consulta, consulta en caché y transferencia comprimida. Las latencias locales son descriptivas, sin estrangulamiento artificial ni equivalencia con INP de campo. Los resultados nuevos se confirmarán mediante CI, no se presumen aprobados. Seis pruebas Node verifican matriz, antecedentes y barreras.

## Límites

No se guardan corpus, capturas ni trazas con texto; no se emiten textos fuente en logs ni se habilita la consulta pública. Se mantiene la página pública sin datos y se repiten las pruebas de regresión e integración anteriores. La revisión manual del lector con contenido sigue pendiente; no se declara certificación de accesibilidad. Tampoco se resuelve aquí la revisión territorial RV1909 ni la aprobación por edición. La interfaz definitiva deberá mostrar condiciones de atribución, enlace de licencia y transformaciones antes de publicar. P11.4.2.5 exige autorizaciones específicas, resolución de hallazgos y validación de salida pública. El avance permanece en 61/69 (88,4 %) hasta el cierre integral de P11.4.2.

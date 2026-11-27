# P9.5. Validación integral y cierre técnico de herramientas textuales

Base main a8ea6f6eccd62d86a272213b160d27b3d7bcc1d6. PR #69 integrado y Pages #203 (45915101184) con build y deploy satisfactorios. P9.4.4: ocho workflows exitosos, 398 pruebas generales, 60 combinaciones de reflujo, 12 escaneos axe, 8 comprobaciones con fixtures y 101 archivos de texto públicos auditados sin datos del piloto.

P0.8 establece P9.5 como cierre de P9 mediante pruebas funcionales, integridad y rendimiento, sin datos no admitidos y con atribución visible. Los cuatro bloques siguientes son un desglose operativo de una única subfase del plan maestro; se implementan en un PR de cierre y no añaden fases al cronograma.

## P9.5.1. Integridad, admisión y derechos

Se concilian las decisiones P9.1.2, sus bytes y SHA-256, la proyección P9.1.3, los 93 recursos y fragmentos y su cobertura. Los archivos se vuelven a verificar desde sus fuentes fijadas en memoria. No se incorpora un corpus nuevo ni se confunde cobertura con canon.

| Edición | Tipo | Archivos/libros | Capítulos | Unidades | Marcadores vacíos | Licencia |
|---|---|---:|---:|---:|---:|---|
| RV1909 | Traducción | 66 | 1189 | 31102 | 18 | Dominio público declarado por eBible.org; revisión territorial pendiente |
| SBLGNT v1.2 | Edición crítica | 27 | 260 | 7939 | 0 | CC BY 4.0; Michael W. Holmes, SBL y Logos, cambios identificables |

Totales de referencia previamente verificados: 93 fragmentos, 66 identidades distintas de libros, 1449 capítulos acumulados y 39041 unidades. No se asignan canon ni versificación, ni se amplía OSHB/WLC. Se comprueban los permisos, la revisión de origen y la atribución de cada edición. Una licencia permite determinados usos, pero no sustituye aprobación del proyecto.

P9.3 conserva cero alineaciones documentales admitidas; 7937 coincidencias literales por dirección no prueban correspondencias. Una única reproyección en memoria ejecuta todas las 39041 comprobaciones de navegación y otras 39041 consultas del motor comparativo, sin emitir texto. Se conservan el registro P9.4.2 vacío y la muestra interna P9.4.3: dos testigos, una variante, dos referencias de lectura, dos atestaciones secundarias, siete recursos y ocho evidencias. No hay colación directa ni transcripciones, imágenes o aparatos importados. Cinco repositorios quedan como enlaces externos y seis grupos editoriales sin seleccionar.

## P9.5.2. Funcionalidad e integración

Regresión completa Node/Astro y siete suites Python específicas. Ocho pruebas adicionales de conciliación, cobertura, huellas, atribución, identidad y barreras. Se reutilizan las validaciones reales de navegación y comparación, los contratos de manuscritos y las pruebas de la muestra. Se ejecutan los tres scripts Chromium existentes con 30 comprobaciones funcionales sintéticas (8 lector + 14 comparador + 8 manuscritos); los fixtures permanecen fuera de dist. Se añade verificación explícita de atribución, licencia, fuente y localizador visibles en las fichas de prueba. Las consultas independientes no infieren alineaciones ni originalidad.

## P9.5.3. Accesibilidad y rendimiento

La regresión conjunta cubre 180 combinaciones de cuatro temas, tres escalas y cinco anchos para las tres herramientas, 36 escaneos axe etiquetados WCAG 2/2.1 A/AA y navegación por teclado, foco y estado sin JavaScript. La prueba cruzada recorre las seis transiciones dirigidas entre lector, comparador y manuscritos, con persistencia de alto contraste oscuro y escala 130 %. Se mide cada ruta en seis contextos fríos (18 muestras comparables: dos anchos y tres repeticiones por herramienta). Presupuestos de P0.6: JS inicial gzip <=150 KiB y transferencia <=500 KiB; sin recursos externos. LCP y CLS se registran como mediciones locales descriptivas, sin estrangulamiento ni datos de campo. La medición INP de campo y las evaluaciones manuales con lector de pantalla, zoom y dispositivos físicos permanecen pendientes de P11.3; los presupuestos de fragmentos con corpus real se evaluarán cuando exista un adaptador aprobado, no se simula un release público.

## P9.5.4. Barreras de publicación y cierre

La compilación debe excluir corpus, registros internos y fixtures. Se conservan las verificaciones estáticas, de rutas, controles deshabilitados y enlaces a licencias; los registros públicos lingüístico y editorial permanecen vacíos. La página de cada herramienta recibe su release vacío. No se cambia interfaz, datos, fuentes, derechos, dependencias versionadas ni autorizaciones. Se refuerzan únicamente las pruebas del navegador y se agregan auditorías y documentación.

Criterios de salida: resultados satisfactorios del workflow integral y regresiones activadas, revisión de diff, integración y despliegue Pages; resultados efectivos en logs de GitHub Actions. Hasta entonces el cierre permanece en validación. Atribución visible se comprueba con datos sintéticos, no acredita aún un release con contenidos reales. P11.4 exige aprobación expresa, revisión territorial cuando corresponda, atribución y control de cambios. Los adaptadores reales de publicación, correspondencias documentales, canon/versificación armonizada y colación directa siguen pendientes. El cierre técnico de P9 no equivale a publicación de corpus ni a finalización del proyecto.

Siguiente fase del plan maestro: P10.1, delimitación de investigaciones piloto SN-001, SN-015, SN-008, SN-021 y SN-040. Se deberá aprobar el alcance y no se exigirá terminar los 42 estudios ni publicar los pilotos antes de autorización.

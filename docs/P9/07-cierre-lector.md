# P9.2.4. Validación integral y cierre del lector

Base main 4822e1bd3ab9d994b97ef90abc49877e5ef8a1ad; PR #60 integrado. Ejecución #168 (45898987219) build y deploy exitosos. Evidencia anterior: PR #58, #59 y #60; despliegues #164, #166 y #168. P9.2.2 comprobó 39041 referencias, 1449 capítulos acumulados por edición, 93 fragmentos y 18 marcadores vacíos; 0 rangos observados en fuentes reales, con rangos y sufijos cubiertos por fixtures.

## Criterios de aceptación

- Regresión Node/Astro y comprobación estática del artefacto.
- Reproyección real y auditoría exacta de unidades en memoria, sin texto persistido.
- Chromium: enlaces y foco nativo, 60 casos de reflujo (4 temas × 3 escalas × 5 anchos), 12 escaneos axe con etiquetas WCAG 2/2.1 A/AA, persistencia de preferencias, navegación sin JavaScript y barrera de lectura pública.
- Ocho comprobaciones funcionales con fixture aislado, usando módulos de producción transpilados en memoria y HTML de la ruta pública sin scripts. Prueba de texto literal, idioma, estado vacío, orden fuente, límites y limpieza de selección. No se añade ruta, fixture ni módulo de prueba al artefacto.
- Seis mediciones locales gzip sin estrangulamiento, contextos fríos, presupuesto estricto de 150 KiB JS inicial y 500 KiB transferencia. LCP y CLS observados son descriptivos, no métricas de campo.
- Escaneo de archivos públicos para ausencia de identificadores de manifiesto/fragmento y huellas de proyección, archivos fuente y marcador sintético.

## Límites y estado

Cierre técnico condicionado a CI especializada y general, integración y despliegue. Los resultados efectivos se conservan en los logs de Actions; este documento no declara las pruebas exitosas antes de su ejecución. Las pruebas con lector de pantalla real, zoom del navegador y dispositivos físicos permanecen pendientes de evaluación manual. El adaptador de publicación real, canon y versificación armonizada, y autorización editorial siguen pendientes; no se autoriza publicación, no se modifica el corpus ni se crean equivalencias. La interfaz pública continúa sin ediciones disponibles. Tras cierre técnico corresponde P9.3, comparador bíblico con correspondencias documentadas y ausencia explícita de alineación.

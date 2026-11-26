# P8.4.7. Validación integral de léxicos y concordancias

Base main 3b697ab48284c6fd8e8918276a73b07293ce76c5. PR #48 integrado tras CI #134: 329/329 pruebas, 0 errores TypeScript, comprobación HTML y barrera de publicación. Se incorpora un workflow aislado Chromium/axe con versiones de navegador iguales a P8.3.5, sin modificar lockfile, registros, admisiones, aplicación ni estudios.

## Criterios de aceptación
- Página pública HTTP 200, controles deshabilitados, ausencia de resultados, con y sin JS.
- Cargar las fuentes reales mediante los importadores admitidos. Verificar huella del modelo P8.4.3 (30.740 entradas y 35.496 definiciones) y 26.750 ocurrencias principales. Usar stdout privado del subproceso, inyección en memoria en navegador local, sin endpoint de corpus, sin capturas, archivos, traces ni artefactos de datos. Bloquear navegación externa.
- Consulta léxica exacta en hebreo/arameo; identificadores Strong/BDB, referencias documentadas y sin resolver, definiciones inglesas y su procedencia. Ausencia de griego y cero coincidencias diferenciadas; no deducir sentidos ni enlaces al corpus.
- Concordancias de las tres lenguas y tres modalidades; comparar total, referencias, formas, lengua, dirección, origen y anotaciones con el motor. Frecuencias y paginación, selección de claves, filtro por libro, falta de lema y sistema no disponible; teclado y limpieza de resultados obsoletos.
- 24 combinaciones de cuatro temas, tres escalas y dos anchos; cuatro auditorías axe WCAG 2/2.1 A/AA del módulo con resultados reales. Reportar solo métricas o diagnóstico técnico seguro. Ninguna regla desactivada. Las pruebas manuales de lector de pantalla, zoom y dispositivos reales siguen pendientes; no certificación WCAG integral.

## Límites de cierre
CI y validación aislada pendientes; integrar únicamente con ambas satisfactorias y comprobar deploy. Sin publicación. Mantener pendientes 8 vínculos Strong, 1.157 atributos aumentados, 333 casos morfológicos OSHB, seis griegos, fuentes STEP/Dodson aplazadas; no sumar entradas de diccionarios como ocurrencias. P8.5 deberá abordar cobertura, rendimiento y consolidación lingüística por etapas; no anticipar aprobación de fuentes ni publicaciones. No se modifica el plan original.

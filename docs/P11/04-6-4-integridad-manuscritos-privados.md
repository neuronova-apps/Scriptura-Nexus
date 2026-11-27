# P11.4.6.4. Integridad, privacidad, accesibilidad y rendimiento de manuscritos

Base main 8d18f62fae042884011fa4afba8ee05c33c51049. PR #122 integrado, 53 comprobaciones satisfactorias y una omitida. Run 46052557827/job 140687199308 confirma ocho escenarios funcionales, 5.530 bytes de proyección y una sola solicitud de datos, cero solicitudes externas y errores de página, dist intacto. Dos testigos, una variante, dos referencias de lectura, siete recursos, ocho evidencias y dos atestaciones secundarias; cero inspecciones directas y archivos de fuente admitidos.

## Validaciones añadidas

Se utiliza el overlay privado existente sin modificar src, permisos, registros históricos ni otros módulos. Se simulan cinco fallos: bytes alterados de igual longitud, truncamiento, exceso de tamaño, HTTP 503 y fallo de conexión. Cada rechazo debe mantener fieldset y controles deshabilitados, sin fichas ni directorio de evidencias; la recuperación se comprueba mediante recarga con el mismo contenido íntegro. No se agrega mecanismo de reintento automático ni se sustituye contenido. Se añaden pruebas de identidad, cobertura y barreras del modelo privado y sus entradas fijadas.

Chromium comprueba dos recorridos de teclado, reflujo del candidato poblado en 24 combinaciones (cuatro temas, tres escalas y dos anchos 320/1280 px) y cuatro auditorías axe a 320 px y escala 130%. Se verifican los 16 enlaces del directorio, HTTPS y no-referrer, ausencia de peticiones externas, cookies, parámetros de búsqueda, persistencia de consultas y solicitudes adicionales al filtrar. No se navega a los proveedores externos ni se afirma vigencia de los permisos. Se compara inventario de huellas de dist antes y después. Logs sin textos ni datos de la muestra, salvo recuentos.

Presupuestos: proyección hasta 64 KiB, JS inicial hasta 150 KiB y cuerpo inicial hasta 500 KiB. La medición suma tamaños equivalentes gzip de respuestas de texto y tamaños de binarios; no representa tráfico real con cabeceras ni rendimiento de campo. Se mantiene el contexto aislado sin servidor público ni subida de artefactos privados.

## Continuidad

La revisión manual con lectores de pantalla y dispositivos físicos, la revisión externa de derechos y enlaces, y la aprobación expresa del responsable siguen pendientes. El resultado de CI nuevo debe verificarse antes de cerrar esta subfase. No se amplía el alcance de Juan 1:18 ni se infieren lecturas originales, alineaciones o inspecciones directas. Se conserva 63/69. Siguiente P11.4.6.5: revisión final y decisión de liberación controlada.

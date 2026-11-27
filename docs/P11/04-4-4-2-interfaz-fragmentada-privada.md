# P11.4.4.4.2. Interfaz funcional sobre fragmentos privados

PR #111 integrado en c540a40382fb39c292655a01d385d1798b3aa353; 34 workflows satisfactorios. Validación de fragmentación run 46033118308, job 140621665994; Pages run 46033851181 satisfactorio. Se preserva la página pública sin datos y con controles deshabilitados.

## Alcance

El cliente obtiene un manifiesto privado de mismo origen, verifica SHA-256 del contenido comprimido y descomprimido, limita el tamaño de cada archivo y decodifica las capas bajo demanda. El catálogo inicial contiene descriptores, no el corpus completo. Se añaden cubetas de resúmenes léxicos y un catálogo compacto de IDs de lema para resolver búsquedas sin descargar detalles completos. Las entradas detalladas se obtienen al seleccionarlas.

La interfaz conserva los formularios y la semántica de P8.4.6. Los métodos síncronos existentes siguen funcionando; el adaptador fragmentado opera de forma asíncrona, cancela resultados obsoletos, muestra estados de carga y errores genéricos y mantiene el foco y la procedencia. Las concordancias resuelven coordenadas únicamente de los capítulos requeridos, reconstruyen sus capas de texto/anotación y vuelven a contrastar el resultado con el motor de concordancias. No se infieren sinónimos, significados contextuales ni equivalencias entre ediciones.

## Barreras

El candidato se genera y sirve exclusivamente en memoria en un servidor local de CI. No se escribe en dist, no se incorpora al bundle público, no se despliega ni se publica corpus. El manifiesto y catálogo exigen publicationAuthorized=false. Cada solicitud se limita al mismo origen y usa no-store; los fragmentos se verifican con SHA-256. No se guarda contenido en almacenamiento persistente ni se envían claves de búsqueda en rutas URL. Dodson XML continúa pendiente de admisión expresa.

## Validación

Pruebas de reconstrucción y decodificación; Chromium con los 78.218 tokens y 30.740 entradas; búsquedas léxicas por forma e identificador; detalle, definiciones y referencias documentadas/no resueltas; concordancias y frecuencias por forma, lema y código de proveedor en hebreo, arameo y griego; paginación, filtro por libro, ausencias y estado de sistema no disponible. Verificación de teclado, cuatro apariencias, tres escalas de texto, 320 y 1280 px, axe WCAG 2.1 A/AA. Se comprueba que el sitio público permanece vacío y que dist no cambia. Revisión manual con lector de pantalla y dispositivos reales sigue pendiente.

La generación, tamaños finales y recuento de fragmentos quedan condicionados a CI. No se declara todavía la publicación funcional.

# P3.3. Rutas y estados de módulos

Base: 6afaebdb84edeb25efdb982912793aecbb63e779. Build y deploy de P3.2 verificados exitosos en 45751218899.
Rama: feature/p3.3-module-routes.

Se generan siete páginas estáticas a partir del registro de navegación existente, con título, descripción, ruta de navegación, estado vacío explícito, tres recursos previstos y enlace de retorno. Se habilitan menú y tarjetas. available significa ruta existente, no contenido funcional. Las tarjetas conservan el estado de preparación y fase responsable. Se mejora la página 404 sin modificar su ruta. No se generan rutas especializadas de P4–P9 ni se importa contenido o corpus. Se mantienen los cuatro temas, tamaños de texto y preferencias locales. No se agregan dependencias.

Pruebas: correspondencia entre navegación y portada; unicidad de página actual; siete rutas y estados; H1 único; recursos y enlaces internos bajo la base de Pages; 404 construido. CI, despliegue, respuesta HTTP 404 real y revisión manual pendientes al redactar. P3.4 consolida resultados, revisión responsive y cierre. No declarar contenido disponible por la existencia de una ruta.

# P10.1.5. Validación integral y cierre de delimitación

Base de trabajo: PR #71, 7c7e89f05c8acb3212ed547fb2ebfc5312bf4fa8, siete workflows satisfactorios. El responsable autorizó las 38 investigaciones nuevas y la ejecución de P10.1.3, P10.1.4 y P10.1.5. Se conserva la delimitación de los cinco pilotos del plan maestro, sin extender la prueba de P10.2 a 80 investigaciones ni aprobar conclusiones. Los registros fuente P10.1 de propuesta se mantienen como constancia histórica, sin cambiar retrospectivamente su estado ni los validadores.

## Inventario consolidado

42 registros históricos inmutables, 38 incorporaciones aprobadas SN-043–SN-080, cinco ampliaciones de metadatos, 49 preguntas consolidadas y 80 fichas planificadas. Se mantienen los 14 ejes y los cinco pilotos SN-001, SN-015, SN-008, SN-021 y SN-040. Siete perfiles orientativos, 48 fichas asignadas, 32 pendientes de delimitación; 30 vínculos específicos (60 enlaces recíprocos, 36 fichas vinculadas). Las referencias preliminares no son evidencias verificadas. Los perfiles metodológicos orientan, pero no sustituyen las perspectivas y métodos seleccionados por pertinencia.

## Validación final ejecutada

1. Los validadores P10.1, P10.1.3 y P10.1.4, las comprobaciones de tipos y las pruebas Node finalizaron satisfactoriamente. Se preservó el hash del catálogo histórico y se verificaron las cinco fichas de delimitación.
2. El build limpio y la auditoría de 96 rutas de catálogo, búsqueda, ejes y fichas finalizaron satisfactoriamente. Se verificaron las 1600 posiciones metodológicas pendientes, la integridad de las 80 fichas, los 60 enlaces de referencias cruzadas, el índice público y la ausencia de snapshots no autorizados. Se conservaron las pruebas de corpus y manuscritos.
3. El navegador Chromium sobre el artefacto real completó 80 búsquedas exactas por identificador, 27 casos de filtros (eje, estado, perfil, casos vacíos y restablecimiento), 4 casos de paginación/limpieza/búsqueda sin resultados, 11 transiciones de teclado (catálogo, búsqueda, SN-080 y cuatro vínculos recíprocos), 108 comprobaciones de reflujo en tres rutas, cuatro temas, tres escalas y tres anchos, 36 escaneos axe de WCAG 2/2.1 A/AA y tres comprobaciones sin JavaScript. No se registraron solicitudes externas ni cuerpos editoriales publicados en las fichas visitadas. Estas pruebas no sustituyen lectores de pantalla, zoom real ni revisión manual P11.3.
4. El PR #71 se marcó listo para revisión y se integró sin conflictos en `main`. Ocho workflows asociados al commit de la rama finalizaron con `success`, incluido el workflow de cierre P10.1.5, run [#7](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45925479010). El commit de integración es `43e8b20825f9ff6f6b637bd85dcf45225949fcea`.
5. Tras la integración, el workflow de `main` ejecutó nuevamente `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run test:build`, la verificación del historial editorial y el render aislado; el job `build` terminó con `success`. El job `deploy` también terminó con `success` y registró como versión desplegada el commit `43e8b20825f9ff6f6b637bd85dcf45225949fcea`. El registro de Actions confirmó la URL de entorno https://neuronova-apps.github.io/Scriptura-Nexus/ (run [#242](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45926241136)).

No se publicaron estudios, corpus, evidencias nuevas ni conclusiones. Las fichas del catálogo siguen siendo metadatos de planificación, no versiones editoriales.

## Pendientes y condición de entrada a P10.2

P10.1.5 queda cerrada técnicamente y con despliegue confirmado. Este cierre no equivale a aprobar los métodos, las fuentes ni los resultados individuales de los cinco pilotos. El archivo `delimitacion-pilotos-p101.json` conserva `approval: pendiente_revision_responsable`, `publicationAuthorized: false`, métodos en selección provisional y referencias orientativas no verificadas. Por tanto, P10.2 no debe comenzar hasta recibir aprobación expresa del responsable sobre las cinco delimitaciones.

La revisión de pertinencia de fuentes y evidencias se realizará en P10.2 después de esa aprobación. Los 32 perfiles pendientes no se infieren automáticamente. Los adaptadores de corpus, los derechos de uso, las pruebas manuales de accesibilidad y la autorización de publicación P11.4 siguen pendientes. La aprobación de P10.2 no habilitará por sí misma la publicación de estudios.

## Hallazgo y corrección de reflujo

La primera ejecución del navegador confirmó filtros, búsquedas, paginación y navegación, pero detectó desbordamiento horizontal a 320 px: el contenedor `.module-landing` medía 296 px mientras sus elementos de cuadrícula implícita alcanzaban 349 px. La causa era el mínimo intrínseco de la pista automática de CSS Grid. Se corrigió `src/styles/modules.css` con una pista `minmax(0, 1fr)` y `min-width: 0` en los hijos directos. La prueba ahora comprueba tanto el ancho desplazable del módulo como el del documento en las tres rutas, cuatro temas, tres escalas y tres anchos. La corrección requiere CI nuevo; no se reduce el criterio de reflujo ni se oculta el desbordamiento.

## Segundo hallazgo: controles de filtro del catálogo

La siguiente ejecución de Chromium confirmó que el desbordamiento persistía dentro de `section#catalog`, específicamente en `.catalog-filters`, sus etiquetas y `select#catalog-axis` (349 px frente a 296 px disponibles en el viewport de 320 px). La causa era el tamaño intrínseco mínimo de los controles dentro de las etiquetas con `display:grid`. Se corrigió `src/styles/catalog.css`: las etiquetas usan `grid-template-columns:minmax(0,1fr)` y los selectores `box-sizing:border-box`, `width:100%` y `min-width:0`. La validación conserva los 108 escenarios de reflujo y los 36 análisis axe; el criterio sigue siendo ausencia de desbordamiento horizontal, no ocultarlo.

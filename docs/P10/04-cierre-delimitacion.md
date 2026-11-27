# P10.1.5. Validación integral y cierre de delimitación

Base de trabajo: PR #71, 7c7e89f05c8acb3212ed547fb2ebfc5312bf4fa8, siete workflows satisfactorios. El responsable autorizó las 38 investigaciones nuevas y la ejecución de P10.1.3, P10.1.4 y P10.1.5. Se conserva la delimitación de los cinco pilotos del plan maestro, sin extender la prueba de P10.2 a 80 investigaciones ni aprobar conclusiones. Los registros fuente P10.1 de propuesta se mantienen como constancia histórica, sin cambiar retrospectivamente su estado ni los validadores.

## Inventario consolidado

42 registros históricos inmutables, 38 incorporaciones aprobadas SN-043–SN-080, cinco ampliaciones de metadatos, 49 preguntas consolidadas y 80 fichas planificadas. Se mantienen los 14 ejes y los cinco pilotos SN-001, SN-015, SN-008, SN-021 y SN-040. Siete perfiles orientativos, 48 fichas asignadas, 32 pendientes de delimitación; 30 vínculos específicos (60 enlaces recíprocos, 36 fichas vinculadas). Las referencias preliminares no son evidencias verificadas. Los perfiles metodológicos orientan, pero no sustituyen las perspectivas y métodos seleccionados por pertinencia.

## Validación final prevista

1. Validadores P10.1, P10.1.3 y P10.1.4, tipos y pruebas Node; preservación del hash de catálogo inicial y comprobación de las cinco delimitaciones.
2. Build limpio y auditoría de 96 rutas de catálogo, búsqueda, ejes y fichas; 1600 posiciones metodológicas pendientes, integridad de 80 fichas, 60 referencias cruzadas, índice público y ausencia de snapshots no autorizados. Se conservan las pruebas de corpus y manuscritos.
3. Navegador Chromium sobre el artefacto real: 80 búsquedas exactas por identificador, 27 casos de filtros (eje, estado, perfil, casos vacíos y restablecimiento), 4 casos de paginación/limpieza/búsqueda sin resultados, 11 transiciones de teclado (catálogo, búsqueda, SN-080 y cuatro vínculos recíprocos), 108 comprobaciones de reflujo en tres rutas, cuatro temas, tres escalas y tres anchos, 36 escaneos axe de WCAG 2/2.1 A/AA, tres comprobaciones sin JavaScript. Sin solicitudes externas; sin cuerpos editoriales publicados en las fichas visitadas. Esta prueba no sustituye lectores de pantalla, zoom real ni revisión manual P11.3.
4. Revisar diff, resultados efectivos de CI del último commit, ausencia de conflictos y base intacta. Solo entonces finalizar PR #71 y verificar build y deploy de Pages en main. No publicar estudios, corpus ni evidencia nueva; las fichas preliminares de catálogo son metadatos, no versiones editoriales.

## Pendientes y condición de salida

P10.1.5 se encuentra implementada y pendiente de resultados. La autorización de ejecutar el cierre no equivale a aprobar métodos, fuentes ni resultados individuales de los cinco pilotos. La revisión definitiva de pertinencia, fuentes y evidencias seguirá en P10.2; se conservará la aprobación expresa del alcance como condición de entrada de esa etapa. Los 32 perfiles pendientes no se infieren automáticamente. Los adaptadores de corpus, derechos, pruebas manuales y autorización P11.4 siguen pendientes. P10.2 no se inicia en este PR.

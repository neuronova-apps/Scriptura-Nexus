# P11.3. Accesibilidad y rendimiento

Base main 8645d545c8d938043c7f6a91323bfd7ccb1f19c6. PR #84 integrado tras dieciséis workflows satisfactorios; run 45945893092, 490 pruebas Node, 462 rutas versionadas, 139 archivos de artefacto, cero rutas restringidas y cero marcadores no públicos detectados. El despliegue 45946440112 quedó confirmado con build y deploy satisfactorios después de fijar el registro histórico, que no se altera.

## Auditoría automatizada

18 rutas representativas: portada, fundamentos, glosario, catálogo, ficha de estudio, buscador, biblioteca, permisos, historia, módulos lingüístico y bíblico, herramientas, manuscritos y guía de diseño. 306 comprobaciones de reflow (cinco anchos a escala normal y 12 combinaciones de tema/escala a 320 px por ruta, con un caso de control repetido), 72 escaneos axe de documento completo a escala 130 %, 108 mediciones de carga local (dos anchos, tres contextos fríos por ruta). No se presenta la muestra como auditoría exhaustiva de todas las páginas ni como certificación WCAG 2.2 AA. Se registran fallos con ruta, tema y métrica; cualquier fallo de CI exige revisión y corrección. Se reutilizan los controles de navegación cruzada, preferencias y presupuestos P8.5.3 y P9.5. Los objetivos P0.6 no se relajan: JS comprimido 150 KiB, portada 500 KiB, LCP 2,5 s y CLS 0,1 en laboratorio. La interacción observada de P8.5.2 es descriptiva, no INP de campo. El objetivo de fragmento JSON 250 KiB queda pendiente para un adaptador de publicación real; no se extrapola el rendimiento del corpus vacío.

## Revisión manual obligatoria

Usar el protocolo 03-protocolo-manual.md. Registrar entorno, acción, resultado real, defecto y evidencia no sensible; distinguir controles no evaluables por ausencia de datos de controles aprobados. No declarar que el usuario ejecutó pruebas sin evidencia. No publicar capturas con información personal. Resolver defectos críticos y registrar aceptación explícita de pendientes no críticos. CI verde permite integrar únicamente la preparación técnica; no cierra P11.3 por sí sola. La fase P11.4 no procede hasta completar la revisión manual y resolver o aceptar explícitamente los hallazgos no críticos dentro de un alcance definido.

## Progreso

59/62 etapas cerradas (95,2 %). 60/62 (96,8 %) solo tras cierre verificado de P11.3, incluida revisión manual. Se mantienen barreras de publicación, limitaciones documentales y autorización de alcance P11.4. No se cambian motores, corpus, permisos ni dependencias versionadas.

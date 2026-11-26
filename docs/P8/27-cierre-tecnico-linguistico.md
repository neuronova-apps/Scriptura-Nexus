# P8.5.5. Validación definitiva y cierre técnico de P8

Base main 01b0ed9ebbd16c96f43c1452e0966b3c4ca609d4, árbol c2d63a6fd4f001792f137f53a43b0356aa027ab5. PR #53 integrado, deploy #146 (45887514502) build/deploy comprobados. Este checkpoint conserva todos los archivos anteriores y añade solo cinco archivos de consolidación. No es una autorización de publicación, nueva admisión, aceptación formal de excepciones ni certificación WCAG.

## Trazabilidad de hitos
| Fase | PR | Despliegue comprobado |
|---|---|---|
| P8.1 | [#29](https://github.com/neuronova-apps/Scriptura-Nexus/pull/29) | [#88](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45832063851) |
| P8.2 | [#36](https://github.com/neuronova-apps/Scriptura-Nexus/pull/36) | [#102](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45847935848) |
| P8.3 | [#42](https://github.com/neuronova-apps/Scriptura-Nexus/pull/42) | [#119](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45863217439) |
| P8.4 | [#49](https://github.com/neuronova-apps/Scriptura-Nexus/pull/49) | [#137](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45876837207) |
| P8.5.1 | [#50](https://github.com/neuronova-apps/Scriptura-Nexus/pull/50) | [#139](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45878628753) |
| P8.5.2 | [#51](https://github.com/neuronova-apps/Scriptura-Nexus/pull/51) | [#141](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45879240085) |
| P8.5.3 | [#52](https://github.com/neuronova-apps/Scriptura-Nexus/pull/52) | [#144](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45883363903) |
| P8.5.4 | [#53](https://github.com/neuronova-apps/Scriptura-Nexus/pull/53) | [#146](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45887514502) |

## Evidencia consolidada
P0.8: versión/licencia/huella por archivo, importación reproducible, análisis hebreo y griego, ausencia explícita, índices y recuentos por edición, RTL y rendimiento. Registro histórico y nueve admisiones internas (ocho incorporadas a validación, TEHMC no incorporada). 2 ediciones parciales, 3 libros, 1.905 unidades, 26.750 ocurrencias (22.930 hbo, 3.601 arc, 219 grc); 26.156 con lema, 594 sin él; 26.411 análisis documentados y 339 pendientes. 30.740 entradas, 10.221 formas y 35.496 definiciones, 41.404 consultas exhaustivas, 158.124 referencias de índice cotejadas (no palabras únicas). Huellas reproducibles consignadas en cierre-tecnico-p85.json. 8 Strong/1.157 aug sin resolver, sin Strong por ocurrencia, sin glosa contextual ni equivalencias entre versiones. No sumar categorías de pendientes. Las 133 palabras de lecturas alternativas OSHB no se cuentan como ocurrencias principales.

Regresiones de analizador #12 y léxicos #6: ocho casos reales del analizador, 8 léxicos, 15 concordancias y 9 frecuencias; 24 diseños y 4 axe por herramienta. Integración #2: 180 diseños, 12 axe, 8 navegaciones, 5 saltos, 3 transiciones, 2 sin JS. No confundir auditoría automatizada con revisión manual. Rendimiento #3 (última medición tras integración de navegación): 18 ejecuciones, portada JS 1.209 B, transferencia 9.374 B, máximo JS tres rutas 10.720 B, máximo fragmento privado muestreado 10.028 B, LCP máximo 52 ms, CLS 0, interacción máxima observada 32 ms. Mediana comparación léxica 0,451→0,003 ms, respuestas iguales. Metas medidas de P0.6 satisfechas en laboratorio; no INP de campo ni extrapolación a publicación completa. Evidencias de navegador y rendimiento se reutilizan porque el PR #53 solo añadió revisión/documentación y pruebas; el presente checkpoint no modifica código ni datos.

## Cierre condicionado
Éxodo, Levítico y Esdras: 32.416 palabras directas candidatas, no admitidas; 56 otros elementos w. El importador permanece restringido; ampliación requiere una autorización específica y una adecuación probada. Se propone aceptar cobertura parcial como alcance del hito técnico, NO se registra aceptación del responsable sin confirmación. Mantener como pendientes TEHMC, léxico griego, fuentes aplazadas, casos de lema/morfología y referencias sin resolver, lectores de pantalla/zoom/dispositivos reales, INP de campo, condiciones de publicación y reversión. No declarar canon completo. P5.5 deploy específico y revisiones manuales previas pendientes; no cerrar otras fases por este checkpoint.

## Validación
Diez pruebas sintéticas del checkpoint. Reproducir cinco verificaciones reales en memoria (motor, índices, cobertura, léxico, revisión de publicación) y contrastar huellas y recuentos. El diff exacto frente a base solo permite las cinco adiciones previstas; comprobar registro público vacío y compilación/ausencia de datos. Ninguna exportación de corpus. Los ocho despliegues y ocho ejecuciones históricas fueron consultados directamente en GitHub al preparar este registro; no se presenta la comprobación local como consulta nueva de GitHub. CI pendiente, integración y deploy propios pendientes. El manifiesto es una instantánea histórica, no una allowlist ni un bloqueo global de cambios futuros: su workflow se limita al checkpoint P8.5.5.

## Puerta hacia P9
Tras CI, integración y deploy del checkpoint y aceptación explícita del alcance técnico parcial, P9.1: auditar RV1909 y SBLGNT y otras ediciones permitidas, sin activar automáticamente las herramientas ni modificar el registro lingüístico. P9.2 lector, P9.3 comparador, P9.4 manuscritos/variantes, P9.5 cierre, según P0.8. Publicación de corpus y revisión manual siguen condicionadas independientemente del avance de infraestructura. No se afirma cierre integral listo para usuarios.

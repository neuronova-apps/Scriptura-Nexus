# P6.5.6. Informe de cierre técnico del motor de investigaciones

Fecha: 26 de noviembre de 2026. Rama feature/p6.5-editorial-audit. PR #23 abierto, sin conflictos según verificación previa. Base main 615e4b72ac11c97769882946b4f8e3f0101df175; revisión validada 5d25a0357a41c4461e6d28552b82a6b5d01fe571. Despliegue base P6.4: 45807527925 exitoso. Este informe registra el cierre técnico de preparación, no la integración ni el cierre operativo definitivo.

## Entregables y criterios de P0.8
| Subfase | Entregable y resultado |
|---|---|
| P6.1 | Contratos editoriales, estados, 20 secciones, afirmaciones, conclusiones, revisiones y controles; pruebas positivas y negativas aprobadas. |
| P6.2 | Plantilla funcional con cinco estados, anclas, omisión justificada y cuerpos resueltos; 42 fichas y 840 posiciones verificadas. |
| P6.3 | Evidencia, argumentos, perspectivas y cruces por ID; trazabilidad y relaciones taxonómicas exactas aprobadas. |
| P6.4 | Registro separado, revisión vinculada, permisos, cadena versionada y barrera de publicación; registro real vacío. |
| P6.5 | Auditoría integral, correcciones, imparcialidad y alcance canónico; render positivo aislado y exclusión de fixtures aprobados. |

## Evidencia de validación
GitHub Actions #72, 45813398834, revisión 5d25a0357a41c4461e6d28552b82a6b5d01fe571: instalación limpia, astro check, npm test, npm run build, npm run test:build, verificación de historial frente a main y render aislado completados satisfactoriamente. 167 pruebas aprobadas, 0 fallidas; 72 páginas construidas, 76 archivos auditados, 840 posiciones HTML. El render temporal comprobó contenido aprobado, omisión, escape de HTML y ficha pendiente. El deploy se omitió por tratarse de PR. #71 falló por descubrimiento prematuro del script; renombrado y reejecutado sin eliminar comprobaciones. La ejecución #72 valida el código anterior a este informe; corresponde nueva CI P6.5.7.

## Hallazgos
H01 retorno controlado de errores, H02 huella de contenido revisado, H03 prefijo histórico frente a Git y H04 coherencia de ficha aprobada: correcciones implementadas y pruebas #72 aprobadas. H05 permanece como control humano permanente: estructura, marcadores y huellas no certifican privacidad semántica, licencias ni identidad del aprobador. El registro público vacío impide publicar investigaciones reales sin admisión documental.

## Imparcialidad
Cuatro resultados editoriales (afirmativa, refutatoria, interpretativa, indeterminada), grado de respaldo separado y reservas exigidas según resultado. Cinco ámbitos de comparación y justificación de cada vínculo argumental. Siete controles críticos, incluidos imparcialidad y contexto canónico. No se anticipan conclusiones sobre Iglesia, canon o tradición; revisión humana necesaria para evaluar calidad, representatividad y proporcionalidad. No se agregan conclusiones a fichas planificadas.

## Controles QA
| Control | Estado y alcance |
|---|---|
| QA-01 | Conforme para diff revisado de código hasta #72: catálogo, registro público, dependencias e identidad preservados; repetir al integrar. |
| QA-02, QA-04, QA-15 | Conforme en CI #72. |
| QA-03 | Conforme en HTML estático y destinos comprobados; smoke test público pendiente de despliegue. |
| QA-05 | Conforme estructuralmente; consulta y comprobación documental real pendientes P7 y estudios posteriores. |
| QA-06 | No aplicable a P6: no se importa corpus ni análisis lingüístico real. |
| QA-07 | Barrera estructural conforme; admisión y licencias reales pendientes P7. |
| QA-08 | Exclusión de rutas privadas/fixtures y marcadores conforme; inspección humana de contenido, permisos y secretos permanente. |
| QA-09 | Conforme estructuralmente con fixtures, huellas e historial Git; no certifica aprobación humana real. |
| QA-10 | Estructura HTML/ARIA y regresiones automatizadas conformes; teclado, foco, lector, zoom y reflujo manuales pendientes. |
| QA-11 | Responsive manual pendiente (320, 375, 768, 1024, 1440 px). |
| QA-12 | Medidas de rendimiento pendientes; no inferir rendimiento de usuarios de tiempo de build. |
| QA-13 | Despliegue base conforme; integración y despliegue P6.5 pendientes. |
| QA-14 | Conforme en salida, índice y render aislado; 42 fichas sin versión aprobada, 0 publicaciones reales. |

## Pendientes y decisión
Responsable de aceptación: titular del proyecto. Conservar pendientes P2–P5: revisión de cuatro apariencias, teclado/foco, lector, zoom/reflujo, tamaños de pantalla, filtros, búsqueda, paginación y recuperación de error, rendimiento y revisión editorial del glosario. Añadir inspección manual de presentación aprobada cuando existan contenidos autorizados. No se declara aceptación expresa de pendientes por el mero encargo de este informe. Registrar aceptación de pendientes no críticos y resolver antes de P11 o antes si se detecta defecto crítico; no declarar certificación WCAG.
P7 deberá conectar fuentes, autores, permisos y cánones documentados. Antes de publicar, adaptar catálogo, búsqueda y validadores actualmente limitados a metadatos planificados; no se habilita una vía alternativa de publicación. No existen publicaciones reales que migrar. La reversión de integración, si fuese necesaria, deberá conservar historial mediante revert, sin reset destructivo.
Dictamen: preparación técnica conforme en el alcance probado por #72; cierre operativo condicionado a CI final del informe, aprobación del responsable, integración y despliegue exitoso, y aceptación explícita de pendientes no críticos. P6.5.7 y P6.5.8 pendientes. No iniciar P7 automáticamente.

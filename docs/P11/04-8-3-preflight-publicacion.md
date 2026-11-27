# P11.4.8.3. Verificación previa a la publicación

Base main 4ab4139918ed1bc03e4742127fe05d977f6d3173; PR #130 integrado: 61 comprobaciones satisfactorias y una omitida. Run 46060151154/job 140712166295 confirma tres recuperaciones, rechazo de respaldo dañado, revert local aislado, limpieza temporal y conservación de 139 archivos (3.250.046 bytes). SHA-256 agregado a49c3084c6e01a2b9f7b8c5f91f409301f92caf04cc4ace9edc4beb635648f34 coincide con P11.4.8.1. Pages 46061075711 se verifica por separado.

El preflight reutiliza los evaluadores de conciliación, línea base y recuperación. Recompila exclusivamente el sitio público ordinario y exige coincidencia exacta de inventario con la evidencia previa; cualquier discrepancia detiene CI para revisión, no cambia automáticamente la huella histórica. Se comprueban ocho objetos Git protegidos y regresiones. El estado esperado es release_blocked: éxito de CI confirma que las barreras funcionan, no que la publicación funcional está aprobada. No genera ni sube artefacto privado, no modifica Pages, no autoriza importación, no realiza despliegue efectivo de corpus.

## Punto de decisión antes de P11.4.8.4

La opción B sigue vigente; no se sustituye por una versión limitada de opción A. Cinco candidatos validados en pruebas privadas, 38 controles de revisión/aceptación todavía pendientes (35 por módulo, tres transversales). No existen aprobaciones efectivas por módulo, edición ni componente. No basta una respuesta de éxito de PR.

Para continuar con la publicación funcional:

1. Ejecutar la revisión privada de escritorio con el protocolo [P11.4.7.3](04-7-3-protocolo-manual-integral.md). Registrar resultados reales por ID, entorno y evidencia no sensible. La prueba en teléfono real no está soportada por el launcher; no declarar conformidad por emulación. Si algún caso no puede realizarse, registrar no evaluable y resolverlo o solicitar aceptación específica de un aplazamiento no crítico; L05 del lector conserva su aplazamiento previo únicamente en su alcance histórico.
2. Verificar derechos actuales, territorio, atribuciones, transformaciones, enlaces y privacidad por recurso. No inferir aprobación por admisión técnica. Respetar exclusiones ya fijadas: P1022-R12, Dodson XML, LING-010 y LEX-C01/C02/C07/C08.
3. Completar [formato de decisión del responsable](formato-decision-responsable-p11474.md), indicando alcance exacto autorizado y pendientes no críticos explícitamente aceptados. Los defectos críticos no pueden dispensarse. No asumir autorización de un recurso por aprobar otro.
4. Solo con evidencia y decisión expresa, preparar un artefacto específico de publicación, distinto del candidato privado y de la línea base vacía; verificar que cada ruta y dato esté autorizado, que las capas y atribuciones se conserven, que las pruebas de integración y recuperación sigan conformes, y fijar commit y huellas. Una autorización de alcance no constituye por sí misma autorización automática del despliegue.
5. Con aprobación efectiva del artefacto, ejecutar P11.4.8.4 y verificar URL pública, rutas, recursos, mensajes de disponibilidad y privacidad, registrar build/deploy y comprobar ausencia de recursos excluidos. No ejecutar rollback real sin incidencia y autorización.

El siguiente paso es obtener la evidencia y decisión, no generar sucesivas compuertas que repitan el mismo bloqueo. Si todavía no se dispone de ellas, registrar P11.4.8.4 bloqueada y mantener la versión ordinaria. P11.5 requiere cierre operativo y aceptación del responsable. No se declara cierre definitivo ni se cambia el contador histórico de 63/69 (66 hitos de preparación técnica).

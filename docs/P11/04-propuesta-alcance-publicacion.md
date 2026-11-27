# P11.4. Propuesta de alcance de publicación (no aprobada)

Este documento prepara una decisión; no autoriza publicación definitiva, incorporación de corpus ni creación de una etiqueta de versión. El portal de desarrollo ya se encuentra desplegado en GitHub Pages. Se propone distinguir una versión técnica inicial de una versión con herramientas y contenido editorial habilitados.

## Opción A: versión técnica inicial de alcance limitado

Mantener únicamente el portal actualmente probado: portada, fundamentos, glosario, catálogo de 80 investigaciones planificadas, buscador, fichas de planificación, biblioteca de consulta externa, historia, navegación y preferencias de accesibilidad. Los módulos lingüísticos y textuales conservan sus interfaces y estados públicos sin datos admitidos para publicación. No se publican investigaciones completas, anotaciones lingüísticas, textos bíblicos, alineaciones ni muestra de manuscritos. Las admisiones técnicas de RV1909/SBLGNT y las decisiones lingüísticas no constituyen aprobación de release. Explicar al visitante la cobertura real; evitar anunciar funciones de consulta de corpus como disponibles. Mantener plan de ampliación y de revisión editorial independiente.

## Opción B: ampliar herramientas antes de la versión definitiva

Si el objetivo de la primera versión incluye consultas bíblicas reales, análisis lingüístico o comparación de ediciones, no cerrar P11.4 con la opción A por defecto. Definir primero alcance por edición, archivo, componente y licencia; completar adaptadores de publicación, atribución, control de privacidad, pruebas reales con datos autorizados, accesibilidad y presupuestos de fragmentos. Resolver o aceptar explícitamente los pendientes no críticos del alcance elegido. La incorporación TR, expansión de hebreo y griego, alineaciones y evidencias manuscritas siguen sujetas a sus propias condiciones; no se deduce autorización global de una licencia ni de una aprobación de la plataforma. La investigación de los 80 temas puede continuar independientemente, sin exigir su finalización para una versión técnica.

## Puertas comunes de P11.4

1. Confirmar cierre P11.3 y aprobación explícita del responsable del alcance elegido.
2. Revisar manualmente privacidad, derechos y mensajes públicos; registrar decisión sobre pendientes no críticos y bloquear defectos críticos.
3. Fijar commit y versión aprobados, verificar árbol, CI, build y artefacto Pages, sin material fuera de alcance.
4. Tras publicar, ejecutar smoke test de URL pública, rutas, recursos, catálogo y estados de disponibilidad; conservar identificadores de build y deploy.
5. Documentar recuperación: identificar commit funcional previo, conservar artefacto y huellas verificables, preparar reversión mediante PR no destructivo (sin reset ni force push), repetir CI, desplegar y repetir smoke test si fuera necesario. No ejecutar reversión real sin incidencia y autorización; comprobar procedimiento de manera segura y dejar constancia de sus límites.

La propuesta no certifica una revisión humana de privacidad ni el éxito futuro de publicación o recuperación. P11.5 requiere cierre de P11.4, informe y aceptación del responsable. No se modifican registros públicos ni se emite autorización en este PR.

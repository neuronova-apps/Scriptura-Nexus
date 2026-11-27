# P11.4.4.4.4. Preparación de revisión final y liberación controlada

PR #113 integrado en 9150f9514da57baa30d35e8088781c67cc049217; 45 comprobaciones satisfactorias y una omitida. GitHub Pages run 46039924476 satisfactorio. P11.4.4.4.3 verificó 599 pruebas automatizadas sin fallos, inventario de 11.442 fragmentos y barreras de integridad. El candidato del navegador P11.4.4.4.2 validó 8 consultas léxicas, 15 concordancias, 9 consultas de frecuencia, paginación, teclado, 24 combinaciones de apariencia/escala y cuatro auditorías axe.

## Decisión actual

El candidato histórico de cuatro fuentes se mantiene privado. La compuerta de liberación devuelve `blocked_pending_manual_review`: faltan la validación manual con lector de pantalla, la comprobación en dispositivos físicos y la aprobación expresa del responsable para una acción de publicación posterior. El evaluador no publica ni autoriza; incluso cuando los requisitos se marquen como completados, `canPublish` permanece en false y será necesaria una acción separada.

Dodson XML no forma parte del candidato. Su admisión continúa pendiente de una decisión independiente. Esta exclusión no bloquea la revisión del conjunto histórico de cuatro archivos LING admitidos.

## Lista de revisión manual pendiente

1. NVDA con Chrome o Firefox: recorrer títulos, formularios, campos, botones, resultados, paginación y mensajes de estado sin utilizar el ratón.
2. TalkBack con Chrome en Android: comprobar el orden de foco, la lectura de etiquetas, los cambios de resultados y el retorno del foco tras consultar una entrada.
3. Verificar hebreo y arameo en dirección RTL y griego en LTR, incluyendo formas, referencias y definiciones.
4. Probar ampliación de texto, zoom al 200 %, ancho de 320 px, alto contraste y orientación móvil.
5. Interrumpir y restablecer la conexión durante una consulta; comprobar el mensaje de error, la repetición de la operación y la ausencia de resultados obsoletos.
6. En las herramientas de red del navegador, confirmar solicitudes al mismo origen, sin cookies, sin claves de búsqueda en las URL y sin escritura en almacenamiento persistente.
7. Revisar atribuciones y licencias de las cuatro fuentes históricas admitidas.

## Barrera de publicación

La compilación pública debe seguir sin contener los fragmentos privados. No se copia el candidato a `dist`, no se suben corpus y no se activa una publicación automática. Para cambiar esta decisión se necesita completar la revisión manual, conservar la exclusión o tramitar por separado cualquier nueva admisión y solicitar expresamente la acción de liberación en una etapa posterior.

Siguiente línea de trabajo: P11.4.5, comparador bíblico, sin alterar la compuerta de publicación de los léxicos.

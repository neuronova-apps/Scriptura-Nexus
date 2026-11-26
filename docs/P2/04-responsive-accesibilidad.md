# P2.4. Responsive y accesibilidad

Estado: implementación en rama independiente; pendiente de CI y revisión en navegador.
Base: 7f754ee7f2452813b459fa8c51d2558cb60dda9e (P2.3).
Identidad: propuesta A, sin modificación de contenidos ni dependencias.

## Diagnóstico y ajustes

- El ancho mínimo fijo del documento y la reducción del espacio de marca podían provocar desbordamiento con texto ampliado. Se elimina ese mínimo, se permite ajuste de palabras y se apila el encabezado a 720 px o menos. La lista de muestras admite columnas menores que 8 rem si es necesario.
- El panel de preferencias pasa al flujo normal en pantallas estrechas para no quedar fuera de la ventana. Se preservan los tamaños de texto y almacenamiento de P2.3.
- Escape cierra el panel y devuelve el foco al resumen. Los controles se muestran cuando la inicialización JavaScript finaliza; sin JavaScript se ofrece un aviso y el contenido sigue disponible.
- Se incorporan bordes de controles con contraste reforzado, soporte de colores forzados y bordes visibles de insignias en alto contraste. Se preserva el movimiento reducido.
- La guía visual tiene un único H1 al inicio y una jerarquía H2/H3. Sus ejemplos de acciones activas enlazan al inicio en vez de presentar botones sin comportamiento.

## Criterios de prueba

Pruebas unitarias: contraste de texto normal (4.5:1), bordes y foco (3:1) en combinaciones seleccionadas; lógica de preferencias y restablecimiento. Prueba de construcción: controles, rutas y estructura semántica de las tres páginas.
Prueba en navegador: reflow a 320, 375, 768 y 1440 px; escalas 100/115/130 %; cuatro temas; teclado, Escape, persistencia, retorno desde 404 y navegación entre páginas. Comprobar zoom al 200 % y reflow equivalente a 400 % sobre ventana de 1280 px. La matriz manual y lector de pantalla quedan pendientes hasta ejecutar en navegador real. No se certifica WCAG integral.

## Alcance

No se crean módulos, navegación principal, perfiles, nuevos servicios ni dependencias de producción. P2.5 consolidará evidencias, limitaciones y cierre.

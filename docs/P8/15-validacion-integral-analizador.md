# P8.3.5. Validación integral aislada del analizador

Base b4add79f2e1962e85c77cf31d3178d78f93f778f, PR #41 integrado tras CI #113. No se modifica interfaz pública, admisiones, registro ni corpus. El workflow usa Chromium headless y axe-core en versiones fijadas, instalados en directorio temporal separado del proyecto. No se altera package.json/lockfile ni se crean artefactos públicos. Se reutilizan importadores verificados; un servidor local vinculado exclusivamente a 127.0.0.1 sirve el HTML/CSS compilado y módulos de interfaz transpilados. El registro real se transmite exclusivamente en memoria al navegador aislado, no se sirve mediante endpoint ni se escribe en archivos. No capturar screenshots, trazas ni datos de corpus en logs. La ruta pública conserva el motor vacío.

## Criterios de aceptación automatizados
- Verificación pública con JS y sin JS, sin ediciones ni ocurrencias y controles deshabilitados.
- Ocho casos reales: hebreo documentado y parcial, arameo documentado/parcial/sin interpretar, griego documentado/sin interpretar/ausente.
- Selección por referencia y ocurrencia, Enter sobre botón, selector sincronizado, dirección y lengua por palabra, forma exacta, código/procedencia, ausencia de significados no autorizados y eliminación de resultados obsoletos.
- 24 combinaciones de ancho (320 y 1280), tema (4) y escala (3); control de desbordamiento del área y foco. Cuatro auditorías axe WCAG A/AA 2.0/2.1 del módulo.
- No afirmar cumplimiento WCAG integral ni validación manual: lector de pantalla, dispositivos reales, zoom manual y revisión visual humana permanecen pendientes de aceptación; registrar esos límites. P8.3.5 cierre técnico condicionado a ejecución real del workflow, CI global, integración y deploy. P8.4 posterior, sin habilitar publicación.

Comando: node scripts/validate-term-analyzer-browser.mjs con P835_DEPS apuntando a las dependencias aisladas y dist compilado. Resultados pendientes de CI.

## Corrección de la validación de navegador

Ejecución #1: incompatibilidad del runner Ubuntu 26.04 con Playwright fijado. Se establece Ubuntu 24.04. Ejecución #2 (45854510925): instalación y lanzamiento de Chromium superados; fallo en etapa pública, sin detalle de aserción. Se revisa la prueba para comprobar estado nativo del fieldset y deshabilitación de cada control, comprobar HTTP 200 y aislar el aviso noscript por su sección. Se subdividen las etapas con etiquetas de diagnóstico fijas y no sensibles; no se imprimen referencias ni corpus. No se presupone que el sitio público haya fallado. Nueva ejecución requerida; código público intacto.

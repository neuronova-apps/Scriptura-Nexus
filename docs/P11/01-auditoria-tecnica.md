# P11.1. Auditoría técnica final

Base main cbfde01a4afae775237f81524c2e5c693911dd27. PR #82 integrado tras catorce workflows satisfactorios, run 45943624594 y job 140323242062. Despliegue 45944002355 pendiente al fijar el registro histórico; comprobar antes de integrar este PR.

## Alcance

Se ejecuta instalación limpia, comprobación TypeScript/Astro, pruebas unitarias, build estático, contratos del artefacto, historial editorial y render positivo aislado. Un auditor nuevo inspecciona todos los HTML generados, rutas locales y anclas, recursos de script, imágenes y enlaces de recursos, sin consultar servicios externos. Se incluyen cinco pruebas del auditor. Las URLs externas no se declaran verificadas. La auditoría de navegador reutiliza seis suites existentes en Chromium y axe con versiones fijadas: catálogo y búsqueda, lector, comparador, analizador, léxicos y concordancias, manuscritos. Se ejecutan en jobs separados y sobre builds limpios; los datos de prueba aislados no se convierten en corpus público. El workflow solo lee el repositorio y no despliega.

## Criterios de aceptación

El job técnico y los seis jobs E2E deben finalizar con éxito; ninguna regresión crítica puede quedar sin resolver. No se presume resultado de la nueva ejecución. El control técnico no acredita el acceso a fuentes no admitidas, la finalización académica ni conformidad manual WCAG. Permanecen cinco limitaciones y veinte necesidades documentales. P11.2 revisará fuentes, derechos y privacidad; P11.3 incluirá pruebas manuales y rendimiento. P11.4 exige autorización del alcance de publicación y recuperación. P11.1 no autoriza publicar corpus o investigaciones.

Progreso no ponderado: 57/62 etapas originales al cerrar P10 (91,9 %); 58/62 al cerrar P11.1 (93,5 %). La integración requiere CI y despliegue previo #82 verificados. P11.2 procede tras integración y despliegue de este PR.

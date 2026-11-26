# P9.2.3. Interfaz del lector bíblico

Base main 543116a97e422f22b327470804391c4b932588f0. PR #59 integrado; despliegue #166 (45897939218) con build y deploy exitosos. Auditoría P9.2.2: 39041 referencias, 1449 capítulos acumulados por edición, 93 fragmentos, 18 marcadores vacíos, 0 rangos reales en las fuentes admitidas.

## Alcance

Ruta biblia/lector/ enlazada desde el módulo Biblia. Breadcrumb, índice de secciones, formulario con selectores nativos de edición/libro/capítulo/versículo, área de lectura, estados accesibles, anterior/siguiente dentro del libro y detalle de procedencia/licencia. Se reutilizan BaseLayout, componentes, cuatro temas, tres escalas y tokens existentes; CSS acotado a la nueva interfaz. Las etiquetas de referencia no se expanden. El texto se inserta como textContent, no HTML, con idioma adecuado. Cambio de selección elimina el resultado y vecinos previos.

Modelo de presentación probado con datos sintéticos aislados de src. La página pública crea únicamente un release vacío con publicación no autorizada. No carga manifiestos, fuentes o textos, ni consulta al motor Python desde el navegador. Los selectores y botones permanecen deshabilitados; estado informativo visible sin JS. El adaptador de publicación de datos reales, revisión de canon/versificación y autorización siguen pendientes según P11.4; no se confunde la interfaz con un lector público de corpus.

## Validación

Siete pruebas del modelo: barrera, orden, referencia, procedencia, ausencia/vacío, vecinos, integridad e idioma griego. Verificación del artefacto estático: enlaces recíprocos, encabezados, etiquetas, destinos y controles deshabilitados, ausencia de datos internos y fixtures. CI, integración y despliegue propios pendientes hasta evidencia. P9.2.4 incluye pruebas de interacción en navegador, reflujo, teclado, foco, temas, escalas y cierre técnico. No se declara revisión manual realizada ni publicación autorizada.

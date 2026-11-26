# P9.3.3. Interfaz visual del comparador bíblico

Base main 8428a891839a98f6572ef18b004ffbc552d52ba4. PR #63 integrado y despliegue #175 (45907638835) exitoso. P9.3.2 comprobó 23 pruebas especializadas y 39041 consultas reales sin alineación automática; 18 marcadores vacíos; registro de alineaciones reales vacío.

## Alcance

Ruta biblia/comparador/ vinculada al módulo Biblia y al lector. Selectores nativos independientes de edición, libro, capítulo y versículo; destino opcional para consultar únicamente grupos documentados. No se completa una referencia por similitud de numeración. Se distinguen misma edición, falta de cobertura, referencia ausente, marcador vacío, lectura independiente y grupo verificado. Paneles paralelos con etiquetas nativas, idioma, recurso, localizador, fuente, licencia, atribución y evidencia revisada. En pantallas estrechas pasan a una columna. Se reutilizan componentes, tokens, cuatro temas, tres escalas, foco visible y destinos de navegación accesibles. Inserción de texto mediante textContent; selección nueva limpia resultados previos.

El modelo de presentación reutiliza reader-view y admite únicamente una proyección suministrada por un adaptador de publicación autorizado. Verifica estructura, disponibilidad, cardinalidad, orden, metadatos de evidencia y solapamientos; no sustituye verificación documental ENT30 ni ejecuta el motor Python privado desde el navegador. El adaptador editorial real permanece pendiente de P11.4. La página usa un release vacío, no importa registros ni corpus internos y deja los controles deshabilitados, incluso sin JavaScript. Las pruebas usan datos sintéticos fuera de src.

## Validación

Nueve pruebas del modelo y verificación estática de la ruta, enlaces, etiquetas, IDs y estados ARIA, barrera pública y ausencia de fixtures/registros. CI general y regresiones según filtros existentes. P9.3.4 deberá realizar pruebas de navegador, teclado, foco, reflujo, temas y escalas, rendimiento y cierre. No se afirma accesibilidad manual ni autorización de publicación.

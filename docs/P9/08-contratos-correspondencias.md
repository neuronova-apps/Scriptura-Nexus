# P9.3.1. Contratos y correspondencias entre ediciones

Base main f333cca79d193036d37e87cab7ea3794b74d5456. PR #61 integrado y despliegue #170 (45905609523) exitoso. P9.2 técnicamente cerrado; pendientes manuales de accesibilidad y autorización de publicación siguen registrados.

## Plan operativo P9.3

P9.3.1 contratos y diagnóstico de correspondencias; P9.3.2 motor de comparación; P9.3.3 interfaz accesible; P9.3.4 validación integral y cierre. Se conserva el criterio del plan maestro: mostrar diferencias y ausencia de alineación sin inventarlas.

## ENT30 y evidencia

Alineación de unidades, no de tokens (diferida). Cada grupo ALI referencia dos ediciones distintas, listas ordenadas de extremos ENT23, tipo one_to_one, one_to_many, many_to_one o many_to_many, estado verificado y evidencia EVD. Los extremos conservan identidad determinista, etiqueta original, libro, recurso, localizador y ambas huellas; se contrastan con el inventario reproyectado de P9.2.2. Se rechazan extremos ausentes, alterados, duplicados, vacíos, desordenados, cardinalidad falsa, equivalencia intraedición, grupos solapados y duplicados inversos. No se deduce equivalencia semántica, doctrinal, canónica ni léxica.

Cada evidencia exige fuente y revisión identificables, huella SHA-256 del documento, localizador, responsable y fecha de revisión, estado verificado y alcance exacto del grupo. El validador comprueba estructura y consistencia referencial, no sustituye la consulta documental ni la revisión humana. No se admite evidencia pendiente como verificada. Los casos ambiguos, ausencias y candidatos quedan fuera del registro de alineaciones hasta que exista respaldo. El registro interno inicia vacío: no se han admitido documentos de correspondencia específicos. No se registra una evidencia real por el solo hecho de que coincidan las etiquetas.

## Diagnóstico de cobertura

Se reproyectan las fuentes admitidas con sus huellas fijadas. El inventario efímero contiene únicamente referencias y metadatos; no se escribe ni emite texto. Se computan recuentos de libros compartidos, cobertura exclusiva, marcadores vacíos, coincidencias literales de libro/capítulo/versículo y etiquetas no coincidentes en libros compartidos. Se publican en logs solo recuentos agregados; una coincidencia literal es una señal de búsqueda, no una alineación. Una diferencia de etiqueta no prueba una variante, omisión ni traducción diferente. La cobertura de un libro no constituye una decisión canónica.

## Validación y límites

Doce pruebas sintéticas del contrato, incluyendo cuatro cardinalidades y casos negativos. CI especializada reproyecta 39041 unidades y valida el registro vacío y conciliación de recuentos. Sin cambios de registros públicos, interfaz, corpus, canon ni versificación; sin autorización de publicación. La implementación no declara el resultado de CI antes de obtener evidencia. P9.3.2 podrá consultar correspondencias verificadas y mostrar el estado sin alineación; la admisión de una fuente documental específica requerirá revisión independiente. No se adelanta el comparador visual ni se inventa una tabla de equivalencias.

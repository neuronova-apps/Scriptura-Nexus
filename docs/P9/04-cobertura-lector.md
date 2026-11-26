# P9.2.1. Base de cobertura del lector bíblico

Base main: b77b4f7d4abd712dfacd6bd700f27ca749614836. PR #57 integrado. CI de revisión: infraestructura y Pages 45894055051, proyección textual 45894055041, ambos exitosos. El trabajo deploy de revisión fue omitido; falta comprobar el despliegue posterior a la integración antes de declarar cierre operativo.

## Alcance y decisión técnica

P9.2 se descompone operativamente en cuatro pasos: P9.2.1 cobertura y barreras; P9.2.2 navegación por referencias originales y validación de fragmentos en memoria; P9.2.3 interfaz accesible de lector en modo no publicante; P9.2.4 regresión y cierre técnico. Esta descomposición no sustituye el plan maestro P0.8 ni autoriza publicación.

P9.2.1 implementa una vista interna derivada de ENT19, ENT22 y ENT37 de P9.1.3. Valida el informe existente y proyecta exclusivamente identidad de edición, idioma, versión, atribución, libro, fragmento, recurso y recuentos. Las listas respetan el orden del inventario de cada edición, no una decisión canónica.

| Edición | Libros | Unidades proyectadas | Marcadores vacíos |
|---|---:|---:|---:|
| RV1909 | 66 | 31102 | 18 |
| SBLGNT v1.2 | 27 | 7939 | 0 |

Los 93 fragmentos corresponden a dos ediciones con libros compartidos, no a 93 libros distintos. Un marcador vacío no se rellena ni se elimina. Un libro fuera de cobertura no se interpreta como ausente del canon. Un número de capítulos es un recuento, no una lista verificada de etiquetas. No se generan capítulos o versículos por secuencia numérica.

## Contratos y controles

reader-coverage.ts expone una función de cobertura y una consulta por identidad exacta. Se distinguen edición no disponible, libro fuera de cobertura y metadatos disponibles sin texto. Canon y versificación permanecen sin asignar hasta que exista evidencia y revisión; no se crea correspondencia ni se cambia ENT20/ENT21. No se importa corpus al frontend, no se crea ruta pública, no se modifica el registro de publicaciones o lingüística y no se autoriza publicación. P11.4 conserva su función de barrera.

## Pruebas

Seis pruebas de Node con el manifiesto real y variantes negativas: cobertura y atribución, ausencia por edición/libro, forma estrictamente metadata-only, bloqueos de publicación, identidades/recursos duplicados y no mutación del informe histórico. Ejecutar node --test tests/p921-reader-coverage.test.mjs, npm run check, npm test, npm run build y npm run test:build. CI, integración y deploy propios pendientes hasta evidencia verificable.

## Dependencia siguiente

P9.2.2 deberá utilizar las unidades efímeras de la proyección original para verificar etiquetas literales, rangos y sufijos, conservar referencias vacías y distinguir ausencias. No inferir etiquetas con el recuento de capítulos; no mapear referencias entre ediciones. Revisar fuentes de canon y versificación por separado, sin atribuir aprobación inexistente.

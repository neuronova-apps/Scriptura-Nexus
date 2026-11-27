# P11.4.2.2. Proyección de textos y fragmentos de consulta

Base main 7e83e45521eca6cfe49532ad0aebe0fa4e294c8a. PR #88 integrado tras 20 workflows satisfactorios; run específico 45950758581, job 140345796907. Despliegue 45987196868 pendiente al fijar el registro histórico; confirmar antes de integrar este PR.

## Contrato y cobertura esperada

Se reutiliza el proyector histórico P9.1.3 con sus fuentes fijadas por huellas y se compara su informe íntegro con el registro aprobado. Por cada libro se generan fragmentos por capítulo, identificados por edición, libro y capítulo; se conservan los identificadores, orden nativo, etiquetas de versículo, rangos, sufijos, texto Unicode, localizador, recurso y huellas de segmento y texto. El contenido esperado comprende 66 libros, 1189 capítulos y 31102 unidades RV1909 (18 marcadores vacíos), más 27 libros, 260 capítulos y 7939 unidades SBLGNT. Total esperado: 93 libros por edición, 1449 fragmentos y 39041 unidades.

Cada fragmento se codifica en JSON UTF-8 canónico, con SHA-256 de los bytes y de su gzip determinista (nivel 6, mtime 0; reproducibilidad dentro del entorno fijado). Se exige un máximo de 250 KiB comprimidos por fragmento; si se excede se detiene la prueba y se revisa la estrategia, sin aumentar el límite automáticamente. El índice de descriptores incluye etiquetas, tamaño, conteos, recursos, límites de orden y huellas. Se verifica la descompresión, la igualdad exacta y la huella de cada proyección de libro; los 18 marcadores vacíos se preservan. Se verifican siete casos de regresión con datos sintéticos.

## Barrera de publicación

El proyector, los fragmentos y el índice se mantienen en memoria durante CI. Se emiten únicamente conteos, tamaños y huella agregada del índice, no texto bíblico ni índice completo. No se crean archivos de corpus, no se suben artefactos de datos, no se modifica la interfaz pública ni se habilitan consultas. No se infiere alineación, canon ni correspondencia entre ediciones. Las decisiones de publicación por edición y revisión territorial RV1909 siguen pendientes. Los resultados cuantitativos del nuevo proyector quedan sujetos a CI; no se declaran medidos antes de ejecutarlo.

## Continuidad

P11.4.2.3 integrará el formato con el lector en un entorno aislado. P11.4.2.4 verificará navegación, accesibilidad, integridad y rendimiento. P11.4.2.5 habilitará únicamente los recursos autorizados, tras revisar las condiciones de publicación. El avance de 61/69 (88,4 %) no cambia hasta completar P11.4.2.

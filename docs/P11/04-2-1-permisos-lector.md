# P11.4.2.1. Revisión de permisos del lector bíblico

Base main 67789ae1fc374592cb599fb540e8da0482767c0b; PR #87 integrado después de 19 workflows satisfactorios. Run de selección 45949709479, job 140342478333. Despliegue 45950611947 pendiente al fijar el registro histórico; confirmar antes de integrar este PR.

## Alcance por edición

| Edición | Fuente fijada | Cobertura | Derechos documentados | Decisión |
|---|---|---|---|---|
| RV1909 spaRV1909 | ZIP USFM de eBible.org, SHA-256 56937c2be9ad278aed91370d6a15a98fe976f275d0cbaa6e26910291d949c7a5 | 66 libros, 31102 unidades, 18 marcadores vacíos | Declaración de dominio público del distribuidor | Preparación en memoria; revisión territorial y aprobación de publicación pendientes |
| SBLGNT v1.2 | Faithlife/SBLGNT commit 736fdc76158950c3d04b949b7e013ca14305145a | 27 libros, 7939 unidades | CC BY 4.0, editor Michael W. Holmes, SBL y Logos | Preparación en memoria; aprobación de publicación pendiente |

Reconsulta documental de las páginas oficiales el 27-11-2026:
- https://ebible.org/spaRV1909/copyright.htm y https://ebible.org/find/details.php?id=spaRV1909 : declaración de dominio público para esta distribución, no para otras revisiones ni dictamen territorial.
- https://www.sblgnt.com/license/ y https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/LICENSE : licencia CC BY 4.0, con atribución, enlace a licencia y señalamiento de cambios. La identidad fijada se comprueba con el auditor P9.1.2.

## Condiciones de integración

Solo texto principal y marcadores nativos de los archivos auditados, no XML/USFM originales, auxiliares, aparatos o anotaciones ajenas. RV1909: transformación de texto principal, exclusión de estructuras auxiliares y normalización de espacios documentadas. SBLGNT: proyección de elementos de palabra, prefijos y sufijos con separadores, conservación de etiquetas y Unicode; mantener atribución y registrar transformación. No inferir equivalencias entre ediciones ni canon. No ocultar marcadores sin texto. Se propone un adaptador por fragmentos con presupuesto máximo gzip 250 KiB, huella de integridad, metadatos de fuente, estado de disponibilidad y comprobación de accesibilidad. La decisión de aprobación por edición y revisión territorial de RV1909 deben constar antes de cualquier publicación. No se presume consentimiento por elegir opción B.

P11.4.2.2 preparará el adaptador reproducible y pruebas en entorno aislado sin persistir ni exponer corpus; no requiere ampliar las autorizaciones históricas de preparación en memoria. P11.4.2.3 integrará el lector en entorno de prueba, P11.4.2.4 validará funcionalidad, accesibilidad y rendimiento, P11.4.2.5 habilitará exclusivamente ediciones autorizadas y cerrará la subfase. No se habilita consulta pública por este PR. Se mantienen los registros originales, las pruebas de ausencia y las barreras de publicación.

Avance: 61/69 (88,4 %) tras verificar despliegue de PR #87; 62/69 (89,9 %) solo cuando termine toda P11.4.2. Las cinco subdivisiones operativas no alteran el denominador.

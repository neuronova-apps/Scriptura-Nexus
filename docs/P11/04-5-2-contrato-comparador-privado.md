# P11.4.5.2. Contrato privado de comparación y referencias independientes

Base main a8ce5c1238b4a9a54bf07f68e144925152597112, PR #115 integrado: 38 workflows, 47 comprobaciones satisfactorias y una omitida. P11.4.5.1 auditó el alcance y mantiene el registro ENT30 sin evidencia ni grupos. Esta subfase no admite fuentes nuevas ni activa la interfaz pública.

## Contrato

Se añade scripts/lib/private-comparator-p11452.mjs, aislado de las rutas públicas. Utiliza createIsolatedFragmentReader con catálogo privado (publicationAuthorized false), las dos ediciones históricas TXT-RV1909 y TXT-SBLGNT-V1-2 y el registro ENT30 P9.3.1 vacío. Rechaza otros conjuntos de ediciones y cualquier evidencia o alineación no vacía. No modifica el motor histórico, el lector o la interfaz existente. El soporte futuro para grupos documentados requerirá admisión separada; las cuatro cardinalidades permanecen probadas en el modelo histórico P9.3.

La selección explícita conserva referencia nativa, rango o sufijo, idioma, licencia, atribución y localizador. Sin destino explícito, solo se lee el origen: el diagnóstico literal consulta exclusivamente metadatos y devuelve label_present, book_outside_coverage, chapter_not_found o reference_not_found. label_present no asegura texto disponible ni correspondencia. No se completa el destino, no se usa aproximación y no se calcula equivalencia. Marcadores vacíos, referencias ausentes, edición inválida y misma edición son estados diferenciados. Las consultas son secuenciales dentro de cada comparación, reutilizando caché acotada del lector; el error de integridad se propaga sin devolver resultado parcial. La carga HTTP, límites comprimidos, coordinación de consultas simultáneas de la UI y privacidad se validarán en etapas posteriores.

## Fuentes

Se preserva la decisión de preparación del lector para RV1909 (declaración de dominio público, reservas territoriales) y SBLGNT v1.2 (CC BY 4.0, atribución y transformaciones). Scrivener 1894 permanece candidato sin archivo, derechos ni admisión comprobados. No se añade evidencia documental ENT30: las etiquetas coincidentes siguen siendo señales diagnósticas, no alineaciones. Dodson XML y la compuerta léxica quedan intactos. No se descarga ni persiste texto real en este PR.

## Pruebas

Ocho pruebas Node con fragmentos sintéticos y el lector de producción: carga diferida, ausencia de selección automática, lectura independiente en ambos sentidos, procedencia, etiquetas nativas, ausencias y marcadores, rechazo de alcance, corrupción y recuperación, aislamiento de referencias y barreras públicas. Se ejecutan también las pruebas históricas de comparador, lector fragmentado y contratos ENT30. La auditoría nueva no equivale a ejecutar el candidato completo con corpus real ni a revisión manual. La compilación ordinaria continúa vacía. No se declara éxito de CI antes de consultar resultados.

Siguiente: P11.4.5.3, candidato funcional privado y conexión de interfaz en entorno aislado. Mantener el 63/69 hasta cierre de P11.4.5; no autorizar publicación.

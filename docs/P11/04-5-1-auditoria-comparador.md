# P11.4.5.1. Auditoría del comparador bíblico

Base main ce58f0f8949986b6f380479cf4c0a8358102ac73; PR #114 integrado, 37 workflows del PR satisfactorios y Pages 46041096882 satisfactorio. No se repite el cierre histórico P9.3. Auditoría del árbol y archivos en este commit; los recuentos siguientes corresponden a evidencia histórica, no a una nueva ejecución exhaustiva. Las comprobaciones de este PR se registrarán en CI.

## Inventario funcional

P9.3.1 definió ENT30 y la evidencia EVD; P9.3.2 implementó el motor privado Python; P9.3.3 implementó el modelo TypeScript, selectores nativos independientes y lectura paralela; P9.3.4 cerró regresiones y navegador. Véanse docs/P9/08-contratos-correspondencias.md, 09-motor-comparacion.md, 10-interfaz-comparador.md y 11-cierre-comparador.md. La página src/pages/biblia/comparador.astro monta emptyComparatorRelease(), mantiene fieldset deshabilitado y no importa corpus. src/lib/comparator-view.ts admite grupos verificados con extremos disponibles, orden, cardinalidad y evidencia; no autoriza documentos. src/scripts/comparator-ui.ts y src/styles/bible-comparator.css constituyen la interfaz existente. No se modifica ningún archivo de producción.

P9 auditó 39.041 unidades en 93 archivos, 27 libros compartidos, 7.937 coincidencias literales de etiquetas, 20 etiquetas RV1909 y 2 SBLGNT no coincidentes en libros comunes, 23.145 unidades RV1909 fuera de cobertura de libros de SBLGNT y 18 marcadores vacíos RV1909. P11.4.2 verificó 1.449 capítulos. El registro docs/P9/alineaciones-p931.json contiene cero evidencias y grupos; publicación false. Coincidencia de referencia no implica alineación, variante, omisión ni equivalencia semántica o doctrinal. Un marcador vacío se conserva como tal.

## Fuentes y derechos

- TXT-RV1909 / ED-C01: spaRV1909, 66 libros, español. Declaración de dominio público de eBible (https://ebible.org/spaRV1909/copyright.htm), corroboración de edición en Open.Bible (https://open.bible/bibles/reina-valera-1909). La revisión documental histórica es favorable condicionada, no dictamen territorial global; conservar fuente exacta, atribución, referencia nativa, huellas y transformaciones. No se amplía a otras revisiones.
- TXT-SBLGNT-V1-2 / ED-C02: 27 libros, griego, texto principal v1.2, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/); LICENSE fijado en https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/LICENSE. Crédito, enlace y cambios declarados; no aparato ni auxiliares.
- P1022-R12: Scrivener 1894 (https://arc.dbs.org/data/scripture/GRCS94/). Identidad documentada, archivo concreto y licencia pendientes. No se admite, descarga ni redistribuye en esta subfase. Tampoco se incorpora ninguna nueva fuente de correspondencias.

La decisión AUT-P11425-20261127-01 aprueba la preparación del lector de ambas ediciones con reservas; no es autorización de publicación, importación de corpus ni alineación. Se reutiliza la documentación histórica de derechos, no se certifica una nueva revisión jurídica. El alcance de comparación inicial se limita a estas dos ediciones como candidatos privados. Sin cambios de canon ni versificación.

## Brecha de integración y requisitos

El comparador actual usa ReaderRelease síncrono; el lector privado dispone de createIsolatedFragmentReader asíncrono, catálogo de referencias y carga selectiva con integridad por capítulo. Evaluar un adaptador de comparación privado sobre esta infraestructura sin volcar las ediciones completas al navegador ni cambiar el lector público. Resolver origen/destino con selectores independientes; sin destino explícito ni grupo ENT30 respaldado, no seleccionar destino automáticamente. Mantener estados de cobertura, ausencia, marcador vacío, selección fuera del grupo y misma edición. Conservar idioma, referencias nativas (incluidos rangos y sufijos), procedencia, licencia y atribución. Una eventual admisión ENT30 exige documento identificable, revisión humana, huella, localizador, extremos y cardinalidad; no crear registros por igualdad de etiquetas.

Requerir carga diferida del mismo origen, comprobación de tamaños y huellas comprimidas/descomprimidas, límites y cancelación/orden de consultas para evitar resultados obsoletos, sin claves de consulta en URL ni almacenamiento persistente. Probar fallos de red, cobertura parcial, dos direcciones, griego LTR, accesibilidad por teclado, lector de pantalla, zoom, 320 px y dispositivos reales; las pruebas automáticas no sustituyen las manuales. Mantener presupuesto histórico inicial de JS 150 KiB y transferencia 500 KiB como referencia hasta medir candidato real. Mantener artefacto público vacío y exigir acción de liberación separada. La revisión manual y privacidad final siguen pendientes. No publicar datos, modificar otros módulos, admitir Dodson ni alterar la compuerta léxica.

## Secuencia propuesta

P11.4.5.2: diseño y validación aislada de correspondencia/lecturas independientes y contrato del adaptador, sin inferir alineaciones; evaluación documental de candidatos, sin admisión implícita. P11.4.5.3: candidato funcional privado, reutilizando la interfaz. P11.4.5.4: integridad, privacidad, rendimiento y accesibilidad. P11.4.5.5: revisión final y decisión de liberación controlada. Ajustar subdivisiones a hallazgos sin adelantar publicación. Se conserva 63/69 en la métrica histórica hasta cierre de P11.4.5.

## Validación

Nuevo registro de auditoría y pruebas Node de consistencia con decisiones históricas, ausencia de alineaciones y barreras públicas. Workflow de lectura sin despliegue. No se declara CI aprobada hasta disponer de resultados.

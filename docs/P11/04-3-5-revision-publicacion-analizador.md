# P11.4.3.5. Revisión previa a la habilitación controlada del analizador

## Evidencia consolidada

PR #102 integrado mediante 54cd2006f1c1b084ae5e255fb2b7e77190779f9c. Los 29 workflows y 36 comprobaciones individuales concluyeron satisfactoriamente; deploy omitido en PR, Pages 46024896115 satisfactorio en main. Ejecución del analizador 46024175119/job 140591161012: 168 capítulos, 336 capas, 5162 referencias y 78218 ocurrencias; catálogo gzip de 33182 bytes, total de 16355402 bytes (incluye catálogo), mayor capa de 143393 bytes frente al límite de 256000. Ocho casos piloto, tres idiomas, 72 configuraciones de diseño, 12 axe, corrupción y selección obsoleta superados. Sin solicitudes externas, almacenamiento de consultas ni cargas de capítulos iniciales en esa prueba. Los 112/97/44 ms de montaje/primera consulta/caché corresponden únicamente al Chromium local, no a rendimiento de campo.

## Alcance y derechos

AUT-P11433-20261127-01 permite preparación técnica, no publicación. Se revisan diez archivos exactos: LING-011/012/019/020 (Génesis, Daniel, Levítico, Deuteronomio); LING-013/021/023 (texto griego de 3 Juan, Hechos y 1 Corintios); LING-014/022/024 (anotaciones de esos tres libros). El registro adjunto fija versión, ruta, SHA-256, componentes, atribución y decisión pendiente por archivo. No incorpora TEHMC, recursos léxicos ni nuevos libros. Los identificadores de admisión auxiliares que puedan existir como metadatos no constituyen incorporación de sus datos.

- [OSHB LICENSE fijo](https://github.com/openscriptures/morphhb/blob/6a5db284c715c18b239422e57bb89684e6a19f00/LICENSE.md): el proveedor declara WLC de dominio público y anotaciones CC BY 4.0. Mantener atribución exacta, indicar proyección de palabras primarias y exclusión de variantes, preservar Unicode, procedencia y capas. Confirmar alcance territorial de la declaración de dominio público antes de publicación; no se emite dictamen jurídico.
- [SBLGNT LICENSE fijo](https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/LICENSE): CC BY 4.0; crédito SBL/Logos, versión fijada, enlace y cambios. Únicamente formas oficiales, no aparato crítico.
- [MorphGNT README fijo](https://github.com/morphgnt/sblgnt/blob/aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d/README.md): anotaciones CC BY-SA 3.0; conservar atribución a Tauber y DOI, declarar transformación y compartir bajo la misma licencia cuando corresponda; excluir columnas textuales, no vincular las 198 divergencias nuevas. No inferir Strong, glosas ni equivalencias. Usar commit exacto; no afirmar equivalencia comprobada con una etiqueta.

Se reabrieron los tres documentos fuente; la nueva validación CI exigirá las huellas y tamaños históricos de sus bytes exactos. El inventario no es una allowlist de publicación.

## Protocolo manual previo a decisión

A01: verificar selección, consulta, retorno y foco mediante teclado y lector de pantalla real, con hebreo, arameo y griego. A02: comprobar dispositivo móvil real, reflujo, ampliación y contraste. A03: revisar avisos de cobertura, ausencias, fuentes, licencias y transformaciones, incluida CC BY-SA separada. A04: comprobar red/almacenamiento del candidato y aviso del alojamiento GitHub Pages; no afirmar ausencia de registros de IP en el proveedor. A05: registrar resultados, dispositivo/navegador/tecnología de apoyo y limitaciones, sin inventar pruebas; cualquier aplazamiento requiere decisión explícita. Ningún resultado manual se da por realizado.

## Barreras y continuación

El workflow nuevo valida inventario, permisos y registro histórico vacío, verifica las tres licencias por SHA-256 y recompone el candidato aislado en memoria. Se preservan los límites de fragmentos y la separación de texto/anotaciones; no se escribe corpus, sube artefacto, altera dist ni activa Pages. El próximo paso es preparar el candidato estático de habilitación y su revisión manual; publicación efectiva requiere aprobación por componente, revisión territorial y privacidad, verificación del artefacto completo y procedimiento de recuperación. Lector bíblico mantiene su cierre separado. Progreso 61/69 hasta cierre verificado.

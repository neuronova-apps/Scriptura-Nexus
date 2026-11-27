# P10.3.2. Validación del análisis griego (SN-008)

Base main 41d0fac651b7a89d355e2f990606e57d558a8660. PR #76 integrado, CI 45936328551 y despliegue 45937908539 con build y deploy satisfactorios. La cobertura hebrea pendiente no se declara resuelta.

## Dos niveles independientes

El lector textual P9 admite SBLGNT v1.2, revisión 736fdc76158950c3d04b949b7e013ca14305145a, incluidos Acts.xml y 1Cor.xml con huellas fijadas en P9.1.2. El analizador lingüístico P8 admite texto y anotaciones exclusivamente de 3 Juan (LING-013/014); no se amplía por la admisión textual. Se auditan seis anclas independientes de SN-008: Hch 2:4, 10:46, 19:6; 1 Co 12:10, 13:8 y 14:2. Se conserva la referencia fuente y la identidad de cada registro: los identificadores de libro de ambos motores no establecen alineación de textos. Resultado esperado: seis referencias textuales disponibles y seis bloqueos de análisis lingüístico por falta de cobertura.

Control positivo: 3 Juan 1:1, con verificación de procedencia de ocurrencias, lema y morfología si están documentados. No se infieren Strong, glosas contextuales, variantes, equivalencias ni significado a partir de identificadores. Los recursos griegos LEX-C01 y LEX-C07 siguen aplazados. No se afirma consulta de Logos o BDAG.

## Candidatos sin admisión

Árbol Git de morphgnt/sblgnt, revisión aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d: 65-Ac-morphgnt.txt (1.228.900 bytes, blob 3aed8e1a1dd9d77b4c448a0893bd4ddee6eb6842), 67-1Co-morphgnt.txt (435.113 bytes, blob 28dec6618da3a378f454b6c72776286855857920). Solo metadatos; no se descargó el contenido candidato ni se acreditó SHA-256, admisión o compatibilidad. Antes de ampliar se exige auditoría, autorización específica por archivo, separación de capas y correspondencia exacta de referencia, posición y forma entre texto y anotación. Las licencias previas de 3 Juan no constituyen autorización de proyecto para nuevas fuentes.

## Validación y continuidad

Seis pruebas específicas de integridad y restricciones; una auditoría real del analizador y otra del lector textual, con datos admitidos en memoria y salida agregada sin texto. Regresiones Node/Astro. El resultado real de CI queda pendiente hasta su comprobación. Se conservan registro público vacío, P1024-F01/F03 abiertos y todas las necesidades académicas. No se interpreta la naturaleza o vigencia del don de lenguas. P10.3.3 procede después de validar, integrar y desplegar este PR. P11.4 permanece como autorización independiente de publicación.

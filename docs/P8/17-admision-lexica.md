# P8.4.2. Admisión controlada de recursos léxicos

Base main 61e83dcbd3f81bb9d263ce994db6511c2ac79b91, PR #43 fusionado tras cuatro workflows exitosos. Auditoría real #3 (45864052007): siete archivos, cinco evidencias, ocho pruebas. Las huellas nuevas se fijan en admision-lexica-p84.json a partir de ese registro; no se modifica el manifiesto histórico P8.4.1 ni el de P8.1. Continuidad solicitada por el responsable tras la verificación, interpretada como autorización técnica limitada de esta subfase, no publicación.

## Decisiones
- LEX-C01 TBESG: aplazado. Las definiciones tienen múltiples procedencias; auditar componentes y condiciones.
- LEX-C02 TBESH: aplazado. No incorporar Meaning de Online Bible sin permiso. Resto requiere revisión separada.
- LEX-C07 Dodson: aplazado. 5.408 registros, cinco campos, cero formas Unicode; la licencia declarada no resuelve discrepancia de representación. Auditar dodson.xml como candidato separado o conversión Beta Code reproducible; sin enlaces por similitud o Strong supuesto.

## ling-015
AugIndex.xml. CC BY 4.0 según README fijo. Autoriza únicamente código aumentado exacto y destino ID del índice, componente identificadores_lexicos. No transforma ni elimina separadores, no interpreta como Strong estándar ni enlaza automáticamente otra versión OSHB.

## ling-016
LexicalIndex.xml. CC BY 4.0 según README fijo. ID de entrada, lengua de parte (heb/arc), forma original, atributos xref aug/strong/bdb. Componentes anotaciones_lema e identificadores_lexicos; no equivale a permiso para asignar un lema de diccionario a ocurrencia. Excluidos TWOT, def, etym, pos, xlit y demás campos.

## ling-017
HebrewStrong.xml. Edición digital CC BY 4.0 y texto Strong declarado dominio público por el proveedor. IDs y elementos de definición exclusivamente textuales bajo meaning, con localizador exacto y contexto. Excluidos source, usage, note, texto mixto y otras capas. No se importan ni asignan sentidos aún.

## ling-018
BrownDriverBriggs.xml. Edición digital CC BY 4.0 y texto BDB original declarado dominio público por el proveedor. ID, lengua declarada y elementos def exclusivamente textuales directos o en sentidos, preservando jerarquía y localizador. No extraer referencias, texto mixto ni contenido externo. Distinto de BDB abreviado Online Bible.

Documentación fija del proveedor: https://github.com/openscriptures/HebrewLexicon/blob/21c9add13bc727d3a951361778e97e3ff7afd1ce/readme.md ; esquemas LiSchema.xsd, StrongSchema.xsd y BdbSchema.xsd de ese commit. Atribuir Open Scriptures Hebrew Bible Project, enlazar CC BY 4.0, declarar cambios y conservar procedencia. Declaraciones del proveedor, no dictamen jurídico. Los selectores son límites para futuros importadores, no autorización para publicar ni copiar archivos completos.

## Verificación
Validador independiente: inventario 7, allowlist exacta 4, permisos/huellas/licencia estrictos, descarga en memoria de cuatro archivos y evidencia fijada. Conteos esperados de auditoría P8.4.1. Comprueba destinos AugIndex y vínculos raw exactos a IDs de BDB/Strong, registra discrepancias sin normalizar ni inferir equivalencias; contabiliza definiciones explícitas textuales y excluidas, no imprime su contenido. No modifica registro lingüístico existente ni genera corpus. Nueve pruebas sintéticas y workflow real. Ningún enlace entre versiones o sentido contextual asignado. P8.4.3 modelará entradas con origen/selector, ausencias, jerarquía, ambigüedad y componentes autorizados; no habilitar consulta pública. Pendientes 333 OSHB, seis griegos, revisión humana y demás exclusiones se conservan. CI pendiente.

# P11.4.4.1. Auditoría de léxicos y concordancias

PR #107 integrado en 20b10235a0e7a19799dfff78715816260e4c4399; 30 workflows, 39 checks satisfactorios. Pages 46030269685: success al preparar este PR. El analizador queda técnicamente preparado, sin publicación; decisión y revisión manual separadas. Se continúa en paralelo según la ruta B y el alcance P11.4.1, sin ampliar permisos.

## Inventario y límites

LING-015 AugIndex.xml: códigos aumentados y destinos exactos. LING-016 LexicalIndex.xml: lengua, forma y vínculos explícitos de proveedor. LING-017 HebrewStrong.xml y LING-018 BrownDriverBriggs.xml: únicamente identificadores y definiciones exclusivamente textuales admitidas; mantener jerarquía, origen y lengua. Los cuatro conservan CC BY 4.0 y las condiciones P8.4.2. No asignar automáticamente Strong o BDB a ocurrencias, traducir glosas ni tratar un sentido de diccionario como interpretación contextual.

LEX-C01 TBESG y LEX-C02 TBESH siguen aplazados por procedencias mixtas, componentes y condiciones específicas; no redistribuir Meaning de Online Bible. LEX-C07 Dodson CSV sigue aplazado por discrepancia entre README y representación real. Se identificó un archivo XML distinto en el [árbol fijo del proveedor](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon/tree/74f70358d4acfaf2f980bf2feb58ab7115cbbcbc), LEX-C08, 1315372 bytes, blob 93bdd519bb68db9a4f2969d50d31ee42b2372e06. README declara dominio público y conversión XML; LICENSE CC0 histórico. Esto no confirma equivalencia con CSV ni autoriza componentes. La auditoría verificará bytes, blob, SHA-256, licencias y estructura XML sin publicar texto ni atributos; comparar representación y procedencia antes de proponer admisión. No atribuir automáticamente categoría léxica o correspondencia MorphGNT/Strong. No se descarga PDF.

## Validaciones

Reauditar las siete fuentes históricas con sus SHA-256 y evidencias; auditar el XML nuevo únicamente por metadatos y obtener su SHA-256. Se reutiliza el modelo histórico y su proyección comprobada (30740 entradas, 10221 formas, 35496 definiciones); los recuentos léxicos nunca son frecuencias de corpus. Pruebas de rechazo de nuevas admisiones, publicación y vínculos implícitos; registro público vacío y barrera de build. Los datos se procesan en memoria, no se almacenan ni se suben. Los resultados reales de CI quedan pendientes.

## Continuación

P11.4.4.2: revisar resultados, proponer alcance léxico por archivo y componente y preparar ampliación de concordancias de 26750 a 78218 ocurrencias de siete libros con el motor de P8, respetando edición, lengua, libro, forma exacta, lema documentado y código de proveedor. No incorporar equivalencias no demostradas; conservar ausencias diferenciadas y paginación. P11.4.4.3: integración/índices y validación de consultas con datos admitidos. P11.4.4.4: candidato, accesibilidad y decisión de publicación separada. Las subdivisiones son operativas, no cambian el total de 69 etapas. Progreso 61/69 hasta cierre de etapas principales. No se habilita lector, analizador ni léxico en este PR.

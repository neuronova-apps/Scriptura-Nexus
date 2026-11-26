# P8.4.1. Auditoría de fuentes léxicas y licencias

Base main 07658a3740e85a5ff505fcfcd77a0ff257113f06, P8.3.5 integrado y deploy #119 satisfactorio. P0.8 exige índices, recuentos reproducibles por edición y consulta bajo demanda, sin equivalencias inventadas. P8.4.1 audita; no admite, importa a registro ni publica. Manifiesto histórico P8.1 permanece intacto. Inventario separado: candidatos-lexicos-p84.json.

## Fuentes y decisiones preliminares
| Candidato | Archivo | Evaluación documental |
|---|---|---|
| LEX-C01 / LING-007 | TBESG | CC BY 4.0 general; definiciones de múltiples fuentes, incluida Abbott-Smith. Mantener excluido hasta identificar derechos por componente. Cabecera completa no accesible mediante web por límite de tamaño; auditar señales y estructura del archivo fijo en CI. |
| LEX-C02 / LING-008 | TBESH | Cabecera fija distingue Gloss y Morph creados por Tyndale, identificadores extendidos/desambiguados/unificados y Meaning derivado del BDB abreviado de Online Bible sujeto a permiso. Excluir toda columna Meaning, incluidas adiciones mezcladas; no deducir identidad semántica de uStrong. Mantener excluido hasta propuesta separada. |
| LEX-C03 | OSHB AugIndex.xml | Candidato prioritario: relación código aumentado a ID de índice. No es equivalencia automática con Strong estándar. |
| LEX-C04 | OSHB LexicalIndex.xml | Candidato prioritario: lengua declarada por parte, ID, forma y vínculos BDB/Strong. TWOT es referencia, no contenido autorizado. |
| LEX-C05 | OSHB HebrewStrong.xml | Candidato prioritario: diccionario Strong hebreo, distinguir versión digital y texto original. |
| LEX-C06 | OSHB BrownDriverBriggs.xml | Candidato prioritario: BDB en edición digital, trabajo en progreso; independiente de Online Bible. |
| LEX-C07 | Dodson dodson.csv | Candidato prioritario: README-ulrikp describe seis columnas Unicode/POS; el CSV fijo consultado contiene cinco columnas entrecomilladas, Strong/GK numéricos, forma en Beta Code y glosas corta/larga. No tiene columna POS. Verificar codificación y versión antes de admisión; no convertir automáticamente ni asumir equivalencia con la descripción del README. |

Evidencia fija:
- STEP [README](https://github.com/STEPBible/STEPBible-Data/blob/5de0a47f35f0fc13dfe1430d104e5db8a4285f9c/README.md) declara CC BY 4.0; cabecera [TBESH](https://github.com/STEPBible/STEPBible-Data/blob/5de0a47f35f0fc13dfe1430d104e5db8a4285f9c/Lexicons/TBESH%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Hebrew%20-%20STEPBible.org%20CC%20BY.txt) especifica permiso Online Bible para Meaning; atribuir STEP Bible y Tyndale House, enlazar origen y registrar cambios. No distribuir archivos íntegros.
- OSHB [readme.md](https://github.com/openscriptures/HebrewLexicon/blob/21c9add13bc727d3a951361778e97e3ff7afd1ce/readme.md): CC BY 4.0 sobre archivos; textos originales BDB y Strong declarados de dominio público; acreditar Open Scriptures Hebrew Bible Project. Los números TWOT son solo referencia, no transcripción de TWOT. Se revisaron estructura de AugIndex y LexicalIndex, sin asumir correspondencia de versiones del corpus.
- Dodson [README](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon/blob/74f70358d4acfaf2f980bf2feb58ab7115cbbcbc/README.md), [README-ulrikp.txt](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon/blob/74f70358d4acfaf2f980bf2feb58ab7115cbbcbc/README-ulrikp.txt), [LICENSE](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon/blob/74f70358d4acfaf2f980bf2feb58ab7115cbbcbc/LICENSE): autor John Jeffrey Dodson (2010) declara dominio público, fuentes Abbott-Smith 1922, Berry 1897, Souter 1917, Strong 1890; conversión de Sandborg-Petersen (2012); repositorio indica CC0. Conservar atribución y edición por rigor. No extender declaración a otras ediciones o bases.
- Estas son declaraciones del proveedor, no certificación jurídica independiente. No copiar diccionarios, definiciones o ejemplos en repositorio público. Fijar SHA-256 de nuevos candidatos y licencias a partir del resultado verificable de CI antes de P8.4.2. Git blob y tamaño fijados desde árboles exactos. Los SHA-256 STEP históricos se verifican adicionalmente.

## Validación reproducible
Siete candidatos (dos STEP, cuatro OSHB, uno Dodson), cinco archivos únicos de evidencia. Descarga acotada en memoria desde raw GitHub, sin redirecciones; tamaño, blob Git SHA-1, SHA-256, UTF-8; XML sin entidades/DTD, TSV por estructura, conteos de campos y vínculos sin texto de entradas. Se registran irregularidades por ancho/duplicados, no se interpretan como autorizaciones. No se almacenan ni imprimen filas. 7 pruebas sintéticas; auditoría real pendiente de CI. Registro público permanece vacío. No se modifica P8.1, manifiesto griego, dependencias, UI ni estudios.

## P8.4.2 (posterior)
Tras aprobar auditoría y verificar huellas, preparar decisión por archivo/componente priorizando OSHB y Dodson. Confirmar cobertura de arameo, correspondencia explícita de AugIndex con las claves OSHB (incluidos homógrafos y extensiones), forma y lengua de MorphGNT frente a Dodson; no vincular por número o coincidencia superficial. Conservar ausencia/ambigüedad; separar Strong, extensiones, GK, BDB, lemas y morfología. No traducir ni inventar sentidos. P8.4.3–7: modelo, concordancias, índices, interfaz, validación. Los 333 pendientes OSHB, seis griegos y revisiones humanas anteriores se conservan.

## Corrección de auditoría real #1

Las siete pruebas sintéticas pasaron, pero la auditoría real #1 (45863771487) falló con diagnóstico genérico. Se verificó por separado el CSV fijo de Dodson y su discrepancia con README-ulrikp; se ajusta el lector a TSV entrecomillado con cinco columnas y recuento Unicode sin convertir Beta Code, y se añade diagnóstico por candidato y razón técnica sin exponer entradas. El origen exacto de la falla #1 aún no está confirmado. El inventario y huellas permanecen idénticos; no se relaja integridad.

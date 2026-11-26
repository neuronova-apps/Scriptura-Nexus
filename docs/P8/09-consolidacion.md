# P8.2.7. Consolidación técnica del modelo e importación

Fecha: 26 de noviembre de 2026. Base main: 52e3f1eaa0ed993a6ddeb1d8b2a36e7f5c8d2919. P8.2.6 PR #35 integrado; CI #99 (45844525175), OSHB #5 (45844524897) y despliegue main #100 (45844781983) exitosos, incluidos jobs build y deploy. Criterio P0.8: cobertura y procedencia verificadas, Unicode conservado. Esta subfase prepara el cierre técnico de la cobertura admitida; no declara cobertura integral ni cierre de P8.

## Alcance
Consolidación en memoria de los resultados reproducibles de P8.2.2–P8.2.6. Génesis y Daniel exclusivamente; tres fuentes admitidas (LING-010–012), nueve excluidas del alcance inicial. No se incorporan Strong, descripciones TEHMC, glosas ni datos griegos. La coincidencia literal de códigos no establece equivalencia semántica. El registro público debe permanecer vacío en sus siete colecciones. No hay cambios a permisos, catálogo, interfaz, dependencias ni datos originales.

## Línea base documentada en P8.2.6
62 capítulos, 1890 unidades, 26531 tokens principales (22930 hebreo, 3601 arameo), 5747 segmentos, 132 lecturas alternativas, 133 palabras alternativas, 2595 claves de lema, 36749 componentes léxicos. Análisis morfológicos (principales y alternativos): 26331 documentados, 326 parciales, 7 no resueltos y 0 ausentes; 333 pendientes. Los 335 registros de notas no equivalen a variantes no resueltas. Conservar códigos originales y motivos; no corregir por inferencia ni copiar notas no admitidas.

## Implementación y controles
El consolidador valida identidad y alcance de las tres fuentes fijadas, licencia documentada y componentes, conciliación de línea base, grupos pendientes por estado, reproducibilidad del resumen íntegro, preservación Unicode y ausencia de identificadores admitidos, equivalencias semánticas y datos públicos. Emite únicamente metadatos agregados y huellas deterministas. Se apoya en la auditoría de integridad real P8.2.6 y en la verificación previa de bytes, no sustituye revisión filológica ni dictamen jurídico.

Comandos: `node --test tests/p8-oshb-closure.test.mjs` (11 pruebas nuevas previstas); `node scripts/import-oshb.mjs --integrity --closure` (dos proyecciones auditadas en memoria y checkpoint). CI de infraestructura y workflow OSHB deben ser exitosos; comprobar diff, padre y protección de datos, registro público vacío, despliegue main posterior y aceptación del responsable. Resultados de P8.2.7 pendientes de ejecución al preparar PR.

## Pendientes y puerta de continuidad
Mantener los 333 casos para revisión documental por código y lengua, sin declarar resolución. Revisar candidatos griegos TAGNT por componentes o alternativa compatible, con licencia, versión, huella y aprobación antes de completar P8.3 (pruebas con hebreo y griego reales). Ampliar cobertura OSHB y revisar TAHOT antes de P8.5; revisar derechos de TBESG/TBESH antes de P8.4 y TEGMC antes de usar su tabla. P8.3 no iniciada; su aceptación integral permanece bloqueada por ausencia de corpus griego admitido. Conservar pendientes manuales de fases previas. No fusionar hasta revisar CI y autorización; no publicar corpus automáticamente.

# P8.3.3. Motor de selección y análisis de ocurrencias

Base main 2f3b496cef0911a541a88b115209e36b4d41c567, PR #39 integrado tras CI #107 y proyección griega #1. P8.3.2 admitió dos archivos griegos para validación en memoria. El motor reutiliza contratos ENT19/23–27 y fuentes admitidas; no cambia la interfaz, no publica datos ni amplía corpus.

## Contrato
createTermAnalyzer recibe registro validado y admisiones, crea índices por edición/referencia exacta y token, conserva Unicode, dirección y posición (cero inicial en el modelo). coverage declara libros, idiomas, edición y versificación; select distingue edición inexistente, libro fuera de cobertura, unidad ausente y ocurrencias disponibles; analyze distingue ID inexistente y resultado con procedencia de texto, lema y código/rasgos. No normaliza originales, no realiza concordancias, no traduce, no define sentidos ni supone equivalencias entre ediciones. Las variantes permanecen fuera del análisis primario; se indica no evaluadas, no ausencia de variantes.

OSHB: adaptador incorpora únicamente enlaces primarios previamente validados. Expone componentes léxicos y claves del proveedor sin presentar candidatos Strong ni atribuir una forma léxica inexistente; no alinea componentes de lema con componentes morfológicos. Conserva estado parcial y sin interpretar, no añade rasgos a códigos no documentados. Griego: lema directo vinculado solo a análisis admitido; tres ocurrencias sin análisis y tres códigos sin interpretar permanecen separados. No se deduce significado.

## Validación
Diez pruebas sintéticas previstas, y workflow real con Génesis, Daniel y 3 Juan: 1.905 unidades, 26.750 ocurrencias esperadas (22.930 hbo, 3.601 arc, 219 grc); valida cada selección y respuesta en dos instancias, comprueba ausencia, dirección, integridad de fuentes y registro público vacío. Los 333 pendientes de OSHB incluyen lecturas alternativas, por lo que no se espera que todos sean tokens primarios; las variantes no se importan al índice primario. Se emiten únicamente métricas y huella SHA-256, sin corpus ni ejemplos textuales reales. P8.3.3 pendiente de CI, integración y deploy. P8.3.4 y P8.3.5 aún no iniciadas.

Comandos: node --test tests/p8-term-analyzer.test.mjs; node scripts/validate-term-analyzer.mjs. El motor es reutilizable para P8.3.4, todavía no es una herramienta pública.

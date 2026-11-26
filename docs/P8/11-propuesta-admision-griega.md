# P8.3.2. Propuesta de admisión y proyección griega mínima

Base main ca9daa215c7cc5dcbb1acb66fcd3be32a23765d5 (PR #37). Auditoría griega #1 (45848265585) e infraestructura #103 (45848265253) exitosas. Se propone una admisión limitada, no se concede automáticamente. El responsable debe aceptar expresamente los componentes y sus condiciones antes de actualizar la barrera de admisión. El plan histórico P8.1 permanece intacto (3/9); no se altera el registro público ni se declara aprobado ningún candidato griego.

## Decisión propuesta

GRK-C01: texto oficial SBLGNT v1.2 de 3 Juan, CC BY 4.0, atribución a SBL y Logos. GRK-C02: solo lema, categoría y código morfológico de MorphGNT v6.12, CC BY-SA 3.0; no usar sus columnas de texto ni presumir que la licencia reciente del SBLGNT se aplica a esa distribución histórica. Conservar atribución, versión y condiciones ShareAlike para material adaptado cuando corresponda. No se autoriza Strong, glosas ni equivalencias semánticas. GRK-C03 MACULA aplazado por procedencia mixta y 40 divergencias; revisar campos antes de decidir. Las nueve exclusiones STEPBible no se modifican.

El alcance propuesto es 15 versículos y 219 ocurrencias de texto oficial; 216 posibles vínculos de anotación por coincidencia estricta de referencia, posición y forma Unicode, 3 sin enlace hasta revisión. El examen de equivalencias NFC, mayúsculas/minúsculas y marcas se usa solo como diagnóstico; no normaliza originales ni amplía los vínculos. Las 40 diferencias MACULA se clasifican, sin incorporar sus datos. La coincidencia no demuestra equivalencia filológica por sí sola.

## Implementación

Manifiesto de decisión pendiente, verificación de bytes y SHA-256 de archivos y licencias (huellas obtenidas en auditoría real #1), revisión doble real, simulación de proyección agregada sin almacenar textos, lemas ni códigos, barrera de publicación y ocho pruebas sintéticas nuevas. El script rechaza autorización, componentes o fuentes ajenos al alcance de esta revisión; una fase de admisión explícita deberá crear el registro de decisión y actualizar el modelo/allowlist con validación por componente. No se implementa una vía de admisión por simple bandera de ejecución.

Comandos: python3 -m unittest discover -s tests -p test_greek_p83_review.py; python3 scripts/review-greek-p83.py. CI pendiente al abrir PR. No fusionar sin validaciones y revisión. P8.3.2 se considera preparada, no cerrada: después de autorización expresa, aplicar admisión y proyección griega real en memoria conforme a ENT19/23–27 y comprobar integridad; después P8.3.3. No publicar ni iniciar interfaz todavía.

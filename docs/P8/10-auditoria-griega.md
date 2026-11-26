# P8.3.1. Auditoría de candidatos griegos para el analizador

Base main 4cb3d4d67cf53abe86f447ffc040a8d5b5627d4d, cierre técnico P8.2.7 integrado (PR #36) y despliegue #102 (45847935848) verificado. P0.8 exige selección de ocurrencia, rasgos y fuentes, pruebas reales con hebreo y griego y ausencia explícita de datos. La cobertura inicial OSHB es Génesis y Daniel; aún no hay corpus griego admitido. P8.3.1 es una etapa operativa de auditoría previa a la admisión y al analizador, no el cierre de P8.3.

## Muestra y procedencia
Se selecciona 3 Juan como muestra pequeña común a tres conjuntos, sin afirmar alineación ni cobertura de todo el NT. Se fijan commits, rutas, tamaños y huellas Git a partir de los inventarios de los proveedores. El workflow calculará SHA-256 de bytes y evidencia de licencia en dos ejecuciones independientes, comparará posiciones y formas exactas, inventariará atributos sin valores y emitirá recuentos agregados. No guarda ni publica corpus, no altera las 12 decisiones de P8.1 ni el registro público.

| Candidato | Fuente y condición |
|---|---|
| GRK-C01 | [SBLGNT oficial](https://github.com/Faithlife/SBLGNT/tree/736fdc76158950c3d04b949b7e013ca14305145a), versión pública v1.2; [licencia](https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/LICENSE) CC BY 4.0. Texto, sin atribuir morfología. |
| GRK-C02 | [MorphGNT](https://github.com/morphgnt/sblgnt/tree/aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d); README fija CC BY-SA 3.0 para lemas/análisis, texto sujeto a EULA; no asumir licencia CC BY del texto de esa versión ni compatibilidad automática con la edición oficial. |
| GRK-C03 | [MACULA Greek](https://github.com/Clear-Bible/macula-greek/tree/8423afe47b9e8f24b7772e808af45c7159a6fe7e); [licencia por componentes](https://github.com/Clear-Bible/macula-greek/blob/8423afe47b9e8f24b7772e808af45c7159a6fe7e/LICENSE.md), CC BY 4.0 para capas propias; [procedencia SBLGNT](https://github.com/Clear-Bible/macula-greek/blob/8423afe47b9e8f24b7772e808af45c7159a6fe7e/SBLGNT/README.md) indica migración desde N1904. Revisar UnicodeLemma y FormalTag/FunctionalTag por separado; excluir StrongNumber, LN, LexDomain, glosas, traducciones y otros atributos no autorizados. |

## Criterios de paso
8 pruebas sintéticas previstas; auditoría real doble sin persistencia. Revisar resultados, diferencias, huellas SHA-256, procedencia y derechos por campo. Cualquier coincidencia posicional y textual es diagnóstica, no equivalencia filológica o permiso. No imprimir textos ni contenidos de atributos. Elaborar decisión de admisión separada (aprobación expresa, atribución, versión, licencia, alcance) antes de proyectar corpus griego al modelo. Si no se acredita la fuente/compatibilidad, mantener pendiente y estudiar alternativas. Los nueve candidatos STEPBible excluidos de P8.1 siguen excluidos.

P8.3.2 propuesta: decisión de admisión y proyección griega mínima, sin publicar; P8.3.3: selección de ocurrencia y contrato del analizador; P8.3.4: interfaz accesible, dirección del texto y estado sin datos; P8.3.5: validación con datos reales hebreo/griego, pruebas negativas y cierre. Subdivisión operativa propuesta; no cambia el plan maestro P0.8. No iniciar fases posteriores ni dar por completada P8.3 hasta cumplir sus criterios.

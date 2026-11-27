# P10.3.1. Validación del análisis hebreo (SN-001)

Base main e75d656368685554cfd9a73aa8ed416a6bdc2f94. PR #75 integrado; workflow 45935665574 satisfactorio y despliegue 45936031296 con build y deploy satisfactorios. P10.2 queda cerrada técnicamente, no académicamente.

## Cobertura y decisión

OSHB v.2.2 / WLC, revisión 6a5db284c715c18b239422e57bb89684e6a19f00, versificación Bible.MT. El analizador interno admite exclusivamente Génesis y Daniel (LING-011/012). Levítico 19:28 y Deuteronomio 14:1 quedan fuera de cobertura. Se comprueba el rechazo de ambos en el motor real y se utilizan Génesis 1:1 y Daniel 1:1 como controles positivos, con verificación de procedencia, ocurrencia, lema y morfología documentada cuando exista, sin inferir significado, Strong ni variantes. Los controles positivos no sustituyen el estudio de los tatuajes.

Se consultó el árbol Git de openscriptures/morphhb en la revisión fija: wlc/Lev.xml (1.085.069 bytes, blob 6025e0713ccfc79de0c90cb92ed0e8c0062d2614, EXP-C02 de P8.5); wlc/Deut.xml (1.315.401 bytes, blob 5317431fd1d1fb5848d7f9f1d22d0753152f9991, no registrado en los candidatos P8.5). LICENSE.md tiene blob 906e051438bf66ef6f2f7f36110504cba2b6867f. Esta consulta acredita identidad de metadatos, no el contenido, SHA-256, permisos de incorporación o compatibilidad. No se descargan ni importan los dos archivos candidatos. Se conservan las decisiones históricas, el importador y el registro público vacío.

## Validación y continuidad

Seis regresiones específicas, auditoría real en memoria con datos previamente admitidos, y regresiones de proyecto. El resultado esperado es dos bloqueos correctos, dos controles positivos, cero datos nuevos publicados. Se requiere auditoría por archivo, decisión de admisión explícita y ampliación probada del importador antes de analizar los dos pasajes. Se conserva P1024-F01 abierto. No se cierra ninguna necesidad de evidencia ni sección académica por este control.

La subdivisión operativa P10.3.1–P10.3.6 se utiliza para validar hebreo, griego, pactos, cristología, crítica textual e integración conjunta, sin cambiar las fases principales. P10.3.2 procede tras confirmar CI, integración y despliegue de P10.3.1; la ampliación de corpus queda pendiente de una decisión específica. El cierre técnico de la prueba de barrera no equivale a cierre del análisis hebreo ni aprobación de publicación.

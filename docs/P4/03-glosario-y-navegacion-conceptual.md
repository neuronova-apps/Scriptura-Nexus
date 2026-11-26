# P4.3. Glosario inicial y navegación conceptual

Base: 786556a9b587e940467397b40cd798ea2c26093c (P4.2 integrado y desplegado).
Rama: feature/p4.3-glossary-concept-navigation.

## 1. Objetivo y alcance

Incorporar un glosario metodológico inicial para facilitar la consulta de conceptos usados en los fundamentos y guías P4.2. El recurso se publica en /fundamentos/glosario/. Esta ruta contextual no reemplaza la ruta general /glosario/ prevista para P7 ni activa /lexicos/ de P8.

El glosario inicial contiene 70 conceptos con identificadores GLO-001 a GLO-070. Se distribuyen en cuatro categorías:
- Investigación e interpretación.
- Lenguas originales y análisis lingüístico.
- Transmisión textual y traducción.
- Fuentes, evidencias y derechos.

Cada registro incorpora término, definición propia, alias, categoría editorial, referencias metodológicas M01–M18, vínculos a guías, conceptos relacionados y referencias documentales internas. La estructura conserva los campos conceptuales de ENT35 en P0.7 (término, definición, alias, disciplinas y evidenceIds). Las disciplinas y evidenceIds permanecen vacíos deliberadamente: las categorías no se presentan como disciplinas teológicas y no se inventan evidencias de estudios individuales.

## 2. Navegación conceptual

La página presenta cuatro secuencias de consulta:
1. Estudio, pasaje, perícopa, exégesis, hermenéutica, aplicación y conclusión.
2. Edición textual, unidad, ocurrencia, forma, lema, identificador Strong y análisis morfosintáctico-semántico.
3. Manuscrito, testigo, variante, aparato, edición crítica, traducción y alineación.
4. Autor/institución, obra, fuente, evidencia, trazabilidad, localizador, afirmación, inferencia y grado de respaldo.

Las secuencias son orientativas y no prescriben que todos los pasos se apliquen a cada investigación. Las entradas incluyen enlaces internos a conceptos relacionados, referencias M y accesos a las cuatro guías P4.2. El índice permite saltar a las cuatro categorías.

La navegación compartida incluye el glosario desde cada guía P4.2. La portada de Fundamentos incorpora un acceso directo. Se actualiza el texto de estado para no presentar el glosario como una tarea futura.

## 3. Criterios conceptuales

- Strong se define como identificador léxico, no como morfología ni como determinante del sentido.
- Lema, raíz, ocurrencia y forma textual permanecen diferenciados.
- Morfología, sintaxis, semántica y significado contextual se describen como niveles relacionados, no intercambiables.
- Cita explícita, alusión y paralelo temático se distinguen; la semejanza no demuestra por sí sola dependencia textual.
- Manuscrito, testigo, variante, aparato, edición y tradición textual no se equiparan.
- Frecuencias y concordancias requieren corpus y edición delimitados.
- La clasificación primaria/secundaria/terciaria depende de la pregunta.
- Evidencia, inferencia, grado de respaldo, licencia y atribución tienen funciones diferentes.

## 4. Límites y decisiones de arquitectura

Este recurso es un vocabulario conceptual editorial. No es un léxico hebreo, arameo o griego, no aloja corpus bíblicos, no contiene una base de Strong, no calcula morfologías ni produce concordancias. Los datos de palabras y ocurrencias requieren edición, sistema, corpus, fuente, versión, licencia y validación en las fases lingüísticas correspondientes.

Se usa /fundamentos/glosario/ para el glosario metodológico inicial de P4.3. La ruta general /glosario/ del mapa arquitectónico de P0.6 se conserva para el módulo de glosario más amplio previsto en P7. No se crea una segunda fuente de datos ni se modifica el modelo de entidades de P0.7.

## 5. Verificación prevista y ejecutada por CI

- IDs GLO-001–GLO-070 únicos, secuenciales y estables.
- Cuatro categorías no vacías.
- Referencias relacionadas existentes, sin autorreferencias ni duplicados.
- M01–M18 y guías P4.2 válidas.
- Distinciones entre Strong, lema, raíz, forma, ocurrencia, morfología, sintaxis y semántica.
- Distinción entre evidencia, inferencia, respaldo, licencia y atribución.
- Destinos internos y anclas de conceptos existentes en build.
- Acceso desde Fundamentos y desde cada guía P4.2.
- Una sola cabecera H1, navegación semántica, preferencias visuales heredadas y diseño adaptable.

Las pruebas automatizadas no sustituyen la revisión visual, de teclado y con lector de pantalla. Estas comprobaciones manuales quedan registradas como pendientes hasta su ejecución.

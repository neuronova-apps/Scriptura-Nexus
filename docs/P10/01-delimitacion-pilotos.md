# P10.1. Delimitación de investigaciones piloto

Fecha: 26 de noviembre de 2026  
Base: `main` en `19c182a208bb30a85df4fc551070ecc7fedeceac`  
Rama de trabajo: `feature/p10.1-pilot-delimitation`  
Dependencias: P0.3, P0.4, P0.7, P0.8; P5, P6, P7, P8 y P9 cerradas técnicamente.

## 1. Objetivo

Delimitar los cinco estudios piloto previstos en P0.8 para comprobar, durante P10.2 y P10.3, que el flujo metodológico y las herramientas de Scriptura Nexus pueden apoyar investigaciones bíblicas, históricas, lingüísticas, teológicas y documentales con trazabilidad.

P10.1 define el alcance de los pilotos, sus preguntas de investigación, límites, necesidades de evidencia y condiciones de revisión. No desarrolla todavía las investigaciones ni formula conclusiones doctrinales. La delimitación final requiere aprobación expresa del responsable antes de iniciar P10.2.

## 2. Estudios piloto seleccionados

Los títulos, identificadores, ejes, enfoques y referencias iniciales se transcriben del catálogo vigente `src/data/catalogo/estudios.json` y de P0.3. Las referencias son puntos de partida sujetos a revisión; no constituyen por sí mismas evidencia de una conclusión.

| ID | Estudio | Eje principal | Enfoque registrado en el catálogo | Referencias iniciales |
|---|---|---|---|---|
| SN-001 | ¿Tatuarse es pecado? | E09 | Alcance de la prohibición y contexto ritual | Lv 19:28; Dt 14:1 |
| SN-015 | Obligatoriedad del diezmo | E10 | Diezmo, pactos y generosidad | Gn 14:20; Lv 27:30; Mal 3:8-10; Mt 23:23; 2 Co 9:7 |
| SN-008 | Hablar en lenguas | E05 | Naturaleza, función y regulación de las lenguas | Hch 2; 10; 19; 1 Co 12–14 |
| SN-021 | ¿Por qué me has desamparado? | E04 | Persona de Cristo, sufrimiento, Trinidad e intertextualidad | Sal 22; Mt 27:46; Mc 15:34 |
| SN-040 | Textus Receptus y texto crítico | E02 | Historia, fuentes, variantes y límites metodológicos | Por seleccionar; el catálogo no registra referencias iniciales |

Los cinco registros permanecen en estado `planificado`. No se alteran sus identificadores, títulos, ejes ni preguntas/focos originales.

## 3. Delimitación individual pendiente de aprobación

Se prepararon las cinco fichas de alcance en [delimitacion-pilotos-p101.json](delimitacion-pilotos-p101.json). Son propuestas para revisión, no investigaciones ejecutadas. Contienen:

1. Pregunta principal: conservar el enfoque registrado y formular una pregunta neutral y precisa, sin anticipar una respuesta.
2. Preguntas complementarias: incorporar las preguntas adicionales que el responsable determine y justificar su relación con la pregunta principal.
3. Objetivo general y objetivos específicos: establecer qué se busca comprender, comparar, documentar o evaluar.
4. Alcance temático y temporal: precisar qué aspecto se estudia y qué asuntos quedan fuera.
5. Pasajes, documentos y fuentes: identificar referencias iniciales y distinguir las que ya fueron verificadas de las que siguen pendientes.
6. Perspectivas y disciplinas: seleccionar las aplicables entre las previstas en P0.3 y P0.4; justificar las no aplicables.
7. Métodos y herramientas: definir qué análisis lingüísticos, históricos, exegéticos, textuales, documentales o comparativos serán necesarios.
8. Evidencias y trazabilidad: registrar afirmaciones, fuentes, ediciones, localizadores, permisos y estado de verificación.
9. Producto esperado: utilizar la plantilla metodológica de 20 secciones, indicando qué secciones están pendientes, analizadas, revisadas o justificadamente no aplican.
10. Exclusiones y limitaciones: declarar qué no podrá concluirse con las fuentes disponibles y qué materiales no se incorporarán.

La delimitación no exige aplicar mecánicamente las 18 perspectivas metodológicas a todos los estudios. Se seleccionarán según la naturaleza de cada pregunta, conforme a P0.4.

## 4. Incorporación de preguntas adicionales

Las preguntas adicionales se administrarán sin modificar el plan maestro ni renumerar los 42 estudios originales.

### 4.1 Preguntas complementarias de un piloto existente

Cuando una pregunta profundice el mismo problema del estudio, se registrará como subpregunta vinculada al identificador correspondiente. Cada una deberá incluir:

- Identificador del estudio principal.
- Redacción exacta de la pregunta.
- Motivo de incorporación y relación con el objetivo.
- Alcance y límites.
- Pasajes, documentos o fuentes iniciales, si se conocen.
- Perspectivas o herramientas que podría requerir.
- Estado: propuesta, aceptada para delimitación, pendiente de evidencia o descartada con justificación.

Una subpregunta no se convierte automáticamente en una conclusión ni en una nueva investigación independiente.

### 4.2 Nuevos temas independientes

Si una pregunta aborda un problema distinto y no cabe razonablemente dentro de un estudio existente, se registrará como propuesta de ampliación del catálogo. No se asignará un nuevo identificador ni se modificará `estudios.json` hasta que el responsable apruebe su incorporación y se compruebe su relación con la taxonomía. Los identificadores SN-001 a SN-042 permanecen estables.

### 4.3 Consolidación de las propuestas recibidas

El registro [propuestas-ampliacion-p101.json](propuestas-ampliacion-p101.json) conserva las 48 preguntas de la conversación y la pregunta adicional sobre responsabilidades parentales (49 en total), con redacción editorial neutral, origen y destino. Diez corresponden directamente a preguntas del responsable (1–9 y 49); las demás son propuestas del asistente para revisión, incluidas las cinco observaciones sobre alcance histórico, científico y religioso comparado. No se asume aprobación individual de todas las sugerencias.

Se proponen 38 estudios independientes, identificados provisionalmente como P10-Qnn, y ampliaciones de cinco estudios existentes: SN-007, SN-020, SN-023, SN-031 y SN-034. Varias preguntas complementarias quedan agrupadas: catolicidad e identidad de la Iglesia (3/10), dogmas marianos (8/22), Escritura y tradición (15/16), santidad y santificación (20/32), Satanás y Lucifer (33/34), honra y deberes parentales (31/49). La propuesta histórica conserva los identificadores P10-Qnn; P10.1.3 registra su correspondencia autorizada con SN-043–SN-080 sin modificar la línea base de 42 temas.

Los perfiles metodológicos propuestos son bíblico-exegético, teológico-doctrinal, histórico-eclesiástico, textual-lingüístico, ético-práctico, interdisciplinario y religioso comparado. Son etiquetas transversales múltiples, distintas de los 14 ejes, las 18 perspectivas M01–M18 y las tradiciones de P0.3. La clasificación no decide qué postura es correcta.

Las preguntas 11, 13 y 14 requieren historia y documentación eclesiástica; la 41 exige fuentes científicas y filosóficas además de la hermenéutica bíblica; la 42 necesita fuentes propias del judaísmo, cristianismo e islam, y estudios de historia de las religiones. No se intenta responder esos asuntos únicamente con la Biblia ni se crean tradiciones taxonómicas nuevas en esta fase. P10-Q49 integra Ef 6:1–4 y Col 3:20–21 con la honra, disciplina, protección frente al abuso y responsabilidad recíproca; su relación con el perdón (P10-Q05) distingue memoria, reparación, confianza y reconciliación.

Se registran 30 relaciones cruzadas propuestas, cada una con tipo y justificación, sin autoenlaces, duplicados ni destinos inexistentes. Son relaciones de planificación y no demostraciones doctrinales ni publicaciones aprobadas. P6.3 ya permite motivos de relación entre estudios; la eventual conexión con la interfaz requerirá admitir los identificadores y validar los contratos existentes.

### 4.4 Incorporación al catálogo operativo

El catálogo original está protegido por validaciones de P5 que fijan 42 registros, IDs y recuentos por eje. El responsable aprobó las 38 investigaciones y autorizó P10.1.3. La ampliación se implementa en una capa operativa separada que preserva el catálogo histórico y asigna SN-043–SN-080. Las cinco ampliaciones conservan sus IDs, títulos y ejes. Véase [02-ampliacion-catalogo.md](02-ampliacion-catalogo.md). Los perfiles y referencias cruzadas específicos se conectarán en P10.1.4. Los nuevos registros son metadatos planificados, no investigaciones concluidas.

## 5. Criterios metodológicos comunes

- Mantener la distinción entre dato textual, evidencia histórica, inferencia exegética, doctrina institucional, opinión de autor y conclusión editorial.
- Contrastar la perspectiva pentecostal con otras perspectivas protestantes y católicas y, cuando sea pertinente, con las perspectivas ortodoxa, judía y académica.
- No atribuir una postura a una tradición completa cuando la fuente solo representa a un autor, institución o corriente particular.
- Registrar las fuentes primarias y secundarias con autoría, obra, edición, fecha y localizador verificable.
- Aplicar APA 7 junto con las convenciones pertinentes para referencias bíblicas, manuscritos y textos antiguos.
- Utilizar Logos Bible Software cuando el recurso esté disponible para el responsable; registrar la edición y el localizador. ChatGPT servirá como apoyo para organizar, contrastar y redactar, no como fuente primaria.
- No inventar citas, páginas, variantes, datos morfológicos, referencias ni resultados.
- Declarar las limitaciones y los desacuerdos entre fuentes; no forzar una conclusión cuando la evidencia no sea suficiente.

## 6. Límites de P10.1

P10.1 no autoriza:

- Dar por concluidas las cinco investigaciones ni desarrollar los 42 temas.
- Convertir los enfoques iniciales del catálogo en conclusiones.
- Incorporar corpus, imágenes, transcripciones o aparatos críticos sin admisión y permisos comprobados.
- Presentar RV1909 o SBLGNT como manuscritos.
- Inferir alineaciones, canon o equivalencias de versificación no verificadas.
- Publicar borradores, resultados, fuentes licenciadas o materiales privados.
- Iniciar P10.2 o P10.3 antes de aprobar la delimitación.

Los borradores de investigación y los materiales de trabajo permanecerán fuera del sitio público. P11.4 conserva la autorización expresa de publicación como condición independiente.

## 7. Relación con las siguientes subfases

| Subfase | Función | Condición de entrada |
|---|---|---|
| P10.1 | Delimitar los cinco pilotos, sus preguntas y necesidades de evidencia | Ampliación y perfiles validados; cierre P10.1.5 en validación |
| P10.2 | Probar el flujo metodológico con casos seleccionados y fuentes disponibles | Delimitación aprobada |
| P10.3 | Validar las herramientas con casos de hebreo, griego, pactos, cristología y crítica textual | Flujo metodológico aplicado y evidencias disponibles |
| P10.4 | Registrar fallos, ajustes, decisiones y cierre | Resultados de P10.2 y P10.3 revisados |

Las subfases mantienen el orden de P0.8. P10.2 no exigirá terminar los 80 estudios planificados ni publicar los pilotos.

## 8. Criterios de aceptación de P10.1

P10.1 podrá cerrarse cuando:

1. Los cinco pilotos coincidan con los registros originales del catálogo.
2. Cada piloto tenga pregunta principal, objetivo, alcance, límites y necesidades de evidencia delimitados.
3. Las preguntas adicionales recibidas estén clasificadas como subpreguntas o propuestas de nuevos temas, con su vínculo y justificación.
4. Las disciplinas, perspectivas y métodos se seleccionen por pertinencia y no por aplicación automática.
5. Las fuentes iniciales estén diferenciadas de las fuentes efectivamente verificadas.
6. Los pendientes, exclusiones y restricciones de publicación queden registrados.
7. El responsable apruebe expresamente la delimitación antes de P10.2.

## 9. Estado de ejecución

P10.1 iniciada como documento de delimitación en la rama `feature/p10.1-pilot-delimitation`. Se verificaron los cinco registros directamente en el catálogo. El archivo histórico `estudios.json`, el corpus y los permisos de publicación permanecen intactos. P10.1.3 amplía la proyección operativa del catálogo.

Estado: P10.1.1 y P10.1.2 validadas; aprobación expresa de las 38 investigaciones recibida. P10.1.3 validada en el PR #71 (e7072818; siete workflows satisfactorios). P10.1.4 implementada: siete perfiles, 48 estudios con perfiles orientativos y 32 pendientes, 30 relaciones específicas con 60 enlaces recíprocos. P10.1.4 validada en 7c7e89f (siete workflows satisfactorios). P10.1.5 incorpora pruebas de cierre de catálogo en navegador y auditoría integral; pendiente CI, integración y despliegue. P10.2 sin iniciar. Véase [03-perfiles-relaciones.md](03-perfiles-relaciones.md). No se han verificado todavía fuentes nuevas ni redactado conclusiones.

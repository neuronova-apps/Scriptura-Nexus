# P0.7. Modelo de datos de Scriptura Nexus

Fecha: 25 de noviembre de 2026
Versión: 1.0
Dependencias: [P0.2](02-alcance.md), [P0.3](03-ejes.md), [P0.4](04-metodologia.md), [P0.5](05-fuentes.md), [P0.6](06-arquitectura.md).

## 1. Alcance

Definir el contrato conceptual y lógico de los datos para una plataforma estática basada en Astro, Markdown/MDX y JSON. Esta etapa no crea una base de datos, esquemas ejecutables, corpus, plantillas operativas ni investigaciones. Los esquemas y validadores se implementarán por fase en P1, P5–P9. Los ejemplos son de diseño y no constituyen resultados exegéticos. Se conserva un único repositorio y las 42 investigaciones planificadas.

## 2. Principios de modelado

Separar identidad, contenido, evidencia, interpretación, edición textual y publicación. Usar entidades referenciadas por IDs estables y evitar duplicación de estudios, fuentes o palabras. No equiparar lema, raíz, Strong y ocurrencia; no equiparar manuscrito, edición, traducción y versificación. Conservar procedencia de cada dato, incluso cuando existan análisis contradictorios. No deducir equivalencias entre ediciones por coincidencia de capítulo/versículo.

Los IDs SN, E, M, T, A y F existentes se mantienen. Los nuevos prefijos se reservan según tabla; los sufijos se asignarán de manera estable, sin reutilizar retirados. El ID compuesto de unidades o secciones se serializará con separadores seguros y reglas explícitas; no dependerá del título. No cambiar IDs por una corrección editorial. Las versiones de esquema y de contenido son independientes.

## 3. Diccionario de entidades

Los campos enumerados son mínimos conceptuales; su obligatoriedad depende del tipo y estado. Campos condicionales se explicitan en las reglas siguientes.

| Código | Entidad | Identificador | Campos principales |
|---|---|---|---|
| ENT01 | Eje | E01–E14 | nombre, alcance, disciplinaBase, orden |
| ENT02 | Disciplina | DIS-… | nombre, definición, disciplinaPadreId opcional |
| ENT03 | Método | M01–M18 | nombre, pregunta, evidencia, producto |
| ENT04 | Tradición/marco | T01–T05/A01 | nombre, tipo confesional/académico, subcorriente, padre opcional |
| ENT05 | Estudio | SN-001… | título, pregunta, objetivo, ejePrincipalId, ejesRelacionados, disciplinas, métodos, tradiciones, estado, versión |
| ENT06 | Sección de estudio | SN-…/S01…S20 | orden, título, estadoAplicabilidad, justificación, contenidoRef, evidenciaIds |
| ENT07 | Pasaje de estudio | PAS-… | estudioId, referencia estructurada, ediciónId opcional, rol, contexto, evidenciaIds |
| ENT08 | Autor o institución | AUT-… | nombre, tipo, tradiciónIds con evidencia, fechas opcionales, identificadores externos |
| ENT09 | Obra/documento | OBR-… | título, autorIds, tipo, fecha o intervalo, idioma, autoridad declarada |
| ENT10 | Edición bibliográfica | BIB-… | obraId, edición, año, editorial, idioma, ISBN/DOI/URL opcionales, fuenteId |
| ENT11 | Fuente inventariada | F01… | nombre, clase A/B/C, proveedor, URL, condiciones, fase |
| ENT12 | Recurso digital | REC-… | fuenteId, versión fija, archivo, checksum, licenciaId, alcance, admisión |
| ENT13 | Licencia | LIC-… | identificador, URL, titular, atribución, restricciones, evidencia, fecha de revisión |
| ENT14 | Evidencia/cita | EVD-… | ediciónBibliográficaId o recursoId, localizador, tipo, fragmento permitido/paráfrasis, estado |
| ENT15 | Afirmación | AF-… | estudioId, secciónId, proposición, tipo, gradoRespaldo, evidencia a favor/en contra, razonamiento |
| ENT16 | Postura teológica | POS-… | estudioId, tradiciónId, disciplinaIds, autor/institución, afirmaciónIds, fuentes, alcance, autoridad |
| ENT17 | Conclusión | CON-… | estudioId, preguntaId implícita, afirmaciónIds, síntesis, gradoRespaldo, reservas |
| ENT18 | Revisión editorial | REV-… | estudioId, versión, controles, responsable público o rol, fecha, resultado |
| ENT19 | Edición textual | TXT-… | nombre, lengua, tipo, recursoIds, canonId, versificacionId, cobertura |
| ENT20 | Canon | CAN-… | nombre, tradición/contexto, lista ordenada de libros y fuente |
| ENT21 | Versificación | VER-… | nombre, versión, reglas, correspondencias y fuente |
| ENT22 | Libro bíblico | LIB-… | código canónico interno, nombres por idioma, alias |
| ENT23 | Unidad textual | TXT-…/LIB-…/capítulo/versículo | ediciónId, libroId, capítulo, versículo como cadena, texto original, orden, recursoId |
| ENT24 | Ocurrencia/token | TOK-… | unidadId, posición, forma exacta, idioma, análisisIds, recursoId |
| ENT25 | Lema | LEM-… | idioma, forma de diccionario, homógrafo opcional, fuente y versión |
| ENT26 | Identificador léxico | LEXID-… | sistema (Strong u otro), código, lemaIds, fuente, correspondencia |
| ENT27 | Análisis morfológico | MOR-… | tokenId, lemaId opcional, sistema, código, rasgos, fuente, estado |
| ENT28 | Entrada/sentido léxico | LEX-… | lemaId, obra/edición, sentido, glosa permitida, dominio, evidencia, restricciones |
| ENT29 | Relación sintáctica | SYN-… | tokenCabezaId, tokenDependienteId, etiqueta, sistema, fuente |
| ENT30 | Alineación textual | ALI-… | unidades/tokens origen y destino, ediciones, tipo, fuente, verificación |
| ENT31 | Testigo manuscrito | MAN-… | sigla, identificador de catálogo, fecha/rango, lengua, custodia, fuente |
| ENT32 | Variante textual | VAR-… | locus, edición/aparato, lecturas, testigos, evidencia interna/externa, valoración |
| ENT33 | Lectura variante | LEC-… | varianteId, texto permitido o referencia, testigoIds, mano/corrección, fuente |
| ENT34 | Relación intertextual | INT-… | pasajes origen/destino, tipo, respaldo, evidencia |
| ENT35 | Concepto de glosario | GLO-… | término, definición propia, alias, disciplinas, evidenciaIds |
| ENT36 | Evento histórico | HIS-… | fecha/rango, precisión, descripción, participantes, fuentes |
| ENT37 | Manifiesto de corpus | COR-… | ediciónId, versión de datos, recursos, fragmentos, integridad, licencias |
| ENT38 | Entrada de concordancia | CCO-… | ediciónId, lema/identificador, tokenIds o índice fragmentado, frecuencia, corpus delimitado |

## 4. Relaciones y cardinalidades

| Origen | Relación | Destino | Cardinalidad / regla |
|---|---|---|---|
| Estudio | eje principal | Eje | N:1 obligatorio |
| Estudio | ejes relacionados | Eje | N:M; excluir eje principal |
| Estudio | clasifica | Disciplina, Método, Tradición | N:M; métodos con estado y justificación |
| Estudio | contiene | Sección | 1:20 posiciones conceptuales |
| Estudio | examina | Pasaje | 1:N; edición explícita si se cita forma exacta |
| Estudio | formula | Afirmación, Postura, Conclusión | 1:N; sin resultados obligatorios en planificado |
| Afirmación | respalda/refuta/contextualiza | Evidencia | N:M con rol y razonamiento |
| Postura | atribuye | Autor/institución, Tradición, Afirmación | N:1 o N:M según campo; autoridad documentada |
| Conclusión | sintetiza | Afirmación | N:M; conservar reservas |
| Estudio | tiene historial | Revisión | 1:N por versión |
| Obra | autoría | Autor/institución | N:M con rol |
| Obra | se materializa en | Edición bibliográfica | 1:N |
| Fuente inventariada | distribuye | Recurso digital | 1:N |
| Recurso digital | se rige por | Licencia | N:M por componente y alcance |
| Evidencia | localiza | Edición bibliográfica o Recurso digital | al menos uno, ambos si procede |
| Edición textual | utiliza | Canon, Versificación | N:1 cada uno; declarar cobertura parcial |
| Canon | ordena | Libro bíblico | N:M con orden y pertenencia |
| Edición textual | contiene | Unidad textual | 1:N |
| Unidad textual | contiene | Ocurrencia/token | 1:N cuando exista tokenización |
| Token | admite | Análisis morfológico | 1:N; conservar alternativas |
| Análisis morfológico | identifica | Lema | N:0..1 |
| Lema | se vincula con | Identificador léxico | N:M, nunca asumir equivalencia exacta |
| Lema | tiene | Entrada/sentido léxico | 1:N por obra y sentido |
| Token | se relaciona con | Token | N:M mediante relación sintáctica |
| Unidad/token | se corresponde con | Unidad/token de otra edición | N:M mediante alineación documentada |
| Variante | reúne | Lectura | 1:N, mínimo dos lecturas para contraste |
| Lectura | se atestigua en | Testigo | N:M, documentar mano/corrección y ausencia de datos |
| Pasaje | se relaciona con | Pasaje | N:M mediante relación intertextual |
| Edición textual | tiene | Manifiesto de corpus | 1:N por versión |
| Concordancia | indexa | Ocurrencias | 1:N dentro de corpus definido |

Las relaciones N:M se representan mediante listas de IDs o registros de enlace cuando requieran evidencia, rol, fecha o estado. No guardar objetos completos duplicados dentro de cada estudio.

## 5. Contrato de investigación y plantilla

Metadatos comunes: schemaVersion (entero positivo), id, createdAt, updatedAt, version, status, sourceRefs según entidad. Fechas ISO 8601; fechas antiguas o aproximadas usar intervalo y precisión, no inventar día/mes. Los registros importados conservan además resourceId y versión del conjunto de origen.

El estudio planificado exige ID, título, pregunta/foco inicial, eje principal, disciplinas si ya se han asignado, referencias preliminares o motivo de selección pendiente, estado y versión. Los campos no investigados pueden omitirse o marcarse pendientes; nunca rellenar con conclusiones inventadas. Métodos M01–M18, tradiciones T01–T05/A01 y 20 secciones de P0.4 son catálogos de referencia. Cada sección registra estado: pendiente, aplicable, no_aplicable, analizada o revisada; no_aplicable requiere justificación y pendiente requiere explicación al solicitar publicación.

Representación prevista: ficha de catálogo JSON, contenido Markdown con frontmatter que referencia el ID de estudio; los registros relacionales se almacenan de manera independiente. MDX solo para componentes propios aprobados. No ejecutar contenido importado. Evitar dos fuentes de verdad: catálogo es autoridad para identidad, eje y estado; el frontmatter enlaza al ID y a la versión editorial, no duplica campos autoritativos.

## 6. Contrato de datos bíblicos y lingüísticos

Referencia estructurada: libroId, capítulo, versículoInicio/Fin como cadenas (admitir sufijos y unidades especiales), ediciónId y versificacionId cuando corresponda, orden interno. Los rangos se validan según edición; correspondencias entre sistemas pueden ser uno-a-muchos, muchos-a-uno, ausentes o inciertas. No forzar 66 libros en todas las ediciones. Canon y cobertura de corpus son distintos: una edición parcial puede no incluir todos los libros de su tradición.

Token: unidadId, orden entero no negativo, forma original Unicode, idioma mediante etiqueta BCP 47 cuando exista (por ejemplo hbo, arc, grc), dirección de presentación según idioma, fuente de tokenización, análisisIds. Preservar grafía y diacríticos; normalizaciones de búsqueda en campos derivados separados, con algoritmo/versionado. No modificar texto mostrado para hacerlo coincidir con índices.

Strong: código como cadena con prefijo H/G, dígitos y extensión solo cuando el proveedor la documente; conservar código original, sistema, versión, relación con lema y estado de equivalencia. No usar Strong como PK de lema ni como código morfológico. Permitir ausencia, alternativas y homógrafos. El sistema de morfología conserva código original y rasgos normalizados (categoría, caso, género, número, persona, tiempo/aspecto, modo, voz, estado o conjugación según idioma), sin forzar rasgos no aplicables. Cada análisis tiene fuente y método, no consenso automático. Transliteración y pronunciación llevan convención; raíz, etimología, semántica contextual y sintaxis tienen evidencia propia.

Alineaciones y concordancias: indicar edición, unidad de recuento (token/lema), versión de corpus, filtro y alcance. No atribuir frecuencia global a un corpus parcial. Alineación de traducciones puede ser múltiple, parcial o inexistente; conservar incertidumbre y no fabricar interlineales.

## 7. Contrato de evidencia y crítica textual

La ficha EVD enlaza una edición bibliográfica o recurso digital, localizador preciso, afirmación vinculada mediante relación con rol, idioma, tipo (cita, paráfrasis, traducción propia, observación), fecha de consulta, estado de comprobación y permiso de publicación. Autor, obra, edición, página/localizador y enlace cuando exista deben resolverse mediante las entidades correspondientes. La referencia bibliográfica no equivale a evidencia leída. Distinguir consultada, verificada y pendiente. No publicar citas sin fuente verificable o autorización.

Variante: identificar locus y aparato concreto; lecturas con testigos documentados, fecha/intervalo, mano, estado (atestiguada, incierta, no consultada), localizadores, evidencia interna/externa, impacto, alternativas y grado de respaldo. No inferir que ausencia de un testigo en el registro significa que omite la lectura. Guardar citas o transcripciones únicamente si son autorizadas; de otro modo referencia. Una postura teológica no se vincula automáticamente con una denominación sin evidencia de su alcance y autoridad.

## 8. Estados y publicación

Estados editoriales: planificado, en_investigacion, borrador, en_revision, publicado, actualizado. Transiciones conforme a P0.4; revisión rechazada devuelve a investigación o borrador. Actualizado requiere nueva revisión y aprobación. Estado de publicación separado del estado de trabajo cuando se revisa una edición ya publicada: mantener snapshot aprobado anterior hasta nueva aprobación. Campos proposedVersion y publishedVersion opcionales; publishedVersion debe apuntar a revisión aprobada. Grados de respaldo por afirmación: explicito, solidamente_fundamentado, plausible, discutido, indeterminado, con justificación textual. No son puntuaciones estadísticas.

Separar estado de verificación de fuente, admisión de recurso y estado editorial. Clase A no equivale a admitido. Estados de admisión: candidato, en_revision, admitido, restringido, rechazado. Solo admitido y compatible puede distribuir contenido digital. Revisar licencias por componente. Recursos externos pueden citarse conforme a permisos sin alojar su contenido. No publicar borradores en la web ni indexarlos; material privado y licenciado tampoco se sube al repositorio público.

## 9. Organización y carga prevista

| Ubicación prevista | Datos |
|---|---|
| src/data/taxonomia/ | ejes, disciplinas, métodos, tradiciones |
| src/data/catalogo/ | fichas de estudio y relaciones |
| src/content/estudios/ | cuerpo narrativo aprobado y metadatos de enlace |
| src/content/autores/, biblioteca/, glosario/, historia/ | fichas narrativas por ID |
| src/data/referencias/ | autores, obras, ediciones, evidencias, afirmaciones, posturas, conclusiones y revisiones publicables |
| src/data/fuentes/ | inventario, recursos y licencias |
| src/data/manifiestos/ | ediciones, cánones, versificaciones y manifiestos |
| schemas/ | contratos JSON Schema o equivalentes, versionados |
| public/data/ | fragmentos generados o admitidos, índices y manifiestos públicos |
| public/licenses/ | licencias y atribuciones requeridas |

La distribución física definitiva se implementará por fase. No duplicar corpus en Markdown ni bundles. Fragmentar unidades por edición/libro/capítulo, índices por rango/prefijo, concordancias por páginas. Manifiesto registra rutas relativas a BASE_URL, bytes, checksum, número de registros, versión y licencias. Validar datos antes de copiar a public/ y excluir archivos no admitidos. Los índices son derivados reproducibles, no fuentes primarias.

## 10. Ejemplo de ficha estructurada de catálogo

Ejemplo de diseño basado en el tema ya planificado SN-001, no un estudio desarrollado ni un archivo JSON incorporado:

```json
{
  "schemaVersion": 1,
  "id": "SN-001",
  "title": "¿Tatuarse es pecado?",
  "primaryAxisId": "E09",
  "relatedAxisIds": ["E06", "E07"],
  "question": "¿Cuál es el alcance de la prohibición y su contexto ritual?",
  "status": "planificado",
  "version": "0.1.0",
  "initialReferences": ["Lv 19:28", "Dt 14:1"],
  "methodSelections": [],
  "traditionSelections": [],
  "evidenceIds": [],
  "publishedVersion": null
}
```

Las referencias preliminares son etiquetas legibles y se resolverán a pasajes estructurados cuando se seleccione edición. Los arreglos vacíos son deliberados, no representan ausencia de evidencia. En P0.7 no se asignan resultados, formas hebreas, códigos Strong ni citas académicas a este tema.

## 11. Integridad, validadores y pruebas previstas

| ID | Regla | Condición de aceptación |
|---|---|---|
| VAL-01 | Esquema y versión | Tipos, campos obligatorios y enums válidos |
| VAL-02 | Identificadores | Únicos, estables, prefijo válido; referencias existentes |
| VAL-03 | Taxonomía | Un eje principal, relacionados sin duplicación, métodos/tradiciones válidos |
| VAL-04 | Estados | Transiciones permitidas, publicación con revisión aprobada |
| VAL-05 | Secciones | 20 posiciones en estudios desarrollados; omisiones justificadas |
| VAL-06 | Evidencia | Afirmaciones publicadas trazables; citas y localizadores comprobados |
| VAL-07 | Corpus | Edición, canon, cobertura, versificación y unidades coherentes |
| VAL-08 | Lingüística | Token/posición, lema, sistema morfológico y procedencia válidos |
| VAL-09 | Alineación | Extremos válidos, ediciones explícitas, evidencia y estado |
| VAL-10 | Variantes | Locus, aparato, lecturas y testigos documentados |
| VAL-11 | Licencias | Recursos admitidos, alcance compatible, atribución y checksum |
| VAL-12 | Privacidad | Sin datos privados, credenciales o contenido no autorizado |
| VAL-13 | Índices | Reproducibles, versión de corpus y cobertura coherentes |
| VAL-14 | Historial | Versiones y revisiones vinculadas; no sobrescribir snapshot aprobado |
| VAL-15 | Unicode y accesibilidad | Preservar texto original, idioma y dirección; alias derivados |

Casos negativos futuros: ID duplicado; referencia huérfana; código Strong tratado como morfología; correspondencia entre ediciones sin evidencia; versículo fuera de cobertura; publicación sin revisión; recurso clase B sin admisión; cita sin localizador; licencia incompatible; texto con diacríticos perdidos; borrador incluido en índice. P0.7 documenta pruebas, no afirma haber ejecutado validadores inexistentes.

## 12. Evolución y criterios de cierre

Usar schemaVersion independiente de version editorial y dataVersion del corpus. Cambios incompatibles requieren migración explícita, pruebas y registro de cambios; conservar IDs y enlaces. Los esquemas ejecutables se introducirán gradualmente con las fases consumidoras, sin instalar una base SQL ni Supabase inicialmente. Revisar tamaño de fragmentos y límites de Pages en P1/P8/P9.

Cierre documental: 38 entidades, relaciones, contratos, estados, procedencia, almacenamiento, ejemplo y 15 reglas de validación registrados. Verificar incorporación y conservación de README/P0.1–P0.6. No importar fuentes ni empezar P0.8 automáticamente. El modelo queda sujeto a pruebas de implementación y ajuste justificado durante los pilotos.


## Ampliación editorial P6.5.5.1
ENT17 añade outcome (afirmativa/refutatoria/interpretativa/indeterminada), separado de grade. Cada vínculo argumental añade comparisonScope (canon_compartido/canon_diferenciado/historico_documental/autoridad_teologica/no_aplicable) y comparisonJustification. Controles críticos adicionales: imparcialidad y contexto_canonico. Sin migración de publicaciones reales: registro vacío. Los campos son obligatorios en el contrato actualizado; no se generan conclusiones para fichas planificadas. El catálogo de cánones y ediciones documentadas se resolverá en las fases de fuentes y análisis textual.

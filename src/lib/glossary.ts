export type GlossaryCategoryId = 'investigacion' | 'lenguas' | 'transmision' | 'fuentes';
export type GlossaryGuideRef = 'exegesis' | 'hermeneutica' | 'fuentes' | 'licencias';

export interface GlossaryCategory {
  id: GlossaryCategoryId;
  title: string;
  description: string;
}

export interface GlossaryTerm {
  schemaVersion: 1;
  id: string;
  term: string;
  definition: string;
  aliases: string[];
  category: GlossaryCategoryId;
  disciplines: string[];
  evidenceIds: string[];
  relatedIds: string[];
  methodRefs: string[];
  guideRefs: GlossaryGuideRef[];
  sourceRefs: string[];
}

export const glossaryCategories: GlossaryCategory[] = [
  {
    id: 'investigacion',
    title: 'Investigación e interpretación',
    description: 'Entidades, criterios y procesos para delimitar una investigación y comprender un pasaje.'
  },
  {
    id: 'lenguas',
    title: 'Lenguas originales y análisis lingüístico',
    description: 'Conceptos para describir formas, ocurrencias, lemas y rasgos lingüísticos sin confundir sus funciones.'
  },
  {
    id: 'transmision',
    title: 'Transmisión textual y traducción',
    description: 'Términos para distinguir manuscritos, testigos, variantes, ediciones y decisiones de traducción.'
  },
  {
    id: 'fuentes',
    title: 'Fuentes, evidencias y derechos',
    description: 'Conceptos para documentar afirmaciones, verificar referencias y respetar las condiciones de uso.'
  }
];

const sourceRefs = [
  'docs/P0/02-alcance.md',
  'docs/P0/03-ejes.md',
  'docs/P0/04-metodologia.md',
  'docs/P0/06-arquitectura.md',
  'docs/P0/07-modelo-datos.md'
];

function term(
  id: string,
  name: string,
  category: GlossaryCategoryId,
  definition: string,
  relatedIds: string[],
  options: {
    aliases?: string[];
    methodRefs?: string[];
    guideRefs?: GlossaryGuideRef[];
  } = {}
): GlossaryTerm {
  return {
    schemaVersion: 1,
    id,
    term: name,
    definition,
    aliases: options.aliases ?? [],
    category,
    // La categoría editorial del glosario no equivale a una disciplina teológica.
    disciplines: [],
    // Las definiciones iniciales son editoriales y no se presentan como evidencias de estudios.
    evidenceIds: [],
    relatedIds,
    methodRefs: options.methodRefs ?? [],
    guideRefs: options.guideRefs ?? [],
    sourceRefs
  };
}

export const glossaryTerms: GlossaryTerm[] = [
  term('GLO-001','Estudio bíblico','investigacion','Investigación delimitada que examina una pregunta mediante pasajes, métodos, fuentes y argumentos identificables. En Scriptura Nexus conserva un identificador SN, un eje principal, un estado editorial y un historial de versiones.',['GLO-002','GLO-018','GLO-021','GLO-023'],{methodRefs:['M10','M11'],guideRefs:['exegesis','hermeneutica','fuentes']}),
  term('GLO-002','Pasaje bíblico','investigacion','Segmento de un texto bíblico identificado mediante libro, capítulo y versículo, junto con la edición, el canon y la versificación cuando sean necesarios para localizarlo con precisión.',['GLO-003','GLO-008','GLO-024','GLO-044'],{methodRefs:['M01','M09','M10','M12','M13'],guideRefs:['exegesis']}),
  term('GLO-003','Unidad textual','investigacion','Fragmento identificable de una edición textual, como una sección, oración, cláusula o versículo. Su delimitación depende de la edición y del propósito del análisis; no debe suponerse que todas las unidades coinciden entre versiones.',['GLO-002','GLO-024','GLO-025','GLO-026','GLO-055'],{methodRefs:['M01','M02','M05']}),
  term('GLO-004','Exégesis','investigacion','Estudio razonado de lo que comunica un pasaje en su contexto. Examina, según la pregunta, la forma textual, la lengua, el género, la estructura, el contexto histórico-literario y las relaciones con otros textos.',['GLO-005','GLO-008','GLO-009','GLO-010','GLO-014','GLO-035'],{methodRefs:['M01','M02','M04','M05','M06','M09','M10','M12'],guideRefs:['exegesis']}),
  term('GLO-005','Hermenéutica','investigacion','Estudio de los principios, presupuestos y reglas que orientan la interpretación y permiten justificar la relación entre el sentido de un texto en su contexto y su aplicación.',['GLO-004','GLO-006','GLO-007','GLO-011','GLO-012','GLO-022'],{methodRefs:['M11','M13','M15','M16','M17','M18'],guideRefs:['hermeneutica']}),
  term('GLO-006','Interpretación','investigacion','Explicación propuesta sobre el sentido o alcance de un texto o fenómeno. Debe distinguirse de los datos observables, las reconstrucciones históricas, las doctrinas institucionales y las conclusiones editoriales.',['GLO-004','GLO-005','GLO-021','GLO-022','GLO-067'],{methodRefs:['M10','M11','M15','M16'],guideRefs:['exegesis','hermeneutica']}),
  term('GLO-007','Aplicación contemporánea','investigacion','Propuesta razonada sobre la pertinencia de un texto o principio para una situación actual. Requiere explicar el vínculo con el contexto original, los destinatarios, el canon y los presupuestos interpretativos.',['GLO-005','GLO-011','GLO-013','GLO-022','GLO-067'],{methodRefs:['M11','M17','M18'],guideRefs:['hermeneutica']}),
  term('GLO-008','Perícopa','investigacion','Unidad o sección de un texto delimitada para su lectura y análisis. La delimitación debe justificarse por la estructura, el argumento y el contexto, y no únicamente por los cortes de capítulos y versículos modernos.',['GLO-002','GLO-003','GLO-009','GLO-010','GLO-004'],{methodRefs:['M09','M10'],guideRefs:['exegesis']}),
  term('GLO-009','Contexto literario','investigacion','Relación de un pasaje con las partes que lo preceden y siguen, la estructura del libro, su género, argumento, voz narrativa y propósito comunicativo.',['GLO-008','GLO-004','GLO-014','GLO-015','GLO-016','GLO-017'],{methodRefs:['M09','M10','M12'],guideRefs:['exegesis']}),
  term('GLO-010','Contexto histórico-cultural','investigacion','Circunstancias históricas, sociales, institucionales y culturales pertinentes para comprender un texto. Cada dato debe situarse en una fuente y un periodo; lo seguro, discutido y desconocido se distingue expresamente.',['GLO-008','GLO-004','GLO-028','GLO-041','GLO-058','GLO-059'],{methodRefs:['M06','M07','M08','M14'],guideRefs:['exegesis','fuentes']}),
  term('GLO-011','Presupuesto interpretativo','investigacion','Supuesto o marco previo que influye en la manera de leer un texto. Puede ser lingüístico, histórico, teológico o confesional y debe hacerse explícito para poder examinar su efecto en la interpretación.',['GLO-005','GLO-020','GLO-022','GLO-061','GLO-063'],{methodRefs:['M11','M15','M16'],guideRefs:['hermeneutica']}),
  term('GLO-012','Canon bíblico','investigacion','Conjunto de libros que una comunidad religiosa reconoce como parte de sus Escrituras autorizadas. Su composición y orden pueden variar entre tradiciones; por ello debe indicarse el canon utilizado en cada estudio.',['GLO-002','GLO-005','GLO-013','GLO-024','GLO-061'],{methodRefs:['M13','M16'],guideRefs:['hermeneutica','exegesis']}),
  term('GLO-013','Pacto bíblico','investigacion','Relación establecida en el marco bíblico entre partes, con promesas, compromisos, disposiciones o señales según el texto estudiado. Su alcance y relación con otros pactos deben analizarse en contexto, sin reducirlos a una etiqueta.',['GLO-005','GLO-007','GLO-012','GLO-022','GLO-063'],{methodRefs:['M10','M11','M13','M15','M17'],guideRefs:['hermeneutica']}),
  term('GLO-014','Intertextualidad','investigacion','Relación textual o literaria entre dos o más pasajes. Debe precisarse si se trata de cita, alusión probable, paralelo temático u otra asociación, y justificar el grado de conexión con evidencia.',['GLO-002','GLO-009','GLO-015','GLO-016','GLO-017','GLO-039'],{methodRefs:['M12','M13'],guideRefs:['exegesis']}),
  term('GLO-015','Cita explícita','investigacion','Reproducción o referencia reconocible a otro texto. La formulación puede variar entre idiomas, ediciones o formas de transmisión; la identificación y comparación deben atender al contexto y a la fuente utilizada.',['GLO-014','GLO-016','GLO-017','GLO-052','GLO-064'],{methodRefs:['M12','M13'],guideRefs:['exegesis','fuentes']}),
  term('GLO-016','Alusión','investigacion','Referencia indirecta o eco de otro texto que se propone por correspondencias verbales, temáticas o contextuales. Su identificación requiere argumentos; una semejanza aislada no basta para afirmar dependencia textual.',['GLO-014','GLO-015','GLO-017','GLO-009'],{methodRefs:['M09','M12','M13'],guideRefs:['exegesis']}),
  term('GLO-017','Paralelo temático','investigacion','Pasaje que presenta un tema o motivo semejante a otro. La semejanza puede ser útil para comparar ideas, pero no demuestra por sí misma que exista una cita, alusión o dependencia literaria.',['GLO-014','GLO-015','GLO-016','GLO-009'],{methodRefs:['M09','M12','M13'],guideRefs:['exegesis']}),
  term('GLO-018','Perspectiva metodológica','investigacion','Enfoque o ángulo de análisis que orienta una pregunta y determina qué evidencias y procedimientos resultan pertinentes. En Scriptura Nexus se organiza mediante las perspectivas M01–M18; no equivale a una tradición confesional.',['GLO-019','GLO-020','GLO-004','GLO-005'],{methodRefs:['M01','M02','M10','M11']}),
  term('GLO-019','Disciplina teológica','investigacion','Área de estudio que aborda un objeto o problema teológico, como cristología, soteriología, pneumatología o eclesiología. Una investigación puede involucrar varias disciplinas sin que estas sean métodos de análisis.',['GLO-018','GLO-020','GLO-022','GLO-063'],{methodRefs:['M15','M16']}),
  term('GLO-020','Tradición confesional','investigacion','Marco histórico y comunitario de interpretación y práctica de una comunidad religiosa. Debe describirse con precisión y atendiendo a su diversidad interna; una opinión individual no representa automáticamente a toda la tradición.',['GLO-011','GLO-019','GLO-022','GLO-056','GLO-061'],{methodRefs:['M15','M16'],guideRefs:['hermeneutica','fuentes']}),
  term('GLO-021','Afirmación','investigacion','Proposición concreta que una investigación examina. Debe redactarse de forma delimitada y vincularse con las evidencias que la respaldan, cuestionan o contextualizan, junto con el razonamiento empleado.',['GLO-001','GLO-022','GLO-023','GLO-050','GLO-066','GLO-067'],{methodRefs:['M10','M11','M15','M16','M17'],guideRefs:['fuentes']}),
  term('GLO-022','Postura teológica','investigacion','Posición interpretativa o doctrinal atribuida a un autor, institución o tradición, según fuentes identificables. Deben registrarse su alcance, autoridad, argumentos y diversidad interna; no se presume que sea una enseñanza oficial.',['GLO-006','GLO-007','GLO-011','GLO-019','GLO-020','GLO-021','GLO-056'],{methodRefs:['M15','M16','M17'],guideRefs:['hermeneutica','fuentes']}),
  term('GLO-023','Conclusión','investigacion','Síntesis que responde a la pregunta delimitada a partir de las afirmaciones y evidencias examinadas. Debe expresar el grado de respaldo, las reservas y los asuntos pendientes; puede revisarse ante nueva evidencia.',['GLO-001','GLO-021','GLO-022','GLO-050','GLO-067'],{methodRefs:['M10','M11','M15','M17','M18'],guideRefs:['exegesis','hermeneutica','fuentes']}),
  term('GLO-024','Edición textual','lenguas','Versión concreta de un texto bíblico o de otro documento, identificada por sus responsables, criterios editoriales, lengua, fecha o versión y procedencia. No debe confundirse con un manuscrito ni con una traducción.',['GLO-002','GLO-003','GLO-025','GLO-043','GLO-047','GLO-052'],{methodRefs:['M01','M02','M03'],guideRefs:['exegesis','fuentes']}),
  term('GLO-025','Forma textual','lenguas','Secuencia exacta de letras o signos que aparece en una posición determinada de una edición. Debe conservarse su escritura y diacríticos; se distingue de la transliteración, la traducción, el lema y la normalización usada para buscar.',['GLO-003','GLO-024','GLO-026','GLO-027','GLO-029'],{methodRefs:['M01','M02','M03'],guideRefs:['exegesis']}),
  term('GLO-026','Ocurrencia o token','lenguas','Instancia concreta de una forma en una unidad textual, con una posición y una procedencia identificables. Varias ocurrencias pueden compartir forma o lema, pero cada una conserva su propio contexto.',['GLO-003','GLO-025','GLO-027','GLO-031','GLO-039','GLO-040'],{methodRefs:['M02','M04','M05'],guideRefs:['exegesis']}),
  term('GLO-027','Lema','lenguas','Forma de referencia utilizada para agrupar las formas flexionadas de una palabra en un diccionario o sistema de análisis. No es lo mismo que una ocurrencia, una raíz ni un identificador Strong.',['GLO-025','GLO-026','GLO-028','GLO-031','GLO-038','GLO-039'],{methodRefs:['M02','M03','M04'],guideRefs:['exegesis']}),
  term('GLO-028','Identificador Strong','lenguas','Código de referencia de un sistema léxico asociado a entradas hebreas o griegas. Sirve para localizar información en recursos que emplean ese sistema, pero no constituye un análisis morfológico ni determina por sí solo el significado contextual.',['GLO-027','GLO-031','GLO-038','GLO-039','GLO-040'],{aliases:['Strong','Número Strong'],methodRefs:['M02','M04'],guideRefs:['exegesis']}),
  term('GLO-029','Transliteración','lenguas','Representación de caracteres de un sistema de escritura mediante caracteres de otro, siguiendo una convención identificable. No traduce el significado de la palabra y puede variar según el sistema adoptado.',['GLO-025','GLO-030','GLO-027'],{methodRefs:['M02','M03'],guideRefs:['exegesis']}),
  term('GLO-030','Pronunciación','lenguas','Representación de cómo se articula una forma lingüística según una convención o reconstrucción fonológica determinada. Para lenguas antiguas debe indicarse el sistema utilizado y evitar presentar una reconstrucción discutida como certeza.',['GLO-029','GLO-025','GLO-027'],{methodRefs:['M02','M03'],guideRefs:['exegesis']}),
  term('GLO-031','Morfología','lenguas','Análisis de la estructura y de los rasgos gramaticales de una forma en una ocurrencia, como categoría, caso, género, número, persona, tiempo/aspecto, voz o modo, según corresponda al idioma. El código y el sistema de etiquetado deben identificarse.',['GLO-026','GLO-027','GLO-028','GLO-032','GLO-033'],{methodRefs:['M02','M05'],guideRefs:['exegesis']}),
  term('GLO-032','Sintaxis','lenguas','Estudio de cómo se combinan las palabras y unidades para formar estructuras y relaciones gramaticales. Analiza funciones y dependencias dentro de la oración; no se reduce a identificar rasgos morfológicos.',['GLO-031','GLO-033','GLO-035','GLO-036'],{methodRefs:['M02','M05'],guideRefs:['exegesis']}),
  term('GLO-033','Semántica','lenguas','Estudio del significado de palabras y expresiones. En el análisis de un pasaje se consideran sus usos, relaciones lingüísticas y contexto, sin asumir que todos los sentidos posibles aparecen simultáneamente en cada ocurrencia.',['GLO-034','GLO-035','GLO-036','GLO-038','GLO-052'],{methodRefs:['M04','M10'],guideRefs:['exegesis']}),
  term('GLO-034','Campo semántico','lenguas','Conjunto de palabras o sentidos relacionados por un ámbito conceptual. Sus elementos pueden compartir aspectos de significado sin ser sinónimos ni intercambiables en todos los contextos.',['GLO-033','GLO-027','GLO-035','GLO-038'],{methodRefs:['M04'],guideRefs:['exegesis']}),
  term('GLO-035','Significado contextual','lenguas','Sentido que una palabra o expresión adquiere en una ocurrencia concreta, determinado mediante la forma, la morfología, la sintaxis y el contexto literario e histórico pertinente. No se obtiene únicamente del lema o del número Strong.',['GLO-026','GLO-031','GLO-032','GLO-033','GLO-034','GLO-038'],{methodRefs:['M02','M04','M05','M09','M10'],guideRefs:['exegesis']}),
  term('GLO-036','Raíz','lenguas','Elemento léxico o morfológico del que se relacionan determinadas formas de una familia de palabras. Su análisis depende del idioma y del enfoque lingüístico; no debe usarse por sí solo para deducir el significado de una ocurrencia.',['GLO-027','GLO-037','GLO-033','GLO-035'],{methodRefs:['M02','M03','M04'],guideRefs:['exegesis']}),
  term('GLO-037','Etimología','lenguas','Estudio del origen y la evolución histórica de una palabra o expresión. Puede aportar información sobre su historia, pero no determina automáticamente el significado que tiene en un pasaje concreto.',['GLO-036','GLO-027','GLO-033','GLO-035'],{methodRefs:['M03','M04'],guideRefs:['exegesis']}),
  term('GLO-038','Glosa','lenguas','Equivalente breve o etiqueta que resume un sentido léxico para facilitar la consulta. Es una ayuda de orientación y no sustituye la definición completa, el análisis de la ocurrencia ni la justificación contextual.',['GLO-027','GLO-033','GLO-035','GLO-041'],{methodRefs:['M02','M04'],guideRefs:['exegesis']}),
  term('GLO-039','Concordancia','lenguas','Índice de las ocurrencias de una forma, lema o identificador dentro de una edición o corpus definido. Su cobertura depende de la fuente y de los criterios de búsqueda; debe indicarse qué conjunto de textos se consultó.',['GLO-026','GLO-027','GLO-028','GLO-040','GLO-042'],{methodRefs:['M02','M04'],guideRefs:['exegesis']}),
  term('GLO-040','Frecuencia léxica','lenguas','Cantidad de ocurrencias de una forma o lema dentro de un corpus y una versión determinados, con criterios de recuento explícitos. No debe presentarse como frecuencia universal si el corpus es parcial o está delimitado.',['GLO-026','GLO-027','GLO-039','GLO-042'],{methodRefs:['M02','M04'],guideRefs:['exegesis']}),
  term('GLO-041','Uso extrabíblico','lenguas','Uso documentado de una palabra o expresión fuera del corpus bíblico estudiado. Su pertinencia depende de la lengua, la fecha, el género y el contexto del documento; no todo paralelo externo prueba el sentido de un pasaje.',['GLO-010','GLO-033','GLO-035','GLO-042','GLO-058'],{methodRefs:['M03','M04','M06','M07'],guideRefs:['exegesis','fuentes']}),
  term('GLO-042','Corpus','lenguas','Conjunto delimitado de textos o datos utilizado para una consulta lingüística. Debe identificarse por contenido, edición, versión, cobertura y criterios de inclusión; las frecuencias y concordancias solo valen para el corpus indicado.',['GLO-039','GLO-040','GLO-041','GLO-024','GLO-058'],{methodRefs:['M02','M03','M04'],guideRefs:['exegesis','fuentes']}),
  term('GLO-043','Manuscrito','transmision','Documento escrito a mano que transmite una parte o la totalidad de un texto. Su identificación requiere, cuando se conozcan, sigla o catálogo, fecha o intervalo, lengua, procedencia y datos de custodia; no equivale al original del autor.',['GLO-044','GLO-045','GLO-046','GLO-048','GLO-050'],{methodRefs:['M01','M06','M14'],guideRefs:['exegesis','fuentes']}),
  term('GLO-044','Testigo textual','transmision','Manuscrito, versión antigua, cita u otra fuente documental que conserva una lectura de un texto. Debe describirse el tipo de testimonio y su localizador; no todos los testigos tienen la misma naturaleza ni independencia.',['GLO-043','GLO-045','GLO-046','GLO-048','GLO-050'],{methodRefs:['M01','M06','M14'],guideRefs:['exegesis','fuentes']}),
  term('GLO-045','Variante textual','transmision','Diferencia entre lecturas transmitidas en un mismo lugar del texto por distintos testigos o ediciones. Debe identificarse el pasaje, las lecturas, los testigos y la fuente del aparato; su existencia no implica siempre un cambio de sentido importante.',['GLO-043','GLO-044','GLO-046','GLO-047','GLO-048'],{methodRefs:['M01','M10'],guideRefs:['exegesis']}),
  term('GLO-046','Aparato crítico','transmision','Conjunto de notas editoriales que registra variantes seleccionadas y los testigos o fuentes que las respaldan, mediante convenciones propias de una edición. Su alcance depende de la edición consultada; no es una lista exhaustiva de todos los manuscritos existentes.',['GLO-044','GLO-045','GLO-047','GLO-043'],{methodRefs:['M01'],guideRefs:['exegesis','fuentes']}),
  term('GLO-047','Edición crítica','transmision','Edición de un texto preparada mediante evaluación de testigos, variantes y decisiones editoriales explícitas. No es un manuscrito ni debe confundirse con el texto original conservado íntegramente; se identifica por su título, edición y responsables.',['GLO-024','GLO-045','GLO-046','GLO-048','GLO-052'],{methodRefs:['M01','M03'],guideRefs:['exegesis','fuentes']}),
  term('GLO-048','Tradición textual','transmision','Conjunto o línea histórica de transmisión caracterizada por lecturas y relaciones entre testigos. Las categorías de tradición ayudan a describir la evidencia, pero no reemplazan el análisis de cada variante ni identifican por sí solas una edición concreta.',['GLO-043','GLO-044','GLO-045','GLO-049','GLO-050','GLO-051'],{methodRefs:['M01','M03','M06'],guideRefs:['exegesis']}),
  term('GLO-049','Texto masorético','transmision','Forma del texto hebreo bíblico transmitida por la tradición masorética y reflejada en ediciones concretas, con sistemas de vocalización y acentuación. Para citarlo debe identificarse la edición utilizada y no tratarlo como un manuscrito único.',['GLO-047','GLO-048','GLO-043','GLO-052'],{methodRefs:['M01','M02','M03'],guideRefs:['exegesis']}),
  term('GLO-050','Septuaginta','transmision','Denominación habitual para las traducciones griegas antiguas de las Escrituras judías. La colección presenta diversidad de libros, revisiones y formas textuales; conviene identificar la edición y el libro consultados.',['GLO-047','GLO-048','GLO-052','GLO-055','GLO-014'],{methodRefs:['M01','M03','M12','M13'],guideRefs:['exegesis']}),
  term('GLO-051','Textus Receptus','transmision','Denominación de una tradición de ediciones impresas del Nuevo Testamento griego difundidas desde el siglo XVI. No es un manuscrito y no debe equipararse automáticamente con el texto bizantino o con todas las ediciones mayoritarias.',['GLO-047','GLO-048','GLO-045','GLO-044'],{methodRefs:['M01','M03','M06'],guideRefs:['exegesis']}),
  term('GLO-052','Traducción bíblica','transmision','Versión de un texto bíblico expresada en otra lengua mediante decisiones léxicas, gramaticales, literarias y editoriales. Debe identificarse por nombre, edición o revisión, responsables y condiciones de uso.',['GLO-024','GLO-049','GLO-050','GLO-051','GLO-053','GLO-054','GLO-055','GLO-068'],{methodRefs:['M02','M04','M05','M10'],guideRefs:['exegesis','licencias']}),
  term('GLO-053','Equivalencia formal','transmision','Orientación de traducción que procura conservar, en la medida que lo permite la lengua de destino, rasgos formales y estructurales del texto de partida. No significa correspondencia palabra por palabra en todos los casos ni garantiza por sí sola una lectura más fiel.',['GLO-052','GLO-054','GLO-032','GLO-055'],{methodRefs:['M02','M04','M05'],guideRefs:['exegesis']}),
  term('GLO-054','Equivalencia funcional','transmision','Orientación de traducción que prioriza expresar el sentido y la función comunicativa del texto en la lengua de destino. Puede reorganizar estructuras para lograr naturalidad; sus decisiones también deben examinarse en contexto.',['GLO-052','GLO-053','GLO-033','GLO-035'],{methodRefs:['M02','M04','M05'],guideRefs:['exegesis']}),
  term('GLO-055','Alineación textual','transmision','Correspondencia documentada entre unidades o tokens de dos ediciones o textos. Puede ser parcial, múltiple o incierta; debe conservar la fuente y el método de alineación, sin forzar equivalencias palabra por palabra.',['GLO-003','GLO-024','GLO-026','GLO-052','GLO-053','GLO-054'],{methodRefs:['M01','M02','M04'],guideRefs:['exegesis']}),
  term('GLO-056','Autor o institución','fuentes','Persona u organización a la que se atribuye la responsabilidad de una obra, documento o declaración. Su identidad, afiliación, fechas y autoridad deben verificarse en fuentes adecuadas; no se infieren por asociación o cita indirecta.',['GLO-057','GLO-058','GLO-061','GLO-062','GLO-063'],{methodRefs:['M06','M14','M15','M16'],guideRefs:['fuentes']}),
  term('GLO-057','Obra o documento','fuentes','Libro, artículo, declaración, manuscrito, informe u otro objeto documental identificable. Debe registrarse el título, autoría o institución, fecha, tipo, idioma y edición o versión consultada.',['GLO-056','GLO-058','GLO-059','GLO-060','GLO-063','GLO-070'],{methodRefs:['M06','M14','M15','M16'],guideRefs:['fuentes','licencias']}),
  term('GLO-058','Fuente primaria','fuentes','Documento o testimonio que constituye objeto directo de estudio o aporta evidencia de primera mano para una pregunta concreta. Su condición de primaria depende del problema investigado; debe evaluarse autenticidad, procedencia, fecha y contexto.',['GLO-043','GLO-044','GLO-056','GLO-057','GLO-059','GLO-061'],{methodRefs:['M01','M06','M14','M16'],guideRefs:['fuentes']}),
  term('GLO-059','Fuente secundaria','fuentes','Investigación especializada que analiza, interpreta o contextualiza fuentes primarias, como monografías, artículos académicos y comentarios. Deben comprobarse autoría, edición, método, referencias y pertinencia para la pregunta.',['GLO-057','GLO-058','GLO-060','GLO-061','GLO-063'],{methodRefs:['M06','M09','M10','M14','M15'],guideRefs:['fuentes']}),
  term('GLO-060','Fuente terciaria','fuentes','Recurso de orientación o síntesis general, como una enciclopedia o instrumento introductorio. Puede ayudar a localizar referencias y conceptos, pero no sustituye la comprobación de documentos y estudios especializados.',['GLO-057','GLO-058','GLO-059','GLO-061'],{methodRefs:['M06','M10'],guideRefs:['fuentes']}),
  term('GLO-061','Evidencia','fuentes','Información documental o textual identificable que respalda, cuestiona o contextualiza una afirmación. Debe vincularse con una fuente, edición y localizador, y distinguirse de la interpretación construida a partir de ella.',['GLO-021','GLO-056','GLO-057','GLO-058','GLO-059','GLO-060','GLO-062','GLO-063','GLO-066','GLO-067'],{methodRefs:['M01','M06','M10','M11','M15','M16'],guideRefs:['fuentes']}),
  term('GLO-062','Trazabilidad','fuentes','Posibilidad de seguir una afirmación hasta la fuente consultada, su autoría, edición, fecha, localizador, procedencia y estado de verificación. Permite revisar cómo se obtuvo y utilizó la información.',['GLO-021','GLO-056','GLO-057','GLO-061','GLO-063','GLO-070'],{methodRefs:['M01','M10','M11'],guideRefs:['fuentes']}),
  term('GLO-063','Localizador bibliográfico','fuentes','Dato que permite encontrar el fragmento concreto de una fuente, como página, sección, versículo, folio, línea, número de catálogo o identificador estable. Debe corresponder a la edición realmente consultada.',['GLO-057','GLO-061','GLO-062','GLO-064','GLO-065','GLO-070'],{methodRefs:['M01','M06','M10','M14'],guideRefs:['fuentes']}),
  term('GLO-064','Cita directa','fuentes','Reproducción literal de palabras de una fuente. Debe identificarse como cita, conservar el sentido del original, incluir un localizador y respetar las condiciones de licencia y los límites aplicables a su reproducción.',['GLO-061','GLO-062','GLO-063','GLO-065','GLO-068','GLO-069'],{methodRefs:['M10','M14','M15','M16'],guideRefs:['fuentes','licencias']}),
  term('GLO-065','Paráfrasis','fuentes','Reformulación de una idea ajena con palabras propias. Aunque no reproduce literalmente el texto, requiere atribución y referencia a la fuente; no debe alterar el alcance de la afirmación original.',['GLO-061','GLO-062','GLO-063','GLO-064','GLO-066','GLO-069'],{methodRefs:['M10','M14','M15','M16'],guideRefs:['fuentes','licencias']}),
  term('GLO-066','Inferencia','fuentes','Conclusión derivada de una o más evidencias mediante un razonamiento explícito, pero que no aparece formulada directamente en la fuente. Debe distinguirse del dato observado y exponerse junto con sus límites y alternativas.',['GLO-021','GLO-061','GLO-065','GLO-067','GLO-023'],{methodRefs:['M10','M11','M15','M17'],guideRefs:['exegesis','hermeneutica','fuentes']}),
  term('GLO-067','Grado de respaldo','fuentes','Valoración cualitativa asignada a una afirmación según la evidencia y los argumentos disponibles. P0.4 establece las categorías explícito, sólidamente fundamentado, plausible, discutido e indeterminado; no son porcentajes ni puntuaciones estadísticas.',['GLO-021','GLO-022','GLO-023','GLO-061','GLO-066'],{methodRefs:['M10','M11','M15','M16'],guideRefs:['exegesis','hermeneutica','fuentes']}),
  term('GLO-068','Licencia','fuentes','Conjunto de condiciones que determina los usos permitidos y las restricciones de un recurso, como reproducción, adaptación, distribución y atribución. Debe consultarse la licencia concreta y verificar que cubra el uso previsto.',['GLO-057','GLO-064','GLO-065','GLO-069'],{methodRefs:['M10','M16'],guideRefs:['fuentes','licencias']}),
  term('GLO-069','Atribución','fuentes','Reconocimiento de autoría o procedencia de un material conforme a las condiciones aplicables. Dar crédito no reemplaza la autorización o licencia necesaria para reproducir, adaptar o distribuir una obra.',['GLO-056','GLO-057','GLO-064','GLO-065','GLO-068','GLO-070'],{methodRefs:['M10','M16'],guideRefs:['fuentes','licencias']}),
  term('GLO-070','Referencia bibliográfica','fuentes','Descripción normalizada de una obra o documento que permite identificarlo y localizar la edición consultada. Incluye los datos disponibles de autoría, título, fecha, editorial o institución, edición y DOI o URL cuando corresponda.',['GLO-056','GLO-057','GLO-059','GLO-060','GLO-061','GLO-063','GLO-068'],{methodRefs:['M06','M14','M15','M16'],guideRefs:['fuentes','licencias']})
];

export function glossaryTermId(id: string): string {
  return id.toLowerCase();
}

# P9.4.2. Contratos de manuscritos, ediciones, loci, aparatos, variantes y traducciones

Base: main f64d2953bba01f599764be0fc38e298b478c47d7, con P9.4.1 integrado (PR #66) y Pages #184 satisfactorio. Dependencias conceptuales: P0.6, P0.7 ENT19 y ENT31–ENT33, P9.1.3, P9.3.1 y P9.4.1.

## 1. Objetivo y alcance

Formalizar los contratos ejecutables y las reglas de integridad para describir testigos manuscritos, ediciones textuales, localizadores, aparatos críticos, variantes, lecturas y traducciones. La implementación se limita al modelo y a la validación de relaciones. No incorpora manuscritos reales, textos, imágenes, aparatos, transcripciones ni datos de catálogo de terceros. No modifica el lector, comparador, corpus, canon, versificación ni interfaz pública.

El contrato reutiliza ENT19 (TXT) para la identidad de una edición textual, ENT31 (MAN) para el testigo manuscrito, ENT32 (VAR) para la variante y ENT33 (LEC) para la lectura. No crea prefijos adicionales ni asigna IDs independientes a locus y aparato: ambos se modelan como estructuras subordinadas de una variante. La traducción se representa mediante un perfil enlazado a una edición ENT19 cuyo tipo sea traducción.

## 2. Distinciones obligatorias

| Concepto | Identidad o referencia | Qué representa | Qué no representa |
|---|---|---|---|
| Testigo | MAN-* (ENT31) | Objeto manuscrito individual y su custodia | Una edición impresa, traducción o transcripción digital |
| Edición textual | TXT-* (ENT19) | Versión textual identificable, con lengua, tipo, recursos y versión | El objeto manuscrito físico |
| Edición bibliográfica | BIB-* (ENT10) | Publicación o manifestación editorial concreta | La identidad del texto ni un testigo |
| Locus | Estructura dentro de VAR | Localización en la edición y localizador nativo de la fuente | Una equivalencia automática entre sistemas |
| Aparato | Referencia dentro de VAR | Edición/aparato, convención, localizador y procedencia | Permiso para copiar su contenido |
| Variante | VAR-* (ENT32) | Registro de contraste textual en un locus y aparato definidos | Una decisión automática sobre el texto original |
| Lectura | LEC-* (ENT33) | Lectura atribuida a una fuente y, cuando esté documentado, a testigos y manos | Una transcripción libre sin permiso |
| Traducción | Perfil asociado a TXT-* de tipo traducción | Edición traducida, idioma, traductor y texto base documentado o desconocido | Un testigo manuscrito ni una alineación inferida |

RV1909 continúa siendo una traducción y SBLGNT v1.2 una edición textual griega. Ninguna se convierte en testigo por su admisión técnica previa. Los contratos tampoco amplían la admisión OSHB/WLC ni admiten los aparatos BHS/BHQ o NA28/UBS5.

## 3. Contratos implementados

### ENT31. Testigo manuscrito

El registro MAN exige sigla o identificador de catálogo, idioma, datación, custodia y procedencia. La custodia identifica institución, colección, shelfmark y URL de catálogo cuando se conocen. La datación conserva etiqueta original, límites cronológicos opcionales, precisión y evidencia. Se permiten intervalos amplios y datación indeterminada; no se fuerza un año exacto. Los años se expresan como enteros con BCE negativo y CE positivo, sin año cero. Una datación no indeterminada requiere evidencia.

Las referencias de procedencia se separan en ediciones bibliográficas, recursos y evidencias. Debe existir al menos una referencia bibliográfica o recurso y una evidencia identificable. El contexto del validador recibe una lista explícita de EVD verificadas; una fuente solo consultada o pendiente no puede respaldar un dato de testigo, locus, aparato o lectura. La ausencia de sigla o de shelfmark se conserva como dato desconocido, pero se exige al menos una identidad estable de catálogo o sigla y una referencia de custodia.

### ENT19. Registro de edición textual

La ficha enlaza el TXT existente con un BIB opcional, responsables editoriales, evidencias y estado documental. Las funciones permitidas son texto crítico, edición textual histórica y traducción. La función traducción debe coincidir con kind=traduccion en ENT19; las otras funciones requieren kind=edicion_critica. Una transcripción documental no se reclasifica como edición crítica por conveniencia: si no cuenta con un registro ENT19 y admisión propios, permanece como referencia externa. El registro no duplica nombre, idioma, versión, proveedor, recursos ni cobertura que ya pertenecen a ENT19.

### Locus

El locus identifica la edición textual, el localizador original de la fuente y el estado de resolución de la referencia. En estado verified_reference, libro, capítulo y versículo deben ser conocidos y, si se declara un unitId, sus campos deben coincidir exactamente con ENT23. La versificación solo se referencia si existe una identidad conocida; no se crea ni se asigna una por coincidencia numérica.

Los estados source_native_only y unresolved exigen mantener nulos libro, capítulo, versículo, unidad y versificación. Se conserva el localizador original y la evidencia, sin completar coordenadas no verificadas. El contrato no equipara un folio, columna o línea con un versículo.

### Aparato

La referencia de aparato debe apuntar a una edición textual crítica conocida y a una edición bibliográfica o recurso identificable. Incluye localizador, convención cuando esté documentada y evidencia. La política de reutilización de P9.4.2 es exclusivamente reference_only. No se almacena el texto del aparato ni se permite convertir la referencia externa en una copia.

### ENT32. Variante textual

La variante relaciona un locus con el aparato de la misma edición, cuya ficha ENT19 debe estar documentada y no ser una traducción, al menos dos lecturas identificadas y listas separadas y no solapadas de evidencia interna y externa. Se rechaza una variante sin evidencia. La valoración admite not_assessed, reviewed o inconclusive. Una valoración no iniciada debe dejar método, fundamento, responsable, fecha y evidencias en null o vacío. Una valoración realizada requiere método, fundamento, responsable, fecha y evidencia vinculada. El validador no determina cuál lectura es original ni calcula una preferencia por mayoría.

### ENT33. Lectura variante y atestación

Cada lectura LEC referencia una variante, una referencia de consulta y evidencias. En esta versión solo se admite contentMode=reference_only y readingText=null. Por tanto, el contrato no persiste transcripciones. El estado de testigos distingue documented de not_documented. Una lista vacía solo es válida cuando se declara expresamente que los testigos no están documentados.

Cada atestación enlaza MAN, estado attested/uncertain/not_consulted, localizador del testigo, mano y evidencia. Si el testigo no fue consultado, no se permite afirmar folio, línea o mano. Una mano correctora requiere identificación explícita. La falta de una atestación no significa que el manuscrito omita la lectura; significa que no se ha documentado en el registro.

### Traducción

El perfil debe enlazar a un TXT cuyo kind sea traduccion y a su ficha ENT19 con función translation. Registra idioma, traductor si se conoce, edición bibliográfica, texto o textos base y evidencias. El texto base se declara documented, multiple_sources o not_documented, con cardinalidad coherente. Las alineaciones se limitan a IDs ENT30 previamente verificados. No se genera ni se infiere alineación automática, y la traducción no contiene una relación de identidad con MAN.

## 4. Integridad transversal

- IDs únicos y prefijos existentes: TXT, MAN, VAR y LEC.
- Referencias bibliográficas, recursos, autores, evidencias, libros, unidades, versificaciones y alineaciones deben existir en sus registros de contexto.
- Los registros de lectura y variante deben enlazarse en ambas direcciones; no se aceptan lecturas huérfanas.
- El locus y el aparato de una variante deben pertenecer a la misma edición textual.
- Una traducción requiere ENT19 de tipo traducción; su texto base no puede ser ella misma.
- Una unidad ENT23 declarada en un locus verificado debe coincidir exactamente en edición, libro, capítulo y versículo.
- Los campos no aplicables se representan con null; no se inventan fechas, manos, shelfmarks, fuentes ni localizadores.
- Se rechazan campos no definidos para evitar incorporar notas privadas o datos no auditados.
- No se infieren parentescos, filiaciones, omisiones, originalidad ni equivalencias por coincidencia de referencias.

## 5. Registro inicial y barreras

El archivo `registro-manuscritos-p942.json` contiene únicamente el contrato metadata-only y listas vacías. No hay testigos, ediciones adicionales, variantes, lecturas ni traducciones nuevas admitidas por P9.4.2. Los fixtures de pruebas están identificados como sintéticos y no representan manuscritos, lecturas o hechos históricos.

Las barreras quedan fijadas: publicación no autorizada, importación de corpus deshabilitada, contenido textual y aparato no persistidos, imágenes no persistidas, atribución automática de testigos deshabilitada y alineación automática deshabilitada. P9.4.1 conserva sus cinco repositorios como enlaces externos y sus seis grupos editoriales sin seleccionar.

## 6. Validación

La suite P9.4.2 cubre registro vacío, fixture sintética relacional, identidad y datación del testigo, locus exacto y nativo, aparato crítico y referencia externa, cardinalidad de variantes, relaciones bidireccionales, bloqueo de transcripciones, manos correctoras, clasificación de traducciones, textos base, alineaciones verificadas, referencias desconocidas, campos adicionales, barreras y copia independiente del parser.

El workflow específico ejecuta TypeScript/Astro check, toda la suite Node, la auditoría P9.4.1, build y verificación del artefacto. Los resultados efectivos se registran en GitHub Actions; este documento no anticipa su aprobación.

## 7. Límites y siguiente dependencia

P9.4.2 define el contrato, no acredita derechos ni verifica manuscritos concretos. P9.4.3 solo podrá crear una muestra de fichas cuando cada objeto, catálogo, edición, localizador, evidencia y permiso estén identificados. Si una fuente solo permite consulta, se conserva el enlace y la referencia; no se copia su contenido. P9.4.4 implementará la interfaz después de contar con registros aptos y pruebas de accesibilidad. La publicación permanece bloqueada hasta P11.4.


## 8. Resultado de implementación y validación

P9.4.2 quedó integrado en main mediante PR #67, commit `7c6eec033e3197661ecd81a312631d929b674c7b`. La ejecución especializada P9.4.2 (45912835477) aprobó 19 pruebas del contrato. La suite general registró 377 pruebas aprobadas y cero fallos; `astro check`, `npm run build` y `npm run test:build` finalizaron correctamente. La regresión P9.4.1 y las validaciones P9.2.4, P9.3.1, P9.3.2 y P9.3.4 también fueron satisfactorias.

El despliegue Pages #195 (45912959296), asociado al commit de integración, terminó con build y deploy satisfactorios. Esta validación acredita los contratos y la integración técnica; no equivale a admitir manuscritos ni a revisar lecturas reales.

Estado de datos al cierre: 0 testigos registrados, 0 ediciones adicionales admitidas, 0 variantes, 0 lecturas y 0 perfiles de traducción añadidos. No se importaron textos, imágenes ni aparatos. Las barreras de publicación, importación, persistencia de contenido y alineación automática continúan deshabilitadas.

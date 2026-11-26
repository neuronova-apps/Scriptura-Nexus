# P0.6. Arquitectura técnica de Scriptura Nexus

Fecha: 25 de noviembre de 2026
Versión: 1.0
Dependencias: [P0.1](01-diagnostico.md), [P0.2](02-alcance.md), [P0.3](03-ejes.md), [P0.4](04-metodologia.md), [P0.5](05-fuentes.md).

## 1. Alcance y decisiones arquitectónicas

Arquitectura estática, modular, orientada a contenido y mantenida en un único repositorio: neuronova-apps/Scriptura-Nexus. GitHub Pages será el destino inicial. Esta fase documenta decisiones; no instala dependencias, activa Pages, importa datos ni implementa módulos. P1 establecerá y probará la infraestructura. P0.7 formalizará contratos de datos. La investigación temática seguirá un flujo editorial independiente.

| ID | Decisión | Motivo y alternativa |
|---|---|---|
| ADR-01 | Astro con salida estática | Generar HTML navegable y cargar JavaScript solo donde haya interacción; frente a una SPA completa, reduce dependencia del cliente. |
| ADR-02 | TypeScript estricto | Contratos explícitos y detección temprana de errores; validar además datos externos en ejecución/build. |
| ADR-03 | Markdown con frontmatter y colecciones de contenido | Facilita edición y versionado; MDX opcional para componentes editoriales aprobados, no para datos importados ni contenido no confiable. |
| ADR-04 | JSON UTF-8, esquemas y manifiestos | Datos y metadatos interoperables; separar corpus de contenido narrativo. |
| ADR-05 | CSS nativo y componentes Astro; JS/TS puntual | Evitar un framework de cliente adicional hasta demostrar necesidad. |
| ADR-06 | Node.js LTS compatible y npm con lockfile | Construcción reproducible; fijar versiones compatibles y acciones en P1, sin declarar versiones no comprobadas. |
| ADR-07 | GitHub Actions y Pages | Despliegue de artefacto estático, sin backend inicial. |
| ADR-08 | Búsqueda local e índices fragmentados | Consultas privadas en navegador, sin servicio externo; Pagefind como candidato para contenido estático, índice especializado para Strong y corpus. |
| ADR-09 | Datos de terceros separados y aprobados | Preservar atribuciones, versiones, licencias y procedencia; impedir importación automática no revisada. |
| ADR-10 | Sin Supabase, autenticación ni IA integrada inicialmente | Reducir coste, complejidad y exposición de datos; reconsiderar mediante decisión documentada si surge necesidad real. |

Referencias técnicas para verificación en P1: https://docs.astro.build/ ; https://docs.astro.build/en/guides/deploy/github/ ; https://docs.github.com/en/pages ; https://pagefind.app/ ; https://www.w3.org/TR/WCAG22/. La compatibilidad de versiones y disponibilidad efectiva se comprobarán al implementar.

## 2. Capas y flujo

Autor/investigador (ChatGPT, Logos y bibliografía externa) → borrador revisado y autorizado → contenido Markdown y registros estructurados → validación de esquemas, referencias y licencias → generación Astro → dist/ e índices públicos → GitHub Actions → GitHub Pages → navegador.

En navegador: navegación HTML; componentes interactivos cargados bajo demanda para filtros, comparación, selección de términos y glosario; consulta de archivos JSON estáticos por edición/libro/capítulo y de índices específicos. Preferencias visuales locales opcionales. No se transmiten búsquedas a un servicio propio ni se requiere cuenta. Los enlaces externos se identifican como tales. Logos sigue siendo una herramienta externa, no un componente conectado.

## 3. Estructura prevista del repositorio

```text
Scriptura-Nexus/
  README.md
  docs/
    P0/                         # documentación existente, conservar
    architecture/               # decisiones y evolución técnica
  src/
    components/
      ui/
      navigation/
      studies/
      biblical/
      linguistic/
      textual/
      bibliography/
    layouts/
    pages/
    content/
      fundamentos/
      estudios/
      autores/
      historia/
      biblioteca/
      glosario/
    content.config.ts           # colecciones según versión de Astro elegida
    data/
      taxonomia/
      catalogo/
      referencias/
      fuentes/
      manifiestos/
    lib/
      validation/
      references/
      corpus/
      search/
      accessibility/
    styles/
  schemas/
  public/
    assets/
    data/                       # solo datos aprobados o generados
    licenses/
  scripts/                      # importación, normalización, validación e índices
  tests/
    unit/
    integration/
    e2e/
    fixtures/
  .github/workflows/
  astro.config.mjs
  tsconfig.json
  package.json
  package-lock.json
  .gitignore
  dist/                         # generado, no versionado
```

La estructura es objetivo, no árbol existente. Los datos originales voluminosos no se duplicarán indiscriminadamente; conservar fuente fija y checksum, usar área local ignorada si procede y versionar manifiestos, scripts reproducibles y archivos autorizados necesarios. Nunca almacenar en Git, incluso en ramas, contenido privado o licenciado sin permiso. Los estudios no publicados pueden mantenerse fuera del repositorio público; excluir de la web no equivale a confidencialidad del archivo Git.

## 4. Módulos funcionales y rutas

| Módulo | Ruta relativa prevista | Fase |
|---|---|---|
| Portal principal | / | P3 |
| Fundamentos | /fundamentos/ | P4 |
| Ejes y catálogo | /estudios/ y /ejes/[id]/ | P5 |
| Estudio individual | /estudios/[id]/ | P6 |
| Biblioteca teológica | /biblioteca/ | P7 |
| Autores | /autores/[id]/ | P7 |
| Historia cristiana | /historia/ | P7 |
| Glosario y léxicos | /glosario/ y /lexicos/ | P7/P8 |
| Análisis lingüístico | /linguistica/ | P8 |
| Lector y comparación bíblica | /biblia/ y /comparador/ | P9 |
| Manuscritos y crítica textual | /manuscritos/ | P9 |
| Perspectivas doctrinales | /perspectivas/ | P6/P7 |
| Referencias y atribuciones | /referencias/ y /licencias/ | P7–P9 |
| Búsqueda | /buscar/ | P5–P9 |

Rutas relativas a la base de Pages, no a la raíz del dominio. Configuración prevista: site=https://neuronova-apps.github.io, base=/Scriptura-Nexus, output=static, trailingSlash coherente (preferencia always). Generar rutas dinámicas conocidas en build, no depender de rewrite de SPA. URLs de activos y enlaces construidos mediante utilidades conscientes de BASE_URL. ID SN estable como ruta, título y slug descriptivo como metadatos. Generar 404 con navegación de retorno; canonical y sitemap con base correcta.

## 5. Contenido, relaciones y publicación

Colecciones con esquemas validados: estudios, fundamentos, autores, obras, documentos, fuentes, glosario y cronologías. Taxonomía E01–E14, métodos M01–M18, tradiciones T01–T05/A01 e IDs SN-001–SN-042 conservados. Separar catálogo público planificado de cuerpo de estudio publicado: la ficha puede mostrar pregunta, pasajes y estado, sin conclusiones ficticias. El build público, los índices y los activos no incluirán borradores ni extractos no aprobados. El repositorio es público: material confidencial o con licencia personal permanecerá fuera de él.

Usar referencias por ID a autores, obras, fuentes, pasajes, palabras y variantes; validar unicidad, referencias huérfanas, estados, relaciones y aprobación. Evitar copiar un estudio para varios ejes. Mantener historial por Git y registro editorial. P0.7 especificará tipos, campos obligatorios y reglas de integridad.

## 6. Corpus, herramientas lingüísticas y textuales

Separar capas: edición textual, versificación/canon, libro/capítulo/versículo, tokens por ocurrencia, lema, Strong opcional, morfología con sistema de códigos, léxicos, concordancias, variantes, traducciones y alineaciones explícitamente verificadas. No fusionar ediciones por igualdad de referencia. Preservar escritura hebrea, aramea y griega, diacríticos y formas originales; normalización de búsqueda separada del texto mostrado. Mostrar dirección RTL en hebreo/arameo y aislamiento bidi en referencias mixtas.

Carga bajo demanda: manifiesto pequeño por corpus, JSON por libro/capítulo (subfragmentar si necesario), índice de lemas/Strong por rangos o prefijos, concordancias paginadas. No descargar la Biblia completa al abrir inicio ni duplicar corpus en HTML o bundles. Consultas grandes podrán ejecutarse en Web Worker si las mediciones lo justifican. Cache HTTP del alojamiento y caché en memoria limitada; no introducir service worker inicial para evitar versiones obsoletas. No almacenar notas personales como si fueran datos sincronizados.

Priorizar candidatos P0.5: STEPBible, OSHB, SBLGNT y RV1909, condicionados a auditoría por archivo. MorphGNT, MACULA, TR, Septuaginta y otros requieren validación específica. Recursos comerciales y Logos: enlaces, referencias y citas autorizadas; no indexar ni alojar bibliotecas privadas. Mostrar fuente, edición y licencia en cada herramienta; los datos no alineados deben señalarse y no inventarse.

## 7. Búsqueda, interfaz y accesibilidad

Búsqueda general sobre catálogo, estudios publicados y fichas autorizadas; filtros por eje, disciplina, estado y tradición. Búsqueda exacta por referencia bíblica, ID SN, Strong H/G, lema y forma; mantener búsqueda lingüística separada del índice editorial. Índice generado en build, cargado al abrir buscador, con resultados limitados/paginados. Pagefind es candidato, sujeto a prueba de español, griego, hebreo y base de Pages; si no satisface un requisito, usar índice especializado local.

Diseño responsive desde 320 px, navegación semántica, landmarks, salto al contenido, foco visible, teclado, etiquetas, texto alternativo, contraste WCAG 2.2 AA como objetivo verificable, zoom/reflujo, reducción de movimiento y modos claro/oscuro/alto contraste. Ajuste de tipografía respetando preferencias del usuario. Tablas complejas con encabezados y desplazamiento accesible; términos originales con lang y dir. Contenido principal legible sin JS; filtros interactivos con degradación y mensajes de error. Exportación inicial mediante CSS de impresión y función del navegador, sin prometer PDF descargable automatizado hasta evaluar necesidad.

## 8. Seguridad, privacidad y licencias

No incluir secretos, tokens, claves API, datos privados, libros de Logos ni credenciales en repositorio/artefacto. Preferir código propio y dependencias mínimas, fijar lockfile, revisar vulnerabilidades y licencias, escapar datos externos y no ejecutar MDX/HTML de fuentes no confiables. Validar URLs y protocolos; abrir externos de forma segura. No usar analytics, cookies publicitarias, CDN de terceros o fuentes remotas por defecto. localStorage únicamente para preferencias visuales no sensibles, con opción de restablecer y manejo de errores; no sincroniza entre dispositivos. GitHub Pages puede registrar datos técnicos de alojamiento: no prometer anonimato. Revisar aviso de privacidad y atribuciones antes de publicación.

Separar código, contenidos propios y datos de terceros. Registrar cada fuente con versión, archivo, checksum, licencia, atribución y modificaciones. No elegir licencia global sin decisión del titular. Los encabezados HTTP personalizados no deben suponerse disponibles en Pages; evaluar limitaciones reales antes de imponer políticas de seguridad incompatibles.

## 9. Construcción, CI y despliegue

P1: fijar versiones soportadas, lockfile y comandos npm ci, check, lint, test y build. Validar esquemas, enlaces internos, referencias, corpus admitidos, licencias, exclusión de borradores y ausencia de secretos. Generar dist/ con rutas y activos correctos. Probar localmente producción bajo /Scriptura-Nexus/.

GitHub Actions: en pull request y push ejecutar checks sin publicar; despliegue solo desde main autorizado (o despacho manual restringido), después de checks exitosos. Usar permisos mínimos por job (contents: read en build, pages: write e id-token: write solo en deploy), acciones oficiales con versiones/SHAs revisados, artefacto de Pages, concurrencia para no solapar despliegues y entorno github-pages. No ejecutar código no confiable con secretos ni publicar desde PR. Configurar Pages Source: GitHub Actions en P1 si la autorización lo permite. Verificar URL pública y estado del workflow; si el conector no permite cambiar ajustes, solicitar intervención del titular. Ante error, detener publicación y conservar última versión válida; revertir commit problemático y reconstruir. No usar force-push.

## 10. Presupuestos técnicos y pruebas

Objetivos iniciales (no mediciones actuales): HTML principal sin necesidad de cargar corpus; JS inicial comprimido objetivo <=150 KiB; transferencia inicial de página principal objetivo <=500 KiB sin recursos externos; fragmento JSON por consulta objetivo <=250 KiB comprimido, justificando excepciones; LCP <=2,5 s, CLS <=0,1 e INP <=200 ms como metas de experiencia, verificar en entorno controlado y no confundir laboratorio con métricas de campo. Revisar tamaño total del sitio y límites vigentes de Pages antes de importar corpus. No comprometer datos completos que excedan capacidad; dividir o excluir con decisión documentada.

| Control | Verificación prevista |
|---|---|
| Build reproducible | npm ci y build limpio con lockfile |
| Datos | Esquemas, IDs, referencias, estados, Unicode y procedencia |
| Rutas | Enlaces y recursos bajo base real, 404 y navegación directa |
| Interacción | Filtros, búsqueda, selección de términos y comparación |
| Accesibilidad | Teclado, zoom, lector de pantalla y auditoría automatizada |
| Responsive | 320, 375, 768, 1024 y 1440 px como casos iniciales |
| Rendimiento | Medición de bundles, solicitudes y pruebas de laboratorio |
| Licencias | Manifiestos, atribuciones y exclusión de fuentes no admitidas |
| Seguridad | Dependencias, secretos, contenido no confiable y permisos CI |
| Publicación | Solo material aprobado; smoke test de Pages y reversión |

Pruebas unitarias para normalización, referencias, filtros y validadores; integración para colecciones y generación; E2E con Playwright como candidato y axe-core para controles automatizables, sin sustituir revisión manual. Seleccionar versiones en P1. P11 consolidará auditoría; P10 validará la arquitectura con casos piloto.

## 11. Dependencias y límites

No se asume backend, base SQL, autenticación, API bíblica de terceros ni conexión automática a Logos. Si más adelante se requiere administración web, notas privadas sincronizadas, búsqueda de corpus masivos o API, evaluar Supabase u otra solución en una nueva decisión con seguridad, coste, licencias y migración. Mantener IDs y contratos desacoplados del framework.

P0.7 detallará el modelo de datos; P0.8 definirá fases y criterios de aceptación; P0.9 consolidará la documentación. P1 realizará el primer build y despliegue de prueba. No se ha comprobado todavía funcionamiento de Pages, versiones concretas de dependencias, límites de alojamiento ni rendimiento real. El cierre P0.6 es documental, no operativo.

## 12. Criterios de cierre

Decisiones técnicas registradas, capas, árbol, rutas, contenido, corpus, búsqueda, accesibilidad, seguridad, CI, despliegue, pruebas y límites definidos; coherencia con P0.1–P0.5; incorporación y lectura posterior verificadas sin modificar archivos anteriores. No iniciar P0.7 automáticamente.

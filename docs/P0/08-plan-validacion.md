# P0.8. Plan maestro de implementación y criterios de validación

Fecha: 25 de noviembre de 2026
Versión: 1.0
Dependencias: [P0.1](01-diagnostico.md), [P0.2](02-alcance.md), [P0.3](03-ejes.md), [P0.4](04-metodologia.md), [P0.5](05-fuentes.md), [P0.6](06-arquitectura.md), [P0.7](07-modelo-datos.md).

## 1. Alcance

Consolidar la ruta de construcción de Scriptura Nexus desde P1 hasta P11, con entregables y condiciones de aceptación verificables. P0.8 es documental: no instala dependencias, modifica Pages, importa corpus ni inicia investigaciones. P0.9 cerrará la planificación antes de P1. Se conserva un solo repositorio y el catálogo inicial de 42 temas planificados. No hay fechas de entrega prometidas: las dependencias, licencias, permisos y aprobaciones determinan el avance.

## 2. Dos líneas de trabajo independientes

La línea técnica construye infraestructura, interfaz, catálogo, plantillas, biblioteca y herramientas. La línea editorial investiga tema por tema mediante ChatGPT, textos específicos y Logos Bible Software, con trazabilidad, revisión y aprobación. P10 utiliza pilotos acotados para validar la infraestructura y metodología; no convierte la investigación completa de los 42 temas en requisito de publicación técnica. Los estudios podrán desarrollarse en paralelo cuando existan las herramientas necesarias, manteniendo borradores privados fuera del repositorio público.

## 3. Fases y dependencias

| Fase | Alcance | Dependencia | Subfases |
|---|---|---|---:|
| P1 | Infraestructura del repositorio | P0.9 | 6 |
| P2 | Identidad visual y accesibilidad | P1 | 5 |
| P3 | Portal principal | P2 | 4 |
| P4 | Fundamentos metodológicos | P3,P0.4 | 4 |
| P5 | Ejes temáticos y catálogo | P3,P4,P0.3,P0.7 | 5 |
| P6 | Motor de investigaciones | P5,P4,P0.7 | 5 |
| P7 | Biblioteca teológica | P6,P0.5 | 5 |
| P8 | Herramientas lingüísticas | P6,P7,P0.5,P0.7 | 5 |
| P9 | Herramientas textuales | P7,P8,P0.5 | 5 |
| P10 | Validación con investigaciones piloto | P6,P7,P8,P9 | 4 |
| P11 | Auditoría y publicación | P1–P10 | 5 |

Las dependencias indican requisitos de entrada, además del cierre y autorización de la fase precedente en la ruta acordada. No adelantar fases ni fusionar alcances sin aprobación. Las subfases son unidades de control y no implican que todas deban tener el mismo tamaño.

## 4. Desglose de implementación

### P1. Infraestructura del repositorio

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P1.1 | Inventario y línea base | Árbol, commit y alcance autorizado | Confirmar archivos protegidos y permisos |
| P1.2 | Entorno reproducible | Astro, TypeScript, Node LTS compatible, npm y lockfile | Instalación limpia npm ci; versiones fijadas |
| P1.3 | Estructura y configuración | Directorios iniciales, base /Scriptura-Nexus, salida estática y página mínima | Check y build sin errores; rutas bajo base real |
| P1.4 | Integración continua | Workflow con permisos mínimos y checks | Ejecución satisfactoria de checks; no publicar PR |
| P1.5 | Despliegue de prueba | Artefacto Pages y configuración autorizada | URL pública y recursos verificados; si falta permiso, registrar bloqueo |
| P1.6 | Cierre | Informe, pruebas y commit | Sin cambios ajenos; autorización para P2 |

### P2. Identidad visual y accesibilidad

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P2.1 | Identidad visual | Propuestas de logo, paleta y tipografía | Aprobación visual del responsable |
| P2.2 | Sistema de diseño | Tokens CSS, componentes y estados | Consistencia y contraste verificable |
| P2.3 | Preferencias visuales | Claro, oscuro, alto contraste y tamaño de letra | Persistencia local, reset, teclado y zoom |
| P2.4 | Responsive y accesibilidad | Prototipos para 320–1440 px | Revisión manual y automatizada; sin defectos críticos |
| P2.5 | Cierre | Capturas y resultados | Validación del diseño antes de P3 |

### P3. Portal principal

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P3.1 | Layout y navegación | Cabecera, pie, menú y estructura semántica | Navegación por teclado y enlaces correctos |
| P3.2 | Inicio | Presentación, accesos a módulos y búsqueda prevista | Diseño aprobado; sin funcionalidades ficticias |
| P3.3 | Rutas y estados | Páginas iniciales de módulos, 404 y estados vacíos | Enlaces internos válidos; módulos pendientes identificados |
| P3.4 | Cierre | Build, responsive y smoke test | Inicio y navegación verificados en Pages |

### P4. Fundamentos metodológicos

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P4.1 | Contenido base | Presentación pública de metodología y criterios | Coherencia con P0.4; distinguir métodos y tradiciones |
| P4.2 | Plantillas de fundamentos | Páginas de exégesis, hermenéutica, evidencias y licencias | Contenido editorial propio y referencias trazables |
| P4.3 | Navegación y glosario inicial | Enlaces y conceptos metodológicos | Sin enlaces rotos ni afirmaciones doctrinales no investigadas |
| P4.4 | Cierre | Revisión documental y técnica | Aprobación editorial y build conforme |

### P5. Ejes temáticos y catálogo

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P5.1 | Taxonomía estructurada | 14 ejes y catálogos de clasificación | IDs y referencias válidos |
| P5.2 | Catálogo inicial | 42 fichas planificadas con SN-001 a SN-042 | 42 IDs únicos; ningún resultado inventado |
| P5.3 | Exploración | Filtros, rutas de ejes y fichas | Resultados correctos; categorías vacías explicadas |
| P5.4 | Búsqueda inicial | Índice del catálogo público | Búsqueda por ID, título y términos; sin borradores |
| P5.5 | Cierre | Pruebas de integridad y navegación | Coincidencia con P0.3 y controles VAL aplicables |

### P6. Motor de investigaciones

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P6.1 | Contratos editoriales | Esquemas de estudio, secciones, afirmaciones y revisión | Pruebas positivas y negativas de integridad |
| P6.2 | Plantilla de 20 secciones | Render de contenido, aplicabilidad y estados | Secciones y omisiones justificadas; sin contenido ficticio |
| P6.3 | Relaciones y perspectivas | Componentes de evidencia, argumentos y referencias cruzadas | Navegación por IDs sin duplicar estudios |
| P6.4 | Publicación versionada | Separar catálogo, borrador y snapshot aprobado | Bloquear publicación sin revisión y recursos permitidos |
| P6.5 | Cierre | Pruebas de plantilla con datos sintéticos marcados | No presentar fixtures como estudios reales |

### P7. Biblioteca teológica

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P7.1 | Contratos bibliográficos | Autores, obras, ediciones, evidencias y fuentes | Referencias válidas, atribución y localizadores |
| P7.2 | Catálogo documental | Fichas de autores y documentos con fuentes comprobadas | Distinguir opinión, documento oficial y tradición |
| P7.3 | Biblioteca y glosario | Búsqueda, filtros, historia y enlaces | No alojar obras comerciales sin autorización |
| P7.4 | Licencias y atribuciones | Registro público y control de admisión | Permisos por recurso y evidencia conservada |
| P7.5 | Cierre | Auditoría bibliográfica y funcional | Sin referencias inventadas ni archivos restringidos |

### P8. Herramientas lingüísticas

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P8.1 | Auditoría de candidatos | STEPBible, OSHB y otros conjuntos seleccionados | Versión, licencia, checksum y aprobación por archivo |
| P8.2 | Modelo e importación | Scripts reproducibles, tokens, lemas, Strong y morfología | Cobertura y procedencia verificadas; conservar Unicode |
| P8.3 | Analizador de términos | Selección de ocurrencia, rasgos y fuentes | Pruebas con hebreo y griego; ausencia de datos explícita |
| P8.4 | Léxicos y concordancias | Índices, recuentos por edición y consulta bajo demanda | Recuentos reproducibles; no inventar equivalencias |
| P8.5 | Rendimiento y cierre | Medición, accesibilidad RTL y pruebas | Cumplir presupuestos o justificar excepciones aprobadas |

### P9. Herramientas textuales

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P9.1 | Admisión de ediciones | RV1909, SBLGNT y fuentes adicionales autorizadas | Licencias y versiones verificadas; corpus restringidos excluidos |
| P9.2 | Lector bíblico | Canon, versificación, navegación y fragmentos | Cobertura declarada y referencias correctas |
| P9.3 | Comparador | Ediciones y correspondencias verificadas | Mostrar diferencias y ausencia de alineación sin inventarlas |
| P9.4 | Manuscritos y variantes | Fichas, testimonios, aparato y enlaces autorizados | Distinguir edición, testigo, lectura y traducción |
| P9.5 | Cierre | Pruebas funcionales, integridad y rendimiento | Sin datos no admitidos; atribución visible |

### P10. Validación con investigaciones piloto

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P10.1 | Delimitación de pilotos | SN-001, SN-015, SN-008, SN-021, SN-040 | Alcance acotado y aprobación del responsable |
| P10.2 | Prueba de flujo | Aplicar metodología a casos seleccionados y fuentes disponibles | Evidencias trazables; pendientes declarados |
| P10.3 | Validación de herramientas | Casos hebreo, griego, pactos, cristología y crítica textual | Comprobar plantillas, referencias y datos pertinentes |
| P10.4 | Ajustes y cierre | Registro de fallos, correcciones y revisión | No exigir terminar 42 estudios ni publicar pilotos sin aprobación |

### P11. Auditoría y publicación

| Subfase | Actividad | Entregable | Criterio de aceptación |
|---|---|---|---|
| P11.1 | Auditoría técnica | Build limpio, enlaces, pruebas unitarias, integración y E2E | Checks críticos conformes |
| P11.2 | Auditoría documental | Catálogo, evidencias, licencias, estados y privacidad | Sin materiales no autorizados ni conclusiones ficticias |
| P11.3 | Accesibilidad y rendimiento | Pruebas manuales, automatizadas y métricas | WCAG 2.2 AA como objetivo; defectos críticos resueltos |
| P11.4 | Publicación y recuperación | Versión aprobada, Pages, smoke test y procedimiento de reversión | Despliegue comprobado y recuperación documentada |
| P11.5 | Cierre y mantenimiento | Informe final, pendientes y ruta editorial continua | Aprobación del responsable; no equivale a concluir investigaciones |

## 5. Protocolo de ejecución y control de cambios

Antes de cada fase: leer documentos aplicables, verificar rama, commit, árbol, archivos protegidos y estado previo; delimitar cambios y registrar riesgos. Solicitar autorización para ampliar alcance. Para documentación aislada se puede trabajar en main cuando el responsable lo haya autorizado; para cambios técnicos utilizar rama específica feature/pN-descripcion y revisión mediante PR cuando sea viable. No usar force-push, borrar archivos ajenos, alterar permisos o activar servicios sin autorización. Mantener cambios pequeños, commits descriptivos y lockfiles revisados. Si el conector no permite una operación, documentar el bloqueo y solicitar acción del titular, sin simular ejecución.

Después de implementar: revisar diff, archivos añadidos/modificados, SHA de archivos protegidos y commit padre; ejecutar verificaciones pertinentes y registrar resultados reales, comandos, entorno, versión, fecha y limitaciones. No declarar pruebas superadas si no se ejecutaron. Guardar informes por fase en docs/P1/…docs/P11/ con nombres consistentes; incluir evidencia de workflows y enlaces cuando existan. Mantener trazabilidad de decisiones arquitectónicas.

## 6. Matriz transversal de validación

| ID | Control | Fases principales | Evidencia exigida |
|---|---|---|---|
| QA-01 | Integridad Git y alcance | Todas | Diff, padre, archivos protegidos, commit |
| QA-02 | Build reproducible y dependencias | P1–P11 | npm ci, check, lint/test/build según disponibilidad |
| QA-03 | Rutas, base y enlaces | P1,P3–P11 | Pruebas bajo /Scriptura-Nexus/ y smoke test |
| QA-04 | Taxonomía y contratos | P5–P10 | VAL-01 a VAL-05 y pruebas negativas |
| QA-05 | Evidencia y referencias | P4,P6–P11 | VAL-06, fuentes comprobadas y revisión |
| QA-06 | Corpus y lingüística | P8–P11 | VAL-07 a VAL-10, VAL-13 y VAL-15 |
| QA-07 | Licencias y atribuciones | P7–P11 | VAL-11, manifiestos, admisión y avisos |
| QA-08 | Privacidad y seguridad | P1–P11 | VAL-12, permisos mínimos, exclusión de secretos |
| QA-09 | Historial y aprobación | P5–P11 | VAL-04 y VAL-14, snapshot aprobado |
| QA-10 | Accesibilidad | P2–P11 | Teclado, foco, contraste, lector, zoom y auditoría automatizada |
| QA-11 | Responsive | P2–P11 | Casos de 320, 375, 768, 1024 y 1440 px |
| QA-12 | Rendimiento | P3,P8–P11 | Medidas de transferencia, JS, fragmentos y experiencia; objetivos P0.6 |
| QA-13 | Despliegue y recuperación | P1,P3,P11 | Estado de Actions, URL pública, prueba y reversión documentada |
| QA-14 | Separación editorial | P4–P11 | Catálogo planificado y publicación solo aprobada; sin borradores privados |
| QA-15 | Regresión | Todas las técnicas | Pruebas de funcionalidades previas y diferencias justificadas |

Aplicar los controles pertinentes por subfase. Estados: conforme, no conforme, pendiente, no aplicable justificado. Los defectos críticos de integridad, seguridad, licencia, exactitud de datos, aprobación editorial, build o accesibilidad que impida el uso bloquean el cierre operativo. Los pendientes no críticos requieren registro, responsable y aceptación explícita. Objetivos de rendimiento y accesibilidad no son resultados medidos ni certificación.

## 7. Protocolo de aceptación y reversión

Entrada: fase anterior cerrada y autorización del responsable; dependencias comprobadas. Salida: entregables presentes, criterios de aceptación cumplidos, verificaciones ejecutadas, hallazgos resueltos o aceptados, diff limitado e informe de cierre. Si hay bloqueo, indicar alcance parcial y no avanzar automáticamente. El responsable valida el cierre y autoriza la siguiente fase. Para revertir cambios, conservar historial y revertir el commit o PR problemático; no restablecer ramas destructivamente. Tras corrección ejecutar pruebas y reconstruir; conservar última versión aprobada hasta verificar nueva publicación.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Permisos de integración o Pages insuficientes | Verificar autorización y solicitar intervención del titular |
| Dependencias incompatibles | Fijar versiones compatibles, lockfile y build limpio |
| Datos protegidos o licencias incompatibles | Auditoría por archivo y bloqueo antes de importar |
| Corpus demasiado grande | Fragmentación, índices bajo demanda y revisión de límites de Pages |
| Alineación o morfología incorrecta | Edición y fuente explícitas, pruebas de integridad y revisión humana |
| Sesgo doctrinal o citas inventadas | Metodología P0.4, fuentes primarias y contraste verificable |
| Exposición de borradores o biblioteca privada | Mantener materiales privados fuera del repositorio público |
| Cambios visuales o técnicos no autorizados | Validación por subfase, ramas y revisión de diff |
| Dependencia de herramientas externas | Mantener contratos propios y enlaces; no presumir API de Logos |

## 9. Plantilla de informe de cierre

Registrar fase/subfase, fecha, objetivo, commit inicial y final, rama, entregables, archivos afectados y protegidos, controles aplicados con evidencia, resultados, incidencias, decisiones, limitaciones, pendientes, estado final y autorización para siguiente etapa. No confundir una comprobación documental con prueba funcional. La investigación editorial posterior seguirá P0.4 y conservará historial de fuentes y revisiones por estudio.

## 10. Cierre P0.8

Plan documentado: 11 fases técnicas (P1–P11), 53 subfases, 15 controles transversales, protocolo de aceptación, riesgos y reversión. Verificar incorporación y conservación de README y P0.1–P0.7. P0.9 consolidará los nueve documentos y la línea base. No iniciar P1 automáticamente. El plan puede ajustarse con aprobación y registro de cambios; no equivale a implementación ni validación funcional.

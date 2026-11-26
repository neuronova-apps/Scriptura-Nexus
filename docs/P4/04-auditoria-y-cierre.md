# P4.4. Auditoría integral y cierre de fundamentos metodológicos

Fecha: 26 de noviembre de 2026  
Repositorio: neuronova-apps/Scriptura-Nexus  
Rama de trabajo: feature/p4.4-fundamentals-audit  
Base auditada: 1e64c23e0e8ee96108e2cc5c15981a3b5267a0e5 (P4.3 integrado)  
Pull request: [#13 - P4.4: auditoría integral y cierre de fundamentos](https://github.com/neuronova-apps/Scriptura-Nexus/pull/13)  
Workflow de validación: [GitHub Actions 45755224530](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45755224530), concluido con éxito sobre el commit aa3b120087812a73a3fc50ac031b38ded6bd962c.

## 1. Objetivo y alcance

Ejecutar la revisión documental y técnica prevista en P0.8 para P4.4. Se revisan los fundamentos publicados en P4.1, las cuatro guías de P4.2, el glosario y la navegación conceptual de P4.3, su correspondencia con P0.4/P0.7, las rutas, la estructura HTML, las referencias ARIA, los estilos y las pruebas de construcción.

La auditoría no inicia P5 ni P6, no desarrolla investigaciones individuales, no importa corpus, no modifica la taxonomía y no cambia los contratos conceptuales de P0.7.

## 2. Inventario documental contrastado

| Elemento | Base de contraste | Resultado |
|---|---|---|
| Perspectivas metodológicas | P0.4 | 18 identificadores M01–M18; correspondencia de nombres y preguntas |
| Plantilla maestra | P0.4 | 20 secciones en el orden establecido |
| Grados de respaldo | P0.4 | Cinco categorías cualitativas conservadas |
| Flujo editorial | P0.4 | Cinco estados, con Publicado como estado final |
| Fundamentos base | P4.1 | Presentación, alcance, criterios y ejemplo SN-001 conservados |
| Guías especializadas | P4.2 | Exégesis, hermenéutica, fuentes/evidencias y licencias/atribuciones |
| Glosario metodológico | P4.3 | 70 términos, GLO-001 a GLO-070, en cuatro categorías |
| Relaciones conceptuales | P4.3/P0.7 | Referencias a conceptos, métodos y guías existentes |
| Ejemplo de estudio | P0.3/P4.1 | SN-001 continúa planificado; no se publica una conclusión doctrinal |

La comparación confirmó que las 18 perspectivas, las 20 secciones y los cinco grados mantienen la estructura definida en P0.4. El glosario conserva los campos conceptuales de ENT35. Sus categorías y relaciones funcionan como metadatos editoriales de navegación; no se asignan disciplinas ni evidencias de estudios inexistentes.

Se conserva la distinción entre /fundamentos/glosario/, recurso metodológico inicial de P4.3, y /glosario/ y /lexicos/, rutas generales previstas en P7 y P8.

## 3. Hallazgos y correcciones aplicadas

1. **Estado desactualizado en la portada general.** La tarjeta Fundamentos indicaba "Metodología base disponible · En ampliación". Se actualizó a "Fundamentos disponibles · P4.4 en revisión".
2. **Estado desactualizado en los metadatos del módulo.** La descripción interna afirmaba que todavía no había contenidos metodológicos publicados. Se sustituyó por el estado real: metodología base, cuatro guías y glosario inicial disponibles; los estudios individuales siguen previstos para P5/P6.
3. **Estado de la página de Fundamentos.** Se actualizó a "Fundamentos metodológicos · P4.4 en revisión".
4. **Nombres de enlaces repetidos.** Las cinco tarjetas de recursos usaban "Consultar guía". Ahora el texto identifica el recurso correspondiente, por ejemplo, "Consultar exégesis bíblica" y "Consultar glosario metodológico".
5. **Cobertura insuficiente del verificador de build para P4.** Se amplió la verificación a seis páginas: Fundamentos, las cuatro guías y el glosario. Se comprueban idioma, landmarks, enlace para saltar al contenido, navegación, H1 único, ubicación actual, referencias aria-labelledby/aria-describedby, IDs únicos, rutas internas y anclas.

No se modificaron los contenidos de P0.1–P0.9, la taxonomía ni los registros de investigaciones planificadas.

## 4. Controles de calidad aplicados

| Control P0.8 | Revisión ejecutada | Estado |
|---|---|---|
| QA-01 Integridad Git y alcance | Diff limitado a portada, estado de módulo, verificador y pruebas P4.4; sin cambios en archivos P0 protegidos | Conforme |
| QA-02 Build reproducible | Instalación limpia, comprobación Astro/TypeScript, pruebas, build y verificación de salida | Conforme |
| QA-03 Rutas y enlaces | Base /Scriptura-Nexus/, destinos internos y fragmentos de seis páginas de Fundamentos | Conforme |
| QA-05 Evidencia y referencias | Correspondencia editorial con P0.4/P0.7; no se inventan fuentes ni evidencias | Conforme |
| QA-07 Licencias y atribuciones | Se mantienen las restricciones de P4.2; no se habilita redistribución sin permiso | Conforme |
| QA-10 Accesibilidad | Contraste automatizado de texto y controles, landmarks, referencias ARIA, foco, colores forzados y movimiento reducido | Parcial; revisión manual pendiente |
| QA-11 Responsive | Reglas de reflujo, rejillas adaptables y puntos de quiebre presentes en las hojas de estilo | Parcial; prueba manual por viewport pendiente |
| QA-13 Despliegue y recuperación | Build de PR satisfactorio; el despliegue de Pages se verifica después de integrar a main | Pendiente de integración |
| QA-14 Separación editorial | SN-001 sigue planificado; no se incorporan borradores ni resultados de investigación | Conforme |
| QA-15 Regresión | Suite completa y verificador de salida ejecutados | Conforme |

### 4.1. Contraste automatizado

Se añadió una prueba sobre los tokens de color de los cuatro temas: claro, oscuro, alto contraste claro y alto contraste oscuro. Se evalúan pares de texto, enlaces, estados informativos, botones, controles y foco. Los pares de texto y controles deben alcanzar 4.5:1; los indicadores no textuales de foco y bordes de control, 3:1.

Este control comprueba los pares de tokens definidos, no todos los estados visuales posibles ni la conformidad integral con WCAG 2.2 AA.

### 4.2. Verificación de estructura y navegación

El verificador inspecciona las seis páginas de Fundamentos y comprueba:
- idioma español, región principal y enlace de salto al contenido;
- navegación principal, pie de página y ruta de navegación;
- un H1 por página y ubicación actual en la ruta;
- unicidad de identificadores HTML;
- resolución de referencias ARIA;
- existencia de destinos internos y fragmentos enlazados;
- acceso desde Fundamentos a las cuatro guías y al glosario.

La comprobación de enlaces se realiza sobre el HTML generado, no únicamente sobre el texto fuente.

## 5. Resultados de CI

Workflow 45755224530, asociado al commit aa3b120087812a73a3fc50ac031b38ded6bd962c:

| Etapa | Resultado |
|---|---|
| Instalación limpia (npm ci) | Exitosa |
| npm run check | Exitoso |
| npm test | 52 pruebas aprobadas; 0 fallidas |
| npm run build | Exitoso; 15 páginas generadas |
| npm run test:build | Exitoso |
| Verificación P4.4 | Seis páginas, estructura, ARIA, IDs, rutas y anclas conformes |

La ejecución completa de CI terminó con success. El workflow de validación de la rama no publicó Pages; el despliegue se produce tras integrar los cambios en main.

## 6. Comprobaciones manuales pendientes

No se declara ejecutada una inspección visual ni una prueba real de interacción que no se haya realizado. Antes de otorgar el cierre editorial definitivo, quedan pendientes:

- revisar la portada de Fundamentos y las cinco páginas de recursos en escritorio y móvil;
- recorrer con teclado los enlaces, el menú, los controles de apariencia y las anclas del glosario;
- comprobar el orden de foco y la visibilidad del indicador en los cuatro temas;
- probar zoom y reflujo, incluyendo anchos de 320, 375, 768, 1024 y 1440 px;
- revisar la lectura con una tecnología de asistencia;
- obtener la conformidad editorial del responsable sobre la presentación metodológica y las definiciones del glosario.

La prueba automatizada de contraste y estructura no reemplaza estas comprobaciones. Tampoco constituye certificación de accesibilidad.

## 7. Estado de P4.4

**Cierre técnico y documental:** conforme, sujeto a la integración y verificación del despliegue de Pages.

**Cierre editorial y accesibilidad manual:** pendiente de revisión y aprobación del responsable.

La fase P4 no se declarará cerrada de manera definitiva mientras no se confirme la revisión editorial y se registren las comprobaciones manuales pendientes. No se inicia P5 automáticamente. El siguiente avance requiere conformidad del responsable conforme al protocolo de aceptación de P0.8.

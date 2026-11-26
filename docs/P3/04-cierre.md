# P3.4. Auditoría y cierre del portal principal

Fecha: 25 de noviembre de 2026 (Perú).
Base P2: cb33258b2b5154f545a36a39c5ea8e4769dfad94.
Base técnica P3: dba03abaacec9e41a63694447674b9472de13b73.

## Entregables

| Subfase | Entregable | Evidencia |
|---|---|---|
| P3.1 | Cabecera, navegación y pie compartidos | PR #7; Actions 45750862360 exitoso |
| P3.2 | Portada, siete tarjetas y búsqueda prevista | PR #8; Actions 45751218899 exitoso |
| P3.3 | Siete rutas iniciales, estados vacíos y 404 | PR #9; Actions 45751548523 exitoso |
| P3.4 | Auditoría y registro de cierre | Este informe |

## Auditoría técnica

Ejecución https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45751548523 vinculada a la base técnica P3. Build y deploy completados con éxito. Logs del job 139680270444: npm ci sin vulnerabilidades reportadas; Astro Check 0 errores, 0 advertencias, 0 indicaciones; 23 pruebas aprobadas, 0 fallidas; 10 páginas generadas. test:build confirma HTML, preferencias, 404, guía de diseño, semántica, navegación, destinos internos, portada y siete rutas con estados vacíos. No se confunde validación del artefacto con validación HTTP en producción.

## Integridad

Comparación recursiva de árboles Git P2 y P3: 31 blobs protegidos idénticos (README, docs/P0–P2, dependencias y lockfile, configuración, workflow, activos públicos, lógica de apariencia y tokens/componentes CSS). 21 rutas añadidas o modificadas dentro del alcance P3. Ninguna dependencia nueva. Se conserva la identidad A, los cuatro temas y las tres escalas de texto. P3.4 añade exclusivamente este informe.

## Rutas

Base pública https://neuronova-apps.github.io/Scriptura-Nexus/.
Inicio, fundamentos/, estudios/, biblioteca/, historia/, linguistica/, biblia/, manuscritos/, design-system/ y 404.html generados y comprobados en el artefacto. Los siete módulos tienen páginas iniciales y estados de preparación; no contienen investigaciones ni herramientas funcionales todavía. El buscador está previsto, no habilitado.

## Limitaciones y pendientes

Se intentó recuperar por web la portada, fundamentos/ y una ruta inexistente prueba-404/; el acceso de la herramienta no permitió recuperar su contenido ni comprobar el código HTTP. No se declara caída del sitio por esta limitación. El despliegue está confirmado por Actions, no se ha comprobado de forma independiente el HTML servido. Pendientes de revisión en navegador: navegación real de todas las rutas, respuesta HTTP 404, preferencias al cambiar de página, reflow 320/375/768/1024/1440 px, zoom y lector de pantalla. Tampoco se midieron transferencia inicial ni métricas de rendimiento de navegador; no se certifica WCAG integral. Solicitar aceptación explícita de estos pendientes o evidencia antes del cierre definitivo. El nuevo commit documental deberá superar build y deploy.

## Continuidad y recuperación

Conservar P0–P3 y no adelantar contenido, catálogo ni corpus. P4 comenzará con autorización del responsable tras confirmar los controles pendientes o aceptar las limitaciones documentadas. En caso de fallo de publicación, revisar logs, mantener la última versión funcional y revertir el cambio problemático mediante commit no destructivo. La investigación tema por tema seguirá independiente de la implementación técnica.

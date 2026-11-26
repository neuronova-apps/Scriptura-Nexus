# P9.3.4. Validación integral y cierre del comparador

Base main d729ea0c447ae7d1016888ecd51c5e0ec34b8878. PR #64 integrado y ejecución #177 (45908758339) con build y deploy exitosos. PR #65 de cierre integral integrado mediante commit d729ea0c447ae7d1016888ecd51c5e0ec34b8878; ejecución Pages #179 (45909728414) con build y deploy exitosos. P9.3.1–P9.3.3 fueron validadas en PR #62–#64 y despliegues #172, #175 y #177. P9.3.2: 39041 consultas reales, 23 pruebas especializadas y cero alineaciones automáticas. P9.3.3: 358 pruebas generales aprobadas, incluida la presentación del comparador.

## Criterios de aceptación

- Regresión general Astro/Node y auditoría estática de la compilación.
- Regresión de contratos ENT30 y motor privado: 12 y 11 pruebas respectivamente; reproyección y auditoría de 39041 consultas reales con cero alineaciones verificadas o automáticas, 18 marcadores vacíos y 7937 coincidencias literales por dirección sin inferir equivalencias.
- Chromium: ocho acciones de navegación por teclado (incluidas tres secciones con foco nativo), tres transiciones de preferencias, tres comprobaciones de navegación sin JavaScript y bloqueo de todos los controles públicos.
- 60 combinaciones de cuatro temas, tres escalas y cinco anchos (320–1440 px); 12 escaneos axe de la interfaz pública según etiquetas WCAG 2/2.1 A/AA.
- 14 comprobaciones funcionales con datos sintéticos aislados y módulos TypeScript de producción transpilados en memoria: lectura independiente, etiqueta coincidente sin destino automático, texto literal e idioma, foco y procedencia, destino incompleto, cuatro cardinalidades, inversión uno-a-varios, selección fuera del grupo, marcadores vacíos de origen y destino, misma edición y limpieza de resultados. Las ausencias de referencia y cobertura se comprueban en las pruebas del modelo y motor.
- Seis mediciones locales en contextos fríos con gzip, sin estrangulamiento artificial; presupuestos estrictos de 150 KiB JavaScript inicial y 500 KiB transferencia. LCP y CLS descriptivos, no datos de campo.
- Escaneo de artefactos para detectar marcadores de pruebas, identificadores y hashes internos de proyección, archivos fuente, referencias a registros y motor privado; registro ENT30 vacío y no autorizado.

## Límites y estado

Cierre técnico completado: workflow general y especializado, integración PR #65 y despliegue Pages #179 satisfactorios. La evidencia de cada ejecución permanece en GitHub Actions. Las pruebas manuales con lector de pantalla, zoom y dispositivos físicos permanecen pendientes. No se ha admitido una fuente documental específica de alineación; la coincidencia literal no es correspondencia. No se habilita el corpus ni se incorpora un adaptador de publicación real. P11.4 mantiene su barrera editorial. No se modifican el lector, el motor privado, el registro ENT30, las fuentes ni la interfaz ya validada. Tras el cierre corresponde P9.4, manuscritos y variantes.

# P9.4.4. Interfaz de manuscritos y variantes

Base main 96539a6332f4a79f89d840aa54007d5f9e3676a5. PR #68 integrado; Pages #200 con build y deploy satisfactorios. P9.4.3: 388 pruebas generales, 11 específicas y 99 archivos públicos auditados sin datos de la muestra.

La ruta manuscritos/consulta/ incorpora catálogo con búsqueda por identidad, datación, idioma, custodia y signatura; ficha individual; selector de variante; paneles de referencias editoriales; testigos y evidencia diferenciada; localizador, consulta, atribución, derechos y enlaces HTTPS. Las referencias editoriales no se presentan como transcripciones. La atestación secundaria no equivale a examen directo; una mano sin verificación se declara desconocida. No se deduce originalidad ni ausencia textual. Se integra con el módulo Manuscritos, el lector y el comparador.

El modelo de presentación recibe una proyección de referencia autorizada por un futuro adaptador editorial. No sustituye los contratos P9.4.2 ni la revisión de P9.4.3. No carga la muestra real, ni importa catálogos, imágenes o aparatos; la página usa un release vacío, controles deshabilitados incluso sin JavaScript. La proyección rechaza datos sin autorización, enlaces inseguros, campos adicionales, referencias sin evidencia y atestaciones secundarias declaradas como directas. Los datos se insertan como texto, no HTML. La autorización P11.4 y el adaptador real continúan pendientes.

Pruebas: diez casos del modelo, regresiones generales y barrera de artefactos; Chromium con 60 combinaciones de cuatro temas, tres escalas y cinco anchos; 12 escaneos axe A/AA, ocho acciones por teclado, tres destinos de sección, estado sin JavaScript y ocho comprobaciones funcionales con fixtures sintéticas aisladas de dist. No se afirma accesibilidad manual ni rendimiento de campo. La muestra real de Juan 1:18 se conserva sin colación directa ni publicación.

Cierre condicionado a CI, integración y despliegue. P9.5 debe validar de forma integral lector, comparador, herramientas de manuscritos, integridad, rendimiento, atribución y barreras de publicación. Las pruebas manuales con lector de pantalla, zoom y dispositivos físicos continúan pendientes.

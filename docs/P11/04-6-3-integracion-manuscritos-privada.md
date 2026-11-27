# P11.4.6.3. Integración funcional privada de manuscritos

Base main cb2d19a22172ac5beba269585e064d35c4cb6b22; PR #121 integrado con 52 comprobaciones satisfactorias y una omitida (run 46051067677/job 140682210176). Se reutiliza la proyección validada P11.4.6.2; no se modifica src ni el registro histórico.

## Candidato aislado

Se extrae la vista privada pura del adaptador previo para compartirla entre Node y navegador sin cambiar su permiso de publicación. La proyección mantiene mode isolated_reference_only y publicationAuthorized false. Se crea un overlay en memoria de la ruta existente, con módulos transpilados de presentación y apariencia, y una única respuesta JSON local acotada a 64 KiB, con longitud y SHA-256 verificados antes de habilitar controles. La interceptación de Chromium no abre puerto ni publica una URL. Solo referencias y enlaces; no se descargan archivos de terceros ni se reutilizan imágenes, transcripciones o aparatos. Los enlaces externos conservan origen y derechos y no envían referrer; no se siguen durante la prueba.

Se presentan fichas P66 y GA 02, Juan 1:18, dos referencias editoriales, dos atestaciones secundarias y un directorio de las ocho evidencias con sus siete recursos. Se agregan las etiquetas de identificación de edición y referencia bibliográfica solo al overlay; ningún testimonio se transforma en inspección directa ni se infiere originalidad. Manos y folios no verificados.

## Verificación

Ocho escenarios previstos en Chromium: inicio, ambas fichas, búsqueda sin coincidencia, variante, directorio, limpieza/privacidad y reflujo a 320 px; adicionalmente comprobación de barrera pública sin JavaScript. Se comprueba que el build ordinario no se altera mediante inventario SHA-256. Se mantienen regresiones Node y escaneo público; no se adjuntan datos ni capturas. Los resultados nuevos no se declaran aprobados antes de consultar CI. Derechos externos y revisión manual pendientes; P11.4.6.4 ampliará integridad, recuperación, privacidad y accesibilidad. Progreso histórico 63/69.

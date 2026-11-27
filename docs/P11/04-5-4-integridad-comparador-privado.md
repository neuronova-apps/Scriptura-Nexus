# P11.4.5.4. Integridad, privacidad, accesibilidad y rendimiento del comparador

Base main e9af3df50c6516314260e7ff9be696d1094b4272. PR #117 integrado: 48 comprobaciones satisfactorias y una omitida. Run 46046466916, job 140666865345: candidato real satisfactorio, dos ediciones, 1.449 capítulos verificados, 39.041 unidades, seis escenarios, cinco solicitudes de capítulos, cero solicitudes externas, cero grupos, dist intacto, sin persistencia ni subida. Estos son resultados de P11.4.5.3, no resultados anticipados de esta subfase.

## Alcance

Se añade validación independiente del mismo overlay y del decodificador gzip; no se cambia el código de producción ni los controles de publicación. Se verifica corrupción y longitudes comprimidas/descomprimidas, integridad SHA-256, rechazo de orígenes ajenos, rutas con claves o fragmentos y credenciales, opciones de fetch sin cookies ni caché y recuperación de fallos. Chromium simula catálogo alterado, capítulo alterado, fallo de red, fragmento truncado y respuesta demorada de una consulta anterior. Tras errores no se conserva lectura parcial ni resultado anterior. La recuperación utiliza nuevamente el mismo material fijado; no sustituye fuentes.

La revisión automatizada del candidato poblado prueba lectura paralela, foco por teclado, idioma español y griego, 24 combinaciones de cuatro apariencias, tres escalas y dos anchos (320/1280 px), y cuatro escaneos axe a 320 px con escala 130%. Verifica ausencia de consultas en URL, peticiones externas, cookies, referrer de fragmentos, almacenamiento local/de sesión, IndexedDB y Cache Storage durante la prueba. No certifica privacidad del futuro alojamiento. La prueba de preferencias visuales y la revisión manual de lector de pantalla, zoom y dispositivos físicos siguen separadas.

## Presupuestos

Sin precarga de capítulos. Límites históricos: JS inicial 150 KiB y cuerpo inicial 500 KiB. El harness mide suma equivalente gzip de HTML, JS, CSS y SVG entregados por interceptación y tamaño real de binarios ya comprimidos; no es tráfico de red real ni medición de campo, no incluye cabeceras. Se conservan límites de 250 KiB por capítulo comprimido y expansión acotada del decodificador. No se sube ningún corpus ni captura. Se comparan SHA-256 de todos los archivos dist antes y después.

## Barreras y continuidad

ENT30 continúa vacío, no se infiere correspondencia ni se admite Scrivener 1894 o Dodson XML. Se conservan los controles públicos y registros históricos. El workflow añade cinco pruebas específicas Node, regresión general, compilación pública y validación privada Chromium/axe. Los resultados deben verificarse en CI antes del cierre. No se certifica accesibilidad manual ni se modifica la compuerta de léxicos. Progreso histórico 63/69 hasta cierre de P11.4.5. Siguiente P11.4.5.5, revisión final y liberación controlada sin autorización implícita.

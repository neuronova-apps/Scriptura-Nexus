# P11.4.5.3. Integración funcional privada del comparador

Base main e0af1ff5ce024ca792295a75ad933ec967cd1928; PR #116 integrado, 47 comprobaciones satisfactorias y una omitida. No se declara resultado de la nueva CI antes de consultarla.

## Candidato real aislado

Se reutiliza createCandidate de P11.4.2.5, que valida la decisión de preparación, reconstruye los 1.449 fragmentos y comprueba tamaños y huellas SHA-256 en memoria. El comparador utiliza las dos ediciones históricas RV1909 y SBLGNT v1.2, 93 libros y 39.041 unidades, sin abrir una nueva admisión. El navegador recibe catálogo y capítulos mediante interceptación de peticiones en un contexto Chromium aislado, con origen loopback virtual, no un servidor público. Se reutilizan la página compilada, controles, estilos y lógica de presentación P9.3; se adapta el envío asíncrono únicamente en el overlay y se invalida el resultado al cambiar la selección. No se cambia src ni dist. La carga usa el decodificador gzip de P11.4.2.5, solicitudes sin credenciales, sin redirección y con huellas comprimidas y descomprimidas.

Los textos se obtienen por referencia nativa explícita. Una etiqueta presente solo informa presencia en catálogo, no disponibilidad de texto de destino ni correspondencia. Se mantiene ENT30 vacío, cero grupos y cero alineaciones automáticas. Los paneles muestran procedencia, lengua, licencia, atribución y las transformaciones documentadas. Scrivener 1894 y Dodson XML quedan fuera; ninguna modificación a otros módulos o barreras.

## Validación prevista

Chromium con corpus real fijado: inicio sin capítulos, Juan 1:1 sin destino explícito, lectura independiente Juan 1:2 griego, inversión de ediciones, Génesis fuera de cobertura griega, marcador vacío Números 12:16, misma edición y limpieza de resultados. Se verifica foco de resultados, procedencia/licencia, ausencia de peticiones externas y almacenamiento de consultas, y huellas de todos los archivos de dist antes y después. Logs solo agregados, sin textos bíblicos; no se adjuntan artefactos privados. El workflow ejecuta build público y regresiones antes de la prueba. El candidato requiere las fuentes fijadas disponibles en CI; un fallo de recuperación se registra, no se sustituye material arbitrariamente.

P11.4.5.4 completará pruebas de corrupción, fallos de red, concurrencia, accesibilidad, rendimiento y recuperación. Revisión manual y dispositivos físicos pendientes; el contexto Chromium no equivale a una vista pública ni a certificación de accesibilidad. Publicación efectiva y cualquier ampliación requieren decisión separada. Se conserva 63/69.

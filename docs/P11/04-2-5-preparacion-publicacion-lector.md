# P11.4.2.5. Preparación de habilitación y cierre

PR #91 integrado en b5f160f963acc756bad51bc1944d7e84e52e5899 tras 23 workflows satisfactorios; run 45990524056, job 140476878256. Despliegue 45991869957 build/deploy satisfactorios después de fijar el registro histórico. Se registran 529 pruebas Node, 39041 referencias, 1449 capítulos, 18 marcadores vacíos, 120 reflows, 24 axe, 12 mediciones. Catálogo gzip 160425 bytes; máximos locales de montaje 52 ms, primera consulta 69 ms, caché 39 ms. No constituyen mediciones de campo ni certificación WCAG.

## Revisión manual local

En una copia local del repositorio, desde la raíz y con Node 24 y Python 3 instalados:

```powershell
npm ci
npm run build
node scripts/preview-reader-p11425.mjs
```

Abrir en el navegador de la misma computadora la URL 127.0.0.1 que imprime la consola. Cerrar con Ctrl+C. No abrir puertos, usar túneles, compartir esta URL ni publicar archivos. El servidor recompone en memoria los corpus fijados; solo acepta loopback y peticiones de su propio origen, sin CORS. Las licencias, atribución, enlaces y transformaciones están visibles. No es una nueva ruta Pages ni permite navegar todo el sitio. Si no funciona, registrar incidencia sin inventar resultado. En Windows, se usa python por defecto, o especificar PYTHON con el ejecutable correcto.

| ID | Prueba | Resultado esperado |
|---|---|---|
| L01 | RV1909 Génesis 1:1; consultar, Tab, anterior/siguiente, cambio de capítulo | Controles y foco comprensibles |
| L02 | NVDA o lector disponible; consulta, estados y procedencia | Anuncio de carga, resultado y controles comprensibles |
| L03 | Cuatro temas, tres escalas, zoom 200 % y 400 % | Sin recortes ni pérdida de interacción |
| L04 | SBLGNT 3 Juan 1:1; RV1909 Números 12:16 | Texto griego y atribución, marcador sin texto explícito |
| L05 | Teléfono real, lector de pantalla, orientación | Pendiente; loopback del PC no es accesible desde otro dispositivo. No compartir corpus para cumplir este control. Repetir en alcance autorizado o registrar limitación y decisión explícita. |

Registrar dispositivo, navegador, tecnología de apoyo y resultado conforme/no conforme/no evaluable con observaciones. Los controles de P11.3 no sustituyen esta revisión del lector cargado. No se publican capturas de textos ni datos privados.

## Decisión por edición

- SBLGNT v1.2: CC BY 4.0 documentada. Se propone aprobar el alcance de texto principal de los 27 libros, con fuente fijada, atribución y enlace, indicando las transformaciones. Se exige autorización explícita del responsable para publicar.
- RV1909: declaración de dominio público de eBible.org sobre la distribución exacta spaRV1909, 66 libros. Revisión territorial pendiente y autorización explícita separada. No se presenta como dictamen jurídico.
- La selección de opción B no concede autorización individual. Se propone habilitar SBLGNT primero si se aprueba y mantener RV1909 pendiente hasta resolver revisión territorial. Si se prefiere publicar las dos ediciones juntas, se mantiene la barrera hasta completar ambas decisiones.
- Revisión manual de privacidad y verificación de artefacto público pendientes. La habilitación requerirá migrar explícitamente los controles históricos de ausencia hacia controles de alcance autorizado, sin desactivar las regresiones. No se modifica el lector público ni se agrega corpus al repositorio o a Pages.

Este PR prepara P11.4.2.5, no la cierra. Progreso 61/69 (88,4 %), 62/69 (89,9 %) únicamente tras habilitación y cierre verificados.

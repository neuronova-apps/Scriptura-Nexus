# P11.4.3.5.3. Verificación del artefacto y revisión manual

PR #104 integrado en 919280bbf45e7f6f35cab3328a2c127591972152. 36 workflows y 44 checks satisfactorios; ejecución 46027092966. Linux job 140601176098 y Windows job 140601176482 confirmaron 346 archivos, 168 capítulos, 336 capas, 5162 unidades y 78218 ocurrencias. Los manifiestos comprimidos difieren por plataforma (registro adjunto); no se declara igualdad binaria entre sistemas ni se atribuye una causa sin prueba. Se incorpora una huella del inventario de las capas JSON descomprimidas para comparación futura. Pages 46027828448: success al preparar el PR.

## Alcance de la prueba

Se copia el sitio compilado a un directorio temporal del sistema, no al repositorio ni a dist. Solo se reemplaza la página del analizador y se añaden 345 archivos de su candidato. Se verifican todos los archivos ajenos byte a byte, los 337 gzip contra sus dos huellas, la reconstrucción de 168 capítulos y el recuento por libro. El navegador de Linux consulta la copia temporal real, comprueba tres rutas ajenas y tres referencias, carga bajo demanda y privacidad local; Windows verifica el artefacto completo sin navegador adicional. Se borra la copia temporal al terminar, no se sube ni se publica. El workflow histórico sigue validando los 8 casos piloto, 72 diseños y 12 axe. No hay aprobación de publicación ni revisión manual simulada.

## Revisión manual (después de CI e integración)

En una copia actualizada del repositorio, desde la raíz, con Node 24 y Python 3.12:

```powershell
$env:PYTHON = "python"
$env:PYTHONDONTWRITEBYTECODE = "1"
npm ci
npm run build
npm run test:build
node scripts/prepare-analyzer-candidate-p11435.mjs --preview
```

Abrir únicamente la URL 127.0.0.1 que muestra el comando. No abrir puertos ni compartir la vista; cerrar con Ctrl+C. Esta vista local usa el mismo constructor del artefacto. Registrar navegador y versión, sistema, lector de pantalla y resultados: conforme, no conforme o no evaluable.

| Caso | Acción | Resultado esperado |
|---|---|---|
| A01a | Consultar Levítico 19:28; usar Tab, Enter y selección de ocurrencia | 12 ocurrencias; foco visible y resultado; hebreo RTL |
| A01b | Consultar Daniel 2:5, revisar ocurrencias arameas | Forma original, idioma arameo cuando corresponda, RTL; lectura con tecnología de apoyo, no asumir pronunciación |
| A01c | Consultar Hechos 19:6, seleccionar ocurrencias | 18 ocurrencias; griego LTR; una sin anotación, no inferir significado |
| A02 | Probar ampliación 130%, alto contraste, ventana estrecha; dispositivo móvil real solo si existe método local autorizado | Sin recortes ni pérdida de controles; simulación no equivale a móvil real |
| A03 | Revisar cobertura, aviso privado, atribuciones y licencias | Siete libros, sin canon completo; CC BY-SA separada, ausencia de Strong y léxico |
| A04 | Revisar almacenamiento y solicitudes en herramientas del navegador | Sin historial, cuenta o analítica; solo preferencias; aviso de registros del alojamiento |
| A05 | Registrar resultados y obstáculos | No inventar resultados; cualquier aplazamiento requiere autorización expresa |

Si no hay lector de pantalla o móvil real disponible, registrar no evaluable; no abrir el servidor a la red. La revisión territorial WLC, privacidad del alojamiento final, autorización efectiva y recuperación siguen pendientes. La siguiente decisión depende de evidencia real y aprobación del responsable. Progreso 61/69; no se declara cierre de P11.4.3.5.3 por el solo PR.

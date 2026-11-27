# P11.4.8.2. Ensayo de recuperación no destructivo

Base main da95b7f92bace0beaa94c17e610772774e22c0a7; PR #129 corregido e integrado, 60 comprobaciones satisfactorias y una omitida. Run 46059470997/job 140709941632: 139 archivos, 3.250.046 bytes, manifest SHA-256 a49c3084c6e01a2b9f7b8c5f91f409301f92caf04cc4ace9edc4beb635648f34, dos compilaciones idénticas, ocho objetos protegidos. Pages 46060023933 se verifica por separado.

## Ensayo automatizado

Se compila el portal ordinario sin corpus. En un directorio temporal exclusivo se generan respaldo y copia de trabajo; se verifica cada huella antes de recuperar. Se simulan de forma independiente modificación de index.html, ausencia del índice de búsqueda e introducción de un archivo sintético inesperado. Cada incidente debe detectarse y recuperarse exactamente mediante respaldo verificado. Una copia de respaldo dañada debe rechazarse sin alterar la copia de trabajo. Se ensaya además git revert en un repositorio local temporal sin remotos que contiene únicamente el artefacto público: commit de base, incidente sintético, revert, igualdad de árbol Git y de huellas del artefacto restaurado. No es una reversión del código fuente real ni una prueba de despliegue remoto.

Se verifica el inventario del dist original y el HEAD y estado del repositorio antes y después; se elimina el directorio temporal. La huella histórica se compara y se informa coincidencia o diferencia (no se presupone reproducibilidad entre runners). Tres pruebas nuevas y flujo sin credenciales persistidas ni subida de artefactos. No se almacena el respaldo temporal como copia permanente.

## Procedimiento real, solo ante incidencia y autorización

Identificar el commit funcional previo, run de Pages y huellas de un artefacto verificado. Conservar respaldo fuera del sitio, con acceso autorizado; no incluir corpus no aprobados. Documentar impacto y alcance de la incidencia. Crear una rama de recuperación desde main y preparar un PR de reversión selectiva de los commits responsables, conservando cambios no afectados. Revisar diff, dependencias, permisos y registros de publicación, ejecutar las comprobaciones y validar artefacto; no usar reset ni force push. Con autorización expresa, integrar y comprobar despliegue, rutas públicas y ausencia de recursos fuera de alcance. Ante discrepancia, detener y revisar. No ejecutar recuperación real por efecto de este ensayo.

Se mantienen opción B, 38 controles humanos pendientes y cero módulos habilitados; ninguna aprobación de publicación, importación o reversión real. El contador histórico 63/69 y 66 hitos técnicos se conservan. Siguiente P11.4.8.3: verificación previa y decisión expresa de publicación; la prueba de recuperación queda pendiente de CI.

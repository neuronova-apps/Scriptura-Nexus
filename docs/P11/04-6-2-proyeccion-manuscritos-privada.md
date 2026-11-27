# P11.4.6.2. Proyección documental privada y validación de permisos

Base main 3eae36751e06276ec5ab1aad4fd4c29cc9449876; PR #120 integrado con 51 comprobaciones satisfactorias y una omitida, run 46049879568/job 140678281141. No se repite la auditoría P9.4 ni se añaden testigos.

## Alcance y permisos

La proyección parte exclusivamente de los tres registros históricos fijados por identidad de blob Git (muestra, inventario y proyección de ediciones). Comprueba los bytes locales, ejecuta validateManuscriptPilot y concilia las restricciones de reutilización. Las huellas Git identifican el contenido del repositorio, no certifican el origen de archivos de terceros. Se mantienen los siete recursos como referencias bibliográficas externas y los ocho registros de evidencia; los datos no se descargan ni se amplían. La decisión histórica es reference_only, no publicación ni admisión de archivos. Se preservan las notas de derechos y se añade atribución de consulta de cada fuente. La revisión externa actual de licencias, enlaces y condiciones específicas sigue pendiente antes de liberar. No se declara permiso jurídico nuevo.

## Adaptador privado

Proyección en memoria con mode isolated_reference_only y publicationAuthorized false; la vista privada ofrece búsqueda por identidad/custodia/datación y consulta de testigo, variante y evidencia, sin activar ManuscriptRelease ni modificar src. Se preservan cinco clases de evidencia: identificación de edición, catálogo, referencia bibliográfica, aparato editorial y atestación secundaria. El aparato de SBLGNT compara ediciones; no se presenta como transcripción manuscrita. Juan 1:18 mantiene localizador nativo, dos testigos, dos referencias editoriales, dos atestaciones secundarias, cero inspecciones directas, manos desconocidas y valoración no iniciada. No se incluyen texto de lectura, imágenes, aparato reproducido, alineación o conclusión de originalidad. Las devoluciones son copias independientes.

## Verificación y continuidad

Cinco pruebas específicas: cobertura/procedencia, búsqueda y límites, rechazo de bytes modificados, aislamiento de objetos y rechazo de proyección por el contrato público. Regresiones del módulo, build y escaneo de ausencia del piloto en dist. No se publican datos ni se altera otro módulo. La integración de navegador de P11.4.6.3 deberá conservar las categorías de evidencia adicionales en una interfaz privada, sin confundir disponibilidad privada con permiso de publicación. Progreso histórico 63/69, pendiente de conciliación.

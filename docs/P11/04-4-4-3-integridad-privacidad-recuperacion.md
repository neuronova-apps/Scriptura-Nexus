# P11.4.4.4.3. Integridad, privacidad y recuperación de fragmentos

PR #112 integrado en 5840b743eea4c96e60cd72614dd2748acfeb9e53; commit 5840b743eea4c96e60cd72614dd2748acfeb9e53. GitHub Pages run 46038677397 satisfactorio. PR #112 cerró con 47 comprobaciones satisfactorias y una omitida. La auditoría de navegador validó 8 consultas léxicas, 15 de concordancia, 9 de frecuencia, paginación, teclado, 24 combinaciones de apariencia/escala y cuatro escaneos axe. El candidato tenía 11.442 fragmentos, 34.329.281 bytes comprimidos; la sesión de navegador obtuvo 96 archivos (3.208.565 bytes). El fragmento mayor fue 223.643 bytes y el catálogo inicial 98.716 bytes. La página pública siguió vacía, sin persistencia ni publicación.

## Alcance de la auditoría

Verificar el manifiesto y catálogo de mismo origen; rechazar publicación autorizada, rutas relativas, orígenes ajenos, descriptores alterados y tamaños fuera de límite. Verificar SHA-256 del contenido comprimido y expandido, límite de expansión, solicitudes no almacenadas en caché, credenciales omitidas, caché en memoria acotada a 24 recursos y desalojo comprobable. Las pruebas de cubetas confirman que las claves exactas no se incorporan a las rutas y que no se normalizan formas Unicode. El módulo de transporte no utiliza cookies ni almacenamiento persistente.

La reconstrucción integral en CI vuelve a generar el candidato privado, verifica inventario y huellas, límites, referencias de todos los descriptores, catálogo de 41 grupos, 16 cubetas de resúmenes y cuatro archivos históricos admitidos. Comprueba que el catálogo no contiene las tablas completas de tokens o definiciones y que dist permanece idéntico.

## Barreras y pendientes

El candidato se construye solo en memoria. No se guarda en el repositorio, no se incorpora a dist, no se publica ni se despliega. Dodson XML continúa pendiente de aprobación expresa. La revisión manual con lector de pantalla y dispositivos físicos permanece pendiente; se requiere comprobar foco, anuncios de estado, navegación por teclado, ampliación y recuperación de red antes de autorizar publicación.

La autorización de publicación permanece en false. Siguiente fase: P11.4.4.4.4, preparación de revisión final y protocolo de liberación controlada.

# P7.1. Contratos bibliográficos

Base main a6b29ec71b53e5e2b649fa8fa5958d7f1e8bcda0, PR #23 integrado y despliegue #74 (45814800517) confirmado exitoso. El responsable autoriza continuar; se conservan los pendientes manuales P6 sin declarar su aceptación expresa ni certificación WCAG. P0.8 establece P7.1 contratos, P7.2 catálogo documental, P7.3 biblioteca y glosario, P7.4 licencias y atribuciones, P7.5 cierre.

## Alcance
Contratos ejecutables de ENT08–ENT14 (autor/institución, obra, edición bibliográfica, fuente inventariada, recurso, licencia y evidencia). Registro separado de siete colecciones, inicialmente vacío, validación estricta de referencias, roles, procedencia, atribución de tradición documentada, autoridad y tipo de documento, localizador, idioma y fecha. Reutiliza tipo Evidence de P6; no inventa conclusiones ni introduce una segunda vía editorial. Los campos de fechas históricas/edición admiten etiquetas de precisión documentada, sin inventar fecha exacta. DOI e ISBN tienen controles de formato, no comprobación externa de autenticidad.

## Separación de estados
Verificación bibliográfica, clase A/B/C, admisión y permiso son dimensiones distintas. Una clase A no acredita autorización. Contratos de recurso externo y archivo separados; archivo exige ruta relativa y SHA-256 declarado, todavía sin importación ni verificación física. La admisión real y los fragmentos autorizados permanecen bloqueados hasta P7.4, cuando se definirá control por recurso/componente y evidencia conservada. La barrera de publicación de P6 sigue intacta con contexto vacío. El registro no importa ni aloja documentos. P0.5 sigue siendo inventario de candidatos, no fuente admitida. P7.2 verificará fichas reales, P7.3 añadirá navegación; P7.4 conectará permisos al motor. Canon ENT20 y ediciones textuales se resolverán en fases consumidoras con fuentes verificadas, sin asumir autoridad universal.

## Validación
Diez pruebas nuevas sintéticas exclusivamente en tests, con dominios example.invalid. Validación de esquema, IDs, atribuciones, referencias, estados, procedencia y exclusión de autorización prematura. Comprobación del registro inicial durante build. CI pendiente. No se cambian las 42 fichas, 840 secciones, diseño, rutas, dependencias ni publicaciones. No se inicia P7.2 automáticamente.

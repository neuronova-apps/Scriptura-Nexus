# P3.2. Página de inicio

Base: fd46666093434755a73e5d9d9238240141ce6833; despliegue 45750862360 exitoso y validación del responsable.
Rama: feature/p3.2-homepage.

## Alcance
Portada institucional según P0.2: identidad A, lema, propósito, siete tarjetas de áreas alineadas con P3.1, espacio informativo de búsqueda y enfoque documental, comparado y progresivo. Se reutilizan Card, Badge, Callout, Button y SectionHeading. El enlace Explorar módulos apunta a una sección existente. Se usan los tokens y preferencias de P2, sin dependencias adicionales.

## Estados
El registro de navegación es la fuente de disponibilidad. Los módulos pendientes se muestran como texto, sin enlaces ficticios. No se crean rutas de módulos en P3.2. El buscador se describe como futuro, sin formulario inoperativo ni resultados simulados. El catálogo de 42 estudios se incorporará en P5, no se presenta como disponible. No se altera la cabecera ni el pie de P3.1.

## Verificación
Pruebas unitarias de correspondencia entre tarjetas y navegación, y smoke test de la portada y enlaces. CI pendiente al redactar. Revisión visual en escritorio/móvil y temas pendiente antes de cierre. P3.3 habilitará rutas iniciales y estados; no se adelantan estudios, corpus ni búsqueda funcional.

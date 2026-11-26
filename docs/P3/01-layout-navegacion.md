# P3.1. Layout y navegación

Base: cb33258b2b5154f545a36a39c5ea8e4769dfad94; cierre P2, workflow 45750476822 exitoso.
Rama: feature/p3.1-layout-navigation.

## Alcance
Cabecera común, menú semántico y pie de página reutilizable. Se conserva la marca A, los temas, escalas, preferencias locales, salto al contenido y estructura main. Se mantiene sin cambios la portada P2 hasta P3.2.

## Navegación
Registro central en src/lib/navigation.ts. Inicio enlaza a la ruta real. Fundamentos, Estudios bíblicos, Biblioteca teológica, Historia cristiana, Análisis lingüístico, Biblia y comparación y Manuscritos se muestran como texto con estado Próximamente, no como enlaces deshabilitados ficticios. Sus rutas previstas se ajustan a P0.6. P3.3 implementará y habilitará los destinos iniciales; el resto de rutas especializadas se incorporará según el plan. Guía técnica e inicio se enlazan desde el pie. No se crean páginas de módulos ni buscador en esta fase.

## Accesibilidad
Nav con nombre accesible, lista semántica, enlaces nativos, aria-current en inicio únicamente y destinos utilizables sin JavaScript. El menú cambia de lista flexible a cuadrícula adaptable a 720 px o menos; no introduce menú modal ni interacción dependiente de JS. Usa tokens de P2 y conserva foco visible y colores forzados. Los elementos pendientes no entran al orden de tabulación.

## Pruebas
Tres pruebas unitarias del registro, base y página actual; smoke test de navegación en las tres páginas existentes, destinos locales y estado actual. CI ejecutará npm ci, check, test, build y test:build. Revisión manual de teclado, temas y resoluciones permanece pendiente. No se declara WCAG integral ni despliegue antes de comprobarlo.

## Exclusiones
No se modifica metodología, catálogo, corpus, dependencias, workflow, logotipo ni documentación anterior. P3.2 corresponde a la portada y accesos; P3.3 a rutas y estados de módulos.

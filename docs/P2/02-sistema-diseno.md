# P2.2. Sistema de diseño y componentes reutilizables

Estado: implementado en rama de trabajo; pendiente de validación de CI y revisión visual.
Dependencia: P2.1 integrada en main, commit 01a2d69912fe1bfb03d5d9b445f8d1958dbd5e1a.
Rama: feature/p2.2-design-system.

## 1. Objetivo y alcance

Convertir la identidad académica clásica aprobada en un sistema consistente de tokens, componentes reutilizables y estados visuales. Esta subfase prepara la base de interfaz sin construir todavía la navegación y los módulos del portal (P3), ni las preferencias persistentes de tema y tamaño de letra (P2.3).

## 2. Tokens

Archivo: `src/styles/design-tokens.css`.

Se definen tokens para:
- Colores institucionales y semánticos.
- Tipografía de títulos y cuerpo, escala de tamaños y alturas de línea.
- Escala de espaciado basada en múltiplos de 4 px.
- Contenedores, radios, bordes y sombras.
- Transiciones y estados de foco.

Los nombres semánticos permiten cambiar la implementación visual en una sola fuente de verdad. Los nombres de identidad de P2.1 se conservan como variables compatibles.

## 3. Componentes Astro

| Componente | Uso |
|---|---|
| `Button.astro` | Enlaces de acción y botones de formulario; variantes primary, secondary y ghost; tamaños sm, md y lg; estado deshabilitado |
| `Card.astro` | Contenedores default, raised, outlined y editorial; padding y variante interactiva |
| `Badge.astro` | Estados neutral, info, success y warning |
| `SectionHeading.astro` | Encabezado de sección con antetítulo y descripción opcionales |
| `Callout.astro` | Notas info, success y warning |

Los componentes se construyen con Astro y CSS, sin dependencias de interfaz adicionales ni JavaScript de cliente.

## 4. Estados y accesibilidad

Se definen hover, active, focus-visible, disabled y prefers-reduced-motion donde corresponda. Los controles interactivos conservan foco visible y área mínima de interacción. Los botones se distinguen de enlaces; las acciones deshabilitadas no se presentan como disponibles. Los componentes de contenido utilizan elementos semánticos y admiten navegación por teclado mediante controles nativos.

## 5. Contraste

Se incorpora `src/lib/contrast.ts` para calcular relación de contraste WCAG y pruebas automatizadas de combinaciones utilizadas para texto normal. Las combinaciones cubiertas por la prueba alcanzan al menos 4.5:1. El dorado medio se reserva para detalles no textuales sobre superficies claras; el texto de acento utiliza el tono oscuro. Esta comprobación cubre tokens seleccionados, no constituye una certificación WCAG integral del portal.

## 6. Página de referencia

Ruta: `/Scriptura-Nexus/design-system/`.
Archivo: `src/pages/design-system/index.astro`.

La página presenta muestras de la paleta, botones, tarjetas, insignias y avisos. Es una referencia técnica para revisión de la fase y no sustituye el diseño del portal principal, que corresponde a P3. Tampoco se incorpora todavía a la navegación pública.

## 7. Verificación

- `npm ci`
- `npm run check`
- `npm test`
- `npm run build`
- `npm run test:build`
- Comprobar la generación de `design-system/index.html`.
- Revisar la página de referencia en escritorio y móvil.
- Confirmar que la ruta y recursos respetan la base `/Scriptura-Nexus/`.

El cierre requiere checks satisfactorios, revisión del diff, contraste probado y aprobación visual del responsable.

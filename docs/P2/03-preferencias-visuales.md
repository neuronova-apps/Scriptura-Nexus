# P2.3. Preferencias visuales y persistencia local

Estado: implementada, integrada en main y desplegada; pendiente de revisión visual manual por el responsable.
Dependencia: P2.2 integrada en main, commit 7943612e8f7a586f5f09b2e7b9fe48b934da7942.
Pull request: [#4](https://github.com/neuronova-apps/Scriptura-Nexus/pull/4), integrada mediante el commit b921f1eab2692a76376f132ccfe41f55ab20eb73.
Rama de trabajo: feature/p2.3-appearance-preferences.

## 1. Objetivo y alcance

Incorporar preferencias visuales globales para que el usuario adapte la presentación de Scriptura Nexus. La configuración se aplica desde el layout compartido y se conserva entre visitas en el almacenamiento local del navegador. No se recopilan ni transmiten preferencias a un servidor.

## 2. Modos de visualización

| Valor | Presentación |
|---|---|
| `light` | Modo claro, identidad académica clásica aprobada |
| `dark` | Modo oscuro, con superficies y textos adaptados |
| `contrast-light` | Alto contraste claro, texto oscuro sobre superficies blancas |
| `contrast-dark` | Alto contraste oscuro, texto blanco sobre superficies negras |

Cada modo define los colores semánticos de fondos, superficies, textos, enlaces, bordes, foco, avisos y controles. Los botones primarios y secundarios disponen de colores de texto y fondo propios para mantener contraste al cambiar de tema.

## 3. Tamaño de letra

Se ofrecen tres escalas globales: 100 %, 115 % y 130 %. Se aplican sobre el tamaño raíz del documento, de modo que los elementos expresados en rem aumentan proporcionalmente. No se modifica el zoom del navegador ni se limita el escalado del usuario.

## 4. Interfaz y accesibilidad

El encabezado compartido incluye un panel nativo desplegable de preferencias. Sus controles tienen etiquetas visibles, operan con teclado y exponen el estado mediante una región `aria-live`. El panel se adapta a pantallas estrechas. La preferencia `prefers-reduced-motion` existente se conserva.

## 5. Persistencia y privacidad

Archivo de lógica: `src/lib/appearance.ts`.
Inicialización del navegador: `src/scripts/appearance.ts`.
Clave de almacenamiento: `scriptura-nexus:appearance:v1`.

Se persisten únicamente el modo y el tamaño de letra. La lectura y escritura están protegidas frente a JSON inválido, almacenamiento bloqueado o indisponible. El script inicial del documento restaura la apariencia antes del primer render para reducir destellos de tema. Si el navegador no permite almacenar, la preferencia sigue aplicándose durante la visita. Restablecer elimina la clave local y recupera modo claro y tamaño estándar.

## 6. Pruebas

- Normalización de valores admitidos y rechazo de valores desconocidos.
- Lectura, escritura y limpieza del almacenamiento.
- Comportamiento cuando el almacenamiento no está disponible.
- Aplicación de preferencias a los atributos globales del documento.
- Contraste AA de textos, enlaces y controles en los cuatro modos.
- Presencia de los tres tamaños de letra.
- Controles accesibles y estado anunciado en el layout.

La prueba de contraste cubre las combinaciones de tokens indicadas, no equivale a una certificación completa WCAG de todas las páginas ni de contenido futuro.

## 7. Exclusiones

Esta fase no implementa una página de configuración independiente, perfiles de usuario, sincronización entre dispositivos, cookies analíticas, preferencias en servidor ni cambios en el contenido de investigación. La auditoría responsive y de accesibilidad integral corresponde a P2.4. La navegación y estructura funcional del portal corresponden a P3.

## 8. Verificación de cierre

Ejecución de GitHub Actions asociada al commit integrado: [45749849256](https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45749849256).

| Verificación | Resultado |
|---|---|
| `npm ci` | Correcto; sin vulnerabilidades reportadas por npm audit en esta ejecución |
| `npm run check` | Correcto; 0 errores, 0 advertencias y 0 indicaciones |
| `npm test` | Correcto; 14 pruebas aprobadas, 0 fallidas |
| `npm run build` | Correcto; 3 páginas estáticas generadas |
| `npm run test:build` | Correcto; HTML, controles de apariencia, 404, guía visual y rutas de Pages verificados |
| Artefacto GitHub Pages | Generado correctamente |
| Deploy GitHub Pages | Correcto; ejecución concluida con éxito |

La comprobación automatizada cubre los controles funcionales y la construcción estática. La revisión visual en escritorio y móvil, así como la prueba manual de los cuatro modos, persistencia y restablecimiento en un navegador real, quedan pendientes de validación por el responsable. No se declara certificación WCAG integral.

## 9. Cierre y continuidad

P2.3 está implementada, integrada en `main` y desplegada. El commit integrado es `b921f1eab2692a76376f132ccfe41f55ab20eb73`. La revisión visual manual permanece pendiente. Una vez validada, corresponde continuar con P2.4: responsive y accesibilidad, sin adelantar todavía P3.

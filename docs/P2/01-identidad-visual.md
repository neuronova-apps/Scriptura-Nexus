# P2.1. Identidad visual de Scriptura Nexus

Estado: implementada en rama de trabajo; pendiente de revisión y aprobación de la implementación.
Propuesta aprobada: A, académica clásica.
Línea base: main en 1b01fdd951e8f2b479fc581a658f0a920258b959.
Rama de trabajo: feature/p2-identidad-academica.

## 1. Dirección visual

Identidad académica clásica, sobria y legible, inspirada en el estudio bíblico, la investigación histórica y la consulta documental. No representa una denominación o tradición eclesial concreta. El sistema conserva una presentación neutral para permitir la comparación de perspectivas pentecostales, protestantes, católicas y otras fuentes pertinentes.

## 2. Símbolo y logotipo

Símbolo vectorial original: libro abierto con eje central y punto superior. El libro representa las Escrituras y su estudio; el eje, la relación entre texto, historia y análisis; el punto, la conexión de conocimientos. El símbolo se utiliza junto al nombre tipográfico Scriptura Nexus. Se dispone de versión SVG y favicon SVG. El símbolo no incorpora una cruz ni un signo denominacional.

Archivos:
- `public/brand/scriptura-mark.svg`: símbolo principal.
- `public/favicon.svg`: icono del sitio.

## 3. Paleta cromática

| Token | Hex | Función |
|---|---|---|
| `--sn-navy` | `#142B3C` | Color institucional principal |
| `--sn-navy-soft` | `#263F52` | Variación de azul |
| `--sn-gold` | `#B99559` | Acento y detalles |
| `--sn-gold-light` | `#D5B77C` | Acento sobre fondos oscuros |
| `--sn-paper` | `#F6F1E7` | Fondo cálido |
| `--sn-surface` | `#FFFDF9` | Superficies |
| `--sn-ink` | `#202A32` | Texto principal |
| `--sn-muted` | `#58636C` | Texto secundario |
| `--sn-border` | `#DED6C8` | Bordes |
| `--sn-focus` | `#164A80` | Indicador de foco |

El dorado es un acento y no debe utilizarse como texto pequeño sobre fondo claro sin comprobar contraste. La validación WCAG completa corresponde a P2.2–P2.4.

## 4. Tipografía

- Encabezados: Noto Serif, con Georgia y Times New Roman como alternativas locales.
- Texto: Noto Sans, con Segoe UI y Arial como alternativas locales.
- Los archivos de fuentes no se descargan ni se incorporan en esta subfase. Se requiere verificar cobertura de caracteres, licencia y carga de fuentes para hebreo, griego y arameo antes de elegir e integrar archivos.
- El sistema conserva fuentes de respaldo para no depender de servicios externos.

## 5. Aplicación en el portal

La página inicial adopta la identidad aprobada mediante encabezado de marca, símbolo, fondo cálido, tarjeta editorial, acento dorado y jerarquía tipográfica. Se mantiene el texto institucional existente y la indicación de que la infraestructura está en desarrollo. Se incorpora el favicon y el color de tema del navegador.

El layout conserva el enlace para saltar al contenido, foco visible, etiquetas semánticas, texto alternativo no redundante y ajuste para pantallas estrechas. Se respeta la preferencia de movimiento reducido del sistema.

## 6. Alcance y exclusiones

Esta entrega corresponde únicamente a P2.1. No implementa todavía un sistema completo de componentes, selector de tema, alto contraste configurable, persistencia de preferencias, tipografía descargable, módulos de investigación ni navegación funcional entre ejes. Estos aspectos permanecen en P2.2–P2.4.

## 7. Verificación prevista

- `npm ci`
- `npm run check`
- `npm test`
- `npm run build`
- `npm run test:build`
- Revisión visual en escritorio y móvil.
- Confirmación de rutas de símbolo y favicon bajo `/Scriptura-Nexus/`.
- Revisión de contraste de combinaciones utilizadas antes de cerrar la fase.

La aprobación final de la implementación corresponde al responsable del proyecto.


## 8. Compatibilidad de GitHub Actions

Durante la validación del PR #2, la construcción fue satisfactoria, pero GitHub informó que `actions/checkout@v4` y `actions/setup-node@v4` usaban Node.js 20 y se ejecutarían forzadas en Node.js 24. Para evitar depender de la compatibilidad transitoria, el workflow de esta rama actualiza las acciones a versiones con runtime Node.js 24: checkout v7, setup-node v7, upload-pages-artifact v5 y deploy-pages v5. La nueva ejecución del PR debe confirmar la compatibilidad. El despliegue permanece restringido a push en main; por ello el job deploy se omite correctamente en pull_request.

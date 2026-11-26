# P5.2. Catálogo inicial de investigaciones

Base: a533a39e2cedf76de273109c522a2951369ca9c1. P5.1: PR #14 integrado, CI correctivo 45757589105 exitoso. Despliegue de main 45758553087 iniciado; verificar su resultado.

## Alcance
Se extraen las 42 filas originales de docs/P0/03-ejes.md, sección 4, sin reformular títulos, focos, referencias ni relaciones. El catálogo JSON es la autoridad de identidad y estado conforme al ejemplo de P0.7. Cada ficha tiene versión 0.1.0, fechas de registro, estado planificado, referencias documentales y listas vacías de disciplinas específicas, métodos, tradiciones y evidencias todavía no seleccionados. No se crean conclusiones, borradores ni snapshots aprobados.

Las referencias son etiquetas preliminares, no pasajes normalizados por edición. Se conservan abreviaturas, referencias abreviadas dependientes del contexto y rangos originales. SN-039, SN-040 y SN-042 conservan literalmente su motivo de selección pendiente y lista de referencias vacía. Los 14 ejes mantienen recuentos originales; E12, E13 y E14 pueden aparecer como relaciones, sin estudios principales.

## Archivos y controles
src/data/catalogo/estudios.json: 42 fichas.
src/lib/catalog.ts: consultas por ID, eje principal y eje relacionado, sin duplicar registros.
scripts/validate-catalog.mjs y tests/catalog.test.mjs: VAL-01–04 aplicados al estado inicial, concordancia exacta con P0.3, integridad de IDs y relaciones, referencias pendientes, rechazo de publicación o evidencia prematura. No se agregan dependencias ni se modifica P5.1. El contrato de publicación versionada completo corresponde a P6.

CI pendiente. P5.3 implementará la exploración pública y rutas; P5.4, búsqueda. Esta fase no altera la interfaz ni inicia investigaciones individuales.

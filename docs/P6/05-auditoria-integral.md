# P6.5. Auditoría integral (en ejecución)
## P6.5.1. Base
Main 615e4b72ac11c97769882946b4f8e3f0101df175; PR #22 integrado, despliegue 45807527925 exitoso, 138 pruebas anteriores. Rama feature/p6.5-editorial-audit. Subdivisión operativa sin modificar P0.8.
## P6.5.2. Plantilla
Seis pruebas nuevas: resolución de 20 cuerpos desde snapshot sintético validado, cinco estados del modelo, omisión justificada, bloqueo de estados no finales, rechazo de identidad/orden/cuerpos inválidos y aislamiento de 840 posiciones. Fixture etiquetado PRUEBA SINTÉTICA P6.5.2, exclusivo de tests. Comprobación del HTML real generado de 42 fichas: posiciones, títulos, aria-labelledby, anclas de retorno, exclusión del índice. No se modifica el catálogo ni el registro de publicaciones.
Alcance: prueba del modelo con snapshot sintético y del HTML de las fichas reales planificadas. El render HTML de un snapshot positivo todavía requiere una prueba aislada en Astro; no se afirma haberlo ejecutado. Pendiente CI y controles manuales. P6.5.3–P6.5.8 pendientes; no es informe final de cierre.

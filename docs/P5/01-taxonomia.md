# P5.1. Taxonomía estructurada

Base: 72f70d6acd736064f4fdcb98d2285a206939a97e. Despliegue P4.4: Actions 45755646074 exitoso.

## Autorización de continuidad
El responsable autorizó expresamente registrar los pendientes de P4 y continuar con P5.1. Se conserva el informe P4.4: no se declara realizada la revisión manual de escritorio/móvil, teclado, foco, zoom, reflujo ni lector de pantalla, ni una aprobación editorial detallada del glosario. La autorización permite avanzar, no certifica accesibilidad. Responsable de aceptación editorial: titular del proyecto; revisión manual pendiente de coordinación antes del cierre integral P11 y antes si surge un defecto crítico.

## Alcance
Cuatro catálogos JSON con schemaVersion 1: 14 ejes, 14 agrupaciones disciplinares base, 18 métodos y cinco tradiciones confesionales más el marco académico A01. Los nombres de las disciplinas base se preservan tal como aparecen en P0.3, incluso cuando agrupan más de una disciplina; los nuevos identificadores DIS-001 a DIS-014 son una decisión de implementación y no asignan disciplinas individuales a los estudios. Las descripciones iniciales de estas agrupaciones proceden del alcance de cada eje, no son definiciones académicas exhaustivas.

Los métodos reproducen P0.4 y se verifica su coincidencia con la presentación existente; esta fase no altera P4. Los recuentos son los 42 temas previstos en P0.3, no fichas publicadas: E12, E13 y E14 permanecen sin temas principales. No se crea todavía el catálogo SN (P5.2), rutas (P5.3), búsqueda (P5.4) ni estudios. No se añaden dependencias.

## Validación
VAL-01–03: estructura, IDs únicos, secuencias, referencias, recuentos y clasificación independiente; pruebas negativas incluidas. La suite existente ejecuta las nuevas pruebas mediante npm test. CI pendiente de comprobación. Archivos previos protegidos sin modificación.

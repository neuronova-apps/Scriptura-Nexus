# P9.4. Plan operativo de manuscritos y variantes

Dependencia: P9.3 cerrado técnicamente e integrado en main (PR #65, commit d729ea0c447ae7d1016888ecd51c5e0ec34b8878; Pages #179 exitoso). Marco rector: P0.8, que define P9.4 como fichas, testimonios, aparato y enlaces autorizados, con el criterio de distinguir edición, testigo, lectura y traducción.

## Alcance

La fase desarrollará una capa documental que permita identificar testigos manuscritos, describir su procedencia, relacionarlos con lecturas en loci explícitos y referenciar aparatos críticos o transcripciones externas autorizadas. No reconstruirá un texto original por mayoría, no equiparará testigos con ediciones y no inferirá alineaciones por igualdad de versículos.

La admisión técnica previa de RV1909 y SBLGNT no las convierte en manuscritos: RV1909 es una traducción y SBLGNT es una edición textual. La cobertura previa OSHB/WLC no se amplía por P9.4. Los aparatos comerciales BHS/BHQ y NA28/UBS5 siguen fuera de admisión mientras no se verifiquen sus derechos y edición concreta.

## Desglose operativo propuesto

Esta subdivisión organiza el trabajo sin alterar la fase P9.4 ni el plan maestro P0.8.

| Subfase | Actividad | Entregable | Condición de salida |
|---|---|---|---|
| P9.4.1 | Auditoría de repositorios, ediciones, custodios y permisos | Inventario de candidatos con fuentes y límites de reutilización | Cada candidato tiene procedencia, condiciones y estado explícito; no hay admisiones implícitas |
| P9.4.2 | Contratos de testigo, edición, lectura, locus, aparato y traducción | Esquemas y reglas de integridad | Identidades separadas, relaciones verificables y referencias no ambiguas |
| P9.4.3 | Fichas y registros de variantes documentados | Muestra acotada de fichas y testimonios | Solo metadatos, lecturas y aparatos con procedencia y permiso comprobados |
| P9.4.4 | Interfaz de manuscritos y variantes | Catálogo, fichas, enlaces externos y presentación de lecturas | Sin imágenes, transcripciones o aparatos no autorizados; accesibilidad y navegación verificables |

P9.5 conservará la validación funcional, integridad, rendimiento, atribución y cierre global de herramientas textuales.

## Reglas de identidad y evidencia

- Testigo: objeto manuscrito individual, con siglum o identificador de catálogo, institución custodiante y shelfmark cuando la fuente lo permita.
- Edición: producto editorial con responsable, versión, fecha y fuente; no se presenta como objeto físico.
- Lectura: transcripción atribuida a un testigo, mano y locus, con su fuente de transcripción y estado de verificación.
- Aparato: estructura editorial que documenta variantes y sus testigos; identificar edición, convención, locus y fuente.
- Traducción: representación en otra lengua, con edición y derechos propios; no es un testigo griego, hebreo o arameo.
- Imagen: recurso digital distinto del manuscrito físico; sus derechos corresponden a la institución, fotógrafo o custodio según el caso.
- Metadatos: registrar solo campos factuales mínimos y de creación propia tras revisar los términos del catálogo. No copiar descripciones, anotaciones o exportaciones protegidas.
- Cada lectura debe indicar si es transcripción diplomática, normalizada o editorial; nunca mezclar categorías.
- La coincidencia de referencia, secuencia o lectura no demuestra filiación, dependencia ni equivalencia textual.
- Una ausencia de datos o de testimonio se representa como desconocida/no disponible, no como lectura ausente del manuscrito.

## Barreras de publicación

P9.4.1 no admite corpus, imágenes, transcripciones, metadatos de terceros ni aparatos críticos. Los cinco repositorios institucionales auditados se mantienen como enlaces externos. Los candidatos editoriales sin proveedor y licencia concretos permanecen sin seleccionar. La incorporación futura requiere revisión por recurso y componente, versión fija, huellas, atribución, compatibilidad, aprobación expresa y registro de cambios. La publicación permanece bloqueada hasta P11.4.

## Criterio de cierre de P9.4.1

Inventario versionado, evidencia oficial de condiciones de acceso/reutilización, estados explícitos, pruebas negativas que impidan una admisión accidental, ausencia de datos protegidos y workflow reproducible. La revisión de un sitio no constituye autorización ni dictamen jurídico independiente.


## Estado de ejecución al 26 de noviembre de 2026

| Subfase | Estado | Evidencia y límite |
|---|---|---|
| P9.4.1 | Completada | PR #66 integrado en main mediante f64d295; Pages #184 con build y deploy satisfactorios. Inventario de 11 candidatos; cero testigos admitidos y cero corpus importados. |
| P9.4.2 | Implementación preparada en rama | Contratos TypeScript, registro metadata-only, pruebas sintéticas y workflow específico. Cierre sujeto a CI, revisión del diff, integración y Pages. |
| P9.4.3 | Pendiente | No crear fichas ni lecturas reales hasta verificar objeto, fuente, derechos y evidencia. |
| P9.4.4 | Pendiente | La interfaz depende de registros aptos y de la validación funcional y accesible. |

La implementación P9.4.2 no modifica la decisión de P9.4.1: los repositorios institucionales siguen como enlaces externos y las ediciones/aparatos no seleccionados continúan fuera de admisión.

# P7.5. Auditoría bibliográfica y funcional
Fecha: 26 de noviembre de 2026. Base main bfc707fc6bea6d19f13030d193e5a9cda51d1c75, PR #27 integrado, árbol idéntico a la revisión aprobada por CI #81 (45822468405). 195/195 pruebas, cero errores, advertencias y pistas, 85 páginas. Despliegue #82 (45823034552) en ejecución al inicio de esta auditoría; confirmar antes del cierre operativo. No se inicia P8.

## Alcance P0.8
| Subfase | Entregable | Resultado |
|---|---|---|
| P7.1 | Contratos ENT08–ENT14 | Validadores y referencias estructurales |
| P7.2 | Catálogo documental | 6 autores/instituciones, 6 obras, 6 ediciones, 6 fuentes y 6 recursos externos |
| P7.3 | Biblioteca, historia, glosario | Búsqueda, filtros, 12 fichas, 70 conceptos conservados |
| P7.4 | Permisos y atribuciones | 6 decisiones pendientes, 1 licencia documentada, puente P6 sin admisión real |
| P7.5 | Auditoría | Correcciones preventivas, 7 pruebas y auditoría de salida; CI pendiente |

## Reconsulta bibliográfica
Consultados nuevamente el 26-11-2026 los seis destinos identificados en 02-catalogo-documental.md: 
- F28 https://ag.org/en-US/Beliefs/Statement-of-Fundamental-Truths (declaración y preámbulo de AG, apartados doctrinales).
- F29 https://opc.org/wcf.html (Confession of Faith, capítulo I).
- F30 https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_sp.html (texto español del documento conciliar).
- F31 https://www.cambridge.org/core/journals/new-testament-studies/article/critical-reflections-on-the-role-of-the-canon-in-new-testament-scholarship/616876A1F3DF519DCDB687FACFA4AD3D y https://durham-repository.worktribe.com/output/2288505/critical-reflections-on-the-role-of-the-canon-in-new-testament-scholarship (DOI, autor y declaración CC BY 4.0; no permiso editorial).
- F32 https://www.newadvent.org/fathers/1010.htm (carta atribuida a Clemente, no atribuir confesión moderna).
- F33 https://www.oca.org/questions/scripture/bible (respuesta catequética, no documento conciliar).
Destinos accesibles y concordantes con identificación principal. Esta revisión no certifica autenticidad histórica, totalidad de metadatos, permanencia de URL ni titularidad exacta. No se copian pasajes ni obras. La representación judía, otras corrientes y autores de opinión personal quedan pendientes; no se pretende equilibrio exhaustivo ni conclusión sobre canon o Iglesia.

## Hallazgos y correcciones
H-P7-01: validación de enumeraciones mediante coerción permitía arrays de un elemento. Se exigen cadenas.
H-P7-02: aprobación podía proyectarse con varias licencias sin comprobar su compatibilidad o con procedencia de autor/obra/fuente no verificada. Se bloquea ambigüedad y exige cadena comprobada y cronología de consulta. Recurso de múltiples licencias necesita contrato por componente antes de admisión.
H-P7-03: P6 aceptaba dos referencias admitidas individualmente aunque no correspondieran a la misma edición. Se conecta mapa edición-recurso en contexto real y se prueba rechazo; contextos de prueba P6 legados siguen funcionando.
H-P7-04: auditoría funcional ampliada a enlaces recíprocos autor-documento-permisos y ausencia de archivos documentales en dist (extensiones habituales). No es detector universal de material restringido ni revisión de navegador.
H-P7-05: no hay aprobación humana, titularidad final ni verificación de componentes de terceros. Cero admisiones reales. Revisión humana obligatoria antes de publicación, incluyendo atribución en evidencias, límites de cita y eventuales revocaciones. El contrato P7 mantiene biblioteca sin archivos ni fragmentos; P8/P9 diseñarán controles específicos por corpus/archivo, no reutilizar como autorización general.
H-P7-06: los checks históricos están fijados a catálogo inicial de seis referencias y a cero snapshots. Antes de ampliar catálogo o iniciar pilotos, sustituir conteos/estados rígidos por controles derivados del registro autorizado, preservando pruebas de regresión y barrera P6.

## Pendientes
Responsable: titular del proyecto. Pendientes no críticos de accesibilidad y rendimiento (teclado, foco, lector de pantalla, zoom/reflujo, 320/375/768/1024/1440 px, cuatro apariencias, búsqueda y navegación real), glosario y ampliación documental. No se presume aceptación expresa de aplazamiento. Resolver cualquier defecto crítico antes de cierre y registrar aceptación de pendientes no críticos; comprobaciones de permisos y nuevas fuentes antes de cualquier uso público. P7.5 queda implementada, no cerrada hasta CI satisfactoria, revisión, integración y despliegue. P8 no iniciada.

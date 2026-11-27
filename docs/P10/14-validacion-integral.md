# P10.3.6. Integración y validación conjunta de pilotos

Base main 896c11416b429b4d04d83636cb2a2f54c1022d24. PR #80 integrado tras doce workflows satisfactorios; auditoría 45941627134: seis pruebas específicas, cinco unidades RV1909, una ancla SBLGNT, edición TR no disponible y ausencia de alineación acreditada. El despliegue 45941890416 estaba pendiente al fijar el registro histórico; se requiere confirmarlo antes de integrar este PR.

## Conciliación de cinco validaciones

| Subfase | Piloto | Casos | Unidades RV1909 | Anclas SBLGNT | PR | CI |
|---|---|---:|---:|---:|---:|---|
| P10.3.1 | SN-001 | 2 | 6 | 0 | 76 | 45936328551 |
| P10.3.2 | SN-008 | 6 | 44 | 6 | 77 | 45938307832 |
| P10.3.3 | SN-015 | 5 | 26 | 2 | 78 | 45939097913 |
| P10.3.4 | SN-021 | 3 | 20 | 2 | 79 | 45940243485 |
| P10.3.5 | SN-040 | 1 | 5 | 1 | 80 | 45941627134 |
| Total | 5 | 17 | 101 | 11 | | |

Las 101 unidades y 11 anclas corresponden a la misma muestra de P10.2.3, no a una ampliación ni a nuevos casos. Se verificaron los cinco jobs específicos y los despliegues previos #76–79 mediante GitHub; se conservan sus identificadores y las huellas de los registros. Treinta pruebas específicas previas aprobadas, seis por subfase, tres controles positivos lingüísticos y treinta ocurrencias de control (20 hebreas y 10 griegas); ocho pasajes piloto fuera de cobertura lingüística correctamente bloqueados. Una variante y dos atestaciones secundarias en la muestra P9.4.3; cero inspecciones directas, cero alineaciones acreditadas. No se suman controles positivos a casos de investigación.

## Límites y continuidad

Se conservan las 100 posiciones metodológicas (10 preparadas, 16 parciales, 74 pendientes), las 20 necesidades documentales y las cinco limitaciones abiertas de P10.2.4. No se acredita conclusión de ninguna investigación ni autorización de publicación. Los registros públicos de publicaciones y lingüística y el registro de alineaciones permanecen vacíos. Las ampliaciones hebrea/griega, la admisión de TR, las fuentes especializadas, los cotejos y las revisiones manuales requieren decisiones y verificaciones específicas; el éxito técnico de una barrera no resuelve la ausencia de datos.

## Pruebas conjuntas

Seis nuevas regresiones, conciliación de los cinco validadores y contratos existentes. El workflow reejecuta los controles lingüísticos reales en memoria, las auditorías de referencias y de comparación y las regresiones de proyecto. No persiste texto ni incorpora nuevos corpus. El manifiesto documenta resultados históricos, no presume resultados futuros. P10.3 solo se cierra técnicamente después de CI, integración y despliegue de este PR y de comprobar el despliegue #80. P10.4 revisará incidencias, ajustes y decisiones pendientes antes de P11. La revisión manual de accesibilidad y P11.4 siguen siendo requisitos independientes.

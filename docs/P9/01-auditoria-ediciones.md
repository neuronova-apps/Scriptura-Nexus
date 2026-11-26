# P9.1.1. Auditoría de ediciones bíblicas

Base inicial: main 546b1f34638e5a73abea56cc60be714d9fff87da. P8.5.5 PR #54 integrado y despliegue #148 exitoso. La continuidad técnica a P9.1 se ejecutó con cobertura parcial de P8, sin autorizar publicación ni resolver pendientes de revisión manual.

## Resultado de P9.1.1

PR #55 integrado en main mediante commit 949a5610729308c85a48aa66ea7aa4954a1fd408. Despliegue de Pages #150, ejecución 45888740669, exitoso. Auditoría específica #1, ejecución 45888340290, exitosa con 10/10 pruebas.

### ED-C01. Reina-Valera 1909

- Fuente eBible.org, identificador spaRV1909; revisión textual 1909.
- La ficha oficial declara Public Domain / Dominio Público y fecha 2013-12-13; los archivos fuente se identifican como fechados 2015-08-10. La fecha del archivo fuente no es una fecha de revisión de la traducción.
- ZIP USFM oficial: 2.384.901 bytes; SHA-256 56937c2be9ad278aed91370d6a15a98fe976f275d0cbaa6e26910291d949c7a5.
- Inventario: 66 archivos de libros, 1.189 capítulos y 31.102 marcadores de versículo. Cuatro archivos auxiliares quedan fuera del corpus.
- El proveedor declara dominio público para esta distribución. P9.1.1 registró el checksum y la estructura; P9.1.2 fijó las huellas de los 66 archivos y resolvió la admisión técnica limitada. No es un dictamen jurídico independiente.

### ED-C02. SBL Greek New Testament

- Fuente oficial Faithlife/SBLGNT, revisión fija 736fdc76158950c3d04b949b7e013ca14305145a, commit del 11 de julio de 2023.
- La historia de versiones del README del repositorio identifica v1.2, fechada 10 de julio de 2023; el commit fijado incorpora Jn 7:53–8:11.
- Licencia CC BY 4.0. Copyright 2010 Society of Biblical Literature y Logos Bible Software; editor Michael W. Holmes.
- Inventario: 27 archivos XML, 260 capítulos, 7.939 marcadores de versículo y 137.741 elementos w. Las huellas SHA-256 de los 27 archivos, LICENSE y README se conservan en el manifiesto de admisión P9.1.2.
- El commit no tiene firma verificada. Se fijan commit, Git blob SHA-1 y SHA-256 de los archivos para reproducibilidad; la firma no se presenta como validada.

## Limitaciones y alcance

Los recuentos son marcadores y elementos estructurales de cada fuente, no una versificación armonizada. No se asigna canonId ni versificationId. No se crean alineaciones entre traducción y texto griego. No se incorpora aparato crítico, manuscritos, MorphGNT ni glosas por esta auditoría. Los archivos originales no se guardan en el repositorio; el registro público permanece vacío. P9.1.1 solo auditó y calculó huellas; la decisión de admisión corresponde a P9.1.2.

La distribución RV1909 contiene cuatro archivos auxiliares, entre ellos claves y firma. Su presencia se registra, pero no se declara verificada criptográficamente la firma PGP. El SHA-256 del ZIP protege la identidad del snapshot usado en esta fase.

## Siguiente subfase

P9.1.2 congela los hashes de cada archivo, revisa versión/licencia y decide la admisión técnica de los componentes permitidos. La publicación del portal continúa bloqueada hasta P11.4 y su aprobación específica.

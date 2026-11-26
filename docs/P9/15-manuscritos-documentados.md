# P9.4.3. Muestra documental de manuscritos y variantes

Fecha: 26 de noviembre de 2026. Base: main 7572a0c5566d9a8f49211e029ea58deade88a702; PR #67 integrado y Pages #195 satisfactorio. Se mantiene el registro histórico P9.4.2 vacío e intacto. La nueva muestra está en muestra-manuscritos-p943.json, bajo docs/P9, no en datos públicos ni en rutas de la aplicación.

## Alcance y decisión de selección

Se selecciona un único locus, Juan 1:18, para comprobar una diferencia editorial real y su relación con dos testigos manuscritos identificados. Es una muestra de contraste, no un aparato exhaustivo ni una evaluación de originalidad. SBLGNT v1.2 sigue siendo una edición crítica ENT19, no un testigo físico. RV1909 y los demás corpus y contratos conservan su alcance anterior.

| Entidad | Identificación | Alcance |
|---|---|---|
| MAN-GA-P66 | P66, GA P66, P. Bodmer II, Bibliotheca Bodmeriana (Cologny) | Siglos II–III según el catálogo consultado; intervalo amplio, no datación exacta. Se describe el ejemplar referido, no el inventario de todos sus fragmentos. |
| MAN-GA-02 | A, GA 02, British Library, Royal MS 1 D VIII | Siglo V según catálogo; se identifica el volumen del Nuevo Testamento. |
| TXT-SBLGNT-V1-2 | SBL Greek New Testament, edición crítica | Identidad ya existente en P9.1.3, editor Michael W. Holmes. |
| VAR-P943-JHN-1-18 | John 1:18, aparato de SBLGNT | Localizador nativo; no se asigna una unidad ENT23 ni versificación. |
| LEC-P943-JHN-1-18-A / B | Lados izquierdo y derecho de la entrada | Referencias editoriales, no transcripciones diplomáticas ni normalizadas de los manuscritos. |

## Evidencia y límites de la comparación

El aparato de SBLGNT registra diferencias entre ediciones, no una lista propia de testigos manuscritos. Se consultó la entrada de John 1:18 en el archivo oficial data/sblgntapp/text/John.txt, línea 10, en el commit 736fdc76158950c3d04b949b7e013ca14305145a. Se identificaron sus dos alternativas editoriales sin copiar el texto del aparato al registro.

La tabla del apartado John 1:18 de Brian J. Wright (2007) identifica P66 en su primera fila y A en su tercera fila. Se enlazan esas dos referencias como atestaciones reportadas por una fuente secundaria, tras contrastar las respectivas formas editoriales del aparato; no por simple igualdad de número de versículo. El artículo contiene otras lecturas y testigos que no se incorporan. No se trasladan sus conclusiones teológicas ni su tabla. No se ha realizado una colación directa de imágenes, ni verificado el folio, línea material o mano de los manuscritos. El estado attested se interpreta junto a attestationBasis=secondary_report, no como examen directo. Ambas manos permanecen unknown. La valoración de la variante es not_assessed.

Se consultó el registro del depósito IGNTP de P66 (2013) para identificar el recurso, no se reutilizó el XML ni se verificó su transcripción en esta etapa. El visor y catálogo de British Library se utilizan como referencias bibliográficas, no como fuente de imágenes o registros exportados.

## Fuentes y permisos por componente

- [SBLGNT, identidad y editor](https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/About.md), blob Git 930258324114fc7520b482fcc57786b841191759; [aparato de Juan](https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/data/sblgntapp/text/John.txt), blob Git 1cc4af0bdc3fca51b38be7ef100431c58f086ccd; [licencia](https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/LICENSE) y [declaración del proveedor](https://github.com/Faithlife/SBLGNT/blob/736fdc76158950c3d04b949b7e013ca14305145a/README.md). CC BY 4.0 declarada para SBLGNT; en esta fase solo se autoriza el registro de referencia, no se admite el archivo.
- [P66](https://manuscripts.csntm.org/manuscript/View/GA_P66_Bodmer), [GA 02](https://manuscripts.csntm.org/manuscript/View/GA_02) y [condiciones CSNTM](https://www.csntm.org/terms-of-use-copyright/): identificación factual mínima y enlace externo; sin copia de catálogo, imágenes ni transcripciones.
- [British Library, Royal MS 1 D VIII](https://searcharchives.bl.uk/catalog/040-002353500) y [condiciones](https://www.bl.uk/terms): referencia al objeto, sin reproducción.
- [IGNTP, depósito 1759](https://epapers.bham.ac.uk/id/eprint/1759/): el registro indica CC BY-NC-SA; la versión exacta del encabezado no está comprobada. Solo enlace, no se admite XML.
- [Wright, Brian J. (2007), Jesus as Θεός (God): A Textual Examination](https://bible.org/article/jesus-%CE%B8%CE%B5%CF%8C%CF%82-god-textual-examination), apartado John 1:18, [condiciones para enlaces](https://bible.org/article/linking-bibleorg): referencia externa; no redistribución de tabla o artículo.

La fecha de revisión documental y los localizadores se guardan por evidencia. Los archivos de terceros admitidos en P9.4.3 son cero; los dos identificadores Git del repositorio oficial fijan las referencias, no son hashes SHA-256 de archivos admitidos. Las páginas web no versionadas se documentan con fecha de consulta, sin fingir snapshots inmutables. La autorización de publicación P11.4 no se anticipa.

## Implementación y verificación

El validador P9.4.3 reutiliza el contrato de P9.4.2 y la proyección ENT19 de P9.1.3. Agrega restricciones de alcance, inventario, localizadores, roles de evidencia, identidad, procedencia, atestación secundaria y representación editorial. Se conserva el registro histórico P9.4.2 sin modificaciones. Las pruebas positivas y negativas verifican la muestra, los vínculos de evidencia y el bloqueo de admisión, publicación, alineación y valoración no autorizada. El workflow verifica que los identificadores del piloto no aparezcan en el artefacto de Pages.

Resultado previsto del registro: 2 testigos, 1 ficha de edición existente, 1 variante, 2 referencias de lectura, 2 atestaciones secundarias, 7 recursos de consulta y 8 evidencias; 0 nuevas ediciones admitidas, 0 transcripciones, 0 imágenes, 0 archivos de aparatos, 0 alineaciones y 0 valoraciones. Los resultados de CI se comprobarán antes de integrar.

P9.4.4 será la interfaz, con separación visible entre referencias editoriales, testimonios secundarios y verificación directa, y enlaces externos con atribución. No procede iniciar esa fase sin cerrar P9.4.3.

# P9.2.2. Navegación y referencias textuales

Base main 0c1fa1accb89737f7507e270e70f282d4e014e5e. PR #58 integrado; despliegue #164 (45896995582) con build y deploy exitosos. La corrección de alias ENT22 queda incluida en la base.

## Alcance

Motor interno Python, no interfaz pública. Consume las unidades efímeras del proyector P9.1.3 mediante un callback opcional; el comportamiento sin callback permanece igual. El consumidor verifica huella completa por fragmento, orden de edición y libro, identidad, recurso, ID determinista, huella de texto, referencias únicas y recuentos frente al manifiesto. Solo conserva en memoria metadatos de las referencias; no retiene ni emite el texto. La auditoría final exige coincidencia exacta del informe reproyectado con P9.1.3.

La navegación se realiza por identidad de edición/libro, etiqueta literal de capítulo y etiqueta literal de versículo. Los rangos y sufijos no se expanden ni se resuelven por aproximación. El orden de capítulos y versículos se deriva de las unidades originales. Anterior/siguiente opera dentro de cada libro, atraviesa capítulos existentes y se detiene en los límites del libro. No hay salto automático entre ediciones.

Estados separados: edición no disponible, libro fuera de cobertura, capítulo no encontrado, referencia no encontrada, marcador vacío y fragmento verificado. Los resultados ofrecen localizador, identidad, recurso y huellas; no texto. Un marcador vacío no significa ausencia canónica. Canon y versificación armonizada siguen sin asignarse; no se construyen alineaciones ni instancias ENT20/ENT21.

## Validación

Siete pruebas sintéticas: etiquetas y orden, ausencia y vacío, navegación anterior/siguiente, integridad, duplicados, finalización y ausencia de texto en resultados. El workflow especializado proyecta las dos fuentes reales, verifica los 93 fragmentos y exige 39041 referencias y 18 marcadores vacíos. Recorre cada referencia, verificando la resolución exacta y vecinos, y emite exclusivamente un resumen de recuentos. No se persiste índice ni corpus; registros públicos intactos. CI general, revalidación P9.1.3, workflow P9.2.2, integración y despliegue pendientes hasta evidencia.

## Dependencia

P9.2.3: interfaz accesible del lector, con estados de ausencia y cobertura. La interfaz pública no debe incorporar texto no autorizado ni cargar fuentes restringidas; los ensayos internos podrán usar fixtures identificados. Publicación condicionada a P11.4. Las decisiones de canon y versificación deberán documentarse con evidencia independiente.

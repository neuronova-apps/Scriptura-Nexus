# P9.3.2. Motor de comparación textual

Base main ab7b480af3a6add7b755016a0106959e5739f219. PR #62 integrado y ejecución #172 (45906756440) con build y deploy exitosos. P9.3.1 verificó 39041 unidades, 27 libros compartidos, 7937 etiquetas coincidentes, 20 etiquetas RV1909 y 2 SBLGNT no coincidentes en libros comunes, 23145 unidades RV1909 fuera de cobertura de libros de SBLGNT y 18 marcadores vacíos RV1909. Cero alineaciones documentadas.

## Motor interno

Reutiliza el proyector P9.1.3 y navegación P9.2.2. La construcción exige manifiesto reproyectado idéntico, inventario de extremos, huellas del texto y registro ENT30 válido. Retiene texto únicamente en memoria privada durante la ejecución; los resultados internos no se serializan, no se exponen por HTTP, no se escriben archivos. La auditoría imprime solo recuentos agregados.

La consulta acepta edición y referencia nativa de origen, edición de destino distinta y referencia de destino opcional. Si se selecciona explícitamente una referencia disponible, se recupera su texto como lectura independiente, no como alineación. Una coincidencia de etiqueta se informa únicamente mediante estado diagnóstico (presencia, marcador vacío, capítulo o referencia ausente, libro fuera de cobertura), sin seleccionar texto de destino por aproximación. Se distinguen edición inválida, misma edición, referencia inválida, origen/destino no disponible, marcadores vacíos, ausencia de alineación y destino fuera del grupo verificado.

Solo un grupo ENT30 respaldado permite resolver automáticamente el conjunto de destino; se conserva orden y cardinalidad en ambas direcciones, incluidos rangos y sufijos. Si el usuario eligió un destino que no pertenece al grupo, no se sustituye ni se compara como alineado. Se incluyen identidad de edición, versión, recurso, localizador, huellas, fuente, licencia, atribución y evidencia revisada. La igualdad literal de secuencias de unidades solo se evalúa entre idiomas iguales y grupos verificados; no es equivalencia semántica. No se generan alineaciones de tokens, métricas de similitud doctrinal ni traducciones.

## Validación y barrera

Once pruebas sintéticas del motor y regresión de doce pruebas ENT30. Auditoría exhaustiva de 39041 consultas reales, en ambas direcciones, con la totalidad de referencias como origen. Exige cero alineaciones y cero destinos seleccionados automáticamente, conciliación de 7937 coincidencias literales por dirección, 18 marcadores vacíos y cobertura exclusiva. Los resultados efectivos se registrarán en logs de CI. No se modifica el registro vacío P9.3.1, los corpus ni la interfaz pública; P11.4 continúa bloqueando publicación. P9.3.3 desarrollará la interfaz sin cargar datos internos ni invocar Python desde el navegador; pruebas sintéticas aisladas y adaptador editorial futuro. No existe todavía una fuente de correspondencia admitida ni se afirma equivalencia de las referencias.

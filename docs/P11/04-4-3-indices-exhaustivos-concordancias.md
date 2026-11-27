# P11.4.4.3. Índices exhaustivos de concordancias (validación privada)

PR #109 integrado en 90226e04ee56206a9bf185df7746a4b069701048; 32 workflows, 41 checks satisfactorios. Run 46031238058, job 140615287135. Pages 46031920767: pending al preparar este PR. La muestra anterior confirmó 90 consultas, 90 filtros por libro, 15667 resultados, nueve grupos de consulta, 49174 ocurrencias hebreas, 3601 arameas, 25443 griegas. 76732 con lema admitido y 1486 sin lema. Las 198 divergencias griegas nuevas permanecen sin enlace. La huella de la muestra se conserva en el registro.

## Dodson XML

La prueba confirmó 5410 claves completas únicas, 5410 formas (5409 distintas), 10820 definiciones, 5408 sufijos numéricos distintos y dos filas adicionales con sufijo repetido. 3163 etiquetas difieren de orth; la coincidencia de 5408 sufijos con CSV es solo diagnóstico. Mantener identificador completo y orth original; no fusionar ni inferir Strong, GK o sentido contextual. El archivo sigue sin admisión técnica hasta decisión expresa. La continuidad del usuario se interpreta como autorización para verificar índices ya admitidos, no para admitir LEX-C08 ni publicar. LING-015–018 mantienen sus permisos históricos; no se añaden entradas al modelo.

## Índices reales

Reutilizar createConcordance sin modificar su contrato, con las fuentes admitidas P11.4.3.3. Reconstruir en memoria referencia independiente desde tokens, unidades, lemas, análisis y componentes, con deduplicación por ocurrencia y clave. Validar todos los grupos observados por edición, lengua, libro, modalidad y sistema; todas las claves, frecuencia ordenada, total, paginación completa, forma, referencia, dirección, origen y conjunto de lemas documentados. Los índices de forma deben sumar 78218 posiciones tanto por edición como por libro; las búsquedas por lema o código pueden tener múltiples asociaciones por ocurrencia y no se confunden con número de palabras. Validar cero coincidencias vs ausencia de cobertura, lema o sistema. Preservar el orden de unidades de la edición existente; no afirmar orden canónico distinto. No usar texto de diccionario como frecuencia.

El workflow conserva pruebas históricas, añade dos pruebas de contrato de alcance, verifica build antes y después y ejecuta comprobación exhaustiva con datos reales. Solo métricas y huella, no corpus. CI pendiente. La próxima fase es preparar candidato funcional e interfaz con fragmentación, accesibilidad y privacidad; admisión técnica de Dodson independiente de índices. No se cambia src ni registro público. Progreso 61/69.

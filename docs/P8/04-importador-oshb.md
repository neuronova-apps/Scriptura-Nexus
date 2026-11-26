# P8.2.2. Importador reproducible OSHB

Base: main 83cad79f3312667fa99a8c319d2751b7097cfc22. P8.2.1 integrada; despliegue confirmado por el responsable. Alcance: LING-011 Génesis y LING-012 Daniel exclusivamente, OSHB v.2.2, commit y bytes del manifiesto P8.1. No se modifica la admisión de los nueve excluidos ni se importa TEHMC.

## Ejecución

Requiere Node 24 y Python 3 (biblioteca estándar, sin dependencia npm nueva). `node --test tests/p8-oshb-importer.test.mjs` ejecuta pruebas sintéticas. `node scripts/import-oshb.mjs` descarga exclusivamente archivos fijados, limita tamaño, rechaza redirecciones, verifica admisión, tamaño y SHA-256 antes de analizar. Dos importaciones independientes deben producir idéntico informe y hash de proyección. La ejecución no escribe XML, corpus ni artefactos; solo comunica métricas. El flujo específico se ejecuta en PR sin despliegue.

## Proyección intermedia

Se preservan referencias OSIS, orden de capítulos/versículos y secuencia directa de palabras y segmentos. Se conservan formas Unicode sin normalización, barras del proveedor, tipo textual, identificador original cuando existe, lema y código morfológico brutos. No se crean IDs de entidades, no se interpreta morfología, no se convierte Strong ni se asignan idiomas por inferencia. No se reconstruyen espacios litúrgicos o lecturas alternativas. Ausencias se expresan con null. El encabezado documental no se copia; notas, qere y elementos no reconocidos se excluyen de la proyección y se cuentan por estructura. Las cantidades son de elementos directos, no cobertura textual completa ni recuento de palabras únicas. Resolver esas estructuras en P8.2.3–P8.2.6 antes de declarar cobertura completa.

Expat rechaza DTD y entidades declaradas o externas antes del análisis con ElementTree; se limita profundidad y tamaño, UTF-8 estricto y namespace OSIS. El intérprete aislado tiene límite de tiempo y salida. Los mensajes de rechazo no reproducen texto de origen. Se conserva procedencia, atribución OSHB, enlace CC BY 4.0, versificación Bible.MT y declaración de transformaciones; no se publica el XML ni el registro lingüístico.

## Validación pendiente

Ocho pruebas nuevas y validación real de los dos archivos en GitHub Actions. Confirmar recuentos, hashes reproducibles y estructuras pendientes antes de integrar. El registro público permanece vacío. P8.2.3 no se inicia. No se declara cobertura griega ni bíblica integral.

# P11.4.8.4. Revisión privada en GitHub Codespaces

La vista previa normal del puerto 4321 muestra la compilación de desarrollo. La tarea **Scriptura Nexus: revisión privada de cinco módulos** compila el sitio y levanta una sesión de revisión independiente en el puerto 43173. Reutiliza la proyección íntegra de P11.4.7.2 con los avisos de P11.4.8.4. El procedimiento Chromium de P11.4.7.3 sigue disponible para revisión local.

1. En el Codespace, abra **Terminal > Run Task** y seleccione la tarea de revisión privada.
2. En **Puertos**, reenvíe el puerto 43173 y confirme que su visibilidad figure como **Privada**. Pulse Intro en la terminal de la tarea. El lanzador usa GitHub CLI para verificar el puerto con la cuenta del Codespace y se detiene si no puede comprobarlo.
3. Abra la dirección que imprime la tarea e introduzca allí la clave temporal mostrada en la terminal. El índice da acceso al lector, analizador, léxicos y concordancias, comparador y manuscritos. Las referencias externas aparecen como texto para mantener la navegación dentro de la sesión.
4. Detenga la tarea al terminar y retire el reenvío del puerto. La sesión también termina después de una hora o si el lanzador deja de confirmar la visibilidad privada.

La consulta requiere autenticación de GitHub y una cookie de sesión propia. GitHub puede registrar datos de conexión. El navegador conserva preferencias visuales. El lanzador no registra consultas ni copia proyecciones a `dist`, al repositorio ni a un artefacto. Las fuentes admitidas se verifican durante la generación. Se mantienen las exclusiones, atribuciones y límites de P11.4.8.4.

Use los casos y criterios de [P11.4.7.3](04-7-3-protocolo-manual-integral.md). Las pruebas de arranque, privacidad y navegación técnica no completan los 38 controles manuales, la prueba en teléfono real ni las decisiones de alcance y publicación.

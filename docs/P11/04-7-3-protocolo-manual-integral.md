# P11.4.7.3. Protocolo manual y matriz de aceptación

Base main 7ae0b3d4ed4993d65c0fdc65271150dbc1b9787a; PR #126 integrado: 57 comprobaciones satisfactorias y una omitida. Run 46056147499/job 140699003078: cinco módulos, siete consultas, seis transiciones, seis comprobaciones de apariencia, cinco barreras públicas, cero solicitudes externas, inesperadas o errores. Tres solicitudes de capítulos del lector/comparador, dos capas del analizador, quince fragmentos léxicos y una proyección documental. Dist intacto. Pages 46056802345 se verifica por separado. Esta evidencia es automatizada.

## Revisión privada en computadora

Desde una copia local confiable del repositorio, una vez integrado el PR correspondiente, con Node 24, Python 3.12, PowerShell y acceso a las fuentes fijadas (no iniciar un servidor web ni subir archivos). Usar estos comandos desde la raíz:

```powershell
git status --short
git switch main
git pull --ff-only
node --version
python --version
npm ci
npm run build
npm run test:build
$env:PYTHON = "python"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:P11473_DEPS = Join-Path $env:TEMP "sn-p11473-browser"
New-Item -ItemType Directory -Force $env:P11473_DEPS | Out-Null
npm install --prefix $env:P11473_DEPS --no-save --package-lock=false playwright@1.56.1
& (Join-Path $env:P11473_DEPS "node_modules\.bin\playwright.cmd") install chromium
node --max-old-space-size=4096 scripts/preview-integral-manual-p11473.mjs --review
```

Si git status muestra cambios locales, no continuar con el cambio de rama; conservarlos primero. La ventana Chromium abierta por el script recibe los cinco candidatos por interceptación de solicitudes en memoria. No abrir la URL en otro navegador, no abrir puertos, no usar túneles, no publicar ni copiar contenido a servicios externos. No existe servidor de exposición del candidato combinado; la generación del lector utiliza su backend local histórico. Los enlaces de terceros se bloquean durante esta sesión; revisar sus condiciones por separado en un navegador ordinario sin transferir contenido del candidato. Cerrar la ventana para terminar. No se generan capturas, grabaciones ni archivos de corpus deliberadamente; evitar capturas, exportaciones, descargas y datos personales. El launcher de CI --smoke verifica acceso y barreras, no es prueba manual. El perfil temporal de navegador no equivale a garantía de ausencia de rastros del sistema operativo.

## Casos por módulo

| Módulo | Consulta funcional de control |
|---|---|
| Lector | RV1909 Juan 1:1; SBLGNT 3 Juan 1:1; marcador vacío RV1909 Números 12:16. Verificar versión, lengua, fuente y navegación. |
| Analizador | Levítico 19:28 y Hechos 19:6; seleccionar ocurrencia; distinguir forma, lema, morfología y ausencia de datos. |
| Léxicos y concordancias | Buscar Strong hebreo o BDB por identificador disponible, abrir detalle; buscar frecuencias hebreas y abrir ocurrencias. No equiparar definición con sentido contextual. |
| Comparador | RV1909 Juan 1:1 y SBLGNT Juan 1:2, seleccionados independientemente; verificar aviso de ausencia de correspondencia documentada. |
| Manuscritos | P66, GA 02 y Juan 1:18; verificar procedencia, ocho evidencias, atestación secundaria y manos/folios no verificados. |

Por cada módulo registrar siete controles: teclado (Tab, Mayús+Tab, Enter, Escape y foco), lector de pantalla (NVDA en escritorio; anunciar títulos, controles, estados y resultados), visual (zoom 200/400 %, temas, escalas y reflujo), móvil real (TalkBack, orientación, objetivos táctiles), derechos (fuentes fijadas, atribución, licencias y limitaciones), privacidad (avisos de alojamiento y almacenamiento), aprobación explícita del responsable por alcance. Además tres controles transversales: navegación, apariencia persistente, lenguas originales/direccionalidad. El registro contiene 35+3 casos pendientes, no resultados inventados.

La ventana local permite revisar escritorio, no teléfono físico. La emulación móvil no sustituye TalkBack en un dispositivo real. Si el entorno no permite prueba móvil, marcar no evaluable, mantener bloqueo y decidir una vía autorizada o aplazamiento específico no crítico. Solo L05 del lector tiene aplazamiento histórico aceptado; no se extiende a otros módulos. L01–L04 son reporte previo del responsable, no comprobación independiente ni nuevo resultado. Defectos críticos bloquean liberación; un no evaluable no equivale a conforme. No se declara certificación WCAG.

## Registro de resultados

Informar fecha, sistema, navegador, versiones de tecnología de apoyo y dispositivo, commit de prueba y por cada caso: ID, conforme/no conforme/no evaluable/pendiente, resultado observado, gravedad, evidencia no sensible. No consignar textos privados ni identificadores personales. Para decisión de derechos/privacidad, registrar fuente o evidencia y alcance; aprobación del responsable separada del resultado técnico. El registro inicial es inmutable como evidencia de preparación; resultados reales se consignan en un registro posterior. P11.4.7.4 concilia resultados y alcance autorizado; no habilita automáticamente corpus. Se conserva 63/69 histórico y 66 hitos de preparación técnica. Dodson XML, Scrivener y demás exclusiones intactas.

# P11.4.3.5.2. Candidato estático privado del analizador

PR #103 integrado en 76210807c166ba85b5c9ce83b7a63873d2aa7c2a; 27 workflows y 34 checks satisfactorios, ejecución 46025161288/job 140594560100. Pages 46025893085: success al preparar este PR. La revisión real verificó tres licencias, diez archivos, 168 capítulos, 336 capas, 5162 unidades y 78218 ocurrencias; mayor capa 143393 bytes. AUT-P11433-20261127-01 autoriza preparación, no publicación.

## Candidato

Se extrae el constructor y servidor del navegador P11.4.3.4 para reutilizar exactamente el mismo código en revisión local y pruebas automatizadas, conservando las aserciones previas. Se construyen en memoria 346 archivos virtuales: 336 capas, un catálogo, ocho módulos y una página HTML. Se comprueba conjunto exacto de rutas, hashes de bytes comprimidos y descomprimidos, tamaños y huella del inventario. El catálogo continúa en modo isolated_validation. No se modifica src, dist, el registro público ni la configuración de Pages; no se suben artefactos. El servidor usa puerto efímero en 127.0.0.1, rechaza métodos no GET, host/origen ajenos, peticiones cruzadas, parámetros y rutas desconocidas; recursos estáticos limitados y comprobación de ruta real. El aviso de cobertura de siete libros, licencias, cambios y privacidad sigue visible. No se afirma revisión jurídica, móvil real ni lector de pantalla manual.

## Revisión local (PowerShell)

Solo después de integrar este PR, usar una copia actualizada del repositorio, Node 24 y Python 3.12. Desde la raíz:

```powershell
$env:PYTHON = "python"
$env:PYTHONDONTWRITEBYTECODE = "1"
npm ci
npm run build
npm run test:build
node scripts/prepare-analyzer-candidate-p11435.mjs --preview
```

Abrir exclusivamente la URL 127.0.0.1 que devuelve el comando; no abrir puertos ni compartir el candidato. Para cerrar, Ctrl+C. La opción --verify construye y verifica sin iniciar servidor. Los tres llamadores Python del analizador aceptan PYTHON y seleccionan python por defecto en Windows; salida UTF-8 explícita. CI prueba preparación real en Linux y Windows, y P11.4.3.4 vuelve a probar los mismos módulos y servidor con sus controles históricos. No se cambian los algoritmos de proyección, sus huellas, admisiones ni criterios. P11.4.3.5.3 queda pendiente de CI y posterior revisión manual y artefacto completo. Progreso 61/69.

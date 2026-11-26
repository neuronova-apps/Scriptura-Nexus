# P1.5–P1.6. Despliegue y auditoría de infraestructura

Fecha: 25 de noviembre de 2026 (Perú).
Estado: auditoría previa conforme; comprobación del nuevo commit documental pendiente al redactar este informe.

## Línea base

P0: 28bf3977be713fa995d2043b92fe21bad0599903.
Integración P1 mediante PR #1: 48fcee6b4279744c6b5aa81f38fb5961e9ff3392.
Rama main. README y los nueve documentos P0 conservan sus blobs registrados en P0.9 (incluido 09-cierre.md: 3c1ad4914df4966655b9e56e12274a534b368683).
Archivos técnicos protegidos para esta operación:
- package.json: 59e581a24c95254a2dffe4250b87b410620e5459
- package-lock.json: 0f44f77449bb9c3cbb4a566543ec1749df115481
- astro.config.mjs: 8a61db93c1284050acd1429bf8814c72ff5c7afb
- pages.yml: 5a8c23aa117fe1027e8939719ae1925bb38d509b
- src (árbol): 4498138fd2e1bf4007755cc2025a31b1d007b67b
- tests (árbol): 4a0fb11f0cda286b395642a4438e93ba63256a1f
- scripts (árbol): 8654cabbb1f2f04dab8ffe4d011639060eed55

## Evidencias de P1.1–P1.5

P1.1: rama y línea base documentadas. P1.2 y P1.3: Node 24, Astro 7.4.9, TypeScript 5.9.3, Astro Check 0.9.12; configuración estática bajo /Scriptura-Nexus, inicio y 404. El lockfile fue generado y versionado después del informe inicial 02-entorno.md; su ausencia inicial ya está resuelta. P1.4: workflow temporal retirado, workflow permanente con permisos acotados y despliegue solo desde main. PR integrado después de checks exitosos.

Ejecuciones:
- https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45745994310 : checks de rama exitosos.
- https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45746001275 : checks PR exitosos.
- https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45746162120 : build y deploy exitosos; segundo intento confirmado mediante API.
- https://github.com/neuronova-apps/Scriptura-Nexus/actions/runs/45746161484 : fallo histórico de Jekyll en el mismo commit. El titular informó haber cambiado Pages Source a GitHub Actions. El indicador rojo histórico no invalida el workflow Astro exitoso.

El titular aportó capturas de la página inicial visualizada correctamente, con el título y los dos párrafos previstos. URL: https://neuronova-apps.github.io/Scriptura-Nexus/. El control test:build verifica dist/index.html, dist/404.html, idioma y enlace de retorno con base correcta. No equivale a verificar HTTP 404 en producción.

## Auditoría P1.6 previa al nuevo commit

| Control | Resultado |
|---|---|
| Integridad README y P0 | Conforme |
| Lockfile y versiones directas | Conforme |
| npm ci, astro check, npm test, build, test:build | Conforme, ejecución 45746162120 intento 2 |
| Artefacto Pages y deploy | Conforme, misma ejecución |
| Inicio publicado | Conforme según captura del titular |
| 404 generado | Conforme en build |
| 404 HTTP público y navegación de retorno | Pendiente de comprobación independiente |
| Ausencia de nueva ejecución Jekyll | Pendiente de comprobar con este commit |
| Alcance documental exclusivo | Verificar diff posterior |

## Recuperación y pendientes

No repetir Jekyll ni eliminar historial de fallos. Si el nuevo workflow falla, revisar logs y conservar última publicación funcional; corregir mediante commit acotado o revertir cambios problemáticos sin force-push. No modificar configuración ni dependencias en esta auditoría. La actualización futura de acciones con advertencias de Node 20, definición de licencia propia, lint específico y auditoría de accesibilidad/rendimiento quedan pendientes de las fases pertinentes; no se certifica WCAG ni seguridad integral. La identidad visual permanece fuera de P1.

Cierre condicionado a comprobar el nuevo commit documental, éxito del workflow Astro y ausencia de nueva ejecución del mecanismo anterior; verificar 404 público o registrar explícitamente la limitación y aceptación del titular. No iniciar P2 automáticamente. La evidencia posterior a este commit se consultará en Actions y en la verificación de cierre, sin introducir un ciclo de commits para registrar su propio SHA.

# P11.4.3.5.3. Consolidación técnica y preparación de decisión

PR #105 integrado en 8b298ada3f70ab58d4cc171238dc26a883858902. 29 workflows y 38 checks satisfactorios; ejecución 46028064811, jobs Linux 140604481942 y Windows 140604481570. Pages 46028715584: success al preparar este PR. Los dos artefactos conservaron 138 de 139 archivos de base, sustituyeron una página y añadieron 345 archivos. Los 336 fragmentos descomprimidos tienen exactamente la misma huella de inventario SHA-256 ccef0afddbf5e481f5508bf259868ff71b95f7db81d1552651dd054566f42b47; las huellas de los paquetes completos siguen siendo distintas por plataforma. Se fija la huella del contenido para las próximas reconstrucciones. Linux verificó tres rutas ajenas, tres referencias, seis peticiones de capítulos, cero solicitudes externas y ausencia de almacenamiento de consultas. Ambos eliminaron la copia temporal. Estas pruebas no son revisión manual ni de campo.

## Recuperación

Se ensaya la restauración únicamente en una copia temporal verificada de dist. La prueba exige que todas las rutas y huellas coincidan antes de borrar los 345 archivos añadidos del candidato, restaura la página original y verifica igualdad de todos los archivos con la base. La base permanece intacta; se elimina la copia temporal. No usa reset, force, despliegue ni cambios a main. El nuevo workflow ejecuta la prueba con las fuentes reales y barreras públicas anterior y posterior. Si más adelante se autoriza habilitación efectiva, documentar la versión exacta y el alcance; una recuperación real requerirá PR correctivo o reversión no destructiva de esa integración, compilación, controles, despliegue y pruebas del sitio. No afirmar reversión de cachés o copias externas ya obtenidas.

## Decisión del responsable

La preparación AUT-P11433-20261127-01 no autoriza publicar. Antes de P11.4.3.5.4 registrar de forma separada:

- A01: revisión manual de teclado y lector de pantalla en hebreo, arameo y griego. A02: móvil real y ampliación/contraste. Si no son evaluables, consignar limitaciones; aplazar solo mediante autorización expresa.
- A03: confirmación del alcance de la declaración de dominio público WLC para el territorio pertinente; conservar atribuciones OSHB CC BY 4.0, SBLGNT CC BY 4.0 y anotaciones MorphGNT CC BY-SA 3.0. No extender licencias a contenido no admitido. No constituye dictamen jurídico.
- A04: revisión del aviso de privacidad del alojamiento. La prueba local no demuestra ausencia de registros de IP de GitHub Pages; no ofrecer garantía de anonimato.
- A05: decisión expresa sobre la publicación del analizador de siete libros y sus capas exactas, con exclusiones y limitaciones. Registrar pruebas manuales realizadas o aplazamientos específicos; no asumir aprobación por CI. Lector bíblico conserva decisión separada.

La lista de comprobación manual y comandos están en 04-3-5-3-verificacion-artefacto-analizador.md. Los estados del registro adjunto son deliberadamente pendientes; una decisión posterior requiere nuevo registro explícito. No se publica corpus ni se habilita el analizador público. Progreso 61/69 hasta cierre.

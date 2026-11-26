import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const p0 = readFileSync('docs/P0/04-metodologia.md','utf8');
const pages = {
  exegesis: readFileSync('src/pages/fundamentos/exegesis.astro','utf8'),
  hermeneutica: readFileSync('src/pages/fundamentos/hermeneutica.astro','utf8'),
  fuentes: readFileSync('src/pages/fundamentos/fuentes.astro','utf8'),
  licencias: readFileSync('src/pages/fundamentos/licencias.astro','utf8'),
};
test('las cuatro guías P4.2 están implementadas como páginas separadas', () => {
  assert.equal(Object.keys(pages).length,4);
  for (const [slug,page] of Object.entries(pages)) {
    assert.ok(page.includes('MethodologyGuide'));
    assert.ok(page.includes('slug="'+slug+'/'));
    assert.ok(page.includes('SectionHeading'));
  }
});
test('la guía de exégesis conserva los procedimientos documentados en P0.4', () => {
  for (const term of ['M10','M01','Strong','perícopa','variantes','traducciones','grado de respaldo']) assert.ok(pages.exegesis.toLowerCase().includes(term.toLowerCase()),term);
  assert.ok(p0.includes('¿Qué comunica el texto en contexto?'));
});
test('la guía hermenéutica declara presupuestos y justifica la aplicación', () => {
  for (const term of ['canon','presupuestos','pactos','destinatarios','mandamiento explícito','práctica cultural','convicción personal']) assert.ok(pages.hermeneutica.toLowerCase().includes(term.toLowerCase()),term);
});
test('la guía de fuentes exige trazabilidad y no atribuye a ChatGPT valor de fuente primaria', () => {
  for (const term of ['autor','localizador','fecha','procedencia','licencia','Logos','no constituye una fuente primaria','APA 7']) assert.ok(pages.fuentes.toLowerCase().includes(term.toLowerCase()),term);
  assert.ok(p0.includes('Ficha de evidencia'));
});
test('la guía de licencias impide redistribución sin autorización comprobada', () => {
  for (const term of ['licencia','permiso','Logos Bible Software','traducciones','imágenes','no se incorpora','atribución por sí sola']) assert.ok(pages.licencias.toLowerCase().includes(term.toLowerCase()),term);
  assert.ok(p0.includes('No publicar material licenciado sin autorización'));
});
test('las guías están enlazadas desde la página principal de fundamentos', () => {
  const home=readFileSync('src/pages/fundamentos/index.astro','utf8');
  for (const slug of Object.keys(pages)) assert.ok(home.includes("path: '"+slug+"/'"));
});

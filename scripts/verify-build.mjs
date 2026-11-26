import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const home = readFileSync('dist/index.html', 'utf8');
const missing = readFileSync('dist/404.html', 'utf8');
const guide = readFileSync('dist/design-system/index.html', 'utf8');

assert.match(home, /<html[^>]*lang="es"/);
assert.match(home, /<html[^>]*data-theme="light"/);
assert.ok(home.includes('<h1 id="hero-title">Scriptura Nexus</h1>'));
assert.match(home, /sn-card--editorial/);
assert.match(home, /sn-callout--info/);
assert.match(home, /data-appearance-theme/);
assert.match(home, /data-appearance-font-scale/);
assert.match(home, /data-appearance-reset/);
assert.match(home, /scriptura-nexus:appearance:v1/);
assert.ok(missing.includes('href="/Scriptura-Nexus/"'));
assert.match(guide, /Sistema de diseño/);
assert.match(guide, /sn-button--primary/);
assert.match(guide, /sn-badge--success/);
assert.doesNotMatch(home, /(?:href|src)="\/(?:_astro|assets)\//);
assert.ok(existsSync('dist/favicon.svg'));
assert.ok(existsSync('dist/brand/scriptura-mark.svg'));

console.log('HTML inicial, preferencias visuales, 404, guía de diseño, componentes y base de Pages: conformes.');

for (const [name, html] of [['inicio', home], ['404', missing], ['guía', guide]]) {
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, name + ': H1 único');
  assert.match(html, /<main[^>]*id="contenido"/);
  assert.match(html, /href="#contenido"/);
  assert.match(html, /data-appearance-panel/);
  assert.match(html, /<noscript>/);
}
assert.ok(guide.indexOf('<h1') < guide.indexOf('<h2'), 'Jerarquía inicial de la guía');
console.log('Estructura semántica y acceso alternativo: conformes.');

for (const [name, html] of [['inicio', home], ['404', missing], ['guía', guide]]) {
  assert.match(html, /<nav[^>]*aria-label="Navegación principal"/);
  assert.match(html, /<nav[^>]*aria-label="Navegación del pie de página"/);
  assert.match(html, /href="\/Scriptura-Nexus\/design-system\/"/);
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/')) continue;
    assert.ok(url.startsWith('/Scriptura-Nexus/'), name + ': base inválida ' + url);
    const relative = url.slice('/Scriptura-Nexus/'.length);
    assert.ok(existsSync('dist/' + relative + (relative === '' || relative.endsWith('/') ? 'index.html' : '')), name + ': destino inexistente ' + url);
  }
}
assert.match(home, /aria-current="page"/);
assert.doesNotMatch(guide, /aria-current="page"/);
console.log('Navegación compartida y destinos existentes: conformes.');

assert.equal((home.match(/class="[^"]*\bhome-module\b[^"]*"/g) || []).length >= 7, true);
assert.match(home, /id="modulos"/);
assert.match(home, /href="#modulos"/);
assert.match(home, /El buscador aún no está habilitado/);
assert.match(home, /Investigar, consultar y contrastar/);
console.log('Portada, áreas de acceso y estado del buscador: conformes.');

const modulePaths = ['fundamentos','estudios','biblioteca','historia','linguistica','biblia','manuscritos'];
for (const path of modulePaths) {
  const url = '/Scriptura-Nexus/' + path + '/';
  const html = readFileSync('dist/' + path + '/index.html', 'utf8');
  assert.ok(home.includes('href="' + url + '"'), 'Acceso desde portada: ' + path);
  if (path === 'fundamentos') {
    for (const label of ['18 perspectivas de análisis','20 secciones de investigación','SN-001','¿Tatuarse es pecado?','Ejemplo metodológico, no resultado','Criterios de evidencia y aplicación']) assert.ok(html.includes(label), label);
    assert.match(html, /Metodología base disponible/);
  } else {
    assert.match(html, /Contenido en preparación/);
    assert.match(html, /Recursos previstos/);
    assert.match(html, /Módulo en desarrollo/);
  }
  assert.match(html, /data-appearance-panel/);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/<a\b[^>]*aria-current="page"/g) || []).length, 1);
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith('/')) continue;
    assert.ok(href.startsWith('/Scriptura-Nexus/'));
    const relative = href.slice('/Scriptura-Nexus/'.length);
    assert.ok(existsSync('dist/' + relative + (relative === '' || relative.endsWith('/') ? 'index.html' : '')), 'Destino inexistente: ' + href);
  }
}
console.log('Siete rutas iniciales, estados vacíos y navegación: conformes.');

const fundamentals = readFileSync('dist/fundamentos/index.html', 'utf8');
const methodologyGuides = ['exegesis','hermeneutica','fuentes','licencias'];
for (const path of methodologyGuides) {
  const url = '/Scriptura-Nexus/fundamentos/' + path + '/';
  const html = readFileSync('dist/fundamentos/' + path + '/index.html', 'utf8');
  const title = {exegesis:'Exégesis bíblica',hermeneutica:'Hermenéutica bíblica',fuentes:'Fuentes y trazabilidad de evidencias',licencias:'Licencias y atribuciones'}[path];
  assert.ok(fundamentals.includes('href="' + url + '"'), 'Acceso desde fundamentos: ' + path);
  assert.ok(html.includes(title), 'Título de guía: ' + path);
  assert.match(html, /Guía metodológica/);
  assert.match(html, /aria-label="Recursos metodológicos relacionados"/);
  assert.match(html, /aria-label="Ruta de navegación"/);
  assert.match(html, /data-appearance-panel/);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith('/')) continue;
    assert.ok(href.startsWith('/Scriptura-Nexus/'), 'Base de Pages incorrecta: ' + href);
    const relative = href.slice('/Scriptura-Nexus/'.length);
    assert.ok(existsSync('dist/' + relative + (relative === '' || relative.endsWith('/') ? 'index.html' : '')), 'Destino inexistente: ' + href);
  }
}
console.log('Cuatro guías P4.2, enlaces de acceso, navegación y destinos: conformes.');


const glossary = readFileSync('dist/fundamentos/glosario/index.html', 'utf8');
assert.ok(fundamentals.includes('href="/Scriptura-Nexus/fundamentos/glosario/"'), 'Acceso al glosario desde fundamentos');
assert.match(glossary, /Glosario metodológico/);
assert.match(glossary, /Mapa de relaciones conceptuales/);
assert.match(glossary, /aria-label="Recursos metodológicos relacionados"/);
assert.match(glossary, /aria-label="Categorías del glosario"/);
assert.match(glossary, /data-appearance-panel/);
assert.equal((glossary.match(/<h1(?:\s|>)/g) || []).length, 1, 'Glosario: H1 único');
assert.equal((glossary.match(/aria-current="page"/g) || []).length, 1, 'Glosario: página actual');
const glossaryIds = [...glossary.matchAll(/\sid="(glo-\d{3})"/g)].map(match => match[1]);
assert.equal(glossaryIds.length, 70, 'Cantidad de entradas GLO');
assert.equal(new Set(glossaryIds).size, 70, 'IDs GLO únicos');
const glossaryIdSet = new Set(glossaryIds);
for (const match of glossary.matchAll(/href="#(glo-\d{3})"/g)) {
  assert.ok(glossaryIdSet.has(match[1]), 'Relación conceptual sin destino: ' + match[1]);
}
for (const path of methodologyGuides) {
  const html = readFileSync('dist/fundamentos/' + path + '/index.html', 'utf8');
  assert.ok(html.includes('href="/Scriptura-Nexus/fundamentos/glosario/"'), 'Acceso al glosario desde ' + path);
}
for (const match of glossary.matchAll(/href="([^"]+)"/g)) {
  const href = match[1];
  if (href.startsWith('#')) continue;
  if (!href.startsWith('/')) continue;
  assert.ok(href.startsWith('/Scriptura-Nexus/'), 'Base de Pages incorrecta en glosario: ' + href);
  const [relative, fragment] = href.slice('/Scriptura-Nexus/'.length).split('#');
  const target = 'dist/' + relative + (relative === '' || relative.endsWith('/') ? 'index.html' : '');
  assert.ok(existsSync(target), 'Destino interno inexistente en glosario: ' + href);
  if (fragment && relative === 'fundamentos/glosario/') {
    const targetHtml = readFileSync(target, 'utf8');
    assert.ok(targetHtml.includes('id="' + fragment + '"'), 'Ancla de glosario inexistente: ' + href);
  }
}
console.log('Glosario P4.3, 70 identificadores, relaciones, navegación y enlaces internos: conformes.');

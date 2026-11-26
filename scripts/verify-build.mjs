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
assert.match(home, /Fundamentos disponibles · P4 completada/);
console.log('Portada, áreas de acceso y estado del buscador: conformes.');

const modulePaths = ['fundamentos','estudios','biblioteca','historia','linguistica','biblia','manuscritos'];
for (const path of modulePaths) {
  const url = '/Scriptura-Nexus/' + path + '/';
  const html = readFileSync('dist/' + path + '/index.html', 'utf8');
  assert.ok(home.includes('href="' + url + '"'), 'Acceso desde portada: ' + path);
  if (path === 'fundamentos') {
    for (const label of ['18 perspectivas de análisis','20 secciones de investigación','SN-001','¿Tatuarse es pecado?','Ejemplo metodológico, no resultado','Criterios de evidencia y aplicación']) assert.ok(html.includes(label), label);
    assert.match(html, /Fundamentos metodológicos · P4 completada/);
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


// Auditoría P4.4: estructura semántica, enlaces y anclas en todas las páginas de fundamentos.
const fundamentalsPages = [
  ['fundamentos', 'dist/fundamentos/index.html'],
  ['exegesis', 'dist/fundamentos/exegesis/index.html'],
  ['hermeneutica', 'dist/fundamentos/hermeneutica/index.html'],
  ['fuentes', 'dist/fundamentos/fuentes/index.html'],
  ['licencias', 'dist/fundamentos/licencias/index.html'],
  ['glosario', 'dist/fundamentos/glosario/index.html']
];
for (const [name, file] of fundamentalsPages) {
  const html = readFileSync(file, 'utf8');
  assert.match(html, /<html[^>]*lang="es"/, name + ': idioma');
  assert.match(html, /<main[^>]*id="contenido"/, name + ': región principal');
  assert.match(html, /href="#contenido"/, name + ': enlace para saltar contenido');
  assert.match(html, /<nav[^>]*aria-label="Navegación principal"/, name + ': navegación principal');
  assert.match(html, /<nav[^>]*aria-label="Navegación del pie de página"/, name + ': navegación de pie');
  assert.match(html, /<nav[^>]*aria-label="Ruta de navegación"/, name + ': ruta de navegación');
  assert.match(html, /data-appearance-panel/, name + ': preferencias visuales');
  assert.equal((html.match(/<h1(?:\\s|>)/g) || []).length, 1, name + ': H1 único');
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, name + ': página actual única');

  const ids = [...html.matchAll(/\\sid="([^"]+)"/g)].map(match => match[1]);
  const idSet = new Set(ids);
  assert.equal(idSet.size, ids.length, name + ': IDs HTML únicos');

  for (const attribute of ['aria-labelledby', 'aria-describedby']) {
    for (const match of html.matchAll(new RegExp(attribute + '="([^"]+)"', 'g'))) {
      for (const id of match[1].split(/\\s+/)) {
        assert.ok(idSet.has(id), name + ': ' + attribute + ' sin destino: ' + id);
      }
    }
  }

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].replace(/&amp;/g, '&');
    if (href.startsWith('#')) {
      const fragment = decodeURIComponent(href.slice(1));
      assert.ok(idSet.has(fragment), name + ': ancla interna inexistente: ' + href);
      continue;
    }
    if (!href.startsWith('/Scriptura-Nexus/')) continue;
    const [relative, rawFragment] = href.slice('/Scriptura-Nexus/'.length).split('#');
    const targetFile = 'dist/' + relative + (relative === '' || relative.endsWith('/') ? 'index.html' : '');
    assert.ok(existsSync(targetFile), name + ': destino interno inexistente: ' + href);
    if (rawFragment) {
      const targetHtml = readFileSync(targetFile, 'utf8');
      const targetId = decodeURIComponent(rawFragment);
      assert.ok(targetHtml.includes('id="' + targetId + '"'), name + ': ancla de destino inexistente: ' + href);
    }
  }
}
console.log('P4.4: seis páginas de fundamentos, landmarks, referencias ARIA, IDs, rutas y anclas: conformes.');

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
assert.match(home, /Buscar investigaciones/);
assert.ok(home.includes('href="/Scriptura-Nexus/buscar/"'));
assert.match(home, /Investigar, consultar y contrastar/);
assert.match(home, /Fundamentos disponibles · P4.4 en revisión/);
console.log('Portada, áreas de acceso y estado del buscador: conformes.');

const modulePaths = ['fundamentos','estudios','biblioteca','historia','linguistica','biblia','manuscritos'];
for (const path of modulePaths) {
  const url = '/Scriptura-Nexus/' + path + '/';
  const html = readFileSync('dist/' + path + '/index.html', 'utf8');
  assert.ok(home.includes('href="' + url + '"'), 'Acceso desde portada: ' + path);
  if (path === 'fundamentos') {
    for (const label of ['18 perspectivas de análisis','20 secciones de investigación','SN-001','¿Tatuarse es pecado?','Ejemplo metodológico, no resultado','Criterios de evidencia y aplicación']) assert.ok(html.includes(label), label);
    assert.match(html, /Fundamentos metodológicos · P4.4 en revisión/);
  } else if (path === 'estudios') {
    assert.match(html, /Catálogo de investigaciones/);
    assert.match(html, /Ejes temáticos/);
  } else if (path === 'biblioteca') {
    assert.match(html, /Catálogo documental/);
  } else if (path === 'historia') {
    assert.match(html, /Testimonios históricos/);
  } else {
    assert.match(html, /Contenido en preparación/);
    assert.match(html, /Recursos previstos/);
    assert.match(html, /Módulo en desarrollo/);
  }
  assert.match(html, /data-appearance-panel/);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/<a[^>]*aria-current="page"/g) || []).length, 1);
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
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, name + ': H1 único');
  assert.equal((html.match(/<li aria-current="page"/g) || []).length, 1, name + ': ubicación actual en la ruta de navegación');
  assert.ok((html.match(/<a[^>]*aria-current="page"/g) || []).length <= 1, name + ': máximo un enlace actual en navegación principal');

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const idSet = new Set(ids);
  assert.equal(idSet.size, ids.length, name + ': IDs HTML únicos');

  for (const attribute of ['aria-labelledby', 'aria-describedby']) {
    for (const match of html.matchAll(new RegExp(attribute + '="([^"]+)"', 'g'))) {
      for (const id of match[1].split(/\s+/)) {
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

const catalogData = JSON.parse(readFileSync('src/data/catalogo/estudios.json','utf8')).items;
const axesData = JSON.parse(readFileSync('src/data/taxonomia/ejes.json','utf8')).items;
const catalogHtml = readFileSync('dist/estudios/index.html','utf8');
assert.equal([...catalogHtml.matchAll(/data-study-id="SN-\d{3}"/g)].length,42);
assert.match(catalogHtml,/id="catalog-axis"/);
assert.match(catalogHtml,/id="catalog-status"/);
assert.match(catalogHtml,/id="catalog-reset"/);
assert.match(catalogHtml,/role="status"/);
for (const item of [...axesData,...catalogData]) {
  const route = (item.id.startsWith('SN-')?'estudios/':'ejes/')+item.id+'/';
  assert.ok(catalogHtml.includes('href="/Scriptura-Nexus/'+route+'"'),route);
  const html=readFileSync('dist/'+route+'index.html','utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,route);
  assert.match(html,/data-appearance-panel/);
  assert.match(html,/aria-label="Ruta de navegación"/);
  if(item.id.startsWith('SN-')) {
    assert.match(html,/Ficha preliminar del catálogo/);
    assert.match(html,/Planificado/);
    for(const id of [item.primaryAxisId,...item.relatedAxisIds]) assert.ok(html.includes('href="/Scriptura-Nexus/ejes/'+id+'/"'));
  } else {
    if(!item.initialPlannedCount) assert.match(html,/aún no tiene investigaciones principales/);
    for(const s of catalogData.filter(s=>s.primaryAxisId===item.id||s.relatedAxisIds.includes(item.id))) assert.ok(html.includes('href="/Scriptura-Nexus/estudios/'+s.id+'/"'));
  }
  for(const [,href] of html.matchAll(/href="([^"]+)"/g)) {
    if(!href.startsWith('/')) continue;
    assert.ok(href.startsWith('/Scriptura-Nexus/'));
    const target=href.slice('/Scriptura-Nexus/'.length).split('#')[0];
    assert.ok(existsSync('dist/'+target+(target===''||target.endsWith('/')?'index.html':'')),href);
  }
}
assert.ok(!existsSync('dist/estudios/SN-999/index.html'));
assert.ok(!existsSync('dist/ejes/E99/index.html'));
console.log('P5.3: 14 ejes, 42 fichas, relaciones, filtros y enlaces estáticos conformes.');

const searchPage=readFileSync('dist/buscar/index.html','utf8');
const searchIndex=JSON.parse(readFileSync('dist/data/catalog-search.json','utf8'));
assert.equal(searchIndex.schemaVersion,1);
assert.equal(searchIndex.items.length,42);
assert.equal(new Set(searchIndex.items.map(x=>x.id)).size,42);
assert.ok(searchPage.includes('data-index="/Scriptura-Nexus/data/catalog-search.json"'));
assert.ok(catalogHtml.includes('href="/Scriptura-Nexus/buscar/"'));
assert.match(searchPage,/id="search-query"/);
assert.match(searchPage,/for="search-query"/);
assert.match(searchPage,/role="status"/);
assert.match(searchPage,/data-appearance-panel/);
assert.match(searchPage,/<noscript>/);
assert.equal((searchPage.match(/<h1(?:\s|>)/g)||[]).length,1);
for(const entry of searchIndex.items){
  assert.equal(entry.status,'planificado');
  assert.deepEqual(Object.keys(entry).sort(),['axis','id','question','status','terms','title']);
  const source=catalogData.find(x=>x.id===entry.id);
  assert.ok(source);
  assert.equal(entry.title,source.title);
  assert.equal(entry.question,source.question);
  assert.ok(existsSync('dist/estudios/'+entry.id+'/index.html'));
}
console.log('P5.4: índice público, 42 fichas, rutas y exclusión de contenido no autorizado: conformes.');

 
// P5.5: exhaustive output audit, without claiming browser accessibility certification.
const auditRoutes=['estudios/','buscar/',...axesData.map(a=>'ejes/'+a.id+'/'),...catalogData.map(s=>'estudios/'+s.id+'/')];
assert.equal(auditRoutes.length,58);
for(const route of auditRoutes){
  const html=readFileSync('dist/'+route+'index.html','utf8');
  assert.match(html,/<html[^>]*lang="es"/,route);
  assert.match(html,/<main[^>]*id="contenido"/,route);
  assert.match(html,/href="#contenido"/,route);
  assert.match(html,/aria-label="Navegación principal"/,route);
  assert.match(html,/aria-label="Navegación del pie de página"/,route);
  assert.match(html,/data-appearance-panel/,route);
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,route);
  assert.equal((html.match(/<li aria-current="page"/g)||[]).length,1,route);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  const unique=new Set(ids);assert.equal(unique.size,ids.length,route+' IDs');
  for(const [,refs] of html.matchAll(/(?:aria-labelledby|aria-describedby|\sfor)="([^"]+)"/g))
    for(const id of refs.split(/\s+/))assert.ok(unique.has(id),route+' referencia '+id);
  for(const [,raw] of html.matchAll(/href="([^"]+)"/g)){
    const href=raw.replace(/&amp;/g,'&');
    if(href.startsWith('#')){assert.ok(unique.has(decodeURIComponent(href.slice(1))),route+' ancla '+href);continue;}
    if(!href.startsWith('/'))continue;
    assert.ok(href.startsWith('/Scriptura-Nexus/'),route+' base '+href);
    const [relative,fragment]=href.slice('/Scriptura-Nexus/'.length).split('#');
    const target='dist/'+relative+(relative===''||relative.endsWith('/')?'index.html':'');
    assert.ok(existsSync(target),route+' destino '+href);
    if(fragment)assert.ok(readFileSync(target,'utf8').includes('id="'+decodeURIComponent(fragment)+'"'),href);
  }
}
const listIds=html=>[...html.matchAll(/data-study-id="(SN-\d{3})"/g)].map(m=>m[1]).sort();
assert.deepEqual(listIds(catalogHtml),catalogData.map(s=>s.id).sort());
for(const a of axesData){
  const html=readFileSync('dist/ejes/'+a.id+'/index.html','utf8');
  const primary=catalogData.filter(s=>s.primaryAxisId===a.id).map(s=>s.id).sort();
  const related=catalogData.filter(s=>s.relatedAxisIds.includes(a.id)).map(s=>s.id).sort();
  const primarySection=html.split('id="principales"')[1].split('</section>')[0];
  const relatedSection=html.split('id="relacionadas"')[1].split('</section>')[0];
  assert.deepEqual(listIds(primarySection),primary,a.id+' principales');
  assert.deepEqual(listIds(relatedSection),related,a.id+' relacionados');
}
assert.deepEqual(searchIndex.items.map(x=>x.id).sort(),catalogData.map(x=>x.id).sort());
for(const x of catalogData.filter(x=>x.referenceSelectionPending)){
  const html=readFileSync('dist/estudios/'+x.id+'/index.html','utf8');
  assert.ok(html.includes(x.referenceSelectionPending),x.id+' selección pendiente');
}
assert.match(searchPage,/role="search"/);
assert.match(searchPage,/id="search-more"/);
assert.match(searchPage,/aria-live="polite"/);
assert.match(catalogHtml,/aria-live="polite"/);
console.log('P5.5: auditoría de 58 páginas, 42 fichas únicas, 70 relaciones, referencias ARIA, enlaces e índice conforme.');

 
// P6.2: pending public templates, no draft body.
for(const study of catalogData){
  const html=readFileSync('dist/estudios/'+study.id+'/index.html','utf8');
  assert.match(html,/Estructura de la investigación/);
  assert.match(html,/aria-label="Índice de secciones de investigación"/);
  assert.equal([...html.matchAll(/data-section-state="pendiente"/g)].length,20,study.id);
  const sectionIds=[...html.matchAll(/data-section-id="([^"]+)"/g)].map(m=>m[1]);
  const expected=Array.from({length:20},(_,i)=>study.id+'/S'+String(i+1).padStart(2,'0'));
  assert.deepEqual(sectionIds,expected);
  for(let i=1;i<=20;i++){const anchor='seccion-'+String(i).padStart(2,'0');assert.ok(html.includes('id="'+anchor+'"'));assert.ok(html.includes('href="#'+anchor+'"'));}
  assert.doesNotMatch(html,/PRUEBA SINTÉTICA|synthetic-only/);
}
console.log('P6.2: 42 plantillas, 840 secciones pendientes, índice y anclas conformes; sin cuerpos sintéticos.');

for(const study of catalogData){
 const html=readFileSync('dist/estudios/'+study.id+'/index.html','utf8');
 assert.match(html,/Relaciones de investigación/);
 assert.match(html,/no constituyen relaciones doctrinales/);
 assert.doesNotMatch(html,/PRUEBA SINTÉTICA|EVD-900001|AF-900001|POS-900001/);
 const ids=new Set([study.primaryAxisId,...study.relatedAxisIds]);
 for(const other of catalogData.filter(s=>s.id!==study.id&&[s.primaryAxisId,...s.relatedAxisIds].some(id=>ids.has(id)))){
  assert.ok(html.includes('href="/Scriptura-Nexus/estudios/'+other.id+'/"'),study.id+' relación '+other.id);
 }
}
console.log('P6.3: relaciones taxonómicas en 42 fichas; sin evidencias o posturas sintéticas.');

const publicationRegistry=JSON.parse(readFileSync('src/data/publicaciones/registro.json','utf8'));
assert.equal(publicationRegistry.schemaVersion,1);
assert.equal(publicationRegistry.snapshots.length,0);
for(const study of catalogData){
 const html=readFileSync('dist/estudios/'+study.id+'/index.html','utf8');
 assert.match(html,/Sin versión aprobada/);
 assert.doesNotMatch(html,/PRUEBA SINTÉTICA P6\.4|study-approved-body|id="argumentos-titulo"/);
}
assert.ok(!existsSync('dist/editorial-private'));
assert.ok(!existsSync('dist/drafts'));
assert.doesNotMatch(JSON.stringify(searchIndex),/PRUEBA SINTÉTICA|EVD-900001/);
console.log('P6.4: registro inicial vacío, 42 fichas sin versión aprobada, sin borradores en rutas ni índice.');

// P6.5.2: actual production HTML and synthetic-data isolation.
let auditedPositions=0;
for(const study of catalogData){
 const html=readFileSync('dist/estudios/'+study.id+'/index.html','utf8');
 const sections=[...html.matchAll(/<section[^>]*data-section-id="([^"]+)"[^>]*>/g)];
 assert.equal(sections.length,20,study.id);auditedPositions+=sections.length;
 for(let i=1;i<=20;i++){const anchor='seccion-'+String(i).padStart(2,'0');assert.ok(html.includes('id="'+anchor+'-titulo"'));assert.ok(html.includes('aria-labelledby="'+anchor+'-titulo"'));}
 assert.equal((html.match(/href="#indice-secciones"/g)||[]).length,20);
 assert.doesNotMatch(html,/PRUEBA SINTÉTICA P6\.5\.2/);
}
assert.equal(auditedPositions,840);
assert.doesNotMatch(JSON.stringify(searchIndex),/PRUEBA SINTÉTICA P6\.5\.2/);
console.log('P6.5.2: 840 posiciones HTML, títulos, anclas de retorno y aislamiento de fixtures conformes.');

// P6.5.3: no synthetic editorial relations in production pages or search.
for(const study of catalogData){
 const html=readFileSync('dist/estudios/'+study.id+'/index.html','utf8');
 assert.doesNotMatch(html,/PRUEBA SINTÉTICA P6\.5\.3|id="rel-(?:AF|EVD|POS|CON)-/);
 const expected=new Set([study.primaryAxisId,...study.relatedAxisIds]);
 const related=catalogData.filter(t=>t.id!==study.id&&[t.primaryAxisId,...t.relatedAxisIds].some(id=>expected.has(id))).map(t=>t.id).sort();
 const section=html.split('aria-labelledby="relaciones-titulo"')[1].split('</section>')[0];
 const actual=[...section.matchAll(/href="\/Scriptura-Nexus\/estudios\/(SN-\d{3})\/"/g)].map(m=>m[1]).sort();
 assert.deepEqual(actual,related,study.id+' vínculos taxonómicos exactos');
}
assert.doesNotMatch(JSON.stringify(searchIndex),/PRUEBA SINTÉTICA P6\.5\.3|POS-90000/);
console.log('P6.5.3: relaciones exactas de 42 fichas y exclusión de trazas sintéticas.');

// P6.5.4: scan the entire publishable output, not only study pages.
const {readdirSync}=await import('node:fs');
const {execFileSync}=await import('node:child_process');
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const privatePath=/(?:^|\/)(?:editorial-private|drafts|fixtures|tests)(?:\/|$)/i;
for(const file of tracked)assert.ok(!/(?:^|\/)(?:editorial-private|drafts)(?:\/|$)/i.test(file),'ruta privada versionada: '+file);
let auditedOutput=0;
for(const file of readdirSync('dist',{recursive:true,withFileTypes:true})){
 const path=file.parentPath+'/'+file.name;
 assert.ok(!privatePath.test(path),'ruta no publicable: '+path);
 assert.ok(!file.isSymbolicLink(),'enlace simbólico en salida: '+path);
 if(!file.isFile())continue;
 auditedOutput++;
 if(/\.(?:html?|json|js|mjs|css|txt|xml|svg|map|md|csv|webmanifest)$/i.test(file.name)){
  const content=readFileSync(path,'utf8');assert.doesNotMatch(content,/PRUEBA SINTÉTICA|synthetic-only|EVD-90000[1-3]|AF-90000[1-2]|POS-90000[1-6]/,path);
 }
}
assert.ok(auditedOutput>0);
console.log('P6.5.4: '+auditedOutput+' archivos de salida auditados; rutas privadas, fixtures y marcadores excluidos.');

// P7.1: bibliography contracts only; no public data or premature admission.
const {validateBibliography}=await import('../src/lib/bibliography-contracts.ts');
const bibliographyData=JSON.parse(readFileSync('src/data/referencias/biblioteca.json','utf8'));
const bibliographyTraditions=JSON.parse(readFileSync('src/data/taxonomia/tradiciones.json','utf8')).items.map(t=>t.id);
assert.deepEqual(validateBibliography(bibliographyData,bibliographyTraditions),[]);
assert.equal(bibliographyData.works.length,6);
assert.ok(bibliographyData.resources.every(r=>r.kind==='consulta_externa'&&r.admission==='en_revision'&&!r.filePath&&!r.checksum));
assert.equal(bibliographyData.evidence.length,0);
assert.equal(bibliographyData.licenses.length,1);
assert.equal(publicationRegistry.snapshots.length,0);
console.log('P7.2: seis cadenas documentales verificadas estructuralmente; sin archivos, permisos ni publicación real.');

// P7.3: real static documentary navigation and safe metadata projection.
const libraryHtml=readFileSync('dist/biblioteca/index.html','utf8');
const historyHtml=readFileSync('dist/historia/index.html','utf8');
assert.equal((libraryHtml.match(/data-document-id="/g)||[]).length,6);
for(const id of ['library-query','library-tradition','library-type','library-language','library-reset','library-count'])assert.ok(libraryHtml.includes('id="'+id+'"'));
for(const e of bibliographyData.editions){
 const relative='biblioteca/documentos/'+e.id+'/';const html=readFileSync('dist/'+relative+'index.html','utf8');
 assert.ok(libraryHtml.includes('href="/Scriptura-Nexus/'+relative+'"'));assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 assert.ok(html.includes('href="'+e.url.replaceAll('&','&amp;')+'"'));assert.match(html,/Referencia bibliográfica/);assert.match(html,/No se aloja el texto completo/);
}
for(const a of bibliographyData.authors){const relative='biblioteca/autores/'+a.id+'/';assert.ok(libraryHtml.includes('href="/Scriptura-Nexus/'+relative+'"'));const html=readFileSync('dist/'+relative+'index.html','utf8');assert.match(html,/Atribución documentada/);assert.match(html,/Obras registradas/);}
assert.ok(historyHtml.includes('/Scriptura-Nexus/biblioteca/documentos/BIB-000005/'));
assert.ok(glossary.includes('href="/Scriptura-Nexus/biblioteca/"'));
assert.ok(libraryHtml.includes('href="/Scriptura-Nexus/fundamentos/glosario/"'));
for(const html of [libraryHtml,historyHtml])assert.doesNotMatch(html,/PRUEBA SINTÉTICA|example\.invalid/);
console.log('P7.3: 6 fichas documentales, 6 de autor, catálogo, historia y glosario enlazados.');

const {validatePermissions,publicationAdmissions}=await import('../src/lib/source-permissions.ts');
const permissionData=JSON.parse(readFileSync('src/data/referencias/permisos.json','utf8'));
assert.deepEqual(validatePermissions(permissionData,bibliographyData),[]);assert.deepEqual(publicationAdmissions(bibliographyData,permissionData),[]);
const permissionHtml=readFileSync('dist/biblioteca/permisos/index.html','utf8');assert.match(permissionHtml,/CC BY 4\.0/);assert.ok(libraryHtml.includes('href="/Scriptura-Nexus/biblioteca/permisos/"'));assert.equal((permissionHtml.match(/Decisión editorial: pendiente/g)||[]).length,6);
console.log('P7.4: seis decisiones, una licencia documentada, cero admisiones editoriales reales.');

// P7.5: audit documentary cross-links and public artifact restrictions.
for(const e of bibliographyData.editions){
 const html=readFileSync('dist/biblioteca/documentos/'+e.id+'/index.html','utf8');
 assert.ok(html.includes('href="/Scriptura-Nexus/biblioteca/permisos/"'));
 const work=bibliographyData.works.find(w=>w.id===e.workId);
 for(const c of work.contributors){const author=readFileSync('dist/biblioteca/autores/'+c.authorId+'/index.html','utf8');assert.ok(html.includes('href="/Scriptura-Nexus/biblioteca/autores/'+c.authorId+'/"'));assert.ok(author.includes('href="/Scriptura-Nexus/biblioteca/documentos/'+e.id+'/"'));}
 assert.ok(permissionHtml.includes('href="/Scriptura-Nexus/biblioteca/documentos/'+e.id+'/"'));
}
for(const file of readdirSync('dist',{recursive:true,withFileTypes:true}))if(file.isFile())assert.doesNotMatch(file.name,/\.(?:pdf|epub|mobi|docx?|zip|7z|rar)$/i,'archivo documental no admitido: '+file.name);
console.log('P7.5: trazabilidad recíproca, permisos, ausencia de archivos documentales y cero publicaciones reales conformes.');

// P8.2.1: no linguistic content until admitted imports are implemented.
const {readAdmissions}=await import('./lib/linguistic-admission.mjs');
const {validateLinguisticRegistry}=await import('../src/lib/linguistic-contracts.ts');
const linguisticRegistry=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));
assert.deepEqual(validateLinguisticRegistry(linguisticRegistry,readAdmissions()),[]);
for(const [key,value] of Object.entries(linguisticRegistry))if(key!=='schemaVersion')assert.deepEqual(value,[]);
assert.ok(!existsSync('dist/data/linguistica/'));
console.log('P8.2.1: contratos lingüísticos válidos, registro vacío y sin publicación de corpus.');

// P8.3.4: public interface, no linguistic corpus publication.
const analyzerHtml=readFileSync('dist/linguistica/analizador/index.html','utf8');
const linguisticsHtml=readFileSync('dist/linguistica/index.html','utf8');
assert.ok(linguisticsHtml.includes('href="/Scriptura-Nexus/linguistica/analizador/"'));
assert.ok(analyzerHtml.includes('href="/Scriptura-Nexus/linguistica/"'));
assert.equal((analyzerHtml.match(/<h1(?:\s|>)/g)||[]).length,1);
assert.match(analyzerHtml,/No hay ediciones lingüísticas publicadas/);
assert.match(analyzerHtml,/<fieldset[^>]*id="ta-fields"[^>]*disabled/);
assert.match(analyzerHtml,/<select[^>]*id="ta-occurrence"[^>]*disabled/);
assert.match(analyzerHtml,/<noscript>/);
for(const id of ['ta-edition','ta-book','ta-chapter','ta-verse','ta-occurrence'])assert.ok(analyzerHtml.includes('for="'+id+'"')&&analyzerHtml.includes('id="'+id+'"'));
const analyzerIds=[...analyzerHtml.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(analyzerIds).size,analyzerIds.length);
for(const m of analyzerHtml.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g))for(const id of m[1].split(/\s+/))assert.ok(analyzerIds.includes(id),'ARIA sin destino');
for(const id of ['ta-status','ta-result-status'])assert.match(analyzerHtml,new RegExp('id="'+id+'"[^>]*role="status"[^>]*aria-live="polite"'));
assert.doesNotMatch(analyzerHtml,/LING-01[0-4]|TOK-demo|TXT-demo/);
for(const file of readdirSync('dist',{recursive:true,withFileTypes:true}))if(file.isFile()&&/\.(?:html?|json|js|mjs|xml|txt|map)$/i.test(file.name)){
 const content=readFileSync(file.parentPath+'/'+file.name,'utf8');
 assert.doesNotMatch(content,/TOK-demo[123]|TXT-demo[123]|LING-demo|candidatos-griegos-p83\.json|85-3Jn-morphgnt\.txt|wlc\/Gen\.xml|wlc\/Dan\.xml/,'Material no publicable: '+file.name);
}
console.log('P8.3.4: interfaz enlazada, estado vacío, controles deshabilitados, etiquetas ARIA y ausencia de corpus/fixtures.');

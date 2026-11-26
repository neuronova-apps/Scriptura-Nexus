import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { perspectives, studySections, evidenceGrades, editorialStages } from '../src/lib/methodology.ts';
import { glossaryCategories, glossaryTerms } from '../src/lib/glossary.ts';

const p04 = readFileSync('docs/P0/04-metodologia.md','utf8');
const p06 = readFileSync('docs/P0/06-arquitectura.md','utf8');
const p07 = readFileSync('docs/P0/07-modelo-datos.md','utf8');
const p08 = readFileSync('docs/P0/08-plan-validacion.md','utf8');
const p41 = readFileSync('docs/P4/01-contenido-base.md','utf8');
const p42 = readFileSync('docs/P4/02-guias-metodologicas.md','utf8');
const p43 = readFileSync('docs/P4/03-glosario-y-navegacion-conceptual.md','utf8');
const home = readFileSync('src/pages/fundamentos/index.astro','utf8');
const guideLayout = readFileSync('src/components/methodology/MethodologyGuide.astro','utf8');
const glossaryPage = readFileSync('src/pages/fundamentos/glosario.astro','utf8');
const glossarySource = readFileSync('src/lib/glossary.ts','utf8');
const baseLayout = readFileSync('src/layouts/BaseLayout.astro','utf8');
const brandCss = readFileSync('src/styles/brand.css','utf8');
const componentCss = readFileSync('src/styles/components.css','utf8');
const moduleCss = readFileSync('src/styles/modules.css','utf8');
const methodologyCss = readFileSync('src/styles/methodology.css','utf8');
const guideCss = readFileSync('src/styles/methodology-guides.css','utf8');
const glossaryCss = readFileSync('src/styles/glossary.css','utf8');
const tokensCss = readFileSync('src/styles/design-tokens.css','utf8');

const guideFiles = {
  exegesis: 'src/pages/fundamentos/exegesis.astro',
  hermeneutica: 'src/pages/fundamentos/hermeneutica.astro',
  fuentes: 'src/pages/fundamentos/fuentes.astro',
  licencias: 'src/pages/fundamentos/licencias.astro',
  glosario: 'src/pages/fundamentos/glosario.astro'
};
const guidePages = Object.fromEntries(Object.entries(guideFiles).map(([key,path]) => [key,readFileSync(path,'utf8')]));

test('P4 conserva la matriz metodológica canónica de P0.4', () => {
  assert.equal(perspectives.length,18);
  assert.equal(studySections.length,20);
  assert.equal(evidenceGrades.length,5);
  assert.equal(editorialStages.length,5);
  assert.equal(editorialStages.at(-1),'Publicado');
  perspectives.forEach((item,index) => {
    assert.equal(item.id,'M'+String(index+1).padStart(2,'0'));
    assert.ok(p04.includes('| '+item.id+' | '+item.name+' | '+item.question+' |'));
  });
  studySections.forEach((item,index) => assert.ok(p04.includes('| '+String(index+1).padStart(2,'0')+' | '+item+' |')));
  evidenceGrades.forEach(item => assert.ok(p04.includes('| '+item.name+' |')));
});

test('P4.1, P4.2 y P4.3 mantienen el alcance editorial y las reservas aprobadas', () => {
  assert.match(p41,/18 perspectivas/);
  assert.match(p41,/20 secciones/);
  assert.match(p41,/no como estudio publicado ni conclusión doctrinal/i);
  assert.match(p42,/Cuatro guías de consulta/);
  assert.match(p42,/No se inventan límites numéricos de citas/);
  assert.match(p42,/no se ofrece dictamen jurídico/i);
  assert.match(p43,/70 conceptos/);
  assert.match(p43,/no es un léxico hebreo, arameo o griego/i);
  assert.match(p43,/no modifica el modelo de entidades de P0\.7/i);
});

test('las cinco guías y recursos están vinculados desde Fundamentos con nombres de enlace identificables', () => {
  for (const [slug,page] of Object.entries(guidePages)) {
    assert.ok(home.includes("path: '"+slug+"/'"),slug);
    assert.ok(page.includes('MethodologyGuide'),slug);
  }
  assert.match(home,/Consultar \{item\.title\.toLowerCase\(\)\}/);
  const labels = Object.values(guidePages).map(page => {
    const match = page.match(/title="([^"]+)"/);
    return match?.[1];
  });
  assert.equal(new Set(labels).size,5);
});

test('el estado de Fundamentos identifica la fase P4 completada sin anunciar trabajo pendiente de P4', () => {
  assert.match(home,/Fundamentos metodológicos · P4 completada/);
  assert.doesNotMatch(home,/Metodología base disponible · En ampliación/);
  assert.match(home,/SN-001 · E09 Conducta y vida cristiana · Planificado/);
  assert.match(home,/Ejemplo metodológico, no resultado/);
  assert.match(home,/permanece pendiente de investigación/);
});

test('la navegación compartida permite recorrer las cuatro guías y el glosario', () => {
  for (const slug of ['exegesis','hermeneutica','fuentes','licencias','glosario']) {
    assert.ok(guideLayout.includes("path: '"+slug+"/'"),slug);
    assert.ok(home.includes("path: '"+slug+"/'"),slug);
  }
  assert.match(guideLayout,/aria-label="Ruta de navegación"/);
  assert.match(guideLayout,/aria-label="Recursos metodológicos relacionados"/);
  assert.match(guideLayout,/aria-current="page"/);
  assert.match(glossaryPage,/aria-label="Categorías del glosario"/);
});

test('el glosario conserva sus 70 identificadores y todas sus relaciones', () => {
  assert.equal(glossaryTerms.length,70);
  assert.equal(new Set(glossaryTerms.map(item=>item.id)).size,70);
  assert.equal(glossaryCategories.length,4);
  for (const category of glossaryCategories) {
    assert.ok(glossaryTerms.some(item=>item.category===category.id),category.id);
  }
  const byId = new Map(glossaryTerms.map(item=>[item.id,item]));
  for (const item of glossaryTerms) {
    assert.ok(item.term.trim() && item.definition.trim(),item.id);
    assert.ok(glossaryCategories.some(category=>category.id===item.category),item.id);
    assert.ok(item.relatedIds.length>0,item.id);
    for (const id of item.relatedIds) assert.ok(byId.has(id),item.id+' -> '+id);
    for (const method of item.methodRefs) assert.ok(perspectives.some(p=>p.id===method),item.id+' '+method);
    for (const guide of item.guideRefs) assert.ok(guideFiles[guide],item.id+' '+guide);
    assert.deepEqual(item.evidenceIds,[],item.id+' evidencia no investigada');
    assert.deepEqual(item.disciplines,[],item.id+' disciplina no asignada');
  }
});

test('las referencias documentales del glosario existen y las rutas generales P7/P8 se conservan', () => {
  const block = glossarySource.match(/const sourceRefs = \[([\s\S]*?)\];/);
  assert.ok(block,'sourceRefs');
  const refs = [...block[1].matchAll(/'([^']+)'/g)].map(match=>match[1]);
  assert.ok(refs.length>=4);
  for (const path of refs) assert.ok(existsSync(path),path);
  assert.match(p07,/ENT35 \| Concepto de glosario \| GLO-/);
  assert.match(p06,/\| Glosario y léxicos \| \/glosario\/ y \/lexicos\/ \| P7\/P8 \|/);
  assert.match(p43,/\/fundamentos\/glosario\//);
  assert.match(p43,/\/glosario\//);
  assert.doesNotMatch(p06,/\/fundamentos\/glosario\/ \| P7/);
});

test('el contrato editorial de fuentes, licencias y uso de herramientas no se contradice', () => {
  assert.match(guidePages.fuentes,/no constituye una fuente primaria/i);
  assert.match(guidePages.fuentes,/Logos es una herramienta de consulta externa/);
  assert.match(guidePages.fuentes,/APA 7/);
  assert.match(guidePages.licencias,/la atribución identifica la procedencia, pero no sustituye una licencia o autorización/i);
  assert.match(guidePages.licencias,/no publicar el archivo/i);
  assert.match(p08,/QA-05 \| Evidencia y referencias/);
  assert.match(p08,/QA-07 \| Licencias y atribuciones/);
});

test('las páginas heredan estructura semántica, idioma, navegación y controles de apariencia', () => {
  assert.match(baseLayout,/<html lang="es"/);
  assert.match(baseLayout,/<a class="skip" href="#contenido">/);
  assert.match(baseLayout,/<main id="contenido" class="site-main" tabindex="-1">/);
  assert.match(baseLayout,/data-appearance-panel/);
  assert.match(baseLayout,/aria-live="polite"/);
  assert.match(brandCss,/:focus-visible/);
  assert.match(brandCss,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(brandCss,/@media \(forced-colors: active\)/);
  assert.match(componentCss,/:focus-visible/);
  assert.match(moduleCss,/min-width: 0/);
});

test('las hojas de estilo de P4 contemplan reflujo y adaptación a pantallas estrechas', () => {
  assert.match(guideCss,/@media \(max-width:600px\)/);
  assert.match(guideCss,/grid-template-columns/);
  assert.match(glossaryCss,/@media \(max-width:600px\)/);
  assert.match(glossaryCss,/minmax\(min\(100%,24rem\),1fr\)/);
  assert.match(glossaryCss,/overflow-wrap:anywhere/);
  assert.match(methodologyCss,/min\(100%,15rem\)/);
  assert.match(brandCss,/width: min\(100% - 1\.5rem/);
});

function blockFor(selector) {
  const start = tokensCss.indexOf(selector);
  assert.notEqual(start,-1,'selector de tema '+selector);
  const end = tokensCss.indexOf('\n}',start);
  return tokensCss.slice(start,end+2);
}
const themeBlocks = {
  light: blockFor(':root {'),
  dark: blockFor(':root[data-theme="dark"] {'),
  contrastLight: blockFor(':root[data-theme="contrast-light"] {'),
  contrastDark: blockFor(':root[data-theme="contrast-dark"] {')
};
function rawToken(block,name) {
  const match = block.match(new RegExp('--sn-'+name+':\\s*([^;]+);'));
  return match?.[1].trim();
}
function token(block,name,seen=new Set()) {
  if (seen.has(name)) throw new Error('Ciclo de tokens: '+name);
  seen.add(name);
  const value = rawToken(block,name) ?? rawToken(themeBlocks.light,name);
  assert.ok(value,'token no definido: '+name);
  const alias = value.match(/^var\(--sn-([a-z0-9-]+)\)$/);
  if (alias) return token(block,alias[1],seen);
  assert.match(value,/^#[0-9a-f]{6}$/i,'color no resuelto: '+name+'='+value);
  return value;
}
function luminance(hex) {
  const channels = [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  return 0.2126*channels[0]+0.7152*channels[1]+0.0722*channels[2];
}
function contrast(foreground,background) {
  const [high,low]=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);
  return (high+0.05)/(low+0.05);
}

test('los pares de texto y controles de los cuatro temas alcanzan contraste WCAG AA', () => {
  const pairs = [
    ['ink','paper'],['muted','surface'],['navy','surface'],['gold-dark','surface'],
    ['info-ink','info-bg'],['success-ink','success-bg'],['warning-ink','warning-bg'],['neutral-ink','neutral-bg'],
    ['button-primary-text','button-primary-bg'],['button-primary-text','button-primary-hover-bg'],
    ['button-secondary-text','button-secondary-bg'],['button-secondary-text','button-secondary-hover-bg'],
    ['skip-text','skip-bg']
  ];
  for (const [theme,block] of Object.entries(themeBlocks)) {
    for (const [foreground,background] of pairs) {
      const value=contrast(token(block,foreground),token(block,background));
      assert.ok(value>=4.5,theme+' '+foreground+'/'+background+' = '+value.toFixed(2));
    }
    assert.ok(contrast(token(block,'focus'),token(block,'surface'))>=3,theme+' indicador de foco');
    assert.ok(contrast(token(block,'control-border'),token(block,'surface'))>=3,theme+' borde de control');
  }
});

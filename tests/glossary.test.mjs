import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glossaryCategories, glossaryTerms } from '../src/lib/glossary.ts';

const byId = new Map(glossaryTerms.map(item => [item.id, item]));
const page = readFileSync('src/pages/fundamentos/glosario.astro','utf8');
const methodology = readFileSync('docs/P0/04-metodologia.md','utf8');
const dataModel = readFileSync('docs/P0/07-modelo-datos.md','utf8');

test('el glosario inicial conserva 70 identificadores GLO únicos y estables', () => {
  assert.equal(glossaryTerms.length,70);
  assert.equal(new Set(glossaryTerms.map(item => item.id)).size,70);
  glossaryTerms.forEach((item,index) => {
    assert.equal(item.id,'GLO-'+String(index+1).padStart(3,'0'));
    assert.ok(item.term.trim().length > 0);
    assert.ok(item.definition.trim().length > 0);
    assert.equal(item.schemaVersion,1);
  });
});

test('las categorías están definidas y todas contienen términos', () => {
  assert.equal(glossaryCategories.length,4);
  assert.equal(new Set(glossaryCategories.map(item => item.id)).size,4);
  for (const category of glossaryCategories) {
    assert.ok(category.title);
    assert.ok(category.description);
    assert.ok(glossaryTerms.some(item => item.category === category.id),category.id);
  }
  for (const item of glossaryTerms) {
    assert.ok(glossaryCategories.some(category => category.id === item.category),item.id);
  }
});

test('las relaciones conceptuales apuntan a términos existentes y no a sí mismos', () => {
  for (const item of glossaryTerms) {
    assert.ok(item.relatedIds.length > 0,item.id);
    assert.equal(new Set(item.relatedIds).size,item.relatedIds.length,item.id);
    for (const relatedId of item.relatedIds) {
      assert.ok(byId.has(relatedId),item.id+' -> '+relatedId);
      assert.notEqual(relatedId,item.id);
    }
  }
});

test('los vínculos metodológicos y las fuentes internas son válidos', () => {
  const methods = new Set(Array.from({length:18},(_,i)=>'M'+String(i+1).padStart(2,'0')));
  const guides = new Set(['exegesis','hermeneutica','fuentes','licencias']);
  for (const item of glossaryTerms) {
    for (const method of item.methodRefs) assert.ok(methods.has(method),item.id+' '+method);
    for (const guide of item.guideRefs) assert.ok(guides.has(guide),item.id+' '+guide);
    assert.ok(item.sourceRefs.includes('docs/P0/07-modelo-datos.md'),item.id);
    assert.deepEqual(item.evidenceIds,[],item.id+' no debe inventar evidencias');
    assert.deepEqual(item.disciplines,[],item.id+' no debe confundir categorías con disciplinas');
  }
});

test('Strong, lema, morfología y significado contextual no se confunden', () => {
  assert.match(byId.get('GLO-028').definition,/no constituye un análisis morfológico/i);
  assert.match(byId.get('GLO-028').definition,/ni determina por sí solo el significado contextual/i);
  assert.match(byId.get('GLO-027').definition,/No es lo mismo que una ocurrencia, una raíz ni un identificador Strong/i);
  assert.match(byId.get('GLO-031').definition,/sistema de etiquetado/i);
  assert.match(byId.get('GLO-035').definition,/morfología, la sintaxis y el contexto/i);
  assert.match(byId.get('GLO-036').definition,/no debe usarse por sí solo para deducir el significado/i);
  assert.match(byId.get('GLO-037').definition,/no determina automáticamente el significado/i);
});

test('las definiciones de intertextualidad distinguen cita, alusión y paralelo', () => {
  assert.match(byId.get('GLO-014').definition,/cita, alusión probable, paralelo temático/i);
  assert.match(byId.get('GLO-016').definition,/una semejanza aislada no basta/i);
  assert.match(byId.get('GLO-017').definition,/no demuestra por sí misma/i);
});

test('las definiciones de fuentes distinguen evidencia, inferencia, respaldo y derechos', () => {
  assert.match(byId.get('GLO-061').definition,/respalda, cuestiona o contextualiza/i);
  assert.match(byId.get('GLO-066').definition,/no aparece formulada directamente/i);
  assert.match(byId.get('GLO-067').definition,/no son porcentajes ni puntuaciones estadísticas/i);
  assert.match(byId.get('GLO-068').definition,/usos permitidos y las restricciones/i);
  assert.match(byId.get('GLO-069').definition,/no reemplaza la autorización o licencia/i);
});

test('el glosario mantiene correspondencia con el modelo conceptual P0.7 y la metodología P0.4', () => {
  assert.match(dataModel,/ENT35 \| Concepto de glosario \| GLO-/);
  assert.match(dataModel,/Estudio \| examina \| Pasaje/);
  assert.match(dataModel,/Lema \| se vincula con \| Identificador léxico/);
  assert.match(dataModel,/Afirmación \| respalda\/refuta\/contextualiza \| Evidencia/);
  assert.match(methodology,/M01 \| Textual/);
  assert.match(methodology,/M10 \| Exegética/);
  assert.match(methodology,/M11 \| Hermenéutica/);
});

test('la página incorpora mapa conceptual, categorías, enlaces relacionados y límites', () => {
  for (const label of ['Mapa de relaciones conceptuales','Índice por categorías','Conceptos relacionados','Perspectivas','Ampliar','glosario metodológico inicial','no incorpora corpus bíblicos']) {
    assert.ok(page.includes(label),label);
  }
  assert.match(page,/aria-label="Categorías del glosario"/);
  assert.match(page,/aria-labelledby="mapa-conceptual"/);
  assert.match(page,/glossaryTermId\(relatedItem\.id\)/);
});

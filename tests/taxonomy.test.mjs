import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { validateTaxonomy, loadTaxonomy } from '../scripts/validate-taxonomy.mjs';
import { perspectives } from '../src/lib/methodology.ts';
const fresh=()=>loadTaxonomy();
const rows=(file,pattern)=>readFileSync(file,'utf8').split('\n').filter(x=>pattern.test(x)).map(x=>x.split('|').slice(1,-1).map(y=>y.trim()));
test('P5.1 valida la taxonomía y sus referencias',()=>assert.equal(validateTaxonomy(fresh()),true));
test('los ejes y disciplinas reproducen P0.3 y los recuentos originales',()=>{
  const d=fresh(), original=rows('docs/P0/03-ejes.md',/^\| E\d\d /), studies=rows('docs/P0/03-ejes.md',/^\| SN-\d{3} /);
  assert.equal(studies.length,42);
  assert.deepEqual(d.axes.items.map(x=>[x.id,x.name,d.disciplines.items.find(y=>y.id===x.baseDisciplineId).name,x.scope,String(x.initialPlannedCount)]),original);
  for(const x of d.axes.items) assert.equal(x.initialPlannedCount,studies.filter(y=>y[1]===x.id).length);
});
test('los métodos reproducen íntegramente P0.4 y las perspectivas publicadas',()=>{
  const methods=fresh().methods.items;
  assert.deepEqual(methods.map(x=>[x.id,x.name,x.question,x.evidence,x.product]),rows('docs/P0/04-metodologia.md',/^\| M\d\d /));
  assert.deepEqual(methods.map(({id,name,question})=>({id,name,question})),perspectives);
});
test('tradiciones y marco académico conservan IDs y nombres de P0.3',()=>{
  const source=readFileSync('docs/P0/03-ejes.md','utf8');
  for(const x of fresh().traditions.items) assert.ok(source.includes(x.name),x.id);
  assert.equal(fresh().traditions.items.filter(x=>x.type==='academico').length,1);
});
test('las referencias documentales existen',()=>{
  for(const record of Object.values(fresh())) for(const path of record.sourceRefs) assert.ok(existsSync(path),path);
});
test('rechaza identificadores duplicados',()=>{const d=fresh();d.axes.items[1].id=d.axes.items[0].id;assert.throws(()=>validateTaxonomy(d));});
test('rechaza disciplina huérfana',()=>{const d=fresh();d.axes.items[0].baseDisciplineId='DIS-999';assert.throws(()=>validateTaxonomy(d));});
test('rechaza un marco académico clasificado como confesión',()=>{const d=fresh();d.traditions.items.at(-1).type='confesional';assert.throws(()=>validateTaxonomy(d));});
test('rechaza versiones de esquema incompatibles',()=>{const d=fresh();d.axes.schemaVersion=0;assert.throws(()=>validateTaxonomy(d));});
test('rechaza recuentos inválidos',()=>{const d=fresh();d.axes.items[0].initialPlannedCount=-1;assert.throws(()=>validateTaxonomy(d));});

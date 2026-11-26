import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCatalog, validateInitialCatalog } from '../scripts/validate-catalog.mjs';
const fresh=()=>loadCatalog();
test('P5.2 valida las 42 fichas iniciales',()=>assert.equal(validateInitialCatalog(fresh()),true));
test('P5.2 coincide exactamente con el catálogo aprobado P0.3',()=>{
  const rows=readFileSync('docs/P0/03-ejes.md','utf8').split('\n').filter(x=>/^\| SN-\d{3} /.test(x)).map(x=>x.split('|').slice(1,-1).map(s=>s.trim()));
  assert.deepEqual(fresh().items.map(x=>[x.id,x.primaryAxisId,x.title,x.referenceSelectionPending??x.initialReferences.join('; '),x.question,x.relatedAxisIds.join(',')]),rows);
});
test('las referencias pendientes se conservan sin pasajes inventados',()=>{
  assert.deepEqual(fresh().items.filter(x=>x.referenceSelectionPending).map(x=>x.id),['SN-039','SN-040','SN-042']);
});
test('rechaza ID duplicado o fuera de secuencia',()=>{const d=fresh();d.items[1].id=d.items[0].id;assert.throws(()=>validateInitialCatalog(d));});
test('rechaza eje principal inexistente',()=>{const d=fresh();d.items[0].primaryAxisId='E99';assert.throws(()=>validateInitialCatalog(d));});
test('rechaza eje relacionado inexistente',()=>{const d=fresh();d.items[0].relatedAxisIds=['E99'];assert.throws(()=>validateInitialCatalog(d));});
test('rechaza eje principal repetido como relacionado',()=>{const d=fresh();d.items[0].relatedAxisIds=['E09'];assert.throws(()=>validateInitialCatalog(d));});
test('rechaza ejes relacionados duplicados',()=>{const d=fresh();d.items[0].relatedAxisIds=['E06','E06'];assert.throws(()=>validateInitialCatalog(d));});
test('rechaza referencias vacías sin motivo pendiente',()=>{const d=fresh();d.items[0].initialReferences=[];assert.throws(()=>validateInitialCatalog(d));});
test('rechaza publicación prematura',()=>{const d=fresh();d.items[0].status='publicado';assert.throws(()=>validateInitialCatalog(d));});
test('rechaza conclusiones añadidas a fichas planificadas',()=>{const d=fresh();d.items[0].conclusion='Resultado ficticio';assert.throws(()=>validateInitialCatalog(d));});
test('rechaza evidencias no investigadas',()=>{const d=fresh();d.items[0].evidenceIds=['EVD-001'];assert.throws(()=>validateInitialCatalog(d));});

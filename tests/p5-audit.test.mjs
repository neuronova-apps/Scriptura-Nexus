import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCatalog, validateInitialCatalog } from '../scripts/validate-catalog.mjs';
import { loadTaxonomy, validateTaxonomy } from '../scripts/validate-taxonomy.mjs';
import { matchesCatalogFilter, statusLabels } from '../src/lib/catalog-exploration.ts';
import { createSearchIndex, searchCatalog, normalizeSearch } from '../src/lib/catalog-search.ts';
const catalog=loadCatalog(), taxonomy=loadTaxonomy(), items=catalog.items, axes=taxonomy.axes.items;
const index=createSearchIndex(items,axes);
test('P5.5 contratos iniciales y correspondencia documental',()=>{
  validateTaxonomy(taxonomy); assert.equal(validateInitialCatalog(catalog,taxonomy),true);
  const lines=readFileSync('docs/P0/03-ejes.md','utf8').split('\n');
  const rows=lines.filter(x=>/^\| SN-\d{3} /.test(x)).map(x=>x.split('|').slice(1,-1).map(s=>s.trim()));
  assert.deepEqual(items.map(x=>[x.id,x.primaryAxisId,x.title,x.referenceSelectionPending??x.initialReferences.join('; '),x.question,x.relatedAxisIds.join(',')]),rows);
});
test('P5.5 matriz exhaustiva de filtros por 14 ejes y seis estados',()=>{
  for(const axis of ['',...axes.map(a=>a.id)]) for(const status of ['',...Object.keys(statusLabels)]) {
    const expected=items.filter(x=>(axis===''||x.primaryAxisId===axis)&&(status===''||status==='planificado')).map(x=>x.id);
    assert.deepEqual(items.filter(x=>matchesCatalogFilter(x.primaryAxisId,x.status,axis,status)).map(x=>x.id),expected);
  }
});
test('P5.5 70 relaciones transversales y tres categorías sin principales',()=>{
  assert.equal(items.reduce((n,x)=>n+x.relatedAxisIds.length,0),70);
  assert.deepEqual(axes.filter(a=>!items.some(x=>x.primaryAxisId===a.id)).map(a=>a.id),['E12','E13','E14']);
  for(const a of axes){const primary=items.filter(x=>x.primaryAxisId===a.id),related=items.filter(x=>x.relatedAxisIds.includes(a.id));assert.equal(primary.length,a.initialPlannedCount);assert.equal(new Set([...primary,...related].map(x=>x.id)).size,primary.length+related.length);}
});
test('P5.5 todos los IDs y títulos recuperan su ficha original',()=>{
  for(const x of items){assert.deepEqual(searchCatalog(index,x.id).map(y=>y.id),[x.id]);assert.ok(searchCatalog(index,x.title).some(y=>y.id===x.id));assert.ok(searchCatalog(index,normalizeSearch(x.title)).some(y=>y.id===x.id));}
});
test('P5.5 índice reproducible, proyección mínima y exclusión editorial',()=>{
  assert.deepEqual(index,createSearchIndex([...items].reverse(),[...axes].reverse()));
  for(const x of items){assert.equal(x.publishedVersion,null);assert.deepEqual(x.evidenceIds,[]);}
  for(const state of ['borrador','en_revision','en_investigacion','publicado','actualizado']) assert.deepEqual(createSearchIndex([{...items[0],status:state}],axes),[]);
  assert.deepEqual(createSearchIndex([{...items[0],privateNotes:'PRIVATE_SENTINEL'}],axes),index.filter(x=>x.id===items[0].id));
});
test('P5.5 validación negativa impide datos privados, publicación y referencias huérfanas',()=>{
  for(const mutate of [d=>d.items[0].privateNotes='private',d=>d.items[0].publishedVersion='1.0.0',d=>d.items[0].relatedAxisIds=['E99'],d=>d.items[0].status='borrador']){
    const data=structuredClone(catalog);mutate(data);assert.throws(()=>validateInitialCatalog(data,taxonomy));
  }
});

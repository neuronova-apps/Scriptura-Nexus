import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTaxonomy, validateTaxonomy } from './validate-taxonomy.mjs';

export function loadCatalog() {
  return JSON.parse(readFileSync('src/data/catalogo/estudios.json','utf8'));
}
export function validateInitialCatalog(data, taxonomy=loadTaxonomy()) {
  validateTaxonomy(taxonomy);
  assert.equal(data.schemaVersion,1);
  assert.deepEqual(data.sourceRefs,['docs/P0/03-ejes.md','docs/P0/07-modelo-datos.md']);
  assert.ok(Array.isArray(data.items));
  assert.equal(data.items.length,42);
  const axisIds=new Set(taxonomy.axes.items.map(x=>x.id));
  const allowed=new Set(['schemaVersion','id','title','primaryAxisId','relatedAxisIds','question','status','version','createdAt','updatedAt','initialReferences','referenceSelectionPending','disciplineIds','methodSelections','traditionSelections','evidenceIds','publishedVersion','sourceRefs']);
  for(const [i,x] of data.items.entries()) {
    assert.equal(x.schemaVersion,1);
    assert.equal(x.id,'SN-'+String(i+1).padStart(3,'0'));
    for(const key of Object.keys(x)) assert.ok(allowed.has(key),x.id+' campo no autorizado: '+key);
    for(const key of ['title','question']) assert.ok(typeof x[key]==='string'&&x[key].trim(),x.id+' '+key);
    assert.ok(axisIds.has(x.primaryAxisId),x.id+' eje principal');
    assert.ok(Array.isArray(x.relatedAxisIds));
    assert.equal(new Set(x.relatedAxisIds).size,x.relatedAxisIds.length);
    for(const id of x.relatedAxisIds) assert.ok(axisIds.has(id)&&id!==x.primaryAxisId,x.id+' eje relacionado');
    assert.equal(x.status,'planificado');
    assert.equal(x.version,'0.1.0');
    for(const key of ['createdAt','updatedAt']) {
      assert.match(x[key],/^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(x[key]).toISOString().slice(0,10),x[key]);
    }
    assert.ok(x.updatedAt>=x.createdAt);
    assert.ok(Array.isArray(x.initialReferences));
    assert.ok(x.initialReferences.every(y=>typeof y==='string'&&y.trim()));
    if(x.initialReferences.length) assert.equal(x.referenceSelectionPending,undefined);
    else assert.ok(typeof x.referenceSelectionPending==='string'&&x.referenceSelectionPending.trim());
    for(const key of ['disciplineIds','methodSelections','traditionSelections','evidenceIds']) assert.deepEqual(x[key],[],x.id+' '+key+' pendiente de investigación');
    assert.equal(x.publishedVersion,null);
    assert.deepEqual(x.sourceRefs,['docs/P0/03-ejes.md']);
  }
  for(const axis of taxonomy.axes.items) assert.equal(data.items.filter(x=>x.primaryAxisId===axis.id).length,axis.initialPlannedCount,axis.id+' recuento');
  return true;
}

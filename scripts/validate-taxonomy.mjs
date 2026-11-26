import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = name => JSON.parse(readFileSync('src/data/taxonomia/'+name+'.json','utf8'));
export function validateTaxonomy(data) {
  for (const key of ['axes','disciplines','methods','traditions']) {
    const record = data[key];
    assert.equal(record.schemaVersion,1);
    assert.ok(Array.isArray(record.items));
    assert.ok(record.sourceRefs.length > 0);
    const ids = record.items.map(x=>x.id);
    assert.equal(new Set(ids).size,ids.length,'IDs duplicados: '+key);
    for (const x of record.items) assert.ok(typeof x.name==='string' && x.name.trim());
  }
  const {axes,disciplines,methods,traditions}=Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.items]));
  assert.equal(axes.length,14);
  assert.equal(disciplines.length,14);
  assert.equal(methods.length,18);
  assert.equal(traditions.length,6);
  const seq=(n,pad,prefix)=>Array.from({length:n},(_,i)=>prefix+String(i+1).padStart(pad,'0'));
  assert.deepEqual(axes.map(x=>x.id),seq(14,2,'E'));
  assert.deepEqual(disciplines.map(x=>x.id),seq(14,3,'DIS-'));
  assert.deepEqual(methods.map(x=>x.id),seq(18,2,'M'));
  assert.deepEqual(traditions.map(x=>x.id),[...seq(5,2,'T'),'A01']);
  for (const [i,x] of axes.entries()) {
    assert.equal(x.order,i+1);
    assert.ok(disciplines.some(d=>d.id===x.baseDisciplineId),'Disciplina inexistente: '+x.id);
    assert.ok(typeof x.scope==='string'&&x.scope.trim());
    assert.ok(Number.isInteger(x.initialPlannedCount)&&x.initialPlannedCount>=0);
  }
  assert.equal(axes.reduce((s,x)=>s+x.initialPlannedCount,0),42);
  for (const x of disciplines) assert.ok(typeof x.definition==='string'&&x.definition.trim());
  for (const x of methods) for (const k of ['question','evidence','product']) assert.ok(typeof x[k]==='string'&&x[k].trim());
  for (const x of traditions) {
    assert.equal(x.type,x.id==='A01'?'academico':'confesional');
    assert.ok(typeof x.scope==='string'&&x.scope.trim());
  }
  return true;
}
export function loadTaxonomy() {return {axes:read('ejes'),disciplines:read('disciplinas'),methods:read('metodos'),traditions:read('tradiciones')};}

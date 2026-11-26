import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRelations} from '../src/lib/editorial-relations.ts';
import {appendSnapshot,validateSnapshot,validateHistoryPrefix} from '../src/lib/publication.ts';
import {fixture,seal,approve,ctx} from './fixtures/p6-template.mjs';
const marker='PRUEBA SINTÉTICA P6.5.5';
test('H01: registro mal formado devuelve errores sin excepción',()=>{
 for(const invalid of [null,{}, {claims:[null]}, {...fixture().record,claims:[{id:'AF-900001'}]}])assert.ok(validateRelations(fixture().relations,invalid,ctx).length);
});
test('H02: reseal sin nueva revisión no autoriza contenido cambiado',()=>{
 const s=fixture();s.bodies['SN-001/S01']=marker;
 assert.ok(validateSnapshot(seal(s),ctx).some(e=>e.includes('huella del contenido revisado')));
 assert.deepEqual(validateSnapshot(approve(s),ctx),[]);
});
test('H02: reseal de evidencia o afirmación no sustituye la aprobación',()=>{
 for(const mutate of [s=>s.relations.evidence[0].locator=marker,s=>s.record.claims[0].proposition=marker,s=>delete s.record.reviews[0].reviewedDigest]){
  const s=fixture();mutate(s);assert.ok(validateSnapshot(seal(s),ctx).some(e=>e.includes('huella del contenido revisado')));
 }
});
test('H03: historial previo no puede eliminarse, sustituirse ni reordenarse',()=>{
 const first=appendSnapshot({schemaVersion:1,snapshots:[]},fixture(),ctx);
 const next=appendSnapshot(first,fixture('1.1.0','1.0.0'),ctx);
 assert.doesNotThrow(()=>validateHistoryPrefix(first,next));
 assert.throws(()=>validateHistoryPrefix(first,{schemaVersion:1,snapshots:[]}));
 const altered=fixture();altered.bodies['SN-001/S01']=marker;
 assert.throws(()=>validateHistoryPrefix(first,{schemaVersion:1,snapshots:[approve(altered)]}));
 assert.throws(()=>validateHistoryPrefix(next,{schemaVersion:1,snapshots:[...next.snapshots].reverse()}));
});

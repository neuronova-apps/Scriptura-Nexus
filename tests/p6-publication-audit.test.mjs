import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {criticalControls} from '../src/lib/editorial-contracts.ts';
import {snapshotDigest,validateSnapshot,validateRegistry,appendSnapshot,approvedSnapshot} from '../src/lib/publication.ts';
import {fixture,seal,ctx} from './fixtures/p6-template.mjs';
const marker='PRUEBA SINTÉTICA P6.5.4';
const empty=()=>({schemaVersion:1,snapshots:[]});
const reject=change=>{const s=fixture();change(s);assert.ok(validateSnapshot(seal(s),ctx).length);};
test('P6.5.4: controles críticos obligatorios individualmente',()=>{
 for(const id of criticalControls){
  reject(s=>s.record.reviews[0].controls=s.record.reviews[0].controls.filter(c=>c.id!==id));
  for(const result of ['pendiente','no_conforme','no_aplicable'])reject(s=>{const c=s.record.reviews[0].controls.find(x=>x.id===id);c.result=result;c.justification=marker;});
 }
});
test('P6.5.4: aprobación vigente y cronología de revisión',()=>{
 reject(s=>s.record.reviews[0].date='2026-11-25');
 reject(s=>s.record.reviews[0].date='2026-11-27');
 reject(s=>s.publishedAt='2026-02-30');
 for(const result of ['pendiente','rechazada'])reject(s=>s.record.reviews.push({...s.record.reviews[0],id:'REV-900002',result}));
});
test('P6.5.4: autorización de fuentes completa, única y para publicación',()=>{
 const source=ctx.admittedSources[0];
 for(const change of [{licenseRef:''},{attribution:' '},{authorizationRef:''},{scope:'consulta'},{admission:'pendiente'}]){
  assert.ok(validateSnapshot(fixture(),{...ctx,admittedSources:[{...source,...change}]}).length);
 }
 assert.ok(validateSnapshot(fixture(),{...ctx,admittedSources:[source,source]}).length);
 assert.ok(validateSnapshot(fixture(),{...ctx,admittedSources:[]}).length);
 reject(s=>{s.relations.evidence[0].permission='restringida';s.relations.evidence[0].excerpt=marker;});
});
test('P6.5.4: campos privados no permitidos en cada nivel editorial',()=>{
 for(const change of [
  s=>s.privateNotes=marker,s=>s.record.privateNotes=marker,s=>s.record.sections[0].privateNotes=marker,
  s=>s.record.claims[0].privateNotes=marker,s=>s.record.conclusions[0].privateNotes=marker,
  s=>s.record.reviews[0].privateNotes=marker,s=>s.record.reviews[0].controls[0].privateNotes=marker,
  s=>s.relations.privateNotes=marker,s=>s.relations.evidence[0].privateNotes=marker,
  s=>s.relations.arguments[0].privateNotes=marker,s=>s.bodies['private/draft']=marker
 ])reject(change);
});
test('P6.5.4: integridad canónica y detección de cambios sin reseal',()=>{
 const s=fixture();const {digest,...payload}=s;
 assert.equal(snapshotDigest(Object.fromEntries(Object.entries(payload).reverse())),digest);
 for(const change of [x=>x.bodies['SN-001/S01']=marker,x=>x.record.claims[0].proposition=marker,x=>x.relations.evidence[0].locator=marker,x=>x.record.reviews[0].reviewerRole=marker]){
  const copy=structuredClone(s);change(copy);assert.ok(validateSnapshot(copy,ctx).some(e=>e.includes('SHA-256')));
 }
});
test('P6.5.4: rechazo de actualización mantiene registro y versión anterior',()=>{
 const first=appendSnapshot(empty(),fixture(),ctx);const before=structuredClone(first);
 const draft=fixture('1.1.0','1.0.0');draft.record.reviews[0].result='rechazada';
 assert.throws(()=>appendSnapshot(first,seal(draft),ctx));assert.deepEqual(first,before);assert.equal(approvedSnapshot(first,'SN-001',ctx).version,'1.0.0');
 const candidate=fixture('1.1.0','1.0.0');const next=appendSnapshot(first,candidate,ctx);
 candidate.bodies['SN-001/S01']=marker;assert.deepEqual(next.snapshots[0],before.snapshots[0]);assert.notEqual(next.snapshots[1].bodies['SN-001/S01'],marker);
 assert.deepEqual(first,before);assert.equal(approvedSnapshot(next,'SN-001',ctx).version,'1.1.0');
});
test('P6.5.4: cadena rechaza duplicados, retrocesos, saltos y entradas corruptas',()=>{
 const base=appendSnapshot(empty(),fixture(),ctx);
 for(const candidate of [fixture('1.0.0','1.0.0'),fixture('0.9.0','1.0.0'),fixture('1.2.0','1.1.0'),fixture('1.2.0',null)])assert.throws(()=>appendSnapshot(base,candidate,ctx));
 const old=fixture('1.1.0','1.0.0');old.publishedAt='2026-11-25';assert.throws(()=>appendSnapshot(base,seal(old),ctx));
 for(const value of [null,[],{}, {schemaVersion:2,snapshots:[]},{schemaVersion:1,snapshots:null},{...base,privateNotes:marker},{schemaVersion:1,snapshots:[null]}])assert.throws(()=>validateRegistry(value,ctx));
});
test('P6.5.4: registro real vacío y ningún estudio recibe versión aprobada',()=>{
 const registry=JSON.parse(readFileSync('src/data/publicaciones/registro.json','utf8'));
 const catalog=JSON.parse(readFileSync('src/data/catalogo/estudios.json','utf8')).items;
 const realContext={...ctx,studyIds:catalog.map(s=>s.id),bibliographyIds:[],admittedSources:[]};
 assert.deepEqual(registry,empty());validateRegistry(registry,realContext);
 assert.equal(catalog.length,42);
 for(const study of catalog){assert.equal(study.publishedVersion,null);assert.equal(approvedSnapshot(registry,study.id,realContext),undefined);}
 assert.ok(validateSnapshot(fixture(),realContext).length);
});

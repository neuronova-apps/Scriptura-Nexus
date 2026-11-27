import test from 'node:test';
import assert from 'node:assert/strict';
import {loadOperationalCatalog} from '../scripts/validate-p1013.mjs';
import {makeSections} from '../src/lib/editorial-contracts.ts';
import {plannedTemplate,sectionView} from '../src/lib/study-template.ts';
import {appendSnapshot,approvedSnapshot,validateSnapshot} from '../src/lib/publication.ts';
import {fixture,seal,approve,ctx,label} from './fixtures/p6-template.mjs';
const empty={schemaVersion:1,snapshots:[]};
test('P6.5.2: 20 cuerpos revisados resueltos desde snapshot validado',()=>{
 const s=approvedSnapshot(appendSnapshot(empty,fixture(),ctx),'SN-001',ctx);
 const views=s.record.sections.map(x=>sectionView(x,id=>s.bodies[id]));
 assert.equal(views.length,20);assert.equal(new Set(views.map(v=>v.anchor)).size,20);
 for(const [i,v] of views.entries()){assert.equal(v.order,i+1);assert.equal(v.state,'revisada');assert.equal(v.body,label);assert.equal(v.anchor,'seccion-'+String(i+1).padStart(2,'0'));}
});
test('P6.5.2: cinco estados y ausencia de resolución de cuerpos pendientes',()=>{
 const base=makeSections('SN-001')[0];let calls=0;
 for(const state of ['pendiente','aplicable','no_aplicable','analizada','revisada']){
  const v=sectionView({...base,applicability:state,justification:label,contentRef:base.id},()=>{calls++;return label;});
  assert.equal(v.state,state);assert.equal(v.body,['analizada','revisada'].includes(state)?label:undefined);
 }
 assert.equal(calls,2);
});
test('P6.5.2: omisión justificada conserva las 20 posiciones y anclas',()=>{
 const s=fixture();const section=s.record.sections[7];section.applicability='no_aplicable';section.justification=label;delete section.contentRef;delete s.bodies[section.id];
 const approved=approvedSnapshot(appendSnapshot(empty,approve(s),ctx),'SN-001',ctx);
 const views=approved.record.sections.map(x=>sectionView(x,id=>approved.bodies[id]));
 assert.equal(views.length,20);assert.equal(views[7].explanation,label);assert.equal(views[7].body,undefined);assert.equal(views[7].anchor,'seccion-08');
});
test('P6.5.2: los estados no finales bloquean publicación',()=>{
 for(const state of ['pendiente','aplicable','analizada']){const s=fixture();s.record.sections[7].applicability=state;assert.ok(validateSnapshot(seal(s),ctx).length);}
});
test('P6.5.2: orden, ID, título y cuerpos incorrectos bloqueados',()=>{
 for(const change of [s=>s.record.sections.reverse(),s=>s.record.sections[0].id='SN-999/S01',s=>s.record.sections[0].title='alterado',s=>s.bodies['SN-001/S01']='   ',s=>s.bodies.extra=label]){
  const s=fixture();change(s);assert.ok(validateSnapshot(seal(s),ctx).length);
 }
});
test('P6.5.2: 1600 posiciones del catálogo operativo no reciben contenido sintético',()=>{
 const catalog=loadOperationalCatalog();
 const views=catalog.flatMap(s=>plannedTemplate(s.id));assert.equal(views.length,1600);assert.equal(new Set(views.map(v=>v.id)).size,1600);assert.ok(views.every(v=>v.state==='pendiente'&&v.body===undefined));assert.doesNotMatch(JSON.stringify(views),/PRUEBA SINTÉTICA P6\.5\.2/);
});

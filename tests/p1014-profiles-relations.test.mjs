import test from 'node:test';
import assert from 'node:assert/strict';
import {loadP1014,validateP1014} from '../scripts/validate-p1014.mjs';
import {loadOperationalCatalog} from '../scripts/validate-p1013.mjs';
import {matchesCatalogFilter} from '../src/lib/catalog-exploration.ts';
const reject=mutate=>{const data=loadP1014();mutate(data);assert.throws(()=>validateP1014(data));};
test('P10.1.4: proyección exacta de perfiles y relaciones aprobadas para planificación',()=>{
 assert.deepEqual(validateP1014(loadP1014()),{profiles:7,assigned:48,pending:32,relations:30,directedLinks:60,linkedStudies:36,publicationAuthorized:false});
});
test('P10.1.4: no publica investigaciones ni agrega campos editoriales',()=>{
 reject(d=>d.publicationAuthorized=true);reject(d=>d.links[0].evidenceId='EVD-ficticia');reject(d=>d.assignments[0].methodStatus='verificado');
});
test('P10.1.4: no admite destinos inexistentes, autoenlaces o duplicados',()=>{
 reject(d=>d.links[0].b='SN-999');reject(d=>d.links[0].b=d.links[0].a);reject(d=>d.links.push({...d.links[0],a:d.links[0].b,b:d.links[0].a}));reject(d=>d.links[0].reason='');
});
test('P10.1.4: mantiene el perfil interdisciplinario y religioso comparado',()=>{
 const p=loadP1014();assert.ok(p.assignments.find(x=>x.studyId==='SN-073').profiles.includes('interdisciplinaria'));assert.ok(p.assignments.find(x=>x.studyId==='SN-074').profiles.includes('religiosa_comparada'));
 reject(d=>d.assignments.find(x=>x.studyId==='SN-074').profiles=['biblica_exegetica']);
});
test('P10.1.4: filtro combina eje, estado y perfiles múltiples sin reclasificar',()=>{
 const p=loadP1014(),catalog=loadOperationalCatalog(),map=new Map(p.assignments.map(x=>[x.studyId,x.profiles]));
 const filter=(axis='',status='',profile='')=>catalog.filter(s=>matchesCatalogFilter(s.primaryAxisId,s.status,axis,status,map.get(s.id)??[],profile));
 assert.equal(filter().length,80);
 assert.equal(filter('','','pendiente').length,32);
 assert.deepEqual(filter('','','religiosa_comparada').map(s=>s.id),['SN-074']);
 assert.deepEqual(filter('E14','planificado','religiosa_comparada').map(s=>s.id),['SN-074']);
 assert.equal(filter('E09','planificado','religiosa_comparada').length,0);
 assert.equal(filter('','publicado','interdisciplinaria').length,0);
 assert.equal(filter('','','interdisciplinaria').length,6);
 assert.equal(filter('','','inexistente').length,0);
 assert.ok(filter('','','biblica_exegetica').some(s=>s.id==='SN-080'));
});
test('P10.1.4: vínculo familiar y perdón usa los códigos definitivos y un motivo',()=>{
 const p=loadP1014(),edges=p.links.filter(l=>l.a==='SN-080'||l.b==='SN-080');
 assert.ok(edges.some(l=>[l.a,l.b].includes('SN-044')&&l.kind==='complementaria'&&l.reason.includes('reconciliación')));
 assert.equal(edges.length,4);
});

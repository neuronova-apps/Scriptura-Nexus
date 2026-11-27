import test from 'node:test';
import assert from 'node:assert/strict';
import {loadExpansion,validateExpansion,loadOperationalCatalog} from '../scripts/validate-p1013.mjs';
import {createSearchIndex,searchCatalog} from '../src/lib/catalog-search.ts';
import {plannedTemplate} from '../src/lib/study-template.ts';
import {readFileSync} from 'node:fs';
const reject=f=>{const d=loadExpansion();f(d);assert.throws(()=>validateExpansion(d));};
test('P10.1.3: 38 nuevos registros y cinco ampliaciones exactas',()=>assert.deepEqual(validateExpansion(loadExpansion()),{original:42,added:38,expanded:5,total:80,publicationAuthorized:false}));
test('P10.1.3: no se admite publicación ni evidencia ficticia',()=>{reject(x=>x.approval.publicationAuthorized=true);reject(x=>x.items[0].status='publicado');reject(x=>x.items[0].evidenceIds.push('EVD-ficticia'));});
test('P10.1.3: rechaza IDs duplicados, cambios de eje y pérdida de registros',()=>{reject(x=>x.items[0].id='SN-001');reject(x=>x.items[0].primaryAxisId='E99');reject(x=>x.items.pop());reject(x=>x.extensions.pop());});
test('P10.1.3: no altera las preguntas aprobadas ni añade fuentes inexistentes',()=>{reject(x=>x.items[0].question='otra pregunta');reject(x=>x.items[0].initialReferences=['referencia inventada']);});
test('P10.1.3: todos los nuevos estudios se buscan y tienen 20 posiciones pendientes',()=>{
 const studies=loadOperationalCatalog();const axes=JSON.parse(readFileSync('src/data/taxonomia/ejes.json','utf8')).items;const index=createSearchIndex(studies,axes);
 for(const s of studies){assert.deepEqual(searchCatalog(index,s.id).map(x=>x.id),[s.id]);assert.equal(plannedTemplate(s.id).length,20);}
 assert.ok(searchCatalog(index,'padres hijos').some(s=>s.id==='SN-080'));assert.ok(searchCatalog(index,'serpiente bronce').some(s=>s.id==='SN-031'));
 assert.ok(searchCatalog(index,'religiones abrahamicas').length>0);
});

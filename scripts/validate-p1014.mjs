import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {loadP101} from './validate-p101.mjs';
import {loadExpansion,validateExpansion,mergeCatalog} from './validate-p1013.mjs';
export const profileNames={biblica_exegetica:'Bíblico-exegético',teologica_doctrinal:'Teológico-doctrinal',historica_eclesiastica:'Histórico-eclesiástico',textual_linguistica:'Textual-lingüístico',etica_practica:'Ético-práctico',interdisciplinaria:'Interdisciplinario',religiosa_comparada:'Religioso comparado'};
export const relationNames={complementaria:'Complementaria',doctrinal:'Doctrinal',historica:'Histórica',textual:'Textual',comparativa:'Comparativa',conceptual:'Conceptual',practica:'Práctica',interdisciplinaria:'Interdisciplinaria'};
export function loadP1014(){
 return JSON.parse(readFileSync('src/data/catalogo/perfiles-relaciones-p1014.json','utf8'));
}
export function validateP1014(data,input=loadP101(),expansion=loadExpansion()){
 validateExpansion(expansion,input);
 const {proposals:p,pilots:d}=input;
 const mapping=new Map(expansion.mapping.map(m=>[m.proposalId,m.studyId]));
 const assignments=[...p.proposedStudies.map(s=>({studyId:mapping.get(s.id),profiles:s.profiles,origin:'ampliacion'})),...p.extensions.map(s=>({studyId:s.studyId,profiles:s.profiles,origin:'revision'})),...d.pilots.map(s=>({studyId:s.id,profiles:s.profiles,origin:'piloto'}))].sort((a,b)=>a.studyId.localeCompare(b.studyId));
 const links=p.links.map(s=>({...s,a:mapping.get(s.a)??s.a,b:mapping.get(s.b)??s.b}));
 assert.deepEqual(data,{schemaVersion:1,phase:'P10.1.4',scope:'planificacion',publicationAuthorized:false,profiles:Object.entries(p.profiles).map(([id,description])=>({id,name:profileNames[id],description})),relationTypes:Object.entries(relationNames).map(([id,name])=>({id,name})),assignments,links});
 const catalog=mergeCatalog(input.catalog.items,expansion),ids=new Set(catalog.map(s=>s.id)),keys=new Set(data.profiles.map(s=>s.id));
 assert.equal(ids.size,80);assert.equal(keys.size,7);
 assert.equal(data.assignments.length,48);
 assert.equal(new Set(data.assignments.map(s=>s.studyId)).size,48);
 for(const a of data.assignments){assert.ok(ids.has(a.studyId));assert.ok(a.profiles.length>0);assert.equal(new Set(a.profiles).size,a.profiles.length);assert.ok(a.profiles.every(k=>keys.has(k)));}
 assert.equal(data.links.length,30);
 const pairs=new Set();
 for(const link of data.links){
  assert.ok(ids.has(link.a)&&ids.has(link.b)&&link.a!==link.b&&Object.hasOwn(relationNames,link.kind)&&link.reason.trim());
  const pair=[link.a,link.b].sort().join('|');assert.ok(!pairs.has(pair));pairs.add(pair);
 }
 assert.equal(new Set(data.links.flatMap(l=>[l.a,l.b])).size,36);
 assert.ok(pairs.has('SN-044|SN-080'));
 assert.deepEqual(data.assignments.find(s=>s.studyId==='SN-074').profiles,['religiosa_comparada','historica_eclesiastica','teologica_doctrinal']);
 return {profiles:7,assigned:48,pending:32,relations:30,directedLinks:60,linkedStudies:36,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP1014(loadP1014())));

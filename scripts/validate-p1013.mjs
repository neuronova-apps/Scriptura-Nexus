import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateInitialCatalog} from './validate-catalog.mjs';
import {loadP101,validateP101} from './validate-p101.mjs';

export function buildExpansion(catalog, proposals){
 const origin='docs/P10/propuestas-ampliacion-p101.json',date='2026-11-26';
 const questions=id=>proposals.questions.filter(q=>q.target===id).map(q=>q.question);
 const scope=id=>proposals.specialScopes.find(s=>s.id===id);
 const mapping=proposals.proposedStudies.map((s,i)=>({proposalId:s.id,studyId:'SN-'+String(i+43).padStart(3,'0')}));
 const items=proposals.proposedStudies.map((s,i)=>{
  const refs=scope(s.id)?.initialReferences??[];
  return {schemaVersion:1,id:mapping[i].studyId,title:s.title,primaryAxisId:s.primaryAxisId,relatedAxisIds:[],question:questions(s.id).join(' '),status:'planificado',version:'0.1.0',createdAt:date,updatedAt:date,initialReferences:refs,...(!refs.length?{referenceSelectionPending:'Pasajes y documentos pertinentes por seleccionar y verificar según el alcance del estudio.'}:{}),disciplineIds:[],methodSelections:[],traditionSelections:[],evidenceIds:[],publishedVersion:null,sourceRefs:[origin]};
 });
 const extensions=proposals.extensions.map(e=>{
  const original=catalog.items.find(s=>s.id===e.studyId);
  // SN-031: expand the original context-dependent Ex 25:18-22 label once.
  const refs=original.initialReferences.map(ref=>original.id==='SN-031'&&ref==='25:18-22'?'Ex 25:18-22':ref);
  return {...original,question:original.question+'. '+questions(original.id).join(' ')+' '+e.focus,initialReferences:[...new Set([...refs,...e.initialReferences])],version:'0.2.0',updatedAt:date,sourceRefs:[...original.sourceRefs,origin]};
 });
 return {schemaVersion:1,phase:'P10.1.3',approval:{date,scope:'38 estudios nuevos y cinco ampliaciones planificadas',publicationAuthorized:false},sourceRefs:[origin],mapping,items,extensions};
}

export function loadExpansion(){return JSON.parse(readFileSync('src/data/catalogo/ampliacion-p1013.json','utf8'));}
export function validateExpansion(expansion,input=loadP101()){
 validateP101(input);validateInitialCatalog(input.catalog);
 assert.deepEqual(expansion,buildExpansion(input.catalog,input.proposals),'Ampliación no coincide con propuesta autorizada');
 assert.equal(expansion.items.length,38);assert.equal(expansion.extensions.length,5);
 const operational=mergeCatalog(input.catalog.items,expansion);
 assert.equal(operational.length,80);
 assert.deepEqual(operational.map(s=>s.id),Array.from({length:80},(_,i)=>'SN-'+String(i+1).padStart(3,'0')));
 assert.equal(new Set(operational.map(s=>s.title.normalize('NFC').toLowerCase())).size,80);
 assert.ok(operational.every(s=>s.status==='planificado'&&s.publishedVersion===null&&s.evidenceIds.length===0));
 for(const s of input.catalog.items){
  const actual=operational.find(x=>x.id===s.id);
  assert.equal(actual.title,s.title);assert.equal(actual.primaryAxisId,s.primaryAxisId);assert.deepEqual(actual.relatedAxisIds,s.relatedAxisIds);assert.equal(actual.createdAt,s.createdAt);
  if(!expansion.extensions.some(e=>e.id===s.id))assert.deepEqual(actual,s);
 }
 return {original:42,added:38,expanded:5,total:80,publicationAuthorized:false};
}
export function mergeCatalog(original,expansion){
 const updates=new Map(expansion.extensions.map(s=>[s.id,s]));
 return [...original.map(s=>updates.get(s.id)??s),...expansion.items];
}
export function loadOperationalCatalog(){
 const input=loadP101(), expansion=loadExpansion();validateExpansion(expansion,input);
 return mergeCatalog(input.catalog.items,expansion);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateExpansion(loadExpansion())));

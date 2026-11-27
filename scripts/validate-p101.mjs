import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const read=path=>JSON.parse(readFileSync(path,'utf8'));
const text=x=>typeof x==='string'&&x.trim().length>0;
const unique=x=>new Set(x).size===x.length;
const nonempty=x=>Array.isArray(x)&&x.length>0&&x.every(text);
const pilotIds=['SN-001','SN-015','SN-008','SN-021','SN-040'];
const profileIds=['biblica_exegetica','teologica_doctrinal','historica_eclesiastica','textual_linguistica','etica_practica','interdisciplinaria','religiosa_comparada'];
const methodIds=Array.from({length:18},(_,i)=>'M'+String(i+1).padStart(2,'0'));
const axisIds=Array.from({length:14},(_,i)=>'E'+String(i+1).padStart(2,'0'));
const relationKinds=['complementaria','doctrinal','historica','textual','comparativa','conceptual','practica','interdisciplinaria'];
const sameSet=(a,b)=>assert.deepEqual([...a].sort(),[...b].sort());

export function loadP101(){
 const catalogBytes=readFileSync('src/data/catalogo/estudios.json');
 return {catalogBytes, catalog:JSON.parse(catalogBytes), proposals:read('docs/P10/propuestas-ampliacion-p101.json'), pilots:read('docs/P10/delimitacion-pilotos-p101.json')};
}
export function validateP101({catalogBytes,catalog,proposals:p,pilots:d}){
 assert.deepEqual(catalog,JSON.parse(catalogBytes));
 // Git stores the pinned historical JSON with LF; Windows may present CRLF.
 // Normalize only CRLF for the blob check, not JSON formatting or content.
 const gitBytes=Buffer.from(catalogBytes.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
 const hash=createHash('sha1').update(Buffer.from('blob '+gitBytes.length+'\0')).update(gitBytes).digest('hex');
 assert.equal(hash,'012e624be0fceb093befd7ad321566d586be3fd6');
 assert.equal(p.schemaVersion,1);assert.equal(p.phase,'P10.1');
 assert.equal(p.status,'propuesta_para_revision');
 assert.equal(p.catalogBaseline.blob,hash);assert.equal(p.catalogBaseline.count,42);
 assert.equal(p.catalogChangeAuthorized,false);assert.equal(p.publicationAuthorized,false);
 assert.equal(d.schemaVersion,1);assert.equal(d.phase,'P10.1');assert.equal(d.status,'delimitacion_propuesta');
 assert.equal(d.baseMain,'19c182a208bb30a85df4fc551070ecc7fedeceac');
 assert.equal(d.methodology,'docs/P0/04-metodologia.md');assert.equal(d.publicationAuthorized,false);
 assert.equal(d.approval,'pendiente_revision_responsable');
 assert.equal(catalog.items.length,42);
 const ids=catalog.items.map(x=>x.id);assert.deepEqual(ids,Array.from({length:42},(_,i)=>'SN-'+String(i+1).padStart(3,'0')));
 assert.ok(catalog.items.every(x=>x.status==='planificado'&&x.publishedVersion===null&&x.evidenceIds.length===0));
 sameSet(Object.keys(p.profiles),profileIds);
 assert.ok(Object.values(p.profiles).every(text));
 function profiles(x){assert.ok(nonempty(x)&&unique(x)&&x.every(v=>profileIds.includes(v)));}
 assert.equal(p.questions.length,49);assert.deepEqual(p.questions.map(x=>x.number),Array.from({length:49},(_,i)=>i+1));
 assert.ok(p.questions.every(x=>text(x.question)&&['usuario','propuesta','propuesta_revisada','propuesta_ampliada_usuario'].includes(x.origin)));
 sameSet(p.questions.filter(x=>x.origin==='usuario').map(x=>x.number),[1,2,3,4,5,6,7,8,9,49]);
 assert.equal(p.proposedStudies.length,38);
 const proposalIds=p.proposedStudies.map(x=>x.id);assert.ok(unique(proposalIds));
 for(const s of p.proposedStudies){
  assert.match(s.id,/^P10-Q\d{2}$/);assert.ok(text(s.title)&&axisIds.includes(s.primaryAxisId));profiles(s.profiles);
  assert.equal(s.status,'propuesta');assert.equal(s.sourceSelection,'pendiente');
  assert.ok(p.questions.some(q=>q.target===s.id&&s.id==='P10-Q'+String(q.number).padStart(2,'0')));
 }
 sameSet(p.extensions.map(x=>x.studyId),['SN-031','SN-020','SN-007','SN-023','SN-034']);
 for(const e of p.extensions){profiles(e.profiles);assert.ok(nonempty(e.initialReferences)&&text(e.focus));}
 const targets=new Set([...ids,...proposalIds]);
 for(const q of p.questions)assert.ok(proposalIds.includes(q.target)||p.extensions.some(e=>e.studyId===q.target));
 assert.ok(p.proposedStudies.every(s=>p.questions.some(q=>q.target===s.id)));
 assert.ok(p.extensions.every(e=>p.questions.some(q=>q.target===e.studyId)));
 sameSet(p.specialScopes.map(x=>x.id),['P10-Q11','P10-Q13','P10-Q14','P10-Q41','P10-Q42','P10-Q49','P10-Q05']);
 for(const s of p.specialScopes)assert.ok(proposalIds.includes(s.id)&&text(s.scope)&&text(s.limit));
 for(const id of ['P10-Q11','P10-Q13','P10-Q14'])assert.ok(p.proposedStudies.find(x=>x.id===id).profiles.includes('historica_eclesiastica'));
 assert.ok(p.proposedStudies.find(x=>x.id==='P10-Q41').profiles.includes('interdisciplinaria'));
 assert.ok(p.proposedStudies.find(x=>x.id==='P10-Q42').profiles.includes('religiosa_comparada'));
 const family=p.specialScopes.find(x=>x.id==='P10-Q49');
 for(const ref of ['Ef 6:1-4','Col 3:20-21'])assert.ok(family.initialReferences.includes(ref));
 assert.ok(nonempty(family.subquestions));
 assert.equal(p.links.length,30);
 const pairs=new Set();
 for(const link of p.links){
  assert.ok(targets.has(link.a)&&targets.has(link.b)&&link.a!==link.b);
  assert.ok(relationKinds.includes(link.kind)&&text(link.reason));
  const key=[link.a,link.b].sort().join('|');assert.ok(!pairs.has(key));pairs.add(key);
 }
 assert.ok(pairs.has(['P10-Q49','P10-Q05'].sort().join('|')));
 assert.deepEqual(d.pilots.map(x=>x.id),pilotIds);
 for(const s of d.pilots){
  assert.ok([s.question,s.objective,s.scope,s.excluded,s.expectedProduct,s.unselectedMethodPolicy].every(text));
  for(const key of ['subquestions','candidateReferences','methods','evidenceNeeds','tools','related'])assert.ok(nonempty(s[key])&&unique(s[key]));
  profiles(s.profiles);assert.ok(s.methods.every(x=>methodIds.includes(x)));
  assert.ok(s.related.every(x=>ids.includes(x)&&x!==s.id));
  assert.equal(s.referenceStatus,'orientativas_no_verificadas_en_p10_1');assert.equal(s.methodStatus,'seleccion_provisional');assert.deepEqual(s.evidenceIds,[]);
 }
 return {phase:'P10.1',originalCatalog:42,pilots:5,questions:49,proposedStudies:38,existingExtensions:5,profiles:7,proposedCrossLinks:30,publicationAuthorized:false,approval:'pending'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP101(loadP101())));

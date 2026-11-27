import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadP1022,validateP1022} from './validate-p1022.mjs';
import {loadP1021,validateP1021} from './validate-p1021.mjs';
const txt=x=>typeof x==='string'&&x.trim().length>0;
export function loadP1024(){return {bytes:readFileSync('docs/P10/registro-aplicacion-p1023.json'),review:JSON.parse(readFileSync('docs/P10/registro-revision-p1024.json','utf8'))};}
export function validateP1024({bytes,review:r}){
 const p=JSON.parse(bytes);const hash=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 assert.equal(hash,'9e1a654fc3fd27a80be1fea127e0dd4cf71e5b14');
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.2.4');assert.equal(r.baselineMain,'dd0b2b50e950a6fb4a592de37745ba932f6c9f56');assert.equal(r.applicationBlob,hash);
 assert.equal(r.publicationAuthorized,false);assert.equal(r.corpusImportAuthorized,false);assert.equal(r.academicCompletion,false);assert.equal(r.scope,'revision_tecnica_de_flujo_no_validacion_academica');
 assert.deepEqual(r.technicalEvidence,{pr:74,head:'849fc5fad4c8cb4e7ff928e93a3c962b333c7fa7',runId:45935174915,jobId:140296613979,conclusion:'success',specificTests:6,successfulWorkflows:6,previousDeployments:[45929804383,45931204464],deploymentAfterMerge:{runId:45935572207,status:'pending_confirmation'}});
 assert.deepEqual(r.pilots.map(x=>x.id),p.pilots.map(x=>x.id));let cases=0,units=0,greek=0,needs=0;const sections={};
 for(const [i,x] of r.pilots.entries()){
  const old=p.pilots[i];const ss=old.sections.reduce((o,s)=>(o[s.status]=(o[s.status]||0)+1,o),{});
  assert.deepEqual(x,{id:old.id,cases:old.cases.length,rvUnits:old.cases.reduce((n,c)=>n+Number(c.contextEnd)-Number(c.contextStart)+1,0),greekAnchors:old.cases.filter(c=>c.greekIndependentCheck).length,sectionStates:ss,openNeeds:old.openNeeds.map((need,j)=>({id:old.id+'-N'+(j+1),need,state:'abierta',impact:'bloquea_cierre_academico'})),limitation:old.limits,decision:'flujo_tecnico_parcial_validado_sin_conclusion'});
  cases+=x.cases;units+=x.rvUnits;greek+=x.greekAnchors;needs+=x.openNeeds.length;
  for(const [k,n] of Object.entries(ss))sections[k]=(sections[k]||0)+n;
 }
 assert.deepEqual([cases,units,greek,needs],[17,101,11,20]);
 assert.deepEqual(sections,{preparada_desde_delimitacion:10,pendiente:74,parcial_requiere_revision:15,parcial_referencia_documental_previa:1});
 assert.deepEqual(r.findings.map(x=>x.id),['P1024-F01','P1024-F02','P1024-F03','P1024-F04','P1024-F05']);
 assert.deepEqual(r.findings.map(x=>x.severity),['alta','alta','alta','media','media']);assert.ok(r.findings.every(x=>x.status==='abierta'&&[x.kind,x.description,x.action].every(txt)));
 assert.equal(r.next.phase,'P10.3');assert.equal(r.next.status,'condicionada_a_CI_integracion_y_despliegue');assert.equal(r.next.missingEvidencePolicy,'prueba_negativa_o_pendiente_no_simular_evidencia');assert.equal(r.next.noAutomaticPublication,true);
 assert.deepEqual(r.next.criteria.map(x=>[x.tool,x.pilot]),[['hebreo','SN-001'],['griego','SN-008'],['pactos','SN-015'],['cristologia','SN-021'],['critica_textual','SN-040']]);
 assert.ok(r.next.criteria.every(x=>txt(x.requirement)&&x.blockedBy.length>0&&x.blockedBy.every(txt)));
 return {phase:r.phase,pilots:5,cases,rvUnits:units,greekAnchors:greek,openNeeds:needs,sections:100,prepared:10,partial:16,pending:74,findings:5,high:3,medium:2,nextCriteria:5,academicCompletion:false,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){validateP1021(loadP1021());validateP1022(loadP1022());console.log(JSON.stringify(validateP1024(loadP1024())));}

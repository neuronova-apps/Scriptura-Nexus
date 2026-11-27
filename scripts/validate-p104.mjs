import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadP1036,validateP1036,reconcileExisting} from './validate-integrated-p1036.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadP104(){return {record:read('docs/P10/registro-cierre-p104.json'),integrated:readFileSync('docs/P10/registro-validacion-integral-p1036.json'),review:readFileSync('docs/P10/registro-revision-p1024.json'),publication:read('src/data/publicaciones/registro.json'),linguistic:read('src/data/linguistica/registro.json'),alignment:read('docs/P9/alineaciones-p931.json'),master:readFileSync('docs/P0/08-plan-validacion.md','utf8')};}
export function validateP104({record:r,integrated,review,publication,linguistic,alignment,master}){
 assert.equal(blob(integrated),'13a4ba018730b6573f619381996a42146109c51b');assert.equal(r.integratedBlob,blob(integrated));
 assert.equal(blob(review),'46c949dbccf623a110a98b1f2ad8c32a733b89a1');assert.equal(r.reviewBlob,blob(review));
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P10.4');assert.equal(r.baselineMain,'32b882d75a29e2eed913dbd088402ffd1feecb30');assert.equal(r.scope,'cierre_tecnico_condicionado_y_plan_de_resolucion');
 assert.deepEqual(r.previousIntegration,{pr:81,workflowRun:45942003133,job:140318183970,deployRun:45943523853,deploy:'pending_confirmation'});
 for(const k of ['academicAnalysisCompleted','publicationAuthorized','corpusImportAuthorized','releaseScopeApproved'])assert.equal(r[k],false);
 const s=JSON.parse(integrated).results,f=JSON.parse(review).findings;
 assert.deepEqual(r.results,{pilots:s.pilots,specificTests:s.specificTests+6,validatorsReconciled:5,cases:s.cases,rvUnits:s.rvUnits,greekAnchors:s.greekAnchors,blockedLinguisticCases:s.blockedLinguisticCases,openNeeds:s.openNeeds,prepared:s.prepared,partial:s.partial,pending:s.pending,publishedStudies:0});
 assert.deepEqual(r.decisions.map(x=>x.id),f.map(x=>x.id));assert.deepEqual(r.decisions.map(x=>x.priority),f.map(x=>x.severity));
 assert.ok(r.decisions.every(x=>x.gap==='abierta'&&x.technicalControl==='verificado'&&[x.resolution,x.gate,x.target].every(y=>typeof y==='string'&&y.trim())));
 assert.deepEqual(r.releaseGates.map(x=>x.id),['P11.1','P11.2','P11.3','P11.4','P11.5']);assert.ok(r.releaseGates.every(x=>x.state==='pendiente'&&typeof x.requirement==='string'&&x.requirement.trim()));
 assert.equal(publication.schemaVersion,1);assert.deepEqual(publication.snapshots,[]);assert.equal(linguistic.schemaVersion,1);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(linguistic[k],[]);
 assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 const masterCounts=[...master.matchAll(/^\| P(\d+) \|[^\n]+\| (\d+) \|$/gm)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.deepEqual(masterCounts,[[1,6],[2,5],[3,4],[4,4],[5,5],[6,5],[7,5],[8,5],[9,5],[10,4],[11,5]]);
 assert.deepEqual(r.progress,{planningStages:9,masterStages:53,completedBeforeP10:53,completedP10BeforeClosure:3,completedAfterP10Closure:57,totalIncludingPlanning:62,metric:'conteo_no_ponderado_de_etapas_originales'});
 assert.deepEqual(r.next,{phase:'P11.1',status:'condicionada_a_CI_integracion_y_despliegue',noAutomaticPublication:true});
 return {phase:r.phase,pilots:5,previousSpecificTests:36,openFindings:5,high:3,medium:2,openNeeds:20,releaseGatesPending:5,publicationAuthorized:false,completedStagesBeforeClosure:56,totalStages:62,completedStagesAfterClosure:57};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){validateP1036(loadP1036());reconcileExisting();console.log(JSON.stringify(validateP104(loadP104())));}

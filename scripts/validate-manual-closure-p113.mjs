import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
export function loadManualClosure(){return {record:read('docs/P11/registro-cierre-accesibilidad-p113.json'),previous:readFileSync('docs/P11/registro-accesibilidad-rendimiento-p113.json'),publication:read('src/data/publicaciones/registro.json'),linguistic:read('src/data/linguistica/registro.json'),alignment:read('docs/P9/alineaciones-p931.json')};}
export function validateManualClosure({record:r,previous,publication,linguistic,alignment}){
 const sha=createHash('sha1').update(Buffer.from('blob '+previous.length+'\0')).update(previous).digest('hex');
 assert.equal(sha,'2b96d66d703b49cf95f52f31c8c35d48ce3d0cb3');assert.equal(r.previousBlob,sha);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.3.cierre');assert.equal(r.baselineMain,'c4e06d1ac495e2041e7d84f634b8051a5bf462dd');
 assert.deepEqual(r.technicalEvidence,{pr:85,run:45946616062,job:140332655725,deployRun:45947229558,build:'success',deploy:'success',successfulWorkflows:17,nodeTests:496,routes:18,reflow:306,axe:72,labSamples:108,findings:0});
 const m=r.manualEvidence;
 assert.equal(m.origin,'declaracion_del_responsable_en_conversacion');assert.equal(m.reportedOn,'2026-11-27');
 assert.deepEqual(m.checks,[['A01','Navegación por teclado'],['A02','Lector de pantalla en computadora'],['A03','TalkBack en Android'],['A04','Ampliación del navegador'],['A05','Visualización móvil'],['A06','Idiomas originales']].map(([id,label])=>({id,label,result:'conforme'})));
 assert.deepEqual(m.checks.map(c=>c.id),JSON.parse(previous).manualChecks.map(c=>c.id));assert.equal(m.observations,'Sin observaciones registradas');
 for(const k of ['deviceDetails','browserDetails','assistiveTechnologyVersions','isolatedEnvironmentDetails'])assert.equal(m[k],null);
 assert.equal(m.independentVerification,false);assert.equal(r.decision,'validacion_manual_reportada_conforme_sin_certificacion');
 for(const k of ['wcagCertification','academicAnalysisCompleted','publicationAuthorized','corpusImportAuthorized','releaseScopeApproved'])assert.equal(r[k],false);
 assert.equal(r.fieldINP,'no_medido');assert.equal(r.publicFragmentBudget,'no_evaluable_sin_adaptador_aprobado');assert.equal(r.manualPrivacyReview,'pendiente');
 assert.deepEqual(publication.snapshots,[]);for(const k of ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'])assert.deepEqual(linguistic[k],[]);
 assert.equal(alignment.publicationAuthorized,false);assert.deepEqual(alignment.alignments,[]);assert.deepEqual(alignment.evidence,[]);
 assert.deepEqual(r.progress,{completedBeforeClosure:59,total:62,afterVerifiedClosure:60});assert.deepEqual(r.next,{phase:'P11.4',status:'requiere_cierre_CI_integracion_despliegue_y_aprobacion_explicita_de_alcance',proposalPath:'docs/P11/04-propuesta-alcance-publicacion.md'});
 return {phase:r.phase,reportedManualChecks:6,reportedConformities:6,independentVerification:false,wcagCertification:false,publicationAuthorized:false,releaseScopeApproved:false,completedAfterClosure:60,total:62};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateManualClosure(loadManualClosure())));

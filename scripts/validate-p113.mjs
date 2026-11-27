import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export function loadP113(){return {record:JSON.parse(readFileSync('docs/P11/registro-accesibilidad-rendimiento-p113.json','utf8')),previous:readFileSync('docs/P11/registro-auditoria-documental-p112.json')};}
export function validateP113({record:r,previous}){
 const sha=createHash('sha1').update(Buffer.from('blob '+previous.length+'\0')).update(previous).digest('hex');
 assert.equal(sha,'4a6f5ed2d016c47876cca140cb0886bd926c2b3d');assert.equal(r.previousBlob,sha);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.3');assert.equal(r.baselineMain,'8645d545c8d938043c7f6a91323bfd7ccb1f19c6');assert.equal(r.scope,'auditoria_automatizada_y_protocolo_manual_pendiente');
 assert.deepEqual(r.previousIntegration,{pr:84,workflowRun:45945893092,job:140330381489,deployRun:45946440112,deploy:'pending_confirmation',nodeTests:490,trackedPathsChecked:462,artifactFiles:139,restrictedPaths:0,nonpublicMarkers:0});
 for(const k of ['publicationAuthorized','releaseScopeApproved','corpusImportAuthorized','wcagCertification'])assert.equal(r[k],false);
 assert.deepEqual(r.routes,['','fundamentos/','fundamentos/glosario/','estudios/','estudios/SN-001/','buscar/','biblioteca/','biblioteca/permisos/','historia/','linguistica/','linguistica/analizador/','linguistica/lexicos-concordancias/','biblia/','biblia/lector/','biblia/comparador/','manuscritos/','manuscritos/consulta/','design-system/']);
 assert.deepEqual(r.widths,[320,375,768,1024,1440]);assert.deepEqual(r.themes,['light','dark','contrast-light','contrast-dark']);assert.deepEqual(r.scales,['100','115','130']);
 assert.deepEqual(r.budget,{initialJsGzipBytes:153600,homeTransferBytes:512000,fragmentGzipBytes:256000,lcpMs:2500,cls:.1,inpMs:200});
 assert.deepEqual(r.manualChecks.map(x=>x.id),['A01','A02','A03','A04','A05','A06']);assert.ok(r.manualChecks.every(x=>x.status==='pendiente'&&typeof x.task==='string'&&x.task.trim()));
 assert.equal(r.fieldINP,'no_medido');assert.equal(r.publicFragmentBudget,'no_evaluable_sin_adaptador_aprobado');assert.deepEqual(r.progress,{completed:59,total:62,afterVerifiedClosure:60});assert.equal(r.next,'P11.4_solo_tras_CI_integracion_despliegue_y_revision_manual');
 return {routes:r.routes.length,reflow:r.routes.length*(r.widths.length+r.themes.length*r.scales.length),axe:r.routes.length*r.themes.length,labSamples:r.routes.length*2*3,manualChecksPending:r.manualChecks.length,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({phase:'P11.3',...validateP113(loadP113())}));

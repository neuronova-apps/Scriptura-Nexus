import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadP11425,validateP11425} from './validate-reader-preparation-p11425.mjs';
const bytes=p=>readFileSync(p);
const blob=b=>{const c=Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));return createHash('sha1').update(Buffer.from('blob '+c.length+'\0')).update(c).digest('hex');};
export function loadManual(){const preparation=bytes('docs/P11/registro-preparacion-publicacion-lector-p11425.json');return {record:JSON.parse(bytes('docs/P11/registro-validacion-manual-lector-p11425.json')),preparation,history:loadP11425()};}
export function validateManual({record:r,preparation,history}){
 validateP11425(history);
 assert.equal(blob(preparation),'a7133e0b4d02cbe8e7fccf18c04d059b419fca74');
 assert.deepEqual(JSON.parse(preparation),history.record);
 assert.equal(r.preparationBlob,blob(preparation));assert.equal(r.rightsBlob,history.record.rightsBlob);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.2.5.validacion_manual');assert.equal(r.baselineMain,'efb500160ecab73db5470ea66a842ab9e57d7f54');assert.equal(r.reviewDate,'2026-11-27');
 assert.deepEqual(r.previousIntegration,{"pr":94,"head":"a86a7071b0bc449379e937da45c817f4e7b9b2b6","successfulWorkflows":30,"windowsRun":46006889569,"windowsJob":140532182895,"windowsTests":12,"verifiedFragments":1449,"previewRun":46006889641,"previewJob":140532183068,"deployRun":46012009690,"deploy":"success"});
 assert.deepEqual(r.manual,{"evidence":"reporte_del_responsable","independentlyVerified":false,"environment":{"os":"Windows","mode":"loopback_only","rvSource":"alternativa_verificada","browser":null,"screenReader":null,"deviceModel":null},"checks":[{"id":"L01","status":"conforme"},{"id":"L02","status":"conforme"},{"id":"L03","status":"conforme"},{"id":"L04","status":"conforme"},{"id":"L05","status":"no_evaluable","limitation":"servidor_loopback_no_accesible_desde_telefono_real"}],"observations":"Sin observaciones","mobile":{"realDeviceValidated":false,"deferralAccepted":false,"next":"prueba_en_dispositivo_real_dentro_de_alcance_autorizado_o_decision_explicita"}});
 assert.deepEqual(r.decisions,history.record.decisions);
 for(const key of ['publicReleaseAuthorized','corpusImportAuthorized','releaseScopeApproved','corpusPersisted'])assert.equal(r[key],false);
 assert.equal(r.privacyReview,'pendiente');assert.equal(r.fieldINP,'no_medido');
 assert.deepEqual(r.progress,history.record.progress);
 assert.equal(r.next,'decision_explicita_por_edicion_revision_territorial_privacidad_y_resolucion_L05');
 return {phase:r.phase,manualConforme:4,manualNoEvaluable:1,realMobileVerified:false,editionDecisionsPending:2,publicationAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateManual(loadManual())));

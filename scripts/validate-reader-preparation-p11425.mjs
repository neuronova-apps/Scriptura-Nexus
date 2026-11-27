import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
export function loadP11425(){return {record:read('docs/P11/registro-preparacion-publicacion-lector-p11425.json'),validation:readFileSync('docs/P11/registro-validacion-lector-p11424.json'),rights:readFileSync('docs/P11/registro-permisos-lector-p11421.json'),page:readFileSync('src/pages/biblia/lector.astro','utf8')};}
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function validateP11425({record:r,validation,rights,page}){
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.2.5.preparacion');assert.equal(r.baselineMain,'b5f160f963acc756bad51bc1944d7e84e52e5899');
 assert.equal(blob(validation),'ed0f0be8c70962b25f4e5f2205147244af882577');assert.equal(r.validationBlob,blob(validation));assert.equal(blob(rights),'3c6d1d783a2b95fce49c5f3d5cd5c112c0e5c67b');assert.equal(r.rightsBlob,blob(rights));
 assert.deepEqual(r.previousIntegration,{pr:91,workflowRun:45990524056,job:140476878256,successfulWorkflows:23,deployRun:45991869957,deploy:'pending_confirmation'});
 assert.deepEqual(r.results,{nodeTests:529,editions:2,books:93,chapters:1449,units:39041,emptyMarkers:18,chapterLoads:1449,layoutChecks:120,axeScans:24,labSamples:12,catalogGzipBytes:160425,maxMountMs:52,maxFirstMs:69,maxCachedMs:39});
 assert.deepEqual(r.manualChecks.map(x=>x.id),['L01','L02','L03','L04','L05']);assert.ok(r.manualChecks.every(x=>x.status==='pendiente'&&x.task.trim()));
 assert.deepEqual(r.decisions,JSON.parse(rights).editions.map(x=>({id:x.id,editionId:x.editionId,publication:x.publicReleaseDecision,territorialReview:x.territorialReview,authorizationRef:x.authorizationRef})));
 assert.deepEqual(r.preview,{mode:'loopback_only',entry:'scripts/preview-reader-p11425.mjs',publicationAuthorized:false,corpusPersisted:false});
 for(const k of ['publicReleaseAuthorized','corpusImportAuthorized','releaseScopeApproved'])assert.equal(r[k],false);
 assert.equal(r.privacyReview,'pendiente');assert.equal(r.fieldINP,'no_medido');
 assert.match(page,/mountReader\(document,createReaderView\(emptyReaderRelease\(\)\)\)/);assert.doesNotMatch(page,/preview-reader|createIsolatedFragmentReader/);
 assert.deepEqual(r.progress,{completed:61,total:69,afterReaderClosure:62});assert.equal(r.next,'P11.4.2.5_habilitacion_solo_con_decision_por_edicion_y_validacion_manual');
 return {phase:r.phase,manualPending:5,editionDecisionsPending:2,publicReleaseAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP11425(loadP11425())));

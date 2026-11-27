import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export function loadP11424(){return {record:JSON.parse(readFileSync('docs/P11/registro-validacion-lector-p11424.json','utf8')),previous:readFileSync('docs/P11/registro-integracion-lector-p11423.json'),page:readFileSync('src/pages/biblia/lector.astro','utf8')};}
export function validateP11424({record:r,previous,page}){
 const sha=createHash('sha1').update(Buffer.from('blob '+previous.length+'\0')).update(previous).digest('hex');
 assert.equal(sha,'c75185e42181f4061f4b55cdd31d1433c4700051');assert.equal(r.previousBlob,sha);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.2.4');assert.equal(r.baselineMain,'13b65df8eb231f5895edbc13508dcbfbeb63269a');
 assert.deepEqual(r.previousIntegration,{pr:90,workflowRun:45988344532,job:140469555958,successfulWorkflows:24,deployRun:45989154894,deploy:'pending_confirmation',nodeTests:520,isolatedChecks:9,chapterRequests:7});
 assert.equal(r.scope,'validacion_integral_real_aislada');
 assert.deepEqual(r.expected,{editions:2,bookFiles:93,chapters:1449,units:39041,emptyMarkers:18,layoutChecks:120,axeScans:24,labSamples:12});
 assert.deepEqual(r.budget,{chapterGzipBytes:256000,catalogGzipBytes:256000});assert.deepEqual(r.widths,[320,375,768,1024,1440]);assert.deepEqual(r.themes,['light','dark','contrast-light','contrast-dark']);assert.deepEqual(r.scales,['100','115','130']);
 assert.equal(r.expected.layoutChecks,2*r.widths.length*r.themes.length*r.scales.length);assert.equal(r.expected.axeScans,2*r.themes.length*r.scales.length);
 assert.equal(r.manualLoadedReader,'pendiente');assert.equal(r.fieldINP,'no_medido');assert.equal(r.releasePermissions,'pendientes');
 for(const k of ['publicReleaseAuthorized','corpusImportAuthorized','persistCorpus','sourceTextLogged'])assert.equal(r[k],false);
 assert.match(page,/mountReader\(document,createReaderView\(emptyReaderRelease\(\)\)\)/);assert.doesNotMatch(page,/createIsolatedFragmentReader|\/chapter\//);
 assert.deepEqual(r.progress,{completed:61,total:69,afterReaderClosure:62});assert.equal(r.next,'P11.4.2.5_tras_CI_integracion_despliegue_y_aprobacion_especifica');
 return {phase:r.phase,...r.expected,manualLoadedReader:'pending',publicReleaseAuthorized:false,completed:61,total:69};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP11424(loadP11424())));

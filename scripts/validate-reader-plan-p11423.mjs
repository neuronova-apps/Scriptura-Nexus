import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export function loadP11423(){return {record:JSON.parse(readFileSync('docs/P11/registro-integracion-lector-p11423.json','utf8')),previous:readFileSync('docs/P11/registro-proyeccion-lector-p11422.json'),page:readFileSync('src/pages/biblia/lector.astro','utf8')};}
export function validateP11423({record:r,previous,page}){
 const sha=createHash('sha1').update(Buffer.from('blob '+previous.length+'\0')).update(previous).digest('hex');
 assert.equal(sha,'136f47797686d0ef2b18441ec65152f91127d810');assert.equal(r.previousBlob,sha);
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.2.3');assert.equal(r.baselineMain,'f0b4b167c5bef2691768049c59ce91f67874ccaf');
 assert.deepEqual(r.previousIntegration,{pr:89,workflowRun:45987384440,job:140466370851,successfulWorkflows:21,deployRun:45988015148,deploy:'pending_confirmation'});
 assert.deepEqual(r.projection,{editions:2,books:93,chapters:1449,units:39041,emptyMarkers:18,maxGzipBytes:29701,totalGzipBytes:8265301,indexSha256:'fc883fb3b99c47ba17fca2b1def24b2b80fe0c52263eef86e8c875709334568c'});
 assert.equal(r.mode,'integracion_real_aislada_loopback');assert.equal(r.plannedBrowserChecks,9);
 for(const k of ['publicReleaseAuthorized','corpusImportAuthorized','persistCorpus','sourceTextLogged'])assert.equal(r[k],false);
 assert.match(page,/mountReader\(document,createReaderView\(emptyReaderRelease\(\)\)\)/);assert.doesNotMatch(page,/createIsolatedFragmentReader|\/chapter\//);
 assert.deepEqual(r.progress,{completed:61,total:69,afterReaderClosure:62});assert.equal(r.next,'P11.4.2.4_tras_CI_integracion_y_despliegue');
 return {phase:r.phase,plannedBrowserChecks:9,publicReleaseAuthorized:false,completed:61,total:69};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateP11423(loadP11423())));

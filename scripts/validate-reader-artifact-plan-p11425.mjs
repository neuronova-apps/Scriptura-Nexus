import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadAuthorization,validateAuthorization} from './validate-reader-authorization-p11425.mjs';
const hash=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
export function loadArtifactPlan(){return {record:JSON.parse(readFileSync('docs/P11/registro-verificacion-artefacto-lector-p11425.json','utf8')),authorization:loadAuthorization(),authorizationBytes:readFileSync('docs/P11/registro-autorizacion-preparacion-lector-p11425.json')};}
export function validateArtifactPlan({record:r,authorization,authorizationBytes}){
 validateAuthorization(authorization);assert.equal(hash(authorizationBytes),'d2675f30437a514f0a335b4fd5a0d3f5cbef85d4');assert.deepEqual(JSON.parse(authorizationBytes),authorization.record);
 assert.deepEqual(r,{"schemaVersion":1,"phase":"P11.4.2.5.verificacion_artefacto","baselineMain":"4b6bbc611ae3c6fabb54b36d29bbb2ee3ed5c122","authorizationBlob":"d2675f30437a514f0a335b4fd5a0d3f5cbef85d4","authorizationRef":"AUT-P11425-20261127-01","previousIntegration":{"pr":97,"head":"9a98ad062a47d53746e87a511199f1935dfe2aa7","successfulWorkflows":24,"run":46016873166,"job":140566130095,"deployRun":46017855458,"deploy":"success"},"candidateEvidence":{"editions":2,"chaptersVerified":1449,"chapterRequests":3,"externalRequests":0,"queryStorage":false,"privacyBrowserChecks":"success","realMobileValidated":false,"publicationAuthorized":false,"corpusPersisted":false},"artifact":{"mode":"temporary_private_staging","scope":"solo_lector","unchangedBaselineRequired":true,"chapterFiles":1449,"catalogFiles":1,"jsFiles":6,"replacedHtml":1,"upload":false,"cleanupRequired":true},"deploymentEnabled":false,"publicReleaseAuthorized":false,"corpusImportAuthorized":false,"privacyFinal":"pendiente_verificacion_artefacto","mobile":{"deferralAccepted":true,"realDeviceValidated":false},"progress":{"completed":61,"total":69,"afterReaderClosure":62},"next":"validar_artefacto_y_registrar_decision_de_publicacion_efectiva"});
 assert.equal(r.authorizationRef,authorization.record.authorizationRef);assert.deepEqual(r.progress,authorization.record.progress);
 return {phase:r.phase,privateStaging:true,expectedChapters:1449,publicationAuthorized:false,deploymentEnabled:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(validateArtifactPlan(loadArtifactPlan())));

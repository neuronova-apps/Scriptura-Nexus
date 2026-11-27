import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {validateReleaseReview} from './validate-analyzer-release-review-p11435.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
export const decisionPath='docs/P11/registro-decision-analizador-p114353.json';
export function validateDecisionPreparation(r=json(decisionPath)){
 const previous=json('docs/P11/registro-verificacion-artefacto-analizador-p114353.json'),review=validateReleaseReview();
 const expected={"schemaVersion":1,"phase":"P11.4.3.5.3.preparacion_decision","baselineMain":"8b298ada3f70ab58d4cc171238dc26a883858902","preparationAuthorization":"AUT-P11433-20261127-01","previousIntegration":{"pr":105,"head":"be1d693751805a1c2af0444ca59bbd7182e90bd9","merge":"8b298ada3f70ab58d4cc171238dc26a883858902","workflows":29,"successfulChecks":38,"run":46028064811,"pagesRun":46028715584,"pagesAtPreparation":"success"},"observed":{"baselineFiles":139,"unchangedFiles":138,"addedFiles":345,"replacedFiles":1,"files":346,"chapterLayers":336,"chapters":168,"units":5162,"occurrences":78218,"books":7,"contentManifestSha256":"ccef0afddbf5e481f5508bf259868ff71b95f7db81d1552651dd054566f42b47","jobs":[{"os":"ubuntu-24.04","job":140604481942,"manifestSha256":"30009de5a56c8c991d19d9cf7c756db11e2e7586ae15753286408eaa83f12f56","browserSmoke":true,"otherRoutes":3,"pilotReferences":3,"chapterRequests":6,"externalRequests":0,"queryStorage":false},{"os":"windows-2025","job":140604481570,"manifestSha256":"577f23635e1cecc0bcd5e3891e4dda8d5e101ec73beb622bce63cfc5bd651f16","browserSmoke":false}],"temporaryCleaned":true,"baselineIntact":true,"corpusPersisted":false,"upload":false},"gates":{"keyboard":"pendiente_manual","screenReader":"pendiente_manual","realMobile":"pendiente_manual","rightsNotice":"pendiente_revision_responsable","hostingPrivacy":"pendiente_revision_responsable","territorialReview":"pendiente_confirmacion_WLC","recovery":"pendiente_ensayo_privado","fieldPerformance":"no_medido","publicationAuthorized":false,"deferralAuthorized":false,"publicArtifact":false},"scope":{"module":"analizador","books":["Gen","Lev","Deut","Dan","Acts","1Cor","3John"],"excluded":["LING-010","LING-015","LING-016","LING-017","LING-018"],"readerSeparate":true},"progress":{"completed":61,"total":69},"next":"decision_responsable_y_preflight_P11.4.3.5.4"};
 assert.deepEqual(r,expected);
 assert.equal(r.preparationAuthorization,review.preparationAuthorization);
 assert.equal(review.releaseGates.publicationAuthorized,false);
 assert.deepEqual(r.scope.excluded,review.excluded);
 assert.equal(previous.artifact.publicationAuthorized,false);
 for(const k of ['books','chapters','chapterLayers','units','occurrences','addedFiles','replacedHtml'])if(k!=='replacedHtml')assert.equal(r.observed[k],previous.scope[k]);
 assert.equal(r.observed.replacedFiles,previous.scope.replacedHtml);
 assert.equal(r.observed.files,previous.scope.overlayFiles);
 for(const j of r.observed.jobs){const p=previous.previousIntegration.jobs.find(x=>x.os===j.os);assert.equal(j.manifestSha256,p.manifestSha256);}
 assert.equal(r.observed.contentManifestSha256,'ccef0afddbf5e481f5508bf259868ff71b95f7db81d1552651dd054566f42b47');
 assert.ok(Object.values(r.gates).every(x=>x===false||typeof x==='string'&&(x.startsWith('pendiente')||x==='no_medido')));
 return r;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const r=validateDecisionPreparation();console.log(JSON.stringify({phase:r.phase,technicalEvidence:true,manualCompleted:false,publicationAuthorized:false,recoveryExecuted:false,contentManifestSha256:r.observed.contentManifestSha256}));}
 catch{console.error('Decision preparation rejected');process.exitCode=1;}
}

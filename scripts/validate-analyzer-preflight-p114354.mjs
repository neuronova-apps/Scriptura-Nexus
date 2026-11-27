import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateDecisionPreparation} from './validate-analyzer-decision-p114353.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
export const preflightPath='docs/P11/registro-preflight-analizador-p114354.json';
export function validateAnalyzerPreflight(r=json(preflightPath)){
 const historical=validateDecisionPreparation();
 assert.deepEqual(r,{"schemaVersion":1,"phase":"P11.4.3.5.4.preflight_sin_publicacion","date":"2026-11-27","baselineMain":"cdd2ab238d2d54ddf3c15c5ff061fe667589751d","previousIntegration":{"pr":106,"head":"9f752af76586dbdbe065104c6c931e5d913a55d8","merge":"cdd2ab238d2d54ddf3c15c5ff061fe667589751d","workflows":30,"successfulChecks":39,"run":46028874293,"job":140607234234,"pagesRun":46029471837,"pagesAtPreparation":"success"},"recovery":{"recoveryRehearsed":true,"recoveredFiles":139,"removedCandidateFiles":345,"restoredHtml":1,"scope":"temporary_private_staging","actualRollback":false,"baselineIntact":true,"temporaryCleaned":true,"contentManifestSha256":"ccef0afddbf5e481f5508bf259868ff71b95f7db81d1552651dd054566f42b47"},"documentaryReview":{"wlc":{"provider":"https://grovescenter.org/file-downloads/","oshb":"https://github.com/openscriptures/morphhb/tree/6a5db284c715c18b239422e57bb89684e6a19f00","territorialCaveat":"https://creativecommons.org/publicdomain/mark/1.0/","peru":"https://www.wipo.int/wipolex/es/legislation/details/18762","assessment":"favorable_condicionada_no_dictamen","territorialConfirmed":false},"hosting":{"source":"https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages","statement":"https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement","ipLogged":true,"chapterRequestsReachHost":true,"anonymousGuaranteed":false,"assessment":"aviso_documental_revisado_validacion_publica_pendiente"}},"scope":{"books":["Gen","Lev","Deut","Dan","Acts","1Cor","3John"],"chapters":168,"chapterLayers":336,"units":5162,"occurrences":78218,"excluded":["LING-010","LING-015","LING-016","LING-017","LING-018"],"withheldNewGreek":198,"readerSeparate":true},"decision":{"preparationAuthorization":"AUT-P11433-20261127-01","publicationAuthorized":false,"territorialReviewAccepted":false,"privacyAccepted":false,"keyboard":"pendiente","screenReader":"pendiente","realMobile":"pendiente","manualDeferralAuthorized":false,"publicArtifact":false},"progress":{"completed":61,"total":69},"next":"decision_explicita_responsable_antes_de_implementar_release"});
 assert.equal(r.decision.preparationAuthorization,historical.preparationAuthorization);
 assert.equal(r.recovery.contentManifestSha256,historical.observed.contentManifestSha256);
 assert.deepEqual(r.scope.books,historical.scope.books);
 assert.deepEqual(r.scope.excluded,historical.scope.excluded);
 for(const k of ['chapters','chapterLayers','units','occurrences'])assert.equal(r.scope[k],historical.observed[k]);
 assert.equal(r.recovery.recoveredFiles,historical.observed.baselineFiles);
 assert.equal(r.recovery.removedCandidateFiles,historical.observed.addedFiles);
 assert.ok(r.recovery.recoveryRehearsed&&!r.recovery.actualRollback);
 assert.equal(r.documentaryReview.wlc.territorialConfirmed,false);
 assert.ok(r.documentaryReview.hosting.ipLogged&&!r.documentaryReview.hosting.anonymousGuaranteed);
 const pub=json('src/data/linguistica/registro.json');
 assert.ok(['editions','units','tokens','lemmas','identifiers','analyses','morphCodes'].every(k=>Array.isArray(pub[k])&&pub[k].length===0));
 const source=readFileSync('scripts/prepare-analyzer-candidate-p11435.mjs','utf8');
 for(const s of [r.documentaryReview.hosting.source,r.documentaryReview.hosting.statement,'las direcciones IP de los visitantes se registran y almacenan con fines de seguridad','no se garantiza anonimato'])assert.ok(source.includes(s));
 return r;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const r=validateAnalyzerPreflight();console.log(JSON.stringify({phase:r.phase,recoveryVerified:true,documentaryReviewed:true,publicRegistryEmpty:true,publicationAuthorized:false,manualCompleted:false}));}
 catch{console.error('Analyzer release preflight rejected');process.exitCode=1;}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateManuscriptReleaseGate} from '../scripts/lib/manuscript-release-gate-p11465.mjs';
const paths={"audit":"docs/P11/registro-auditoria-manuscritos-p11461.json","projection":"docs/P11/registro-proyeccion-manuscritos-p11462.json","candidate":"docs/P11/registro-candidato-manuscritos-p11463.json","integrity":"docs/P11/registro-integridad-manuscritos-p11464.json","release":"docs/P11/registro-liberacion-manuscritos-p11465.json","historic":"docs/P9/registro-manuscritos-p942.json","comparator":"docs/P11/registro-liberacion-comparador-p11455.json","lexical":"docs/P11/registro-liberacion-lexicos-p114444.json"};
const fixture=()=>Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'))]));
test('documented evidence retains five publication blockers',()=>{
 const f=fixture(),r=evaluateManuscriptReleaseGate(f);assert.equal(r.status,f.release.status);assert.deepEqual(r.blockers,f.release.expectedBlockers);assert.equal(r.canPublish,false);assert.equal(r.sourceFilesAdmitted,0);
});
test('manual completion never performs a release or permits corpus import',()=>{
 const f=fixture();for(const k of Object.keys(f.release.gates))f.release.gates[k]=k==='ownerPublicationApproval'?'approved':'passed';
 const r=evaluateManuscriptReleaseGate(f);assert.equal(r.status,'ready_for_separate_release_action');assert.deepEqual(r.blockers,[]);assert.equal(r.canPublish,false);assert.equal(r.publicationAuthorized,false);assert.equal(r.corpusImportAuthorized,false);assert.equal(r.releaseActionPerformed,false);
});
test('reject scope expansion, inferred evidence and unauthorized content',()=>{
 for(const mutate of [f=>f.release.scope.witnesses++,f=>f.release.scope.directInspections++,f=>f.release.scope.folioVerified++,f=>f.release.scope.sourceFilesAdmitted++,f=>f.audit.controls.automaticWitnessAttribution=true,f=>f.release.publicationAuthorized=true,f=>f.release.corpusImportAuthorized=true,f=>f.release.sourceContentPublished=true,f=>f.historic.readings.push({id:'unauthorized'})]){
  const f=fixture();mutate(f);assert.throws(()=>evaluateManuscriptReleaseGate(f));
 }
});
test('reject altered CI evidence, budgets, pending reviews and adjacent gates',()=>{
 for(const mutate of [f=>f.release.previousEvidence.observed.recoveries--,f=>f.release.previousEvidence.observed.projectionBytes++,f=>f.release.previousEvidence.observed.initialJsGzipEstimateBytes=153601,f=>f.release.previousEvidence.observed.externalRequests=1,f=>f.release.previousEvidence.observed.manualScreenReader=true,f=>f.release.gates.rightsAndLinksReview='assumed',f=>f.lexical.canPublish=true,f=>f.comparator.canPublish=true]){
  const f=fixture();mutate(f);assert.throws(()=>evaluateManuscriptReleaseGate(f));
 }
});
test('public page remains empty and no private adapter is imported',()=>{
 const page=readFileSync(new URL('../src/pages/manuscritos/consulta.astro',import.meta.url),'utf8');
 assert.ok(page.includes('createManuscriptView(emptyManuscriptRelease())'));assert.ok(!page.includes('private-manuscript'));assert.ok(!page.includes('muestra-manuscritos-p943.json'));
});

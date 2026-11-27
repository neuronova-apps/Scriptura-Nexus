import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateComparatorReleaseGate} from '../scripts/lib/comparator-release-gate-p11455.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const fixture=()=>({candidate:read('docs/P11/registro-candidato-comparador-p11453.json'),integrity:read('docs/P11/registro-integridad-comparador-p11454.json'),registry:read('docs/P9/alineaciones-p931.json'),release:read('docs/P11/registro-liberacion-comparador-p11455.json')});
test('private candidate remains blocked by four unresolved decisions',()=>{
 const f=fixture(),r=evaluateComparatorReleaseGate(f);
 assert.equal(r.status,f.release.status);assert.deepEqual(r.blockers,f.release.expectedBlockers);assert.equal(r.canPublish,false);assert.equal(r.publicationAuthorized,false);
});
test('manual completion does not grant publication authority',()=>{
 const f=fixture();for(const k of Object.keys(f.release.gates))f.release.gates[k]=k==='ownerPublicationApproval'?'approved':'passed';
 const r=evaluateComparatorReleaseGate(f);assert.equal(r.status,'ready_for_separate_release_action');assert.deepEqual(r.blockers,[]);assert.equal(r.canPublish,false);assert.equal(r.publicationAuthorized,false);
});
test('reject release flags, new corpus, editions and undocumented groups',()=>{
 for(const mutate of [f=>f.release.canPublish=true,f=>f.release.corpusPublished=true,f=>f.candidate.publicAdapterConnected=true,f=>f.release.scope.editions.push('TR'),f=>f.registry.alignments.push({id:'fake'}),f=>f.registry.evidence.push({id:'fake'}),f=>f.release.scope.excluded.pop()]){
  const f=fixture();mutate(f);assert.throws(()=>evaluateComparatorReleaseGate(f));
 }
});
test('reject inconsistent evidence and exceeded budgets',()=>{
 for(const mutate of [f=>f.release.scope.units++,f=>f.release.previousEvidence.observed.axeScans--,f=>f.release.previousEvidence.observed.initialBodyGzipEstimateBytes=512001,f=>f.release.previousEvidence.observed.externalRequests=1,f=>f.release.previousEvidence.observed.manualScreenReader=true,f=>f.release.gates.manualDeviceReview='assumed']){
  const f=fixture();mutate(f);assert.throws(()=>evaluateComparatorReleaseGate(f));
 }
});
test('retain public route and lexical gate unchanged',()=>{
 const page=readFileSync(new URL('../src/pages/biblia/comparador.astro',import.meta.url),'utf8');
 assert.ok(page.includes('createComparatorView(emptyComparatorRelease())'));
 assert.ok(!page.includes('comparator-release-gate-p11455'));
 const lexical=read('docs/P11/registro-liberacion-lexicos-p114444.json');
 assert.equal(lexical.canPublish,false);assert.equal(lexical.exclusions.dodson,'not_included_pending_separate_approval');
});

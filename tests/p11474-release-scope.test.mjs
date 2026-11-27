import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyReleaseScope} from '../scripts/lib/release-scope-p11474.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const fixture=()=>{const d='docs/P11/',i=read(d+'registro-conciliacion-integral-p11471.json');return [read(d+'registro-alcance-publicacion-p11474.json'),i,Object.fromEntries(Object.entries(i.inputs).map(([k,p])=>[k,read(p)])),read(d+'registro-revision-manual-p11473.json'),read(d+'registro-validacion-conjunta-p11472.json')];};
test('technical review does not approve release',()=>{const r=verifyReleaseScope(...fixture());assert.equal(r.technicalModules,5);assert.equal(r.manualPending,38);assert.equal(r.approvedModules,0);assert.equal(r.publicModulesEnabled,0);});
test('reject false manual results and inherited approval',()=>{
 for(const m of [x=>x[0].manual.passed++,x=>x[0].modules[0].effectiveApproval='approved',x=>x[0].decision.approvedEditions.push('TXT-RV1909'),x=>x[0].decision.approvedModules.push('reader'),x=>x[0].decision.approvalRef='CI',x=>x[0].decision.acceptedDeferrals.push('all'),x=>x[0].previousEvidence.launcher.manualReview=true]){const x=fixture();m(x);assert.throws(()=>verifyReleaseScope(...x));}
});
test('reject expansion, release flags, progress inflation and critical waivers',()=>{
 for(const m of [x=>x[0].modules[1].scope.books++,x=>x[0].selectedOption='A',x=>x[0].controls.exclusions.pop(),x=>x[0].controls.publicationAuthorized=true,x=>x[0].controls.publicModulesEnabled=5,x=>x[0].decision.criticalDefectsMayBeWaived=true,x=>x[0].progress.historicalCompleted++,x=>x[0].next.state='approved']){const x=fixture();m(x);assert.throws(()=>verifyReleaseScope(...x));}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateManualPlan} from '../scripts/lib/manual-acceptance-plan-p11473.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../docs/P11/'+p,import.meta.url),'utf8'));
const fixture=()=>[read('registro-revision-manual-p11473.json'),read('registro-validacion-conjunta-p11472.json'),read('registro-validacion-manual-lector-p11425.json'),read('registro-autorizacion-preparacion-lector-p11425.json')];
test('all five modules and three cross-module cases remain pending',()=>{const r=validateManualPlan(...fixture());assert.equal(r.moduleChecks,35);assert.equal(r.crossModuleChecks,3);assert.equal(r.manualPassed,0);});
test('cannot promote automated or historical evidence to manual approval',()=>{
 for(const mutate of [x=>x[0].matrix[0].result='passed',x=>x[0].matrix[0].evidence='CI',x=>x[0].manualReviewCompleted=true,x=>x[0].readerPriorEvidence.appliesOnlyToReader=false,x=>x[0].reviewMethod.realMobileSupported=true,x=>x[0].publicationAuthorized=true,x=>x[0].previousEvidence.observed.queries=6,x=>x[0].matrix.pop()]){
  const x=fixture();mutate(x);assert.throws(()=>validateManualPlan(...x));
 }
});
test('review is not a permission to serve or persist a corpus',()=>{
 for(const mutate of [x=>x[0].reviewMethod.networkListener=true,x=>x[0].reviewMethod.externalNavigationBlocked=false,x=>x[0].corpusPersisted=true,x=>x[0].upload=true,x=>x[0].publicModulesEnabled=1,x=>x[0].progress.historicalCompleted++]){const x=fixture();mutate(x);assert.throws(()=>validateManualPlan(...x));}
});

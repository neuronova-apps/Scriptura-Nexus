import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewPath,validateReleaseReview} from '../scripts/validate-analyzer-release-review-p11435.mjs';
const load=()=>JSON.parse(readFileSync(reviewPath,'utf8'));
test('P11.4.3.5 inventory preserves exact seven-book scope and historical gates',()=>{const r=validateReleaseReview();assert.equal(r.sourceFiles.length,10);assert.equal(r.releaseGates.publicationAuthorized,false);});
for(const [name,mutate] of [
 ['publication',r=>{r.releaseGates.publicationAuthorized=true;}],
 ['source digest',r=>{r.sourceFiles[0].sha256='0'.repeat(64);}],
 ['source expansion',r=>{r.sourceFiles.push({...r.sourceFiles[0],id:'LING-010'});}],
 ['annotation license',r=>{r.sourceFiles.find(f=>f.id==='LING-014').license='CC BY 4.0';}],
 ['manual validation',r=>{r.releaseGates.manualScreenReader='aprobado';}],
 ['divergent annotations',r=>{r.withheldNewGreek=0;}],
 ['progress',r=>{r.progress.completed=63;}]
])test('P11.4.3.5 rejects unauthorized '+name,()=>{const r=load();mutate(r);assert.throws(()=>validateReleaseReview(r));});

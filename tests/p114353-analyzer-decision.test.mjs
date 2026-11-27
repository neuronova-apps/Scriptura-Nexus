import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,existsSync,cpSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {validateDecisionPreparation} from '../scripts/validate-analyzer-decision-p114353.mjs';
import {rehearseAnalyzerRecovery} from '../scripts/lib/analyzer-recovery-p114353.mjs';
import {snapshot,analyzerHtml,dataRoot} from '../scripts/lib/analyzer-artifact-scope-p114353.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
test('technical evidence is pinned; manual and release decisions remain pending',()=>{const r=validateDecisionPreparation();assert.equal(r.gates.publicationAuthorized,false);assert.equal(r.gates.screenReader,'pendiente_manual');assert.equal(r.observed.contentManifestSha256,'ccef0afddbf5e481f5508bf259868ff71b95f7db81d1552651dd054566f42b47');});
test('rejects invented approvals, unsupported deferrals, and changed evidence',()=>{for(const change of [r=>r.gates.publicationAuthorized=true,r=>r.gates.deferralAuthorized=true,r=>r.gates.screenReader='conforme',r=>r.gates.realMobile='conforme',r=>r.observed.contentManifestSha256='0'.repeat(64),r=>r.scope.books.push('Matt')]){const r=validateDecisionPreparation();change(r);assert.throws(()=>validateDecisionPreparation(r));}});
function fixture(t){
 const baseline=mkdtempSync(join(tmpdir(),'sn-analyzer-baseline-test-')),temp=mkdtempSync(join(tmpdir(),'sn-analyzer-stage-')),dir=join(temp,'site');
 t.after(()=>{rmSync(temp,{recursive:true,force:true});rmSync(baseline,{recursive:true,force:true});});
 const put=(root,p,value)=>{mkdirSync(dirname(join(root,p)),{recursive:true});writeFileSync(join(root,p),value);};
 put(baseline,analyzerHtml,'disabled');put(baseline,'biblia/lector/index.html','reader');const before=snapshot(baseline);cpSync(baseline,dir,{recursive:true});
 put(dir,analyzerHtml,'candidate');put(dir,dataRoot+'catalog.json.gz','synthetic-only');
 const expected=new Map([[analyzerHtml,sha('candidate')],[dataRoot+'catalog.json.gz',sha('synthetic-only')]]);
 return {temp,dir,baseline,before,expected,put};
}
test('private recovery removes candidate files and restores original bytes',t=>{const f=fixture(t),r=rehearseAnalyzerRecovery(f);assert.equal(r.recoveryRehearsed,true);assert.equal(r.actualRollback,false);assert.equal(r.removedCandidateFiles,1);assert.deepEqual(snapshot(f.dir),f.before);});
test('unexpected change is rejected before any candidate removal',t=>{const f=fixture(t);f.put(f.dir,'biblia/lector/index.html','changed');assert.throws(()=>rehearseAnalyzerRecovery(f));assert.ok(existsSync(join(f.dir,dataRoot+'catalog.json.gz')));});
test('wrong destination or altered candidate digest is rejected',t=>{const f=fixture(t);assert.throws(()=>rehearseAnalyzerRecovery({...f,dir:f.baseline}));f.put(f.dir,dataRoot+'catalog.json.gz','changed');assert.throws(()=>rehearseAnalyzerRecovery(f));assert.ok(existsSync(join(f.dir,dataRoot+'catalog.json.gz')));});

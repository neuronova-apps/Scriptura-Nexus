// Rehearsal on a dedicated temporary copy, never a deployed site or Git operation.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync,existsSync,realpathSync} from 'node:fs';
import {join,relative,isAbsolute,basename,dirname} from 'node:path';
import {snapshot,compareAnalyzerScope,analyzerHtml,dataRoot} from './analyzer-artifact-scope-p114353.mjs';
export function rehearseAnalyzerRecovery({temp,dir,baseline,before,expected}){
 const t=realpathSync(temp),d=realpathSync(dir),b=realpathSync(baseline);
 assert.ok(basename(t).startsWith('sn-analyzer-stage-')&&basename(d)==='site'&&dirname(d)===t);
 const rel=relative(t,b);assert.ok(rel&&(rel.startsWith('..')||isAbsolute(rel)),'baseline inside staging');
 assert.deepEqual(snapshot(b),before);
 const staged=snapshot(d),scope=compareAnalyzerScope(before,staged,expected);
 assert.ok(expected.size>1&&scope.addedFiles===expected.size-1);
 // Every path and digest is checked before removing any candidate file.
 for(const p of expected.keys())if(p!==analyzerHtml)assert.ok(p.startsWith(dataRoot));
 const original=readFileSync(join(b,analyzerHtml));
 rmSync(join(d,dataRoot),{recursive:true,force:false});
 writeFileSync(join(d,analyzerHtml),original,{flag:'w'});
 const restored=snapshot(d);
 assert.deepEqual(restored,before);
 assert.deepEqual(snapshot(b),before);
 assert.equal(existsSync(join(d,dataRoot)),false);
 return {recoveryRehearsed:true,recoveredFiles:restored.size,removedCandidateFiles:scope.addedFiles,restoredHtml:1,recoveryScope:'temporary_private_staging',actualRollback:false,baselineIntact:true};
}

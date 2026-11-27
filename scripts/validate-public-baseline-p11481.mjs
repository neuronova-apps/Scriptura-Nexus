import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync,execSync} from 'node:child_process';
import {inventoryPublicBaseline,comparePublicInventories,verifyPreparationRecord} from './lib/public-baseline-p11481.mjs';
const read=p=>JSON.parse(readFileSync('docs/P11/'+p,'utf8'));
const r=read('registro-linea-base-publica-p11481.json'),scope=read('registro-alcance-publicacion-p11474.json');
verifyPreparationRecord(r,scope);
for(const [path,sha] of Object.entries(r.protectedGitObjects)){
 assert.equal(execFileSync('git',['rev-parse','HEAD:'+path],{encoding:'utf8'}).trim(),sha,'Protected object changed');
 assert.equal(execFileSync('git',['status','--porcelain','--',path],{encoding:'utf8'}).trim(),'','Protected path has worktree changes');
}
const before=inventoryPublicBaseline();
// Reuse the package's versioned build entrypoint, not Astro's internal file layout.
execSync('npm run build',{stdio:'inherit'});
const after=inventoryPublicBaseline();
const result=comparePublicInventories(before,after);
console.log(JSON.stringify({phase:r.phase,status:'public_baseline_verified_release_blocked',...result,protectedObjects:Object.keys(r.protectedGitObjects).length,publicModulesEnabled:0,manualPending:r.artifact.manualPending,publicationAuthorized:false,corpusImportAuthorized:false,releaseActionPerformed:false,upload:false}));

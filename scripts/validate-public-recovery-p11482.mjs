import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validateRecoveryRecord,rehearsePublicRecovery} from './lib/public-recovery-p11482.mjs';
const read=p=>JSON.parse(readFileSync('docs/P11/'+p,'utf8'));
const r=read('registro-recuperacion-publica-p11482.json'),b=read('registro-linea-base-publica-p11481.json'),scope=read('registro-alcance-publicacion-p11474.json');
validateRecoveryRecord(r,b,scope);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const head=git('rev-parse','HEAD'),status=git('status','--porcelain');
for(const [path,sha] of Object.entries(b.protectedGitObjects)){
 assert.equal(git('rev-parse','HEAD:'+path),sha);
 assert.equal(git('status','--porcelain','--',path),'');
}
const result=rehearsePublicRecovery();
assert.equal(result.incidents,r.planned.incidents.length);assert.equal(result.restorations,r.planned.restorations);
assert.equal(git('rev-parse','HEAD'),head);assert.equal(git('status','--porcelain'),status);
const previous=r.previousEvidence.observed;
console.log(JSON.stringify({phase:r.phase,status:'recovery_rehearsed_release_blocked',...result,previousManifestMatches:result.manifestSha256===previous.manifestSha256,protectedObjects:Object.keys(b.protectedGitObjects).length,manualPending:r.manualPending,publicModulesEnabled:0,publicationAuthorized:false,corpusImportAuthorized:false,releaseActionPerformed:false,upload:false}));

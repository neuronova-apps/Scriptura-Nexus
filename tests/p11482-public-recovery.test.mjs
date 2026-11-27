import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {snapshot} from '../scripts/lib/reader-artifact-scope.mjs';
import {classifyIncident,verifyRecoveryCopy,validateRecoveryRecord} from '../scripts/lib/public-recovery-p11482.mjs';
test('classify exact modified, missing and unexpected paths independently',()=>{
 const expected=new Map([['index.html','a'],['data/catalog-search.json','b']]);
 assert.deepEqual(classifyIncident(expected,new Map([['index.html','c'],['extra.txt','d']])),{missing:['data/catalog-search.json'],modified:['index.html'],unexpected:['extra.txt']});
});
test('recovery copy rejects modified bytes, even if size stays unchanged',()=>{
 const dir=mkdtempSync(join(tmpdir(),'sn-recovery-test-'));
 try{writeFileSync(join(dir,'index.html'),'a');const baseline=snapshot(dir);verifyRecoveryCopy(dir,baseline);writeFileSync(join(dir,'index.html'),'b');assert.throws(()=>verifyRecoveryCopy(dir,baseline));}
 finally{rmSync(dir,{recursive:true,force:true});}
});
test('recovery preparation is not authority to roll back or publish',()=>{
 const read=p=>JSON.parse(readFileSync(new URL('../docs/P11/'+p,import.meta.url),'utf8'));
 const r=read('registro-recuperacion-publica-p11482.json'),b=read('registro-linea-base-publica-p11481.json'),s=read('registro-alcance-publicacion-p11474.json');
 assert.doesNotThrow(()=>validateRecoveryRecord(r,b,s));
 for(const mutate of [x=>x.actualRollback=true,x=>x.remoteGitWrites=true,x=>x.publicationAuthorized=true,x=>x.upload=true,x=>x.planned.restorations=2,x=>x.manualPending=0]){const x=structuredClone(r);mutate(x);assert.throws(()=>validateRecoveryRecord(x,b,s));}
});

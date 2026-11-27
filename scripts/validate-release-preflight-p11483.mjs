import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inventoryPublicBaseline} from './lib/public-baseline-p11481.mjs';
import {evaluatePreflight} from './lib/release-preflight-p11483.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),d='docs/P11/';
const integral=read(d+'registro-conciliacion-integral-p11471.json'),baseline=read(d+'registro-linea-base-publica-p11481.json');
for(const [path,sha] of Object.entries(baseline.protectedGitObjects)){
 assert.equal(execFileSync('git',['rev-parse','HEAD:'+path],{encoding:'utf8'}).trim(),sha);
 assert.equal(execFileSync('git',['status','--porcelain','--',path],{encoding:'utf8'}).trim(),'');
}
const result=evaluatePreflight({r:read(d+'registro-preflight-publicacion-p11483.json'),scope:read(d+'registro-alcance-publicacion-p11474.json'),integral,inputs:Object.fromEntries(Object.entries(integral.inputs).map(([k,p])=>[k,read(p)])),manual:read(d+'registro-revision-manual-p11473.json'),combined:read(d+'registro-validacion-conjunta-p11472.json'),baseline,recovery:read(d+'registro-recuperacion-publica-p11482.json'),inventory:inventoryPublicBaseline()});
console.log(JSON.stringify(result));

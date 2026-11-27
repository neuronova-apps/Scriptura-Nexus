import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluatePreflight} from '../scripts/lib/release-preflight-p11483.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8')),d='docs/P11/';
const fixture=()=>{
 const integral=read(d+'registro-conciliacion-integral-p11471.json'),recovery=read(d+'registro-recuperacion-publica-p11482.json'),o=recovery.previousEvidence.observed;
 return {r:read(d+'registro-preflight-publicacion-p11483.json'),scope:read(d+'registro-alcance-publicacion-p11474.json'),integral,inputs:Object.fromEntries(Object.entries(integral.inputs).map(([k,p])=>[k,read(p)])),manual:read(d+'registro-revision-manual-p11473.json'),combined:read(d+'registro-validacion-conjunta-p11472.json'),baseline:read(d+'registro-linea-base-publica-p11481.json'),recovery,inventory:{files:o.files,bytes:o.bytes,sha256:o.manifestSha256}};
};
test('verified recovery and baseline do not unlock publication',()=>{const o=evaluatePreflight(fixture());assert.equal(o.canPublish,false);assert.equal(o.manualPending,38);assert.equal(o.technicalModules,5);assert.equal(o.approvedModules,0);assert.equal(o.blockers.length,4);});
test('reject changed artifact and unverified recovery evidence',()=>{
 for(const m of [x=>x.inventory.sha256='0'.repeat(64),x=>x.inventory.files++,x=>x.r.previousEvidence.observed.restorations--,x=>x.r.previousEvidence.observed.previousManifestMatches=false,x=>x.r.previousEvidence.observed.actualRollback=true,x=>x.r.previousEvidence.observed.remoteGitWrites=true]){const x=fixture();m(x);assert.throws(()=>evaluatePreflight(x));}
});
test('reject implicit authority and removal of blockers',()=>{
 for(const m of [x=>x.r.approvedModules.push('reader'),x=>x.r.manualPending=0,x=>x.r.publicationAuthorized=true,x=>x.r.blockers.pop(),x=>x.r.next.state='approved',x=>x.scope.decision.approvalRef='CI',x=>x.manual.matrix[0].result='passed',x=>x.r.progress.historicalCompleted++]){const x=fixture();m(x);assert.throws(()=>evaluatePreflight(x));}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPrivateManuscriptCandidate,loadPrivateManuscriptInputs,projectPrivateManuscripts} from '../scripts/lib/private-manuscript-projection-p11462.mjs';
import {createIsolatedManuscriptView} from '../scripts/lib/private-manuscript-view-p11463.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('private view rejects public or altered scope',()=>{
 const {projection}=createPrivateManuscriptCandidate();
 for(const mutate of [p=>p.publicationAuthorized=true,p=>p.mode='public',p=>p.evidence.pop(),p=>p.sources.pop(),p=>p.witnesses.pop(),p=>p.variants.push(p.variants[0])]){
  const p=structuredClone(projection);mutate(p);assert.throws(()=>createIsolatedManuscriptView(p));
 }
});
test('all eight historical evidence identities resolve independently',()=>{
 const {projection,view}=createPrivateManuscriptCandidate(),ids=view.evidenceIds();
 assert.equal(new Set(ids).size,8);assert.deepEqual(ids,projection.evidence.map(e=>e.id));
 for(const id of ids){const row=view.evidence(id);assert.equal(row.evidence.id,id);assert.equal(row.evidence.sourceId,row.source.id);assert.ok(row.source.rights&&row.source.attribution);}
 ids.pop();assert.equal(view.evidenceIds().length,8);
});
test('reject altered pinned bytes and do not enlarge admission',()=>{
 for(const key of ['pilot','projection','inventory']){
  const inputs=loadPrivateManuscriptInputs();inputs[key]=Buffer.from(inputs[key]);inputs[key][0]^=1;assert.throws(()=>projectPrivateManuscripts(inputs));
 }
});
test('reconcile successful functional evidence and preserve publication gates',()=>{
 const r=read('docs/P11/registro-integridad-manuscritos-p11464.json'),c=read('docs/P11/registro-candidato-manuscritos-p11463.json'),o=r.previousEvidence.observed;
 for(const k of Object.keys(c.scope))assert.equal(o[k],c.scope[k]);
 assert.equal(o.browserScenarios,c.planned.browserScenarios);assert.equal(o.projectionRequests,c.planned.projectionRequests);assert.ok(o.projectionBytes<=c.planned.projectionMaxBytes);
 assert.equal(o.externalRequests,0);assert.equal(o.pageErrors,0);assert.equal(o.distUnchanged,true);assert.equal(o.manualReview,false);
 for(const k of ['publicationAuthorized','corpusImportAuthorized','publicAdapterConnected','sourceContentPersisted','upload'])assert.equal(r[k],false);
 assert.equal(r.rightsReview,'pending_before_release');assert.deepEqual(r.progress,c.progress);
 assert.equal(read('docs/P11/registro-liberacion-comparador-p11455.json').canPublish,false);
 assert.equal(read('docs/P11/registro-liberacion-lexicos-p114444.json').canPublish,false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPrivateManuscriptCandidate,loadPrivateManuscriptInputs,projectPrivateManuscripts} from '../scripts/lib/private-manuscript-projection-p11462.mjs';
import {createManuscriptView,emptyManuscriptRelease} from '../src/lib/manuscript-view.ts';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('real historical sample produces private references with all evidence types',()=>{
 const {projection:p,view}=createPrivateManuscriptCandidate();
 assert.equal(p.mode,'isolated_reference_only');assert.equal(p.publicationAuthorized,false);assert.equal(view.available,true);
 assert.deepEqual([p.witnesses.length,p.variants.length,p.variants[0].readings.length,p.sources.length,p.evidence.length],[2,1,2,7,8]);
 assert.deepEqual([...new Set(p.evidence.map(e=>e.kind))].sort(),['bibliographic_reference','catalog','edition_identity','editorial_apparatus','secondary_report']);
 assert.ok(p.sources.every(s=>s.attribution&&s.rights&&new URL(s.url).protocol==='https:'&&new URL(s.rightsUrl).protocol==='https:'));
 assert.equal(view.evidence('EVD-P943-IGNTP').evidence.kind,'bibliographic_reference');
 assert.equal(view.evidence('EVD-P943-ED').evidence.kind,'edition_identity');
});
test('independent searches and references retain documentary limits',()=>{
 const {view}=createPrivateManuscriptCandidate();
 assert.equal(view.witnesses('bodmer')[0].id,'MAN-GA-P66');
 assert.equal(view.witnesses('british library')[0].id,'MAN-GA-02');
 assert.equal(view.witnesses('no-match').length,0);
 assert.equal(view.witness('missing'),null);assert.equal(view.evidence('missing'),null);
 const v=view.variant('VAR-P943-JHN-1-18');
 assert.equal(v.locus,'John 1:18');assert.equal(v.assessment,'not_assessed');
 assert.equal(view.evidence(v.apparatusEvidenceId).evidence.kind,'editorial_apparatus');
 for(const r of v.readings){assert.equal(r.attestations.length,1);assert.equal(r.attestations[0].basis,'secondary_report');assert.equal(r.attestations[0].hand,null);assert.ok(!Object.hasOwn(r,'readingText'));assert.equal(view.evidence(r.attestations[0].evidenceId).evidence.kind,'secondary_report');}
});
test('raw pinned inputs reject changes in rights, identity, inventory and reference bytes',()=>{
 for(const key of ['pilot','projection','inventory']){
  const inputs=loadPrivateManuscriptInputs();inputs[key]=Buffer.concat([inputs[key],Buffer.from(' ')]);
  assert.throws(()=>projectPrivateManuscripts(inputs));
 }
 const inputs=loadPrivateManuscriptInputs(),p=JSON.parse(inputs.pilot);p.resources[0].rights='unrestricted';inputs.pilot=Buffer.from(JSON.stringify(p));
 assert.throws(()=>projectPrivateManuscripts(inputs));
});
test('private projection and returned rows cannot mutate internal view',()=>{
 const {projection,view}=createPrivateManuscriptCandidate();
 projection.witnesses[0].name='changed';view.witness('MAN-GA-P66').name='changed';
 assert.equal(view.witness('MAN-GA-P66').name,'P66');
 view.evidence('EVD-P943-P66').source.rights='changed';assert.notEqual(view.evidence('EVD-P943-P66').source.rights,'changed');
});
test('private candidate cannot be treated as a public release',()=>{
 const {projection}=createPrivateManuscriptCandidate();
 assert.equal(createManuscriptView(emptyManuscriptRelease()).available,false);
 assert.throws(()=>createManuscriptView(projection));
 const {mode,...publicShape}=projection;assert.throws(()=>createManuscriptView(publicShape));
 const r=read('docs/P11/registro-proyeccion-manuscritos-p11462.json');
 assert.equal(r.publicationAuthorized,false);assert.equal(r.corpusImportAuthorized,false);assert.equal(r.rights.currentExternalReview,'pending_before_release');
 assert.equal(r.publicAdapterConnected,false);assert.equal(r.sourceContentPersisted,false);assert.equal(r.externalDownloads,false);
 assert.deepEqual(r.progress,read('docs/P11/registro-auditoria-manuscritos-p11461.json').progress);
});

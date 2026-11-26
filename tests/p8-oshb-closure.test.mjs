import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {consolidateP82} from '../scripts/lib/oshb-closure.mjs';

function fixture(){
 const manifest=JSON.parse(readFileSync('docs/P8/candidatos-linguisticos.json','utf8'));
 const registry=JSON.parse(readFileSync('src/data/linguistica/registro.json','utf8'));
 const integrity={books:{Gen:{chapters:50,verses:1533,words:20612,segments:4670},Dan:{chapters:12,verses:357,words:5919,segments:1077}},counts:{units:1890,tokens:26531,hbo:22930,arc:3601,unknown:0,alternatives:132,alternativeWords:133,lemmas:2595,components:36749,documented:26331,partial:326,unresolved:7,absent:0,segments:5747},unicode:{forms:32411,codePoints:120000,combiningMarks:80000,nonNfc:100},sha256:'a'.repeat(64),pendingMorphology:333,pendingCodeGroups:[{key:['hbo','synthetic-partial','partial','fixture'],occurrences:326},{key:['arc','synthetic-unresolved','unresolved','fixture'],occurrences:7}],unanchoredVariants:0};
 return {manifest,registry,integrity,repeatedIntegrity:structuredClone(integrity),compatibility:{exactCodeMatches:1,semanticEquivalencesApproved:0},lexical:{admittedIdentifiers:0}};
}
function changedIntegrity(f,fn){fn(f.integrity);f.repeatedIntegrity=structuredClone(f.integrity);return f;}
test('P8.2.7: deterministic checkpoint, partial coverage and explicit gate',()=>{
 const a=consolidateP82(fixture()),b=consolidateP82(fixture());
 assert.deepEqual(a,b);assert.match(a.checkpointSha256,/^[a-f0-9]{64}$/);
 assert.equal(a.pending.total,333);assert.equal(a.scope.fullCanon,false);
 assert.equal(a.next.p83FullAcceptanceBlocked,true);assert.equal(a.publication.publicRegistryEmpty,true);
 assert.equal(a.excludedIds.length,9);assert.equal(a.sources.length,3);
});
test('P8.2.7: reject expanded admission',()=>{const f=fixture();f.manifest.files[0].review='aprobado';assert.throws(()=>consolidateP82(f));});
test('P8.2.7: reject duplicate file identity',()=>{const f=fixture();f.manifest.files[0].id=f.manifest.files[1].id;assert.throws(()=>consolidateP82(f));});
test('P8.2.7: reject changed version/hash/component',()=>{
 for(const k of ['commit','sha256','path','allowedComponents']){
  const f=fixture(),a=f.manifest.files.find(x=>x.id==='LING-011');
  a[k]=k==='allowedComponents'?['texto_wlc']: 'invalid';assert.throws(()=>consolidateP82(f));
 }
});
test('P8.2.7: reject missing attribution',()=>{const f=fixture();f.manifest.files.find(x=>x.id==='LING-011').attribution='';assert.throws(()=>consolidateP82(f));});
test('P8.2.7: reject nonempty or unknown public collection',()=>{
 const f=fixture();f.registry.tokens.push({id:'synthetic'});assert.throws(()=>consolidateP82(f));
 const g=fixture();g.registry.extra=[];assert.throws(()=>consolidateP82(g));
});
test('P8.2.7: reject nonreproducible audit',()=>{const f=fixture();f.repeatedIntegrity.sha256='b'.repeat(64);assert.throws(()=>consolidateP82(f));});
test('P8.2.7: reject missing or altered coverage',()=>{
 assert.throws(()=>consolidateP82(changedIntegrity(fixture(),a=>delete a.books.Dan)));
 assert.throws(()=>consolidateP82(changedIntegrity(fixture(),a=>a.counts.tokens--)));
});
test('P8.2.7: reject suppressed pending cases and duplicated groups',()=>{
 assert.throws(()=>consolidateP82(changedIntegrity(fixture(),a=>a.pendingMorphology=0)));
 assert.throws(()=>consolidateP82(changedIntegrity(fixture(),a=>a.pendingCodeGroups[0].occurrences--)));
 assert.throws(()=>consolidateP82(changedIntegrity(fixture(),a=>a.pendingCodeGroups.push(a.pendingCodeGroups[0]))));
});
test('P8.2.7: reject inferred identifiers and semantic equivalences',()=>{
 const f=fixture();f.lexical.admittedIdentifiers=1;assert.throws(()=>consolidateP82(f));
 const g=fixture();g.compatibility.semanticEquivalencesApproved=1;assert.throws(()=>consolidateP82(g));
});
test('P8.2.7: reject incorrect Unicode count',()=>assert.throws(()=>consolidateP82(changedIntegrity(fixture(),a=>a.unicode.forms--))));

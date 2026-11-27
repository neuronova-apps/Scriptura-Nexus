import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {loadExpandedAnalyzerData} from './lib/linguistic-expansion-p11433.mjs';
import {loadPrivateLexicalModel} from './lib/build-lexical-concordance-p114441.mjs';
import {buildPrivateLexicalBrowserCandidate} from './lib/build-lexical-browser-candidate-p114442.mjs';
import {snapshot} from './lib/reader-artifact-scope.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
let stage='sources';
try{
 const before=snapshot('dist'),data=await loadExpandedAnalyzerData(),lexical=loadPrivateLexicalModel();
 stage='rebuild-private-candidate';const candidate=await buildPrivateLexicalBrowserCandidate(data,lexical);
 stage='descriptor-inventory';assert.equal(candidate.assets.size,candidate.descriptors.size);assert.equal(candidate.summary.fragmentFiles,candidate.assets.size);
 const inventory=[...candidate.descriptors.values()].map(x=>({path:x.path,jsonBytes:x.jsonBytes,sha256:x.sha256})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 assert.equal(sha(Buffer.from(JSON.stringify(inventory))),candidate.summary.manifestSha256);
 for(const [path,bytes] of candidate.assets){
  const d=candidate.descriptors.get(path);assert.ok(d&&d.path===path);assert.match(path,/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.json\.gz$/);
  assert.ok(d.gzipBytes>0&&d.gzipBytes<=256000&&d.jsonBytes>0&&d.jsonBytes<=8388608);
  assert.equal(bytes.length,d.gzipBytes);assert.equal(sha(bytes),d.gzipSha256);
 }
 stage='catalog-integrity';const d=candidate.rootManifest.catalog,packed=candidate.assets.get(d.path),raw=gunzipSync(packed,{maxOutputLength:8388608});
 assert.equal(raw.length,d.jsonBytes);assert.equal(sha(raw),d.sha256);
 const catalog=JSON.parse(raw);assert.equal(catalog.publicationAuthorized,false);assert.equal(catalog.mode,'isolated_lexical_concordance');
 assert.equal(catalog.groups.length,41);assert.equal(Object.keys(catalog.lexicalSummaryBuckets).length,16);
 assert.equal(catalog.lexicalAdmissions.length,4);assert.deepEqual(catalog.lexicalAdmissions.map(x=>x.id),['LING-015','LING-016','LING-017','LING-018']);
 assert.equal(catalog.lemmaCatalog.path,'lemma-catalog.json.gz');assert.equal(catalog.chapterCatalog.path,'analyzer-catalog.json.gz');
 assert.ok(!Object.hasOwn(catalog,'tokens')&&!Object.hasOwn(catalog,'definitions'));
 const referenced=[catalog.chapterCatalog,catalog.lemmaCatalog,...Object.values(catalog.lexicalSummaryBuckets),...Object.values(catalog.details),...catalog.groups.map(x=>x.manifest)];
 assert.ok(referenced.every(x=>candidate.assets.has(x.path)));
 stage='release-barriers';assert.equal(candidate.rootManifest.publicationAuthorized,false);assert.equal(candidate.summary.publicationAuthorized,false);assert.equal(candidate.summary.corpusPersisted,false);assert.equal(candidate.summary.browserCandidate,true);
 assert.equal(candidate.summary.occurrences,78218);assert.equal(candidate.summary.lexicalEntries,30740);assert.equal(candidate.summary.forms,10221);assert.equal(candidate.summary.definitions,35496);
 assert.ok(candidate.summary.maxGzipBytes<=256000&&candidate.summary.maxJsonBytes<=8388608);
 assert.equal(data.registry.tokens.length,78218);assert.equal(lexical.model.entries.length,30740);
 stage='public-output';assert.deepEqual(snapshot('dist'),before);
 console.log(JSON.stringify({phase:'P11.4.4.4.3',mode:'private-fragment-integrity',fragments:candidate.assets.size,compressedBytes:candidate.summary.totalGzipBytes,maxGzipBytes:candidate.summary.maxGzipBytes,maxJsonBytes:candidate.summary.maxJsonBytes,catalogGzipBytes:candidate.summary.catalogGzipBytes,manifestSha256:candidate.summary.manifestSha256,occurrences:78218,lexicalEntries:30740,definitions:35496,admittedHistoricalFiles:4,dodsonAdmission:'pending_approval',publicationAuthorized:false,corpusPersisted:false,corpusPublished:false,distUnchanged:true},null,2));
}catch{throw new Error('P11.4.4.4.3 falló en '+stage+'; contenido lingüístico omitido');}

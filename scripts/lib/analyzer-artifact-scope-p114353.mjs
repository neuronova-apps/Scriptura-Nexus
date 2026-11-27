// Scope and byte comparison for the temporary analyzer artifact. Never changes dist.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {validateCatalog,decodeAnalyzerAsset,assembleChapter} from './analyzer-fragments-p11434.mjs';
import {validateStaticOverlay,prefix,root,assets} from '../prepare-analyzer-candidate-p11435.mjs';
export {snapshot} from './reader-artifact-scope.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const analyzerHtml='linguistica/analizador/index.html',dataRoot='linguistica/analizador/candidate-data/';
const moduleNames=['term-analyzer.js','linguistic-contracts.js','term-analyzer-view.js','term-analyzer-ui.js','appearance.js','analyzer-fragments.js','static-gzip.js','init.js'];
export function allowedPath(p){
 return p===analyzerHtml||p===dataRoot+'catalog.json.gz'||moduleNames.some(n=>p===dataRoot+n)||/^linguistica\/analizador\/candidate-data\/chapters\/TXT-[A-Za-z0-9_-]+\/LIB-[A-Za-z0-9_-]+\/[1-9][0-9]*\/(text|annotations)\.json\.gz$/.test(p);
}
export function overlayRelative(url){
 assert.ok(typeof url==='string'&&(url===root||url.startsWith(assets)));
 const p=url.slice(prefix.length)+(url===root?'index.html':'');
 assert.ok(allowedPath(p));return p;
}
export function overlayDigests(overlay){
 const out=new Map();for(const [url,f] of overlay){const p=overlayRelative(url);assert.ok(!out.has(p));out.set(p,sha(f.body));}return out;
}
export function compareAnalyzerScope(before,after,expected){
 assert.ok(before.has(analyzerHtml)&&expected.has(analyzerHtml));
 assert.ok([...before.keys()].every(p=>!p.startsWith(dataRoot)));
 assert.ok([...expected.keys()].every(allowedPath));
 assert.equal(after.size,before.size+expected.size-1);
 for(const [p,d] of before)if(p!==analyzerHtml)assert.equal(after.get(p),d,'unrelated file changed');
 for(const [p,d] of expected)assert.equal(after.get(p),d,'overlay byte mismatch');
 assert.ok([...after.keys()].every(p=>before.has(p)||expected.has(p)));
 return {baselineFiles:before.size,unchangedFiles:before.size-1,addedFiles:expected.size-1,replacedFiles:1};
}
export function verifyStagedAnalyzer(dir,candidate,overlay){
 const staged=new Map();
 for(const [url,f] of overlay)staged.set(url,{type:f.type,body:readFileSync(join(dir,overlayRelative(url)))});
 const summary=validateStaticOverlay(candidate,staged);
 const unpack=d=>{
  const b=staged.get(assets+d.path)?.body;
  assert.ok(b&&b.length===d.gzipBytes&&sha(b)===d.gzipSha256);
  const raw=gunzipSync(b,{maxOutputLength:8388608});assert.ok(raw.length===d.jsonBytes&&sha(raw)===d.sha256);
  return decodeAnalyzerAsset(d.path,JSON.parse(raw));
 };
 const c=unpack(candidate.catalogSpec);validateCatalog(c);
 assert.equal(sha(Buffer.from(JSON.stringify(c))),sha(Buffer.from(JSON.stringify(candidate.catalog))));
 const books=new Map(),seen=new Set();let units=0,occurrences=0;
 for(const d of c.chapters){
  const p=assembleChapter(c,d,unpack(d.text),unpack(d.annotations));
  units+=p.registry.units.length;occurrences+=p.registry.tokens.length;
  books.set(d.bookId,(books.get(d.bookId)??0)+p.registry.tokens.length);
  for(const t of p.registry.tokens){assert.ok(!seen.has(t.id));seen.add(t.id);}
 }
 assert.equal(c.editions.length,2);assert.equal(c.chapters.length,168);assert.equal(units,5162);assert.equal(occurrences,78218);assert.equal(seen.size,occurrences);
 assert.deepEqual(Object.fromEntries([...books].sort()),{'LIB-1Cor':6812,'LIB-3John':219,'LIB-Acts':18412,'LIB-Dan':5919,'LIB-Deut':14294,'LIB-Gen':20612,'LIB-Lev':11950});
 const contentManifest=c.chapters.flatMap(d=>[d.text,d.annotations].map(s=>({path:s.path,jsonBytes:s.jsonBytes,sha256:s.sha256}))).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
 return {...summary,chapters:168,units,occurrences,books:7,contentManifestSha256:sha(Buffer.from(JSON.stringify(contentManifest))),publicationAuthorized:false};
}

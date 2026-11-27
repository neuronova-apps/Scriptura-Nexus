// Compare a staged artifact to the ordinary already-verified site byte for byte.
import assert from 'node:assert/strict';
import {readdirSync,readFileSync,lstatSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const readerHtml='biblia/lector/index.html',dataRoot='biblia/lector/reader-data/';
const modules=['appearance.js','init.js','reader-fragment-view.js','reader-ui.js','reader-view.js','static-gzip.js'];
export function snapshot(root){
 const entries=new Map();
 function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,e.name),rel=relative(root,path).split(sep).join('/');
  assert.ok(!e.isSymbolicLink(),'symlink forbidden');
  if(e.isDirectory())walk(path);else{assert.ok(e.isFile()&&lstatSync(path).isFile(),'nonregular file');entries.set(rel,sha(readFileSync(path)));}
 }}walk(root);return entries;
}
export function compareScope(before,after,expected){
 assert.ok(before.has(readerHtml)&&expected.has(readerHtml));
 assert.ok([...before.keys()].every(p=>!p.startsWith(dataRoot)),'baseline reader data forbidden');
 assert.equal(after.size,before.size+expected.size-1);
 for(const [path,digest] of before){if(path!==readerHtml)assert.equal(after.get(path),digest,'unrelated baseline file changed: '+path);}
 for(const [path,digest] of expected){assert.ok(path===readerHtml||path.startsWith(dataRoot),'unexpected overlay path');assert.equal(after.get(path),digest,'overlay mismatch: '+path);}
 assert.ok([...after.keys()].every(p=>before.has(p)||expected.has(p)),'unexpected artifact file');
 return {baselineFiles:before.size,unchangedFiles:before.size-1,addedFiles:expected.size-1,replacedFiles:1};
}
export function verifyReaderData(root){
 const read=p=>readFileSync(join(root,p));
 const packedCatalog=read(dataRoot+'catalog.json.gz');
 assert.ok(packedCatalog.length>0&&packedCatalog.length<=256000);
 const c=JSON.parse(gunzipSync(packedCatalog,{maxOutputLength:8*1024*1024}));
 assert.equal(c.schemaVersion,1);assert.equal(c.mode,'isolated_validation');assert.equal(c.publicationAuthorized,false);
 const known=[['TXT-RV1909',66,1189,31102,18],['TXT-SBLGNT-V1-2',27,260,7939,0]];
 const allowed=new Set([readerHtml,dataRoot+'catalog.json.gz',...modules.map(x=>dataRoot+x)]);
 assert.equal(c.editions.length,2);
 let allUnits=0,allChapters=0;
 const index=[];
 for(const [i,e] of c.editions.entries()){
  const [id,books,chapters,units,empty]=known[i];assert.equal(e.id,id);assert.equal(e.books.length,books);assert.equal(new Set(e.books.map(b=>b.id)).size,books);
  let n=0,u=0,z=0;
  for(const b of e.books){assert.match(b.id,/^LIB-[A-Z0-9]+$/);for(const d of b.chapters){
   assert.equal(d.editionId,id);assert.equal(d.bookId,b.id);assert.match(d.chapter,/^[1-9][0-9]*$/);
   const p=dataRoot+'chapters/'+[id,b.id,d.chapter].join('/')+'.json.gz';assert.ok(!allowed.has(p));allowed.add(p);
   const packed=read(p);assert.ok(packed.length===d.gzipBytes&&packed.length>0&&packed.length<=256000&&sha(packed)===d.gzipSha256);
   const raw=gunzipSync(packed,{maxOutputLength:8*1024*1024});assert.ok(raw.length===d.jsonBytes&&sha(raw)===d.sha256);
   const f=JSON.parse(raw);assert.deepEqual(Object.keys(f).sort(),['bookId','chapter','editionId','format','schemaVersion','units']);assert.equal(f.schemaVersion,1);assert.equal(f.format,'sn-reader-chapter-v1');assert.equal(f.editionId,id);assert.equal(f.bookId,b.id);assert.equal(f.chapter,d.chapter);
   assert.equal(f.units.length,d.unitCount);
   const markers=f.units.filter(x=>x.text==='').length;assert.equal(markers,d.emptyMarkers);
   for(const [j,x] of f.units.entries()){
    assert.deepEqual(Object.keys(x).sort(),['bookId','chapter','editionId','id','order','resourceId','sourceLocator','sourceSegmentSha256','text','textSha256','verse']);
    assert.equal(x.editionId,id);assert.equal(x.bookId,b.id);assert.equal(x.chapter,d.chapter);assert.equal(x.verse,d.verses[j]);assert.equal(x.order,d.firstOrder+j);assert.equal(x.resourceId,d.resourceId);
    assert.ok(typeof x.text==='string'&&sha(Buffer.from(x.text))===x.textSha256&&/^[0-9a-f]{64}$/.test(x.sourceSegmentSha256));
    assert.equal(x.id,'UNIT-'+sha(Buffer.from([id,b.id,d.chapter,x.verse,x.sourceLocator].join('\u001f'))));
   }
   index.push(d);n++;u+=f.units.length;z+=markers;
  }}assert.deepEqual([n,u,z],[chapters,units,empty]);allUnits+=u;allChapters+=n;
 }
 // The historical Python index is canonical JSON (sorted keys, compact Unicode).
 const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
 assert.equal(sha(Buffer.from(JSON.stringify(canonical(index)))),'fc883fb3b99c47ba17fca2b1def24b2b80fe0c52263eef86e8c875709334568c');
 assert.equal(allowed.size,1457);assert.equal(allChapters,1449);assert.equal(allUnits,39041);
 for(const p of allowed)read(p);
 const html=read(readerHtml).toString('utf8');
 assert.match(html,/Candidato de publicación: revisión privada/);assert.match(html,/id="candidate-rights"/);assert.match(html,/id="candidate-privacy"/);assert.match(html,/creativecommons\.org\/licenses\/by\/4\.0/);
 return {allowed,chapters:allChapters,units:allUnits,catalogGzipBytes:packedCatalog.length};
}
export function overlayDigests(overlay){
 const out=new Map();
 for(const [path,f] of overlay){
  assert.ok(path.startsWith('/Scriptura-Nexus/biblia/lector/'));
  const rel=path.slice('/Scriptura-Nexus/'.length)+(path.endsWith('/')?'index.html':'');
  assert.ok(rel===readerHtml||rel.startsWith(dataRoot));assert.ok(!rel.split('/').some(s=>s==='..'||s==='.')&&!out.has(rel));
  out.set(rel,sha(f.body));
 }return out;
}

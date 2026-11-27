import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {assembleChapter,validateCatalog,encodeAnnotationLayer,decodeAnalyzerAsset} from './analyzer-fragments-p11434.mjs';
import {createTermAnalyzer} from '../../src/lib/term-analyzer.ts';
const sha=x=>createHash('sha256').update(x).digest('hex');
const key=(e,b,c)=>JSON.stringify([e,b,c]);
export function buildAnalyzerFragments(data){
 const {registry:r,admissions,supplements,typography}=data;
 assert.equal(r.tokens.length,78218);assert.equal(r.units.length,5162);assert.equal(r.identifiers.length,0);assert.equal(r.morphCodes.length,0);
 const groups=new Map(),unitGroup=new Map(),tokenGroup=new Map(),lemmas=new Map(r.lemmas.map(l=>[l.id,l])),assets=new Map();
 for(const u of r.units){
  const k=key(u.editionId,u.bookId,u.chapter);let g=groups.get(k);
  if(!g){g={identity:{schemaVersion:1,editionId:u.editionId,bookId:u.bookId,chapter:u.chapter},units:[],tokens:[],typography:[],analyses:[],links:[],supplements:[],lemmaIds:new Set()};groups.set(k,g);}
  g.units.push(u);unitGroup.set(u.id,g);
 }
 for(const t of r.tokens){const g=unitGroup.get(t.unitId);assert.ok(g);tokenGroup.set(t.id,g);g.tokens.push(t);if(t.analysisIds.length)g.links.push({tokenId:t.id,analysisIds:t.analysisIds});}
 for(const a of r.analyses){const g=tokenGroup.get(a.tokenId);assert.ok(g);g.analyses.push(a);if(a.lemmaId)g.lemmaIds.add(a.lemmaId);}
 for(const s of supplements){const g=tokenGroup.get(s.tokenId);assert.ok(g);g.supplements.push(s);for(const c of s.lexical.components)if(c.lemmaId)g.lemmaIds.add(c.lemmaId);}
 for(const t of typography){const g=tokenGroup.get(t.tokenId);assert.ok(g);g.typography.push(t);}
 const pack=(path,obj)=>{
  const encoded=path.endsWith('/annotations.json.gz')?encodeAnnotationLayer(obj):obj;
  const raw=Buffer.from(JSON.stringify(encoded)),packed=gzipSync(raw,{level:6});
  if(raw.length>8388608||packed.length>256000){
   // Only fixed book/chapter and size metadata; never emit the layer.
   const m=/^chapters\/TXT-[A-Za-z0-9_-]+\/(LIB-[A-Za-z0-9_-]+)\/([0-9]+)\/(text|annotations)\.json\.gz$/.exec(path);
   console.error(JSON.stringify({check:'asset-budget',book:m?.[1]??null,chapter:m?.[2]??null,layer:m?.[3]??'catalog',jsonBytes:raw.length,gzipBytes:packed.length}));
   throw Error('Asset budget exceeded');
  }
  assert.ok(!assets.has(path),'Duplicate asset');assets.set(path,packed);return {path,jsonBytes:raw.length,gzipBytes:packed.length,sha256:sha(raw),gzipSha256:sha(packed)};
 };
 const read=d=>{const b=assets.get(d.path);assert.ok(b&&b.length===d.gzipBytes&&sha(b)===d.gzipSha256);const raw=gunzipSync(b,{maxOutputLength:8388608});assert.ok(raw.length===d.jsonBytes&&sha(raw)===d.sha256);return decodeAnalyzerAsset(d.path,JSON.parse(raw));};
 const catalog={schemaVersion:1,mode:'isolated_validation',publicationAuthorized:false,editions:r.editions,admissions,chapters:[]};
 const reconciled=new Map(),coveredLemmas=new Set();
 for(const g of groups.values()){
  const {identity:i}=g,stem='chapters/'+[i.editionId,i.bookId,i.chapter].join('/')+'/',ls=r.lemmas.filter(l=>g.lemmaIds.has(l.id));
  assert.equal(ls.length,g.lemmaIds.size);for(const l of ls)coveredLemmas.add(l.id);
  const d={editionId:i.editionId,bookId:i.bookId,chapter:i.chapter,units:g.units.length,occurrences:g.tokens.length,
   text:pack(stem+'text.json.gz',{...i,units:g.units,tokens:g.tokens.map(t=>({...t,analysisIds:[]})),typography:g.typography}),
   annotations:pack(stem+'annotations.json.gz',{...i,lemmas:ls,analyses:g.analyses,links:g.links,supplements:g.supplements})};
  catalog.chapters.push(d);
  const p=assembleChapter(catalog,d,read(d.text),read(d.annotations));
  assert.deepEqual(p.registry.units,g.units);assert.deepEqual(p.registry.tokens,g.tokens);assert.deepEqual(p.registry.lemmas,ls);assert.deepEqual(p.registry.analyses,g.analyses);assert.deepEqual(p.supplements,g.supplements);assert.deepEqual(p.typography,g.typography);
  // A real engine validates each fragment, not just its serialization.
  const engine=createTermAnalyzer(p.registry,admissions,p.supplements);
  for(const u of g.units){const found=engine.select({editionId:u.editionId,bookId:u.bookId,chapter:u.chapter,verse:u.verse});assert.equal(found.status,'disponible');for(const t of found.occurrences){assert.ok(!reconciled.has(t.id));reconciled.set(t.id,t.form);}}
 }
 assert.equal(groups.size,168);assert.equal(assets.size,336);assert.equal(reconciled.size,r.tokens.length);
 for(const t of r.tokens)assert.equal(reconciled.get(t.id),t.form);
 // Some baseline lemmas were originally sourced from alternative readings and are not referenced by primary occurrences.
 const unusedLemmas=r.lemmas.filter(l=>!coveredLemmas.has(l.id)).length;
 validateCatalog(catalog);
 const catalogSpec=pack('catalog.json.gz',catalog);
 return {catalog,catalogSpec,assets,summary:{chapters:groups.size,chapterLayers:336,units:r.units.length,occurrences:reconciled.size,unusedLemmasExcluded:unusedLemmas,catalogGzipBytes:catalogSpec.gzipBytes,totalGzipBytes:[...assets.values()].reduce((n,b)=>n+b.length,0),maxChapterLayerGzipBytes:Math.max(...catalog.chapters.flatMap(d=>[d.text.gzipBytes,d.annotations.gzipBytes])),publicationAuthorized:false,corpusPersisted:false}};
}

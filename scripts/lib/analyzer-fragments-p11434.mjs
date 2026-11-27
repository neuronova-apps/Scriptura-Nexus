// Shared private candidate adapter; loading must verify both asset digests before decoding.
import {createTermAnalyzer} from '../../src/lib/term-analyzer.ts';
const req=ok=>{if(!ok)throw Error('Invalid linguistic fragment');};
const empty=()=>({schemaVersion:1,editions:[],units:[],tokens:[],lemmas:[],identifiers:[],analyses:[],morphCodes:[]});
const key=(e,b,c)=>JSON.stringify([e,b,c]);
const keys=(o,fields)=>o&&typeof o==='object'&&Object.keys(o).sort().join('|')===fields.split('|').sort().join('|');
const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const spec=x=>keys(x,'path|jsonBytes|gzipBytes|sha256|gzipSha256')&&Number.isSafeInteger(x.jsonBytes)&&x.jsonBytes>0&&x.jsonBytes<=8388608&&Number.isSafeInteger(x.gzipBytes)&&x.gzipBytes>0&&x.gzipBytes<=256000&&hash(x.sha256)&&hash(x.gzipSha256);
export function validateCatalog(c){
 req(keys(c,'schemaVersion|mode|publicationAuthorized|editions|admissions|chapters')&&c.schemaVersion===1&&c.mode==='isolated_validation'&&c.publicationAuthorized===false);
 req(Array.isArray(c.editions)&&Array.isArray(c.admissions)&&Array.isArray(c.chapters));
 const initial=createTermAnalyzer({...empty(),editions:c.editions},c.admissions);
 const index=new Map(),coverage=initial.coverage();
 for(const d of c.chapters){
  req(keys(d,'editionId|bookId|chapter|units|occurrences|text|annotations')&&coverage.some(e=>e.editionId===d.editionId&&e.bookIds.includes(d.bookId)));
  req(/^TXT-[A-Za-z0-9_-]+$/.test(d.editionId)&&/^LIB-[A-Za-z0-9_-]+$/.test(d.bookId)&&/^[1-9][0-9]*$/.test(d.chapter));
  req(Number.isSafeInteger(d.units)&&d.units>0&&Number.isSafeInteger(d.occurrences)&&d.occurrences>=d.units);
  const stem='chapters/'+[d.editionId,d.bookId,d.chapter].join('/')+'/';
  req(spec(d.text)&&spec(d.annotations)&&d.text.path===stem+'text.json.gz'&&d.annotations.path===stem+'annotations.json.gz');
  const k=key(d.editionId,d.bookId,d.chapter);req(!index.has(k));index.set(k,d);
 }
 return {initial,index};
}
export function assembleChapter(c,d,t,a){
 req(keys(t,'schemaVersion|editionId|bookId|chapter|units|tokens|typography')&&keys(a,'schemaVersion|editionId|bookId|chapter|lemmas|analyses|links|supplements')&&t.schemaVersion===1&&a.schemaVersion===1);
 for(const f of ['editionId','bookId','chapter'])req(t[f]===d[f]&&a[f]===d[f]);
 for(const f of ['units','tokens','typography'])req(Array.isArray(t[f]));
 for(const f of ['lemmas','analyses','links','supplements'])req(Array.isArray(a[f]));
 req(t.units.length===d.units&&t.tokens.length===d.occurrences);
 req(t.units.every(u=>u.editionId===d.editionId&&u.bookId===d.bookId&&u.chapter===d.chapter));
 const tokens=new Map(t.tokens.map(x=>[x.id,x]));req(tokens.size===t.tokens.length&&t.tokens.every(x=>Array.isArray(x.analysisIds)&&x.analysisIds.length===0));
 const links=new Map();
 for(const l of a.links){req(keys(l,'tokenId|analysisIds')&&tokens.has(l.tokenId)&&!links.has(l.tokenId)&&Array.isArray(l.analysisIds)&&l.analysisIds.length>0);links.set(l.tokenId,l.analysisIds);}
 const seen=new Set();
 for(const x of t.typography){req(keys(x,'tokenId|segments|origin')&&tokens.has(x.tokenId)&&!seen.has(x.tokenId)&&Array.isArray(x.segments)&&x.segments.length>0);seen.add(x.tokenId);
  const token=tokens.get(x.tokenId);req(JSON.stringify(x.origin)===JSON.stringify(token.origin));let end=0;for(const g of x.segments){req(keys(g,'type|start|length')&&g.type==='x-large'&&Number.isSafeInteger(g.start)&&Number.isSafeInteger(g.length)&&g.start>=end&&g.length>0&&g.start+g.length<=Array.from(token.form).length);end=g.start+g.length;}
 }
 const edition=c.editions.find(e=>e.id===d.editionId);req(edition);
 const registry={...empty(),editions:[edition],units:t.units,tokens:t.tokens.map(x=>({...x,analysisIds:links.get(x.id)??[]})),lemmas:a.lemmas,analyses:a.analyses};
 return {registry,supplements:a.supplements,typography:t.typography};
}
export function createFragmentAnalyzer(c,load){
 const {initial,index}=validateCatalog(c);
 let cache=null;
 async function prepare(ref){
  const k=key(ref.editionId,ref.bookId,ref.chapter),d=index.get(k);
  if(!d)return initial;
  if(cache?.key===k)return cache.engine;
  const [t,a]=await Promise.all([load(d.text),load(d.annotations)]);
  const p=assembleChapter(c,d,t,a),engine=createTermAnalyzer(p.registry,c.admissions,p.supplements);
  cache={key:k,engine};return engine;
 }
 return {initial,prepare};
}

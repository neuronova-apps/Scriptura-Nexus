// P11.4.2.3: lazy, integrity-checked chapter adapter. Not connected to public pages.
import type {ReaderEdition,ReaderRef,ReaderResult,ReaderView} from './reader-view.ts';
type EditionSummary=Omit<ReaderEdition,'books'>;
export interface ChapterDescriptor {editionId:string;bookId:string;chapter:string;verses:string[];unitCount:number;emptyMarkers:number;firstOrder:number;lastOrder:number;resourceId:string;jsonBytes:number;gzipBytes:number;sha256:string;gzipSha256:string}
export interface FragmentBook {id:string;name:string;chapters:ChapterDescriptor[]}
export interface FragmentEdition extends EditionSummary {books:FragmentBook[]}
export interface IsolatedCatalog {schemaVersion:1;mode:'isolated_validation';publicationAuthorized:false;editions:FragmentEdition[]}
export type FragmentLoader=(d:ChapterDescriptor)=>Promise<Uint8Array>;
export type AsyncReaderView=Omit<ReaderView,'locate'>&{locate(ref:ReaderRef):Promise<ReaderResult>};
const req=(ok:unknown)=>{if(!ok)throw new Error('Fragmento o catálogo no válido');};
const label=/^[0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?$/;
const hash=/^[0-9a-f]{64}$/;
const unique=(xs:string[])=>new Set(xs).size===xs.length;
const text=(v:unknown):v is string=>typeof v==='string'&&v.length>0;
const exact=(o:object,keys:string[])=>Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const sha=async(bytes:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',Uint8Array.from(bytes).buffer))).map(x=>x.toString(16).padStart(2,'0')).join('');
export function createIsolatedFragmentReader(input:IsolatedCatalog,load:FragmentLoader):AsyncReaderView{
 req(input.schemaVersion===1&&input.mode==='isolated_validation'&&input.publicationAuthorized===false&&typeof load==='function');
 const editions=structuredClone(input.editions);
 req(unique(editions.map(e=>e.id)));
 for(const e of editions){
  req([e.id,e.name,e.version,e.attribution,e.license,e.source].every(text)&&['spa','grc'].includes(e.language)&&unique(e.books.map(b=>b.id)));
  for(const b of e.books){
   req(text(b.id)&&text(b.name)&&b.chapters.length>0&&unique(b.chapters.map(d=>d.chapter)));
   let prior:number|undefined;
   for(const d of b.chapters){
    req(d.editionId===e.id&&d.bookId===b.id&&/^[1-9][0-9]*$/.test(d.chapter)&&d.verses.length>0&&unique(d.verses)&&d.verses.every(v=>typeof v==='string'&&label.test(v)));
    req(d.unitCount===d.verses.length&&Number.isSafeInteger(d.emptyMarkers)&&d.emptyMarkers>=0&&d.emptyMarkers<=d.unitCount&&Number.isSafeInteger(d.firstOrder)&&d.firstOrder>=0&&d.lastOrder===d.firstOrder+d.unitCount-1&&(prior===undefined||d.firstOrder===prior+1));
    req(text(d.resourceId)&&Number.isSafeInteger(d.jsonBytes)&&d.jsonBytes>0&&d.jsonBytes<=8*1024*1024&&Number.isSafeInteger(d.gzipBytes)&&d.gzipBytes>0&&d.gzipBytes<=256000&&hash.test(d.sha256)&&hash.test(d.gzipSha256));
    prior=d.lastOrder;
   }
  }
 }
 const getEdition=(id:string)=>editions.find(e=>e.id===id);
 const getBook=(e:string,b:string)=>getEdition(e)?.books.find(x=>x.id===b);
 const summarize=({books:_,...e}:FragmentEdition):EditionSummary=>({...e});
 type Unit={id:string;editionId:string;bookId:string;chapter:string;verse:string;order:number;text:string;resourceId:string;sourceLocator:string;sourceSegmentSha256:string;textSha256:string};
 // One cached chapter only; concurrent requests cannot replace a newer cache entry.
 let cache:{key:string;units:Unit[]}|null=null,sequence=0;
 async function getUnits(d:ChapterDescriptor):Promise<Unit[]>{
  const key=d.editionId+'/'+d.bookId+'/'+d.chapter;
  if(cache?.key===key)return cache.units;
  const ticket=++sequence,bytes=await load(structuredClone(d));
  req(bytes instanceof Uint8Array&&bytes.length===d.jsonBytes&&await sha(bytes)===d.sha256);
  const obj=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  req(obj&&exact(obj,['schemaVersion','format','editionId','bookId','chapter','units'])&&obj.schemaVersion===1&&obj.format==='sn-reader-chapter-v1'&&obj.editionId===d.editionId&&obj.bookId===d.bookId&&obj.chapter===d.chapter&&Array.isArray(obj.units)&&obj.units.length===d.unitCount);
  const units:Unit[]=obj.units;
  for(const [i,u] of units.entries()){
   req(u&&exact(u,['id','editionId','bookId','chapter','verse','order','text','resourceId','sourceLocator','sourceSegmentSha256','textSha256'])&&u.editionId===d.editionId&&u.bookId===d.bookId&&u.chapter===d.chapter&&u.verse===d.verses[i]&&u.order===d.firstOrder+i&&u.resourceId===d.resourceId&&text(u.sourceLocator)&&typeof u.text==='string'&&hash.test(u.sourceSegmentSha256)&&hash.test(u.textSha256));
   req(await sha(new TextEncoder().encode(u.text))===u.textSha256);
   req(u.id==='UNIT-'+await sha(new TextEncoder().encode([u.editionId,u.bookId,u.chapter,u.verse,u.sourceLocator].join('\u001f'))));
  }
  req(units.filter(u=>u.text==='').length===d.emptyMarkers);
  if(ticket===sequence)cache={key,units};
  return units;
 }
 async function locate(ref:ReaderRef):Promise<ReaderResult>{
  const e=getEdition(ref.editionId);if(!e)return {status:'edition_unavailable'};
  const b=e.books.find(x=>x.id===ref.bookId);if(!b)return {status:'book_outside_coverage'};
  const ci=b.chapters.findIndex(x=>x.chapter===ref.chapter);if(ci<0)return {status:'chapter_not_found'};
  const d=b.chapters[ci],vi=d.verses.indexOf(ref.verse);if(vi<0)return {status:'reference_not_found'};
  const u=(await getUnits(d))[vi];
  const at=(c:ChapterDescriptor,v:string):ReaderRef=>({editionId:e.id,bookId:b.id,chapter:c.chapter,verse:v});
  const prev=b.chapters[ci-1],next=b.chapters[ci+1];
  return {status:u.text?'available':'empty_marker',unit:{chapter:u.chapter,verse:u.verse,text:u.text,sourceLocator:u.sourceLocator,resourceId:u.resourceId},edition:summarize(e),bookName:b.name,
   previous:vi>0?at(d,d.verses[vi-1]):prev?at(prev,prev.verses.at(-1)!):null,
   next:vi+1<d.verses.length?at(d,d.verses[vi+1]):next?at(next,next.verses[0]):null};
 }
 return {editions:()=>editions.map(summarize),books:id=>(getEdition(id)?.books??[]).map(({id,name})=>({id,name})),chapters:(e,b)=>(getBook(e,b)?.chapters??[]).map(c=>c.chapter),verses:(e,b,c)=>[...(getBook(e,b)?.chapters.find(x=>x.chapter===c)?.verses??[])],locate};
}

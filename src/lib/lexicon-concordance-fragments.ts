import {createConcordance,type ConcordanceQuery,type FrequencyQuery} from './concordance.ts';
import {createLexicalQuery,type LexicalQuery} from './lexical-query.ts';
import {assembleChapter,decodeAnnotationLayer} from './analyzer-fragment-runtime.ts';
import {bucketFor,decodeCoordinate,createPrivateLookup,type PrivateGroupQuery} from './lexical-fragment-runtime.ts';
import {openPrivateFragmentSource} from './private-fragment-loader.ts';
const require=(ok:unknown):void=>{if(!ok)throw new Error('La consulta privada no pudo completarse.');};
const SUMMARY_BUCKETS=16;
type ConcordanceEngine=ReturnType<typeof createConcordance>;
type Occurrence=ReturnType<ConcordanceEngine['search']>['occurrences'][number];
type Coverage=ReturnType<ConcordanceEngine['coverage']>[number];
type LexicalSummary={id:string;system:'index'|'strong'|'bdb';providerKey:string;language:'hbo'|'arc'|'grc'|null};
export async function createLexiconConcordanceFragments(options:{manifestUrl:string;assetBase:string}){
 const source=await openPrivateFragmentSource(options.manifestUrl,options.assetBase),catalog=source.catalog;
 const chapterCatalog=await source.load(catalog.chapterCatalog);
 require(chapterCatalog&&chapterCatalog.schemaVersion===1&&Array.isArray(chapterCatalog.editions)&&Array.isArray(chapterCatalog.admissions)&&Array.isArray(chapterCatalog.chapters));
 const lookup=createPrivateLookup(catalog,source.load),coverage=catalog.coverage as Coverage[],groupExists=(q:PrivateGroupQuery)=>lookup.hasGroup(q);
 const summaryCache=new Map<string,Map<string,LexicalSummary>>();let lemmaCache:Map<string,string>|null=null;
 const summaries=async(ids:string[])=>{
  const pending=new Map<string,string[]>();for(const id of ids){const b=bucketFor(id,SUMMARY_BUCKETS),a=pending.get(b)??[];a.push(id);pending.set(b,a);}
  const found=new Map<string,LexicalSummary>();
  for(const [b,keys] of pending){
   let rows=summaryCache.get(b);
   if(!rows){const d=catalog.lexicalSummaryBuckets[b];require(d);const p=await source.load(d);require(p.bucket===b&&Array.isArray(p.entries));rows=new Map<string,LexicalSummary>(p.entries.map((x:LexicalSummary)=>[x.id,x] as [string,LexicalSummary]));summaryCache.set(b,rows);if(summaryCache.size>4)summaryCache.delete(summaryCache.keys().next().value!);}
   for(const id of keys){const x=rows.get(id);if(!x)throw new Error('Resumen léxico ausente');found.set(id,x);}
  }
  return ids.map(id=>found.get(id)!);
 };
 const lemmas=async()=>{
  if(lemmaCache)return lemmaCache;const p=await source.load(catalog.lemmaCatalog);require(p.schemaVersion===1&&Array.isArray(p.lemmas));
  lemmaCache=new Map<string,string>(p.lemmas.map((x:any)=>[x.id,x.language] as [string,string]));return lemmaCache;
 };
 const scopeStatus=(q:{editionId:string;language:string;bookId?:string})=>{
  const e=coverage.find(x=>x.editionId===q.editionId);if(!e)return 'edicion_no_disponible';
  if(!e.languages.includes(q.language as any))return 'lengua_fuera_de_cobertura';
  if(q.bookId&&!e.bookIds.includes(q.bookId))return 'libro_fuera_de_cobertura';return 'disponible';
 };
 const chapterCache=new Map<number,Promise<{text:any;engine:ConcordanceEngine}>>();
 const chapter=async(index:number)=>{
  const old=chapterCache.get(index);if(old){chapterCache.delete(index);chapterCache.set(index,old);return old;}
  const promise=(async()=>{
   const d=chapterCatalog.chapters[index];require(d);const [text,packed]=await Promise.all([source.load(d.text),source.load(d.annotations)]);
   const annotations=decodeAnnotationLayer(packed),p=assembleChapter(chapterCatalog.editions,d,text,annotations);
   const engine=createConcordance(p.registry,chapterCatalog.admissions,p.supplements);return {text,engine};
  })();
  chapterCache.set(index,promise);if(chapterCache.size>2)chapterCache.delete(chapterCache.keys().next().value!);
  try{return await promise;}catch{chapterCache.delete(index);throw new Error('No se pudo reconstruir el capítulo privado.');}
 };
 const resolveOccurrences=async(refs:number[],q:ConcordanceQuery):Promise<Occurrence[]>=>{
  const grouped=new Map<number,{index:number;position:number}[]>();refs.forEach((value,index)=>{const x=decodeCoordinate(value,chapterCatalog.chapters),a=grouped.get(x.chapter)??[];a.push({index,position:x.position});grouped.set(x.chapter,a);});
  const result=new Array<Occurrence>(refs.length),{offset:_offset,limit:_limit,...query}=q;
  for(const [chapterIndex,items] of grouped){
   const loaded=await chapter(chapterIndex),byToken=new Map<string,Occurrence>();let offset=0;
   while(true){const page=loaded.engine.search({...query,offset,limit:100} as ConcordanceQuery);if(page.status!=='disponible')throw new Error('Ocurrencia no disponible en el fragmento');for(const hit of page.occurrences)byToken.set(hit.tokenId,hit);if(page.nextOffset===null)break;offset=page.nextOffset;}
   for(const item of items){const token=loaded.text.tokens[item.position];require(token);const hit=byToken.get(token.id);if(!hit)throw new Error('Ocurrencia reconstruida ausente');result[item.index]=hit;}
  }
  require(result.every(Boolean));return result;
 };
 const lexicon={
  available:()=>[...catalog.lexicalSystems] as string[],
  detail:(id:string)=>lookup.detail(id),
  search:async(q:LexicalQuery)=>{
   const offset=q.offset??0,limit=q.limit??20;
   if(q.mode==='form'&&!catalog.lexicalLanguages.includes(q.language))return {status:'lengua_no_disponible',total:null,offset,limit,nextOffset:null,entries:[]};
   if(q.mode==='identifier'&&!catalog.lexicalSystems.includes(q.system))return {status:'recurso_no_disponible',total:null,offset,limit,nextOffset:null,entries:[]};
   const group:PrivateGroupQuery=q.mode==='form'?{kind:'lexical',mode:'form',language:q.language}:{kind:'lexical',mode:'identifier',system:q.system};
   const r=await lookup.lookup(group,q.value,offset,limit);
   if(r.status!=='available')return {status:'disponible',total:0,offset,limit,nextOffset:null,entries:[]};
   const entries=await summaries(r.refs as string[]);
   return {status:'disponible',total:r.total,offset:r.offset,limit:r.limit,nextOffset:r.nextOffset,entries};
  }
 };
 const concordance={
  coverage:()=>coverage.map(x=>structuredClone(x)),
  frequency:async(q:FrequencyQuery)=>{
   const {offset=0,limit=20,...scope}=q,group:PrivateGroupQuery={kind:'concordance',...scope};
   const status=scopeStatus(q);if(status!=='disponible')return {status,totalKeys:null,totalPostings:null,offset,limit,nextOffset:null,entries:[]};
   const r=await lookup.frequency(group,offset,limit);
   if(r.status!=='available'){
    if(q.mode==='provider'&&!groupExists({kind:'concordance',editionId:q.editionId,language:q.language,mode:'provider',system:q.system}))return {status:'sistema_no_disponible',totalKeys:null,totalPostings:null,offset,limit,nextOffset:null,entries:[]};
    return {status:'disponible',totalKeys:0,totalPostings:0,offset,limit,nextOffset:null,entries:[]};
   }
   return {status:'disponible',totalKeys:r.total,totalPostings:r.totalPostings,offset:r.offset,limit:r.limit,nextOffset:r.nextOffset,entries:r.entries};
  },
  search:async(q:ConcordanceQuery)=>{
   const {offset=0,limit=20,...scope}=q,group:PrivateGroupQuery={kind:'concordance',...scope};
   const status=scopeStatus(q);if(status!=='disponible')return {status,total:null,offset,limit,nextOffset:null,occurrences:[]};
   if(q.mode==='lemma'&&(await lemmas()).get(q.lemmaId)!==q.language)return {status:'lema_no_disponible',total:null,offset,limit,nextOffset:null,occurrences:[]};
   if(q.mode==='provider'&&!groupExists({kind:'concordance',editionId:q.editionId,language:q.language,mode:'provider',system:q.system}))return {status:'sistema_no_disponible',total:null,offset,limit,nextOffset:null,occurrences:[]};
   const key=q.mode==='lemma'?q.lemmaId:q.value,r=await lookup.lookup(group,key,offset,limit);
   if(r.status!=='available')return {status:'disponible',total:0,offset,limit,nextOffset:null,occurrences:[]};
   const occurrences=await resolveOccurrences(r.refs as number[],q);
   return {status:'disponible',total:r.total,offset:r.offset,limit:r.limit,nextOffset:r.nextOffset,occurrences};
  }
 };
 return {lexicon,concordance,close:()=>{chapterCache.clear();summaryCache.clear();source.close();}};
}

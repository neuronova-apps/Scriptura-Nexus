import type {AdmittedFile,Edition,LinguisticRegistry,Unit,Token,Lemma,MorphAnalysis} from './linguistic-contracts.ts';
import type {createTermAnalyzer} from './term-analyzer.ts';
type Supplement=NonNullable<Parameters<typeof createTermAnalyzer>[2]>[number];
const require=(ok:unknown):void=>{if(!ok)throw new Error('Fragmento de capítulo inválido');};
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v:Record<string,unknown>,fields:string[])=>Object.keys(v).length===fields.length&&fields.every(k=>Object.hasOwn(v,k));
export function decodeAnnotationLayer(value:unknown):unknown{
 require(object(value)&&exact(value,['schemaVersion','encoding','strings','value'])&&value.schemaVersion===1&&value.encoding==='string-table-v1'&&Array.isArray(value.strings)&&value.strings.length<=200000);
 const strings=value.strings as unknown[];require(strings.every(x=>typeof x==='string')&&new Set(strings).size===strings.length);
 const used=new Set<number>();let budget=8388608,nodes=0;
 const consume=(n:number)=>{budget-=n;require(budget>=0);};
 const walk=(v:unknown,depth=0):unknown=>{
  require(depth<=32&&++nodes<=1000000);consume(8);
  if(typeof v==='string'){
   require(/^(0|[1-9][0-9]*)$/.test(v)&&v.length<=6);const i=Number(v);require(i<strings.length);used.add(i);
   const s=strings[i] as string;consume(s.length*2);return s;
  }
  if(Array.isArray(v))return v.map(x=>walk(x,depth+1));
  if(object(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>{consume(k.length*2);return [k,walk(x,depth+1)];}));
  require(v===null||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v));return v;
 };
 const result=walk(value.value);require(used.size===strings.length);return result;
}
export function assembleChapter(editions:readonly Edition[],descriptor:{editionId:string;bookId:string;chapter:string;units:number;occurrences:number},textValue:unknown,annotationValue:unknown){
 if(!object(textValue)||!object(annotationValue))throw new Error('Fragmento de capítulo inválido');
 const t=textValue,a=annotationValue;
 require(exact(t,['schemaVersion','editionId','bookId','chapter','units','tokens','typography'])&&exact(a,['schemaVersion','editionId','bookId','chapter','lemmas','analyses','links','supplements']));
 require(t.schemaVersion===1&&a.schemaVersion===1);
 for(const k of ['editionId','bookId','chapter'])require(t[k]===descriptor[k]&&a[k]===descriptor[k]);
 require(Array.isArray(t.units)&&Array.isArray(t.tokens)&&Array.isArray(t.typography)&&Array.isArray(a.lemmas)&&Array.isArray(a.analyses)&&Array.isArray(a.links)&&Array.isArray(a.supplements));
 const units=t.units as Unit[],rawTokens=t.tokens as Token[],lemmas=a.lemmas as Lemma[],analyses=a.analyses as MorphAnalysis[];
 require(units.length===descriptor.units&&rawTokens.length===descriptor.occurrences);
 require(units.every(u=>u.editionId===descriptor.editionId&&u.bookId===descriptor.bookId&&u.chapter===descriptor.chapter));
 const tokens=new Map<string,Token>();for(const token of rawTokens){require(typeof token.id==='string'&&!tokens.has(token.id)&&Array.isArray(token.analysisIds)&&token.analysisIds.length===0);tokens.set(token.id,token);}
 const links=new Map<string,string[]>();
 for(const link of a.links as any[]){require(object(link)&&exact(link,['tokenId','analysisIds'])&&tokens.has(link.tokenId)&&!links.has(link.tokenId)&&Array.isArray(link.analysisIds)&&link.analysisIds.length>0);links.set(link.tokenId,link.analysisIds);}
 const edition=editions.find(e=>e.id===descriptor.editionId);if(!edition)throw new Error('Edición de capítulo ausente');
 const registry:LinguisticRegistry={schemaVersion:1,editions:[edition],units,tokens:rawTokens.map(t=>({...t,analysisIds:links.get(t.id)??[]})),lemmas,identifiers:[],analyses,morphCodes:[]};
 require(registry.tokens.every(t=>units.some(u=>u.id===t.unitId)));
 return {registry,supplements:a.supplements as Supplement[],typography:t.typography};
}

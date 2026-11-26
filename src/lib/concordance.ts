// P8.4.4: concordance by exact form or admitted occurrence lemma, never dictionary equivalence.
import {createTermAnalyzer} from './term-analyzer.ts';
import type {AdmittedFile,LinguisticRegistry,Language,Origin} from './linguistic-contracts.ts';
type Supplements=NonNullable<Parameters<typeof createTermAnalyzer>[2]>;
export type ConcordanceQuery={editionId:string;language:Language;bookId?:string;offset?:number;limit?:number}&(
 {mode:'form';value:string}|{mode:'lemma';lemmaId:string}|{mode:'provider';system:string;value:string});
export type FrequencyQuery={editionId:string;language:Language;bookId?:string;offset?:number;limit?:number}&(
 {mode:'form'|'lemma'}|{mode:'provider';system:string});
type LemmaEvidence={lemmaId:string;system:string;providerKey:string;form:string|null;origin:Origin;annotationOrigin:Origin;componentPositions:number[];analysisIds:string[]};
type Occurrence={tokenId:string;editionId:string;bookId:string;chapter:string;verse:string;unitId:string;unitOrder:number;position:number;form:string;language:Language;direction:'ltr'|'rtl';origin:Origin;lemmas:LemmaEvidence[];lexicalState:'codigo_proveedor'|'vinculado'|'ausente'};
const cmp=(a:string,b:string)=>a<b?-1:a>b?1:0;
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=1024;
const natural=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const copy=<T,>(v:T):T=>structuredClone(v);
export function createConcordance(registry:LinguisticRegistry,admissions:readonly AdmittedFile[],supplements:readonly Supplements[number][]=[]){
 const data=copy(registry);
 // Reuse the previously tested source and supplementary-link validation.
 const analyzer=createTermAnalyzer(data,admissions,supplements);
 const editions=new Map(data.editions.map(e=>[e.id,e]));
 const units=new Map(data.units.map(u=>[u.id,u]));
 const lemmas=new Map(data.lemmas.map(l=>[l.id,l]));
 const rows:Occurrence[]=[];
 for(const t of data.tokens){
  const u=units.get(t.unitId)!;
  const a=analyzer.analyze(t.id);
  if(a.status!=='disponible')throw new Error('Ocurrencia no validada');
  const evidence=new Map<string,LemmaEvidence>();
  const add=(id:string,origin:Origin,component:number|null,analysisId:string|null)=>{
   const l=lemmas.get(id)!;
   const key=JSON.stringify([id,origin.fileId,origin.locator]);
   let e=evidence.get(key);
   if(!e){e={lemmaId:id,system:l.system,providerKey:l.providerKey,form:l.form,origin:l.origin,annotationOrigin:origin,componentPositions:[],analysisIds:[]};evidence.set(key,e);}
   if(component!==null&&!e.componentPositions.includes(component))e.componentPositions.push(component);
   if(analysisId!==null&&!e.analysisIds.includes(analysisId))e.analysisIds.push(analysisId);
  };
  for(const c of a.lexical.components)if(c.lemmaId&&a.lexical.origin)add(c.lemmaId,a.lexical.origin,c.position,null);
  for(const d of a.lexical.direct){
   const analysis=a.morphology.analyses.find(x=>x.id===d.analysisId);
   if(!analysis)throw new Error('Anotación no validada');
   add(d.lemma.id,analysis.origin,null,d.analysisId);
  }
  const lexicalState=a.lexical.state;
  if(lexicalState!=='codigo_proveedor'&&lexicalState!=='vinculado'&&lexicalState!=='ausente')throw new Error('Estado léxico no validado');
  rows.push({tokenId:t.id,editionId:u.editionId,bookId:u.bookId,chapter:u.chapter,verse:u.verse,unitId:u.id,unitOrder:u.order,position:t.position,form:t.form,language:t.language,direction:t.direction,origin:t.origin,lemmas:[...evidence.values()],lexicalState});
 }
 rows.sort((a,b)=>cmp(a.editionId,b.editionId)||a.unitOrder-b.unitOrder||a.position-b.position||cmp(a.tokenId,b.tokenId));
 // P8.4.5: inverted postings built once, ordered exactly like the original scan.
 // Every scope has independent keys; no alias, normalization or cross-edition merge.
 type Scope={editionId:string;language:Language;bookId?:string};
 type Mode='form'|'lemma'|'provider';
 const groupKey=(q:Scope,mode:Mode,system?:string)=>JSON.stringify([q.editionId,q.language,q.bookId??null,mode,system??null]);
 const groups=new Map<string,Map<string,Occurrence[]>>();
 const insert=(scope:Scope,mode:Mode,key:string,row:Occurrence,system?:string)=>{
  const g=groupKey(scope,mode,system);
  let keys=groups.get(g);if(!keys){keys=new Map();groups.set(g,keys);}
  let hits=keys.get(key);if(!hits){hits=[];keys.set(key,hits);}
  // Each row's keys have already been deduplicated before insertion.
  hits.push(row);
 };
 for(const row of rows){
  const common={editionId:row.editionId,language:row.language};
  const lemmaIds=new Set(row.lemmas.map(l=>l.lemmaId));
  const providerKeys=new Map(row.lemmas.map(l=>[JSON.stringify([l.system,l.providerKey]),l]));
  for(const scope of [common,{...common,bookId:row.bookId}]){
   insert(scope,'form',row.form,row);
   for(const id of lemmaIds)insert(scope,'lemma',id,row);
   for(const l of providerKeys.values())insert(scope,'provider',l.providerKey,row,l.system);
  }
 }
 type FrequencyEntry={key:string;count:number};
 const frequencies=new Map<string,{entries:FrequencyEntry[];totalPostings:number}>();
 // Build rankings on demand; keep private immutable snapshots, return only requested page.
 const ranking=(g:string)=>{
  let r=frequencies.get(g);
  if(!r){const entries=[...(groups.get(g)??new Map<string,Occurrence[]>())].map(([key,hits])=>({key,count:hits.length})).sort((a,b)=>b.count-a.count||cmp(a.key,b.key));
   r={entries,totalPostings:entries.reduce((n,x)=>n+x.count,0)};frequencies.set(g,r);}
  return r;
 };
 const scopeStatus=(q:Scope)=>{
  const e=editions.get(q.editionId);
  if(!e)return 'edicion_no_disponible' as const;
  if(!e.languages.includes(q.language))return 'lengua_fuera_de_cobertura' as const;
  if(q.bookId!==undefined&&!e.coverageBookIds.includes(q.bookId))return 'libro_fuera_de_cobertura' as const;
  return 'disponible' as const;
 };
 const validScope=(q:Scope)=>text(q.editionId)&&['hbo','arc','grc'].includes(q.language)&&(q.bookId===undefined||text(q.bookId));
 const providerAvailable=(q:Scope,system:string)=>groups.has(groupKey({editionId:q.editionId,language:q.language},'provider',system));
 const search=(q:ConcordanceQuery)=>{
  const offset=q.offset??0,limit=q.limit??25;
  if(!natural(offset)||!natural(limit)||limit<1||limit>100||!validScope(q)||
    !((q.mode==='form'&&text(q.value))||(q.mode==='lemma'&&text(q.lemmaId))||(q.mode==='provider'&&text(q.system)&&text(q.value))))throw new Error('Consulta inválida');
  const empty=(status:'edicion_no_disponible'|'lengua_fuera_de_cobertura'|'libro_fuera_de_cobertura'|'lema_no_disponible'|'sistema_no_disponible')=>({status,total:null,offset,limit,nextOffset:null,occurrences:[] as Occurrence[]});
  const status=scopeStatus(q);if(status!=='disponible')return empty(status);
  if(q.mode==='lemma'&&(!lemmas.has(q.lemmaId)||lemmas.get(q.lemmaId)!.language!==q.language))return empty('lema_no_disponible');
  if(q.mode==='provider'&&!providerAvailable(q,q.system))return empty('sistema_no_disponible');
  const g=groupKey(q,q.mode,q.mode==='provider'?q.system:undefined);
  const matches=groups.get(g)?.get(q.mode==='lemma'?q.lemmaId:q.value)??[];
  return copy({status:'disponible' as const,total:matches.length,offset,limit,nextOffset:offset+limit<matches.length?offset+limit:null,occurrences:matches.slice(offset,offset+limit)});
 };
 const frequency=(q:FrequencyQuery)=>{
  const offset=q.offset??0,limit=q.limit??25;
  if(!natural(offset)||!natural(limit)||limit<1||limit>100||!validScope(q)||
    !(q.mode==='form'||q.mode==='lemma'||(q.mode==='provider'&&text(q.system))))throw new Error('Consulta de frecuencias inválida');
  const empty=(status:'edicion_no_disponible'|'lengua_fuera_de_cobertura'|'libro_fuera_de_cobertura'|'sistema_no_disponible')=>({status,totalKeys:null,totalPostings:null,offset,limit,nextOffset:null,entries:[] as FrequencyEntry[]});
  const status=scopeStatus(q);if(status!=='disponible')return empty(status);
  if(q.mode==='provider'&&!providerAvailable(q,q.system))return empty('sistema_no_disponible');
  const r=ranking(groupKey(q,q.mode,q.mode==='provider'?q.system:undefined));
  return copy({status:'disponible' as const,totalKeys:r.entries.length,totalPostings:r.totalPostings,offset,limit,nextOffset:offset+limit<r.entries.length?offset+limit:null,entries:r.entries.slice(offset,offset+limit)});
 };
 const coverage=()=>analyzer.coverage();
 return Object.freeze({coverage,search,frequency});
}

// P8.4.4: concordance by exact form or admitted occurrence lemma, never dictionary equivalence.
import {createTermAnalyzer} from './term-analyzer.ts';
import type {AdmittedFile,LinguisticRegistry,Language,Origin} from './linguistic-contracts.ts';
type Supplements=NonNullable<Parameters<typeof createTermAnalyzer>[2]>;
export type ConcordanceQuery={editionId:string;language:Language;bookId?:string;offset?:number;limit?:number}&(
 {mode:'form';value:string}|{mode:'lemma';lemmaId:string}|{mode:'provider';system:string;value:string});
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
 const search=(q:ConcordanceQuery)=>{
  const offset=q.offset??0,limit=q.limit??25;
  if(!natural(offset)||!natural(limit)||limit<1||limit>100||!text(q.editionId)||!['hbo','arc','grc'].includes(q.language)|| (q.bookId!==undefined&&!text(q.bookId))||
    !((q.mode==='form'&&text(q.value))||(q.mode==='lemma'&&text(q.lemmaId))||(q.mode==='provider'&&text(q.system)&&text(q.value))))throw new Error('Consulta inválida');
  const e=editions.get(q.editionId);
  const empty=(status:'edicion_no_disponible'|'lengua_fuera_de_cobertura'|'libro_fuera_de_cobertura'|'lema_no_disponible'|'sistema_no_disponible')=>({status,total:null,offset,limit,nextOffset:null,occurrences:[] as Occurrence[]});
  if(!e)return empty('edicion_no_disponible');
  if(!e.languages.includes(q.language))return empty('lengua_fuera_de_cobertura');
  if(q.bookId!==undefined&&!e.coverageBookIds.includes(q.bookId))return empty('libro_fuera_de_cobertura');
  // All matching is scoped to this edition and language. A provider code is not a Strong code.
  const scope=rows.filter(r=>r.editionId===q.editionId&&r.language===q.language&&(!q.bookId||r.bookId===q.bookId));
  if(q.mode==='lemma'&&(!lemmas.has(q.lemmaId)||lemmas.get(q.lemmaId)!.language!==q.language))return empty('lema_no_disponible');
  if(q.mode==='provider'&&!rows.some(r=>r.editionId===q.editionId&&r.language===q.language&&r.lemmas.some(l=>l.system===q.system)))return empty('sistema_no_disponible');
  const matches=scope.filter(r=>q.mode==='form'?r.form===q.value:q.mode==='lemma'?r.lemmas.some(l=>l.lemmaId===q.lemmaId):r.lemmas.some(l=>l.system===q.system&&l.providerKey===q.value));
  return copy({status:'disponible' as const,total:matches.length,offset,limit,nextOffset:offset+limit<matches.length?offset+limit:null,occurrences:matches.slice(offset,offset+limit)});
 };
 const coverage=()=>analyzer.coverage();
 return Object.freeze({coverage,search});
}

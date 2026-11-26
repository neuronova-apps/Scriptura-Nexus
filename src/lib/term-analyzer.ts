// P8.3.3: exact occurrence lookup, with no inference or publication.
import {validateLinguisticRegistry} from './linguistic-contracts.ts';
import type {AdmittedFile,LinguisticRegistry,Origin,Language} from './linguistic-contracts.ts';
type Reference={editionId:string;bookId:string;chapter:string;verse:string};
type Supplement={tokenId:string;lexical:{raw:string|null;origin:Origin|null;components:{position:number;code:string;lemmaId:string|null}[]};morphology:{state:'documented'|'partial'|'unresolved'|'absent';analysisId:string|null}};
const key=(r:Reference)=>JSON.stringify([r.editionId,r.bookId,r.chapter,r.verse]);
const require=(condition:unknown,message:string)=>{if(!condition)throw new Error(message);};
export function createTermAnalyzer(registry:LinguisticRegistry,admissions:readonly AdmittedFile[],supplements:readonly Supplement[]=[]){
 const errors=validateLinguisticRegistry(registry,admissions);
 require(errors.length===0,'Registro lingüístico inválido o no admitido');
 const data=structuredClone(registry);
 const editions=new Map(data.editions.map(x=>[x.id,x]));
 const units=new Map(data.units.map(x=>[x.id,x]));
 const references=new Map(data.units.map(x=>[key(x),x]));
 const tokens=new Map(data.tokens.map(x=>[x.id,x]));
 const lemmas=new Map(data.lemmas.map(x=>[x.id,x]));
 const analyses=new Map(data.analyses.map(x=>[x.id,x]));
 const files=new Map(admissions.map(x=>[x.id,x]));
 const byUnit=new Map<string,typeof data.tokens>();
 for(const t of data.tokens){
  const list=byUnit.get(t.unitId)??[];list.push(t);byUnit.set(t.unitId,list);
 }
 for(const list of byUnit.values())list.sort((a,b)=>a.position-b.position);
 const extra=new Map<string,Supplement>();
 for(const s of supplements){
  const t=tokens.get(s.tokenId);
  require(t&&t.language!=='grc'&&!extra.has(s.tokenId),'Suplemento ajeno o duplicado');
  const l=s.lexical,o=l.origin,f=o?files.get(o.fileId):undefined;
  if(l.raw===null)require(o===null&&l.components.length===0,'Lema ausente con datos');
  else{
   require(typeof l.raw==='string'&&o&&f&&o.fileId===t?.origin.fileId&&o.component==='anotaciones_lema'&&o.commit===f.commit&&o.sha256===f.sha256&&f.allowedComponents.includes(o.component)&&o.locator,'Procedencia léxica no admitida');
   require(l.components.map(c=>c.code).join('/')===l.raw,'Componentes léxicos divergentes');
  }
  for(const [i,c] of l.components.entries()){
   const lemma=c.lemmaId===null?null:lemmas.get(c.lemmaId);
   require(c.position===i&&(c.lemmaId===null||lemma&&lemma.language===t?.language&&lemma.providerKey===c.code&&lemma.origin.fileId===o?.fileId&&lemma.origin.commit===o?.commit),'Vínculo léxico inválido');
  }
  const m=s.morphology,a=m.analysisId===null?null:analyses.get(m.analysisId);
  require(['documented','partial','unresolved','absent'].includes(m.state),'Estado morfológico inválido');
  require(m.state==='absent'?m.analysisId===null&&t?.analysisIds.length===0:a&&a.tokenId===t?.id&&t?.analysisIds.includes(a.id)&&a.state===(m.state==='documented'?'documentado':'sin_interpretar'),'Suplemento morfológico divergente');
  extra.set(s.tokenId,structuredClone(s));
 }
 const copy=<T,>(v:T):T=>structuredClone(v);
 const select=(r:Reference)=>{
  const e=editions.get(r.editionId);
  if(!e)return {status:'edicion_no_disponible' as const,reference:copy(r),occurrences:[]};
  if(!e.coverageBookIds.includes(r.bookId))return {status:'fuera_de_cobertura' as const,reference:copy(r),occurrences:[]};
  const u=references.get(key(r));
  if(!u)return {status:'unidad_no_disponible' as const,reference:copy(r),occurrences:[]};
  return {status:'disponible' as const,reference:copy(r),unitId:u.id,occurrences:(byUnit.get(u.id)??[]).map(t=>({id:t.id,position:t.position,form:t.form,language:t.language,direction:t.direction}))};
 };
 const analyze=(tokenId:string)=>{
  const t=tokens.get(tokenId);
  if(!t)return {status:'ocurrencia_no_disponible' as const,tokenId};
  const u=units.get(t.unitId)!,e=editions.get(u.editionId)!,s=extra.get(t.id);
  const aa=t.analysisIds.map(id=>analyses.get(id)!);
  const direct=aa.filter(a=>a.lemmaId!==null).map(a=>({analysisId:a.id,lemma:lemmas.get(a.lemmaId!)!}));
  const lexical=s?{state:s.lexical.raw===null?'ausente':'codigo_proveedor',raw:s.lexical.raw,origin:s.lexical.origin,components:s.lexical.components.map(c=>({...c,lemma:c.lemmaId===null?null:lemmas.get(c.lemmaId)!})),direct:[]}: {state:direct.length?'vinculado':'ausente',raw:null,origin:null,components:[],direct};
  const morphState=s?({documented:'documentado',partial:'parcial',unresolved:'sin_interpretar',absent:'ausente'} as const)[s.morphology.state]:aa.length===0?'ausente':aa.every(a=>a.state==='documentado')?'documentado':aa.every(a=>a.state==='sin_interpretar')?'sin_interpretar':'mixto_o_alternativo';
  const ids=new Set([...direct.map(x=>x.lemma.id),...(s?.lexical.components.flatMap(c=>c.lemmaId?[c.lemmaId]:[])??[])]);
  const identifiers=data.identifiers.filter(x=>x.lemmaIds.some(id=>ids.has(id)));
  return copy({status:'disponible' as const,token:t,reference:{editionId:e.id,bookId:u.bookId,chapter:u.chapter,verse:u.verse},edition:e,lexical,morphology:{state:morphState,analyses:aa},identifiers,meaning:{state:'no_disponible' as const},alternatives:{state:'no_evaluadas' as const},sourcePolicy:'Procedencia por componente; no inferir traducción, Strong ni correspondencia entre ediciones.'});
 };
 const coverage=()=>copy(data.editions.map(e=>({editionId:e.id,name:e.name,version:e.version,bookIds:e.coverageBookIds,languages:e.languages as Language[],versificationRef:e.versificationRef,canonRef:e.canonRef})));
 return Object.freeze({coverage,select,analyze});
}

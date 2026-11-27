// Reference-only display projection. It is not an admission or documentary verification engine.
export interface DocumentarySource {id:string;title:string;url:string;rightsUrl:string;rights:string;attribution:string}
export interface DocumentaryEvidence {id:string;sourceId:string;locator:string;kind:'catalog'|'editorial_apparatus'|'secondary_report'|'direct_inspection';reviewedOn:string}
export interface WitnessCard {id:string;name:string;catalogIdentifier:string;dating:string;language:string;institution:string;shelfmark:string|null;evidenceIds:string[]}
export interface ReadingCard {id:string;reference:string;evidenceIds:string[];attestations:{witnessId:string;evidenceId:string;basis:'secondary_report'|'direct_inspection';locator:string;hand:string|null}[]}
export interface VariantCard {id:string;locus:string;edition:string;apparatusEvidenceId:string;readings:ReadingCard[];assessment:'not_assessed'|'inconclusive'}
export interface ManuscriptRelease {publicationAuthorized:boolean;witnesses:WitnessCard[];variants:VariantCard[];sources:DocumentarySource[];evidence:DocumentaryEvidence[]}
export const emptyManuscriptRelease=():ManuscriptRelease=>({publicationAuthorized:false,witnesses:[],variants:[],sources:[],evidence:[]});
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(v:unknown,keys:string[])=>object(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const nonblank=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&!/[\u0000-\u001f\u007f]/u.test(v);
const safeUrl=(v:unknown)=>{if(!nonblank(v))return false;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
function need(condition:unknown,message:string):asserts condition{if(!condition)throw new Error(message);}
const prefix=(value:unknown,p:string)=>nonblank(value)&&new RegExp('^'+p+'-[A-Za-z0-9][A-Za-z0-9_-]*$').test(value);
const unique=(values:unknown[])=>new Set(values).size===values.length;
const date=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export function createManuscriptView(input:ManuscriptRelease){
 need(exact(input,['publicationAuthorized','witnesses','variants','sources','evidence'])&&typeof input.publicationAuthorized==='boolean','Proyección inválida');
 for(const list of [input.witnesses,input.variants,input.sources,input.evidence])need(Array.isArray(list),'Lista requerida');
 if(!input.publicationAuthorized)need([input.witnesses,input.variants,input.sources,input.evidence].every(v=>v.length===0),'Publicación no autorizada');
 const release=structuredClone(input);
 const index=<T extends {id:string}>(items:T[],p:string)=>{need(items.every(x=>object(x)&&prefix(x.id,p))&&unique(items.map(x=>x.id)),'Identidades inválidas');return new Map(items.map(x=>[x.id,x]));};
 const sources=index(release.sources,'REC'),evidence=index(release.evidence,'EVD'),witnesses=index(release.witnesses,'MAN'),variants=index(release.variants,'VAR');
 const refs=(values:string[],map:Map<string,unknown>)=>Array.isArray(values)&&values.length>0&&unique(values)&&values.every(id=>map.has(id));
 for(const s of sources.values())need(exact(s,['id','title','url','rightsUrl','rights','attribution'])&&[s.title,s.rights,s.attribution].every(nonblank)&&safeUrl(s.url)&&safeUrl(s.rightsUrl),'Fuente o enlace inválido');
 for(const e of evidence.values())need(exact(e,['id','sourceId','locator','kind','reviewedOn'])&&sources.has(e.sourceId)&&nonblank(e.locator)&&nonblank(e.reviewedOn)&&date(e.reviewedOn)&&['catalog','editorial_apparatus','secondary_report','direct_inspection'].includes(e.kind),'Evidencia inválida');
 for(const w of witnesses.values())need(exact(w,['id','name','catalogIdentifier','dating','language','institution','shelfmark','evidenceIds'])&&[w.name,w.catalogIdentifier,w.dating,w.language,w.institution].every(nonblank)&&(w.shelfmark===null||nonblank(w.shelfmark))&&refs(w.evidenceIds,evidence)&&w.evidenceIds.some(id=>evidence.get(id)?.kind==='catalog'),'Ficha de testigo inválida');
 const readingIds=new Set<string>();
 for(const v of variants.values()){
  need(exact(v,['id','locus','edition','apparatusEvidenceId','readings','assessment'])&&nonblank(v.locus)&&nonblank(v.edition)&&evidence.get(v.apparatusEvidenceId)?.kind==='editorial_apparatus'&&['not_assessed','inconclusive'].includes(v.assessment)&&Array.isArray(v.readings)&&v.readings.length>=2,'Variante inválida');
  for(const reading of v.readings){
   need(exact(reading,['id','reference','evidenceIds','attestations'])&&prefix(reading.id,'LEC')&&!readingIds.has(reading.id)&&nonblank(reading.reference)&&refs(reading.evidenceIds,evidence)&&reading.evidenceIds.includes(v.apparatusEvidenceId)&&Array.isArray(reading.attestations),'Referencia de lectura inválida');
   readingIds.add(reading.id);
   need(reading.attestations.every(a=>object(a))&&unique(reading.attestations.map(a=>a.witnessId)),'Atestaciones duplicadas o inválidas');
   for(const a of reading.attestations)need(exact(a,['witnessId','evidenceId','basis','locator','hand'])&&witnesses.has(a.witnessId)&&reading.evidenceIds.includes(a.evidenceId)&&['secondary_report','direct_inspection'].includes(a.basis)&&evidence.get(a.evidenceId)?.kind===a.basis&&nonblank(a.locator)&&(a.hand===null||nonblank(a.hand))&&(a.basis!=='secondary_report'||a.hand===null),'Atestación sin evidencia del tipo declarado');
  }
 }
 const clone=<T>(x:T):T=>structuredClone(x);
 const query=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('es').trim();
 return {
  available:release.publicationAuthorized,
  witnesses:(search='')=>clone(release.witnesses.filter(w=>query([w.name,w.catalogIdentifier,w.institution,w.dating,w.language,w.shelfmark??''].join(' ')).includes(query(search)))),
  variants:()=>clone(release.variants.map(v=>({id:v.id,locus:v.locus,edition:v.edition}))),
  witness:(id:string)=>clone(witnesses.get(id)??null),
  variant:(id:string)=>clone(variants.get(id)??null),
  evidence:(id:string)=>{const e=evidence.get(id);return e?clone({evidence:e,source:sources.get(e.sourceId)!}):null;}
 };
}
export type ManuscriptView=ReturnType<typeof createManuscriptView>;

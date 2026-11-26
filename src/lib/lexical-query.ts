// P8.4.6: read-only query adapter for the validated P8.4.3 model.
import type {Origin,AdmittedFile,Language} from './linguistic-contracts.ts';
type System='index'|'strong'|'bdb';
type LexOrigin=Origin&{selector:string};
type Admission=AdmittedFile&{selectors:readonly string[]};
type Entry={id:string;system:System;providerKey:string;language:Language|null;origin:LexOrigin};
type Form={id:string;entryId:string;form:string;language:Language;origin:LexOrigin};
type Definition={id:string;entryId:string;text:string;language:'en';origin:LexOrigin};
type Relation={id:string;kind:'aug-index'|'index-bdb'|'index-strong'|'index-aug-attribute';sourceEntryId:string|null;rawCode:string;targetSystem:System;targetKey:string|null;targetEntryId:string|null;state:'documentado'|'sin_resolver';relation:'referencia_proveedor'|'atributo_sin_resolver';rule:string|null;origin:LexOrigin};
export type LexicalModel={schemaVersion:1;scope:'internal-only';entries:Entry[];forms:Form[];definitions:Definition[];links:Relation[]};
export type LexicalQuery={mode:'form';language:Language;value:string;offset?:number;limit?:number}|{mode:'identifier';system:System;value:string;offset?:number;limit?:number};
const files={index:'LING-016',strong:'LING-017',bdb:'LING-018'} as const;
const cmp=(a:string,b:string)=>a<b?-1:a>b?1:0;
const check=(ok:unknown)=>{if(!ok)throw new Error('Modelo léxico no válido');};
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const copy=<T,>(v:T):T=>structuredClone(v);
export function createLexicalQuery(model:LexicalModel,admissions:readonly Admission[]){
 const data=copy(model);check(data.schemaVersion===1&&data.scope==='internal-only');
 const allowed=new Map(admissions.map(a=>[a.id,a]));
 check(allowed.size===admissions.length);
 const byId=new Map<string,Entry>(),records=new Set<string>();
 const byForm=new Map<string,Set<string>>(),byKey=new Map<string,string>();
 const forms=new Map<string,Form[]>(),defs=new Map<string,Definition[]>(),links=new Map<string,Relation[]>();
 const add=<T,>(map:Map<string,T[]>,key:string,value:T)=>{const a=map.get(key)??[];a.push(value);map.set(key,a);};
 const origin=(o:LexOrigin,component:Origin['component'],file:string)=>{
  const a=allowed.get(file);check(a&&o.fileId===file&&o.component===component&&a.allowedComponents.includes(component)&&a.selectors.includes(o.selector)&&o.commit===a.commit&&o.sha256===a.sha256&&text(o.locator));
 };
 const id=(v:string,prefix:string)=>{check(new RegExp('^'+prefix+'-[a-f0-9]{64}$').test(v)&&!records.has(v));records.add(v);};
 for(const e of data.entries){id(e.id,'LENTRY');check(Object.hasOwn(files,e.system)&&text(e.providerKey)&&(e.language===null||['hbo','arc','grc'].includes(e.language)));origin(e.origin,'identificadores_lexicos',files[e.system]);const k=JSON.stringify([e.system,e.providerKey]);check(!byKey.has(k));byKey.set(k,e.id);byId.set(e.id,e);}
 for(const f of data.forms){id(f.id,'LFORM');const e=byId.get(f.entryId);check(e?.system==='index'&&e.language===f.language&&text(f.form));origin(f.origin,'anotaciones_lema','LING-016');add(forms,f.entryId,f);const k=JSON.stringify([f.language,f.form]);const a=byForm.get(k)??new Set<string>();a.add(f.entryId);byForm.set(k,a);}
 for(const d of data.definitions){id(d.id,'LDEF');const e=byId.get(d.entryId);check(e&&(e.system==='bdb'||e.system==='strong')&&d.language==='en'&&text(d.text));if(!e)throw new Error('Entrada ausente');origin(d.origin,'sentidos_lexicos',files[e.system]);add(defs,d.entryId,d);}
 for(const l of data.links){id(l.id,'LLINK');const src=l.sourceEntryId===null?undefined:byId.get(l.sourceEntryId),target=l.targetEntryId===null?undefined:byId.get(l.targetEntryId);
  check(text(l.rawCode)&&['aug-index','index-bdb','index-strong','index-aug-attribute'].includes(l.kind)&&Object.hasOwn(files,l.targetSystem));
  check(l.kind==='aug-index'?l.sourceEntryId===null:src?.system==='index');origin(l.origin,'identificadores_lexicos',l.kind==='aug-index'?'LING-015':'LING-016');
  check(l.state===(target?'documentado':'sin_resolver')&&(target!==undefined||l.targetEntryId===null));
  if(target)check(target.system===l.targetSystem&&target.providerKey===l.targetKey);
  if(l.kind==='index-strong')check(l.targetSystem==='strong'&&(target?/^[0-9]+$/.test(l.rawCode)&&l.rule==='OSHB-lexicon-xref-strong-H-prefix-v1'&&l.targetKey==='H'+l.rawCode:l.rule===null));
  else check(l.rule===null);
  if(l.kind==='index-bdb')check(l.targetSystem==='bdb'&&l.targetKey===l.rawCode);
  if(l.kind==='index-aug-attribute')check(l.targetSystem==='index'&&l.targetEntryId===null&&l.targetKey===null&&l.relation==='atributo_sin_resolver');
  else check(l.relation==='referencia_proveedor');
  if(l.kind==='aug-index')check(l.targetSystem==='index');
  if(src)add(links,src.id,l);else if(target)add(links,target.id,l);
 }
 const availableSystems=[...new Set(data.entries.map(e=>e.system))].sort();
 const availableLanguages=new Set(data.forms.map(f=>f.language));
 const available=()=>availableSystems.slice();
 const detail=(entryId:string)=>{const entry=byId.get(entryId);return entry?copy({entry,forms:forms.get(entryId)??[],definitions:defs.get(entryId)??[],links:links.get(entryId)??[]}):null;};
 const search=(q:LexicalQuery)=>{
  const offset=q.offset??0,limit=q.limit??20;
  if(!text(q.value)||q.value.length>1024||!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>100||!(q.mode==='form'&&['hbo','arc','grc'].includes(q.language)||q.mode==='identifier'&&Object.hasOwn(files,q.system)))throw new Error('Consulta léxica inválida');
  const absent=!data.entries.length?'sin_recursos':q.mode==='identifier'&&!availableSystems.includes(q.system)?'recurso_no_disponible':q.mode==='form'&&!availableLanguages.has(q.language)?'lengua_no_disponible':null;
  if(absent)return {status:absent,total:null,offset,limit,nextOffset:null,entries:[] as Entry[]};
  const key=q.mode==='identifier'?byKey.get(JSON.stringify([q.system,q.value])):undefined;
  const ids=q.mode==='form'?[...(byForm.get(JSON.stringify([q.language,q.value]))??[])]:key?[key]:[];
  ids.sort((a,b)=>cmp(byId.get(a)!.providerKey,byId.get(b)!.providerKey)||cmp(a,b));
  return copy({status:'disponible' as const,total:ids.length,offset,limit,nextOffset:offset+limit<ids.length?offset+limit:null,entries:ids.slice(offset,offset+limit).map(x=>byId.get(x)!)});
 };
 return Object.freeze({available,detail,search});
}
